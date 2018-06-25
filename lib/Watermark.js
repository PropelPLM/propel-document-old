const async = require('async')
const crypto = require('crypto')
const https = require('https')
const fs = require('fs')

const hummusUtils = require('./hummusUtils')
const Database = require('./Database')
const Aspose = require('./Aspose')

const asposeHostname = 'api.aspose.cloud'
const approvalTemplateName = 'Approval_Template.doc'
const ensure = async.ensureAsync
module.exports = Watermark

function Watermark(documents, approvalData, hostname, sessionId, orgId, res) {
  this.hostname = hostname;
  this.sessionId = sessionId;
  this.res = res;
  this.versionIds = {}

  async.series([
    ensure((topCB) => {
      if (approvalData != null) {
        log('==start approval page')
        this.templateHexName = approvalTemplateName.replace('.', '_') + crypto.randomBytes(20).toString('hex') + '.doc';
        this.templateHexNewName = this.templateHexName.replace('.doc', '.pdf')
        this.generateApprovals(approvalData, topCB)
      } else {
        topCB()
      }
    }),
    ensure((topCB) => {
      async.eachOfSeries(documents, (doc, key, seriesCB) => {
        const { templateName, templateExtension, templateVersionId, itemId, pdfDocumentId, itemRevisionId, stamps } = doc;
        const { watermarkText } = stamps
        this.fileName = templateName
        const ext = '.' + templateExtension
        this.fileNameNoExt = this.fileName.replace(new RegExp(ext + '$', 'i'), '')
        if (templateExtension) {
          this.fileName = this.fileNameNoExt + ext
        }
        let hex = this.fileName.replace('.', '_') + crypto.randomBytes(20).toString('hex')
        this.hexDOCName = hex + '.doc';
        this.hexPDFName = hex + '.pdf';
        //TODO: need to convert xlsx too
        log('start async.waterfall for: ' + templateName)
        async.waterfall([
          (cb) => {
            log('==start moveFileToAspose')
            this.moveFileToAspose(templateVersionId, cb)
          },
          (cb) => {
            log('==start watermarkOnAspose')
            this.watermarkOnAspose(watermarkText, cb)
          },
          (cb) => {
            log('==start pdfTasks')
            this.pdfTasks(stamps, cb)
          },
          (cb) => {
            if (approvalData != null) {
              log('==start appendApprovals')
              this.appendApprovals(cb)
            } else {
              cb()
            }
          },
          (cb) => {
            if (pdfDocumentId) {
              log('==start insertContentVersion')
              this.insertContentVersion(pdfDocumentId, itemRevisionId, cb)
            } else {
              log('==start insertNewDocument')
              this.insertNewDocument(itemId, itemRevisionId, cb)
            }
          },
          (cb) => {
            log('==log activity')
            let pageCount = hummusUtils.getPageCount(this.hexPDFName)
            new Database().insertRecord(orgId, 'watermark', this.fileName, pageCount, cb)
          },
        ].map(fn => ensure(fn)), (err) => {
          log('==series callback')
          if (err) { log(err) }

          // clean up
          fs.unlink(this.hexPDFName, (e) => {
            if (e) { log('unlink error:', e) }
          })
          Aspose.deleteFile('', this.hexDOCName, null)
          seriesCB()
        })
      }, (err) => {
        if (approvalData != null) {
          fs.unlink(this.templateHexNewName, (err) => {
            if (err) { log('unlink error:', err) }
          })
          log('==clean aspose cloud')
          Aspose.deleteFile('Templates', this.templateHexName, null)
        }
        if (err) { log(err) }
        topCB()
      })
    }),
  ], (err) => {
    log('end watermark')
    log(err)
    log('end orig response')
    if (err) {
      res.status(400).json({ error: err.toString() })
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.write(JSON.stringify(this.versionIds))
      res.end()
    }
  });

}


