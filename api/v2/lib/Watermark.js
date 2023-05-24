const fs = require('fs')
const crypto = require('crypto')
const https = require('https')

const hummusUtils = require('./hummusUtils')
const Database = require('./Database')
const Aspose = require('./Aspose')
const FileService = require('./FileService')

const approvalTemplateName = 'Approval_Template.doc'
const customLog = true
const retryMax = 10

class Watermark {
  constructor(body, res) {
    console.log('Route to V2: ' + process.env.ROUTE_TO_V2)
    let route_to_v2 = process.env.ROUTE_TO_V2;
    if (route_to_v2 == true) {
      this.log('Routing to V2 service');
      this.routeToJavaV2Service(body);
      res.status(200);
      res.send('Processing');
    } else {
      this.log('Routing to Aspose Service');
      this.routeToAsposeService(body, res);
    }
  }
  
  async routeToJavaV2Service(body) {
    let java_url = process.env.V2_JAVA_URL;
    this.log('>>> Route ' + java_url)
      const options = {
        hostname: java_url,
        path: '/v1/watermark',
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
      }
      };
      const req = new https.request(options, (res) => {
        if (res.statusCode != 200) {
          throw new Error('Unable to connect to Java service: ' + res.statusMessage);
        }
        let data ='';
        res.on('data', (c) => {
          data += c;
        });
        res.on('end', () => {
          console.log('Java request sent successfully ' + data);
        });
      });
      req.on('error', (e) => {
        console.log('Error: ' + e);
      });
      req.write(JSON.stringify(body));
      req.end();
  }
  
  async routeToAsposeService(body, res) {
    const { documents, approvalData, hostUrl, sessionId, orgId, namespace } = body
    let hostUrlArray = hostUrl.split('//')
    this.hostname = hostUrlArray[hostUrlArray.length - 1]
    this.documents = documents
    this.approvalData = approvalData
    this.orgId = orgId
    this.namespace = namespace ? namespace + '/' : ''
    this.sessionId = sessionId


    this.versionIds = {}
    this.changeTemplateMap = {}

    this.log('>>> body ' + JSON.stringify({
      hostname: this.hostname,
      orgId: this.orgId,
      namespace: this.namespace,
      sessionId: this.sessionId,
    }))

    res.status(200)
    res.send('Processing')

    this.start()
  }

  async start() {
    try {
      await Aspose.getToken()
      await this.makeApprovalPage()
      for (let doc of this.documents) {
        await this.convertDoc(doc)
      }
      await this.removeApprovalPage()
      await this.updateFileLinks()
    } catch (e) {
      console.error(e.stack || e)
    }
  }

  async convertDoc(doc) {
    try {

      const { templateName, templateExtension, templateVersionId, itemId, pdfDocumentId, itemRevisionId, stamps, changeId } = doc
      let fileName = templateName
      let fileNameNoExt = templateName
      let ext = '.docx'
      if (templateExtension) {
        ext = '.' + templateExtension
        fileNameNoExt = fileName.replace(new RegExp(ext + '$', 'i'), '')
        fileName = fileNameNoExt + ext
      }
      const hex = crypto.randomBytes(20).toString('hex')
      const hexDOCName = hex + ext
      const hexPDFName = hex + '.pdf'

      const isDoc = (ext == '.docx' || ext == '.doc')

      this.log('>>> convert : ' + isDoc + ' : ' + templateName + ' : ' + hex);

      if (isDoc) {
        await Aspose.convertFileOnAspose(this.hostname, this.sessionId, hexDOCName, hexPDFName, templateVersionId)
      } else {
        // move doc from sf to aspose
        await Aspose.moveFileToAspose(this.hostname, this.sessionId, hexDOCName, templateVersionId)

        // download file as pdf (convert on aspose)
        await this.timeout(1000)
        let tryCount = 0
        let isDone = false
        while (tryCount < retryMax && !isDone) {
          try {
            await Aspose.downloadFile(hexDOCName, '', 'pdf', hexPDFName)
            isDone = true
          } catch(e) {
            tryCount += 1
            await this.timeout(tryCount * 1000)
            console.log(`Failed_to_download : try count : ${tryCount} : ${hex}`);
            console.log(e);
          }
        }
        if (!isDone) {
          throw new Error('Failed_to_download_too_many_tries : ' + templateName + ' : ' + hex)
        }
      }

      this.log('>>> watermark : ' + templateName + ' : ' + hex);

      // add watermark
      hummusUtils.main(stamps, hexPDFName)

      // append approval data
      if (this.approvalData && this.changeTemplateMap[changeId]) {
        const templateHexName = this.changeTemplateMap[changeId];
        const templateHexNewName = templateHexName.replace('.doc', '.pdf')
        await hummusUtils.appendPage(hexPDFName, templateHexNewName)

      }

      this.log('>>> upload : ' + templateName + ' : ' + hex);

      // save it back to sf
      if (pdfDocumentId) {
        await FileService.insertContentVersion(this.hostname, this.sessionId, fileNameNoExt, this.versionIds, hexPDFName, pdfDocumentId, itemRevisionId)
      } else {
        await FileService.insertNewDocument(this.hostname, this.sessionId, fileNameNoExt, this.versionIds, hexPDFName, itemId, itemRevisionId)
      }

      // log
      let pageCount = hummusUtils.getPageCount(hexPDFName)
      await Database.insertRecord(this.orgId, 'watermark', fileName, pageCount)

      // clean up
      fs.unlinkSync(hexPDFName)
      if (!isDoc) {
        await Aspose.deleteFile('', hexDOCName, null)
      }
    } catch (e) {
      console.error(e, doc)
    }
  }

  async makeApprovalPage() {

    if (this.approvalData == null) { return }
    try {
      for (let changeApproval in this.approvalData) {
        const approvalDataInternal = this.approvalData[changeApproval]
        if (!this.changeTemplateMap[changeApproval]) {
          this.changeTemplateMap[changeApproval] = changeApproval + crypto.randomBytes(10).toString('hex') + '.doc'
        }
        else {
          continue;
        }
        const templateHexName = this.changeTemplateMap[changeApproval]
        const templateHexNewName = templateHexName.replace('.doc', '.pdf')
        await Aspose.newFileFromTemplate(approvalTemplateName, 'Templates', templateHexName, JSON.stringify(approvalDataInternal))
        await Aspose.downloadFile(templateHexName, 'Templates', 'pdf', templateHexNewName)

      }
    } catch (e) {
      console.error(e.stack)
    }
  }

  async removeApprovalPage() {
    if (this.approvalData == null) { return }
    try {
      for (let cId in this.changeTemplateMap) {
        const templateHexName = this.changeTemplateMap[cId];
        const templateHexNewName = templateHexName.replace('.doc', '.pdf')
        fs.unlinkSync(templateHexNewName)
        await Aspose.deleteFile('Templates', templateHexName, null)
      }
    } catch (e) {
      console.error(e.stack)
    }
  }

  updateFileLinks() {
    // this.versionIds
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.hostname,
        path: `/services/apexrest/${this.namespace}api/v2/attachment`,
        method: 'POST',
        headers: {
          'Authorization': 'OAuth ' + this.sessionId
        }
      }
      const req = new https.request(options, (res) => {
        let data = ''
        if (res.statusCode != 200) {
          for (let v in this.versionIds) {
            console.log(`${v}: ${this.versionIds[v]}`);
          }
          reject(`WMv2: Fail to post file links: ${res.statusCode}:${res.statusMessage}`)
        }
        res.on('data', (d) => {
          data += d
        })
        res.on('end', () => {
          console.log(data);
          resolve()
        })
      })
      req.on('error', (e) => {
        reject(e)
      })
      req.write(JSON.stringify({
        isBulk: true,
        isWatermark: true,
        docRevMap: this.versionIds,
      }))
      req.end()
    })
  }

  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  log(raws) {
    if (!customLog) { return }
    console.log(raws);
  }
}

module.exports = Watermark
