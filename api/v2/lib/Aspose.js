const fs = require('fs')
const https = require('https')
const crypto = require('crypto')
const StorageApi = require('asposestoragecloud')

const asposeHostname = 'api.aspose.cloud'
const asposeID = '3d1ec870-02bf-422f-b29b-1bc6aec2ca32'
const asposeKey = 'e37df3fb4bc63208d859f728ba038732'
const config = { 'appSid': asposeID, 'apiKey': asposeKey }

//these aspose objects need to be singletons, so I cache them on global so they aren't initialized more than once
const uId = asposeID + asposeKey
global.storageApiMap = global.storageApiMap || {}
const storageApi = global.storageApiMap[uId] || new StorageApi(config)
global.storageApiMap[uId] = storageApi
global.staticToken = null

const downloadFile = (name, folder, format, outPath) => {
  return new Promise((resolve, reject) => {
    const type = (name.endsWith('.docx') || name.endsWith('.doc')) ? 'v4.0/words' : 'v3.0/cells'
    const options = {
      hostname: asposeHostname,
      path: `/${type}/${encodeURIComponent(name)}?folder=${folder}&format=${format}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${global.staticToken}`,
      },
    }
    const file = fs.createWriteStream(outPath)
    const req = new https.request(options, (res) => {
      if (!res || res.statusCode != 200) {
        reject(`downloadFile: Fail to get file (1): ${res.statusCode}:${res.statusMessage} : ${name}`)
      }
      res.pipe(file)
      res.on('end', () => {
        file.end()
        setTimeout(resolve, 500)
      })
    })
    req.on('error', (e) => {
      return reject(e)
    })
    req.end()
  })
}

const newFileFromTemplate = (templateName, folder, newName, data) => {
  return new Promise((resolve, reject) => {
    const querySet = {
      folder: folder,
      withRegions: true,
      destFileName: encodeURIComponent(`${folder}/${newName}`),
      cleanup: encodeURIComponent('EmptyParagraphs,UnusedRegions,UnusedFields,RemoveTitleRow,RemoveTitleRowInInnerTables'),
    }
    const queryStr = Object.keys(querySet).map((k) => `${k}=${querySet[k]}`).join('&')
    const options = {
      hostname: asposeHostname,
      path: `/v4.0/words/${encodeURIComponent(templateName)}/MailMerge?${queryStr}`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${global.staticToken}`,
      },
    }
    const req = new https.request(options, (res) => {
      if (res.statusCode != 200) {
        reject(`newFileFromTemplate: Fail to get file (1): ${res.statusCode}:${res.statusMessage} : ${templateName}`)
        console.error(res.statusCode, res.statusMessage, res.error)
      }
      let rData = ''
      res.on('data', (c) => {
        rData += c
      })
      res.on('end', () => {
        setTimeout(() => { resolve(rData) }, 500);
      })
    })
    req.on('error', (e) => {
      return reject(e)
    })
    req.write(data)
    req.end()
  })
}

const convertFileOnAspose = (hostname, sessionId, hexDOCName, hexPDFName, templateVersionId) => {
  return new Promise((resolve, reject) => {
    const getOptions = {
      hostname,
      path: `/services/data/v23.0/sobjects/ContentVersion/${templateVersionId}/VersionData`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${sessionId}` }
    }

    const asposeType = 'v4.0/words' // doc only for now
    const putOptions = {
      hostname: asposeHostname,
      path: `/${asposeType}/convert?format=pdf`,
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/octet-stream',
        'Authorization': `Bearer ${global.staticToken}`,
      },
    }

    const file = fs.createWriteStream(hexPDFName)

    const putReq = https.request(putOptions, (putRes) => {
      if (putRes.statusCode != 200) {
        reject(`convertFileOnAspose: Fail to conver file (1): ${putRes.statusCode}: ${putRes.statusMessage} : ${hexDOCName}`)
      }

      putRes.pipe(file)
      putRes.on('end', () => {
        file.end()
        setTimeout(resolve, 500)
      })
    })

    putReq.on('error', (err) => {
      reject(err)
    })

    const getReq = https.request(getOptions, (getRes) => {
      if (getRes.statusCode != 200) {
        reject(`convertFileOnAspose: Fail to convert file (2): ${getRes.statusCode}:${getRes.statusMessage} : ${hexDOCName}`)
      }

      getRes.on('data', (chunk) => {
        putReq.write(chunk)
      })
      getRes.on('end', () => {
        putReq.end()
      })
    })

    getReq.on('error', (err) => {
      reject(err)
    })

    getReq.end()
  })
}

const moveFileToAspose = (hostname, sessionId, hexDOCName, templateVersionId) => {
  return new Promise((resolve, reject) => {
    let getOptions = {
      hostname,
      path: `/services/data/v23.0/sobjects/ContentVersion/${templateVersionId}/VersionData`,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${sessionId}` }
    }

    let putOptions = {
      hostname: asposeHostname,
      path: sign('/v1.1/storage/file?path=' + encodeURIComponent(hexDOCName)),
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/octet-stream',
      },
    }

    const putReq = https.request(putOptions, (putRes) => {
      if (putRes.statusCode != 200) {
        reject(`moveFileToAspose: Fail to post file (3): ${putRes.statusCode}: ${putRes.statusMessage} : ${hexDOCName}`)
      }
    })

    putReq.on('error', (err) => {
      reject(err)
    })

    const getReq = https.request(getOptions, (getRes) => {
      if (getRes.statusCode != 200) {
        reject(`moveFileToAspose: Fail to get file (2): ${getRes.statusCode}:${getRes.statusMessage} : ${hexDOCName}`)
      }

      getRes.on('data', (chunk) => {
        putReq.write(chunk)
      })
      getRes.on('end', () => {
        putReq.end(() => {
          setTimeout(resolve, 300)
        })
      })
    })

    getReq.on('error', (err) => {
      reject(err)
    })

    getReq.end()
  })
}

const deleteFile = (orgId, fileName) => {
  return new Promise((resolve, ) => {
    let filePath = orgId ? orgId + '/' : ''
    storageApi.DeleteFile(filePath + encodeURIComponent(fileName), null, null, resolve)
  })
}

const sign = (url) => {
  url = 'https://' + asposeHostname + url
  url = url.replace(' ', '%20')
  url += '&appsid=' + asposeID
  let hash = crypto.createHmac('sha1', asposeKey).update(url).digest('base64')
  if (hash.endsWith('=')) {
    hash = hash.substring(0, hash.length - 1)
  }
  return url + '&signature=' + encodeURIComponent(hash)
}

const getToken = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: asposeHostname,
      path: '/connect/token',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    }
    const data = `grant_type=client_credentials&client_id=${asposeID}&client_secret=${asposeKey}`
    const req = new https.request(options, (res) => {
      if (res.statusCode != 200) {
        throw new Error('Unable to get Aspose token: ' + res.statusMessage)
      }
      let rData = ''
      res.on('data', (c) => {
        rData += c
      })
      res.on('end', () => {
        global.staticToken = JSON.parse(rData).access_token
        resolve(global.staticToken)
      })
    })
    req.on('error', (e) => {
      return reject(e)
    })
    req.write(data)
    req.end()
  })
}


module.exports = {
  downloadFile,
  getToken,
  newFileFromTemplate,
  convertFileOnAspose,
  moveFileToAspose,
  deleteFile,
  sign
}
