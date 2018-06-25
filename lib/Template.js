const async = require('async')
const https = require('https')
const fs = require('fs')
const crypto = require('crypto')

const hummusUtils = require('./hummusUtils')
const Database = require('./Database')
const Aspose = require('./Aspose')
const ensure = async.ensureAsync

module.exports = Template

function Template(hostname, sessionId, orgId, recordId, templateNameOnAspose, newFileName, dataToPopulate, res) {
  this.hostname = hostname;
  this.sessionId = sessionId;
  this.newFileName = newFileName;
  const hex = templateNameOnAspose.replace('.', '_') + crypto.randomBytes(20).toString('hex')
  this.tempFileName = hex + '.docx';
  this.tempFilePDFName = hex + '.pdf';

  async.series([
    (cb) => {
      log('==start TemplateOnAspose')
      this.TemplateOnAspose(orgId, templateNameOnAspose, newFileName, dataToPopulate, cb)
    },
    (cb) => {
      log('======start downloadNewDocument')
      this.downloadDocumentFromAspose(orgId, cb)
    },
    (cb) => {
      log('======start insertToChatter')
      this.insertNewDocument(orgId, recordId, cb)
    },
    (cb) => {
      log('==log activity')
      let pageCount = hummusUtils.getPageCount(this.tempFilePDFName)
      new Database().insertRecord(orgId, 'template', this.newFileName, pageCount, cb)
    },
    (cb) => {
      log('======clean aspose cloud')
      Aspose.deleteFile(orgId, this.tempFileName, cb)
    }
  ].map(fn => ensure(fn)), (e, results) => {
    log('end Template')
    log(e)
    log('end orig response:' + results)
    fs.unlink(this.tempFilePDFName, (err) => {
      if (err) {
        log('unlink error:', err)
      }
    })
    if (e) {
      res.status(400).json({error: e.toString()})
    } else {
      res.writeHead(200, {'Content-Type': 'application/json'})
      res.end()
    }
  })
}

Template.prototype.TemplateOnAspose = function(orgId, templateNameOnAspose, newFileName, dataToPopulate, cb) {
  Aspose.newFileFromTemplate(templateNameOnAspose, orgId, this.tempFileName, dataToPopulate, cb)
}

Template.prototype.downloadDocumentFromAspose = function(orgId, cb) {
  Aspose.downloadFile(this.tempFileName, orgId, 'pdf', this.tempFilePDFName, cb)
}

//https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_sobject_insert_update_blob.htm
Template.prototype.insertNewDocument = function(orgId, recordId, cb) {
  const {hostname, sessionId, newFileName} = this;
  var boundary = 'a7V4kRcFA8E79pivMuV2tukQ85cmNKeoEgJgq';
  // Options to create the request
  var options = {
    hostname,
    path: '/services/data/v34.0/chatter/feed-elements',
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data; boundary=' + boundary,
      'Authorization': 'OAuth ' + sessionId
    }
  };
  var CRLF = '\r\n';
  // Request
  var postData = [
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
  var req = new https.request(options, function(res) {
    // var data = ''
    // res.on('data', function (chunk) {
    //   data += chunk;
    // });
    res.on('end', () => {
      log('end chatter response')
      cb()
    })
  });
  // If error show message and finish response
  req.on('error', function(e) {
    log('Error in request, please retry or contact your Administrator', e);
  });

  // write data to request body
  req.write(postData);
  // Add final boundary and bind request to zip
  fs.createReadStream(this.tempFilePDFName).on('end', function() {
    req.end(CRLF + '--' + boundary + '--' + CRLF);
  }).pipe(req, {end: false});

}

function log(...args) {
  console.log(...args)/* eslint-disable-line no-console */
}
