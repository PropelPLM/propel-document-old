const fs = require('fs')
const https = require('https')
const crypto = require('crypto')
const StorageApi = require('asposestoragecloud')
const { WordsApi, ExecuteMailMergeRequest } = require('asposewordscloud')

const asposeHostname = 'api.aspose.cloud'
const asposeID = '3d1ec870-02bf-422f-b29b-1bc6aec2ca32'
const asposeKey = 'e37df3fb4bc63208d859f728ba038732'
const config = { 'appSid': asposeID, 'apiKey': asposeKey }

//these aspose objects need to be singletons, so I cache them on global so they aren't initialized more than once
const uId = asposeID + asposeKey
global.wordsApiMap = global.wordsApiMap || {}
const wordsApi = global.wordsApiMap[uId] || new WordsApi(asposeID, asposeKey)
global.wordsApiMap[uId] = wordsApi

global.storageApiMap = global.storageApiMap || {}
const storageApi = global.storageApiMap[uId] || new StorageApi(config)
global.storageApiMap[uId] = storageApi

const downloadFile = async (name, folder, format, outPath) => {
  const token = await getToken()
  const options = {
    hostname: asposeHostname,
    path: `/v4.0/words/${encodeURIComponent(name)}?folder=${folder}&format=${format}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  }
  const file = fs.createWriteStream(outPath)
  await new Promise((resolve, reject) => {
    const req = new https.request(options, (res) => {
      if (res.statusCode != 200) {
        reject(`Fail to get file (1): ${res.statusCode}:${res.statusMessage}`)
      }
      res.pipe(file)
      res.on('end', () => {
        file.end()
        setTimeout(resolve, 100)
      })
    })
    req.on('error', (e) => {
      return reject(e)
    })
    req.end()
  })
}

const newFileFromTemplate = async (templateName, folder, newName, data) => {

  const request = new ExecuteMailMergeRequest({
    folder: folder,
    name: templateName,
    data: data,
    withRegions: true,
    cleanup: 'EmptyParagraphs,UnusedRegions,UnusedFields,RemoveTitleRow,RemoveTitleRowInInnerTables',
    destFileName: `${folder}/${newName}`
  })

  try {
    const res = await wordsApi.executeMailMerge(request)
    if (!res || res.response.statusCode != 200) {
      throw new Error(`Fail to post file: ${res.response.statusCode}:${res.response.statusMessage}`)
    }

  } catch (e) {
    console.error(e)
  }
}

const moveFileToAspose = (hostname, sessionId, hexDOCName, templateVersionId) => {
  return new Promise((resolve, reject) => {
    let getOptions = {
      hostname,
      path: `/services/data/v64.0/sobjects/ContentVersion/${templateVersionId}/VersionData`,
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
        reject(`Fail to post file: ${putRes.statusCode}:${putRes.statusMessage}`)
      }
    })

    putReq.on('error', (err) => {
      reject(err)
    })

    const getReq = https.request(getOptions, (getRes) => {
      if (getRes.statusCode != 200) {
        reject(`Fail to get file: ${getRes.statusCode}:${getRes.statusMessage}`)
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
      let data = ''
      res.on('data', (c) => {
        data += c
      })
      res.on('end', () => {
        resolve(JSON.parse(data).access_token)
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
  newFileFromTemplate,
  moveFileToAspose,
  deleteFile,
  sign
}
