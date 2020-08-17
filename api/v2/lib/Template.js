const fs = require('fs')
const https = require('https')
const crypto = require('crypto')

const Aspose = require('./Aspose')
const Database = require('./Database')
const hummusUtils = require('./hummusUtils')

class Template {
  constructor(body, res) {
    const { hostUrl, sessionId, orgId, recordId, templateNameOnAspose, newFileName, dataToPopulate } = body

    console.log('>>> body', body);

    this.res = res
    this.sessionId = sessionId
    this.orgId = orgId
    this.recordId = recordId
    this.newFileName = newFileName
    this.dataToPopulate = dataToPopulate
    this.templateNameOnAspose = templateNameOnAspose

    const hostUrlArray = hostUrl.split('//')
    const hostname = hostUrlArray[hostUrlArray.length - 1]
    this.hostname = hostname

    const hex = crypto.randomBytes(20).toString('hex')
    this.tempFileName = hex + '.docx';
    this.tempFilePDFName = hex + '.pdf';

    this.start()
  }

  async start() {
    try {
      // make new doc from template
      await Aspose.newFileFromTemplate(this.templateNameOnAspose, this.orgId, this.tempFileName, this.dataToPopulate)

      // download it as pdf
      await Aspose.downloadFile(this.tempFileName, this.orgId, 'pdf', this.tempFilePDFName)

      // upload to sf
      await this.insertNewDocument()

      // log
      await Database.insertRecord(this.orgId, 'template', this.newFileName, hummusUtils.getPageCount(this.tempFilePDFName))

      //cleanup
      await Aspose.deleteFile(this.orgId, this.tempFileName)
      fs.unlinkSync(this.tempFilePDFName)

      this.res.writeHead(200, { 'Content-Type': 'application/json' })
      this.res.end()
    } catch (e) {
      console.error(e)
      this.res.status(400).json({ error: e.toString() })
    }
  }

  insertNewDocument() {
    return new Promise((resolve, reject) => {
      const { recordId, hostname, sessionId, newFileName, tempFilePDFName } = this;
      const boundary = 'a7V4kRcFA8E79pivMuV2tukQ85cmNKeoEgJgq';
      // Options to create the request
      const options = {
        hostname,
        path: '/services/data/v34.0/chatter/feed-elements',
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data; boundary=' + boundary,
          'Authorization': 'OAuth ' + sessionId
        }
      };
      const CRLF = '\r\n';
      // Request
      const postData = [
        '--' + boundary,
        'Content-Disposition: form-data; name="json"',
        'Content-Type: application/json; charset=UTF-8',
        '',
        '{',
        '"body":{',
        '"messageSegments":[',
        '{',
        '"type":"Text",',
        '"text":""',
        '}',
        ']',
        '},',
        '"capabilities":{',
        '"content":{',
        '"title":"' + newFileName + '"',
        '}',
        '},',
        '"feedElementType":"FeedItem",',
        '"subjectId":"' + recordId + '"',
        '}',
        '',
        '--' + boundary,
        'Content-Disposition: form-data; name="feedElementFileUpload"; filename="' + newFileName + '"',
        'Content-Type: application/octet-stream; charset=ISO-8859-1',
        '',
        ''
      ].join(CRLF);

      // Execute request
      const req = new https.request(options, (res) => {
        let data = ''
        res.on('data', (d) => {
          data += d
        })
        res.on('end', () => {
          resolve(data)
        })
      })
      // If error show message and finish response
      req.on('error', (e) => {
        reject(e)
      })

      // write data to request body
      req.write(postData);
      // Add final boundary and bind request to zip
      fs.createReadStream(tempFilePDFName).on('end', () => {
        req.end(CRLF + '--' + boundary + '--' + CRLF);
      }).pipe(req, { end: false });
    }).then(() => {}, (e) => {
      console.error(e)
    })
  }
}

module.exports = Template