Watermark.prototype.moveFileToAspose = function(templateVersionId, cb) {
  const { hostname, sessionId, hexDOCName } = this;

  let getOptions = {
    hostname,
    path: `/services/data/v23.0/sobjects/ContentVersion/${templateVersionId}/VersionData`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${sessionId}` }
  }

  let putOptions = {
    hostname: asposeHostname,
    path: Aspose.sign('/v1.1/storage/file?path=' + encodeURIComponent(hexDOCName)),
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/octet-stream',
    },
  }

  const putReq = https.request(putOptions, (putRes) => {
    if (putRes.statusCode != 200) {
      return cb(new Error('Encountered an issue while put file to Aspose; ' + putRes.statusCode + ': ' + putRes.statusMessage))
    }
  })

  putReq.on('error', (err) => {
    cb(new Error('Encountered an issue while uploading template; ' + err))
  })

  const getReq = https.request(getOptions, (getRes) => {
    if (getRes.statusCode != 200) {
      return cb(new Error('Encountered an issue while fetching template on SalesForce; ' + getRes.statusCode + ': ' + getRes.statusMessage))
    }

    getRes.on('data', (chunk) => { putReq.write(chunk) })
    getRes.on('end', () => {
      putReq.end(() => {
        cb()
      });
    })
  })

  getReq.on('error', (err) => {
    cb(new Error('Encountered an issue while fetching template on SalesForce; ' + err))
  })

  getReq.end()

}

Watermark.prototype.watermarkOnAspose = function(watermarkText, cb) {
  if (!watermarkText) { return cb() }
  log(watermarkText)
  const { hexDOCName } = this
  const uri = '/v1.1/words/' + encodeURI(hexDOCName) + '/watermark/insertText?text=' + encodeURIComponent(watermarkText) + '&rotationAngle=-45&opacity=0.2';
  let options = {
    hostname: asposeHostname,
    path: Aspose.sign(uri),
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  }
  const req = https.request(options, (res) => {
    if (res.statusCode != 200) {
      return cb(new Error('Encountered an issue while watermarking; ' + res.statusCode + ': ' + res.statusMessage))
    } else {
      return cb()
    }
  })

  req.on('error', (err) => {
    cb(new Error('Encountered an issue while watermarking; ' + err))
  })

  req.end()
}

Watermark.prototype.pdfTasks = function(marginRules, cb) {
  const { hexDOCName, hexPDFName } = this;

  Aspose.downloadFile(hexDOCName, '', 'pdf', hexPDFName, () => {
    hummusUtils.main(marginRules, hexPDFName, cb)
  })
}

Watermark.prototype.appendApprovals = function (cb) {
  if (!this.templateHexNewName) { cb() }
  hummusUtils.appendPage(this.hexPDFName, this.templateHexNewName)
  cb()
}

Watermark.prototype.generateApprovals = function (appendApprovalData, cb) {

  // inject data to template
  Aspose.newFileFromTemplate(approvalTemplateName, 'Templates', this.templateHexName, JSON.stringify(appendApprovalData), () => {
    Aspose.downloadFile(this.templateHexName, 'Templates', 'pdf', this.templateHexNewName, cb)
  })
}

//https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_sobject_insert_update_blob.htm
Watermark.prototype.insertNewDocument = function(itemId, itemRevisionId, cb) {
  const { hostname, sessionId, fileNameNoExt, versionIds, hexPDFName } = this;
    var boundary = 'a7V4kRcFA8E79pivMuV2tukQ85cmNKeoEgJgq';
    // Options to create the request
    var options = {
        hostname,
        path: '/services/data/v34.0/chatter/feed-elements',
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data; boundary='+boundary,
          'Authorization': 'OAuth ' + sessionId
        }
    };
    var CRLF = '\r\n';
    // Request
    var postData = [
        '--'+ boundary,
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
                 '"title":"'+ fileNameNoExt +'.pdf"',
              '}',
           '},',
           '"feedElementType":"FeedItem",',
           '"subjectId":"'+ itemId +'"',
        '}',
        '',
        '--'+ boundary,
        'Content-Disposition: form-data; name="feedElementFileUpload"; filename="'+ fileNameNoExt +'.pdf"',
        'Content-Type: application/octet-stream; charset=ISO-8859-1',
        '',
        ''].join(CRLF);

    // Execute request
    var req = new https.request(options, function(res) {
      var data = ''
      res.on('data', function (chunk) {
          data += chunk;
        });
      res.on('end', () => {
        log('end chatter response')
        const versionId = (((JSON.parse(data) || {}).capabilities || {}).content || {}).versionId;
        versionIds[versionId] = itemRevisionId
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
    fs.createReadStream(hexPDFName)
        .on('end', function() {
            req.end(CRLF + '--'+ boundary +'--' + CRLF);
        })
        .pipe(req, {end:false});

}


Watermark.prototype.insertContentVersion = function(docId, itemRevisionId, cb) {
  const { hostname, sessionId, fileNameNoExt, versionIds, hexPDFName } = this;
    var boundary = 'a7V4kRcFA8E79pivMuV2tukQ85cmNKeoEgJgq';
    // Options to create the request
    var options = {
        hostname,
        path: '/services/data/v34.0/sobjects/ContentVersion',
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data; boundary='+boundary,
          'Authorization': 'OAuth ' + sessionId
        }
    };
    var CRLF = '\r\n';
    // Request
    var postData = [
        '--'+ boundary,
        'Content-Disposition: form-data; name="entity_content"',
        'Content-Type: application/json; charset=UTF-8',
        '',
        '{',
           `"ContentDocumentId" : "${docId}",`,
           `"ReasonForChange" : "${''}",`,
           `"PathOnClient" : "${fileNameNoExt}.pdf"`,
        '}',
        '',
        '--'+ boundary,
        'Content-Disposition: form-data; name="VersionData"; filename="'+ fileNameNoExt +'.pdf"',
        'Content-Type: application/octet-stream; charset=ISO-8859-1',
        '',
        ''].join(CRLF);

    // Execute request
    var req = new https.request(options, function(res) {
      if (res.statusCode != 201) {
        return cb(new Error('Encountered an issue while posting to chatter; ' + res.statusCode + ': ' + res.statusMessage))
      }
      var data = ''
      res.on('data', function (chunk) {
          data += chunk;
        });
      res.on('end', () => {

        const versionId = (JSON.parse(data) || {}).id
        versionIds[versionId] = itemRevisionId

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
    fs.createReadStream(hexPDFName)
        .on('end', function() {
            req.end(CRLF + '--'+ boundary +'--' + CRLF);
        })
        .pipe(req, {end:false});

}

function log(...args) {
  console.log(...args) /*eslint-disable-line no-console*/
}
