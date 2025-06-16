const fs = require('fs')
const https = require('https')

const insertNewDocument = async (hostname, sessionId, fileNameNoExt, versionIds, hexPDFName, itemId, itemRevisionId) => {
  try {
    const fileName = `${fileNameNoExt}.pdf`
    const data = await _insertNewDocument(hostname, sessionId, fileName, hexPDFName, itemId)
    const versionId = (((JSON.parse(data) || {}).capabilities || {}).content || {}).versionId
    versionIds[versionId] = itemRevisionId
  } catch (e) {
    console.error(e)
  }
}

const _insertNewDocument = (hostname, sessionId, fileName, dataFileName, parentId) => {
  return new Promise((resolve, reject) => {
    const boundary = 'a7V4kRcFA8E79pivMuV2tukQ85cmNKeoEgJgq'
    const options = {
      hostname,
      path: '/services/data/v34.0/chatter/feed-elements',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Authorization': 'OAuth ' + sessionId
      }
    }
    const postData =
`--${boundary}
Content-Disposition: form-data; name="json"
Content-Type: application/json; charset=UTF-8

{
  "body": {
    "messageSegments": [
      {
        "type": "Text",
        "text": ""
      }
    ]
  },
  "capabilities": {
    "content": {
      "title": "${fileName}"
    }
  },
  "feedElementType": "FeedItem",
  "subjectId": "${parentId}"
}

--${boundary}
Content-Disposition: form-data; name="feedElementFileUpload"; filename="${fileName}"
Content-Type: application/octet-stream; charset=ISO-8859-1


`

    const req = new https.request(options, (res) => {
      if (res.statusCode != 201) {
        reject(`WMv2: SF: Fail to post file: insertNewDocument ${res.statusCode}:${res.statusMessage}`)
      }
      let data = ''
      res.on('data', (d) => {
        data += d
      })
      res.on('end', () => {
        resolve(data)
      })
    });

    req.on('error', (e) => {
      reject(e)
    });

    req.write(postData);
    fs.createReadStream(dataFileName)
      .on('end', () => {
        req.end(`\n--${boundary}--\n`);
      })
      .pipe(req, { end: false });

  })
}


const insertContentVersion = async (hostname, sessionId, fileNameNoExt, versionIds, hexPDFName, docId, itemRevisionId) => {
  try {
    const fileName = `${fileNameNoExt}.pdf`
    const data = await _insertContentVersion(hostname, sessionId, fileName, docId, hexPDFName)
    const versionId = (JSON.parse(data) || {}).id
    versionIds[versionId] = itemRevisionId
  } catch (e) {
    console.error(e)
  }
}

const _insertContentVersion = (serverUrl, sessionId, fileName, docId, dataFileName) => {
  return new Promise((resolve, reject) => {
    const boundary = 'a7V4kRcFA8E79pivMuV2tukQ85cmNKeoEgJgq'
    const dataLoad =
`--${boundary}
Content-Disposition: form-data; name="entity_document";
Content-Type: application/json

{
  "ContentDocumentId" : "${docId}",
  "ReasonForChange" : "",
  "PathOnClient" : "${fileName}"
}

--${boundary}
Content-Type: application/octet-stream
Content-Disposition: form-data; name="VersionData"; fileName="${fileName}"


`

    const options = {
      hostname: serverUrl,
      path: '/services/data/v64.0/sobjects/ContentVersion/',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary="${boundary}"`,
        'Authorization': 'OAuth ' + sessionId
      }
    }
    const req = new https.request(options, (res) => {
      if (res.statusCode != 201) {
        reject(`WMv2: SF: Fail to post file: insertContentVersion ${res.statusCode}:${res.statusMessage}`)
      }
      let data = ''
      res.on('data', (d) => {
        data += d
      })
      res.on('end', () => {
        resolve(data)
      })
    })
    req.on('error', (e) => {
      reject(e.message);
    })
    req.write(dataLoad);
    fs.createReadStream(dataFileName)
      .on('end', () => {
        req.end(`\n--${boundary}--\n`)
      })
      .pipe(req, { end: false })
  })
}

module.exports = {
  insertNewDocument,
  insertContentVersion,
}
