const fs = require('fs')
const crypto = require('crypto')

const asposeHostname = 'api.aspose.cloud'
const asposeID = 'c73173ea-18d8-4e40-8b40-21596152017a'
const asposeKey = '8f265cdf54b0c63ceec1c311bb157a4e'
const { WordsApi, PostExecuteTemplateRequest, GetDocumentWithFormatRequest } = require("asposewordscloud")
const StorageApi = require("asposestoragecloud")
const config = { 'appSid': asposeID, 'apiKey': asposeKey };

const wordsApi = new WordsApi(asposeID, asposeKey);
const storageApi = new StorageApi(config);


function downloadFile(name, folder, format, outPath, cb) {
  log('== start download == ' + name)
  var request = new GetDocumentWithFormatRequest();
  request.name = name
  request.folder = folder
  request.format = format
  // request.outPath = outPath

  return wordsApi.getDocumentWithFormat(request)
    .then((res) => {
      if (res.response.statusCode != 200) {
        return cb(new Error('Encountered an issue while downloading file form Aspose ' + res.response.statusCode + ': ' + res.response.statusMessage))
      }

      let newFile = fs.createWriteStream(outPath)
      newFile.write(res.body)
      newFile.close(cb)
    }).catch((err) => {
      log(err);
    });
}

function newFileFromTemplate(templateName, folder, newName, data, cb){
  log('== start create new file from template== ' + templateName)
  const request = new PostExecuteTemplateRequest({
    folder: folder,
    name: templateName,
    data: data,
    withRegions: true,
    destFileName: newName
  })

  return wordsApi.postExecuteTemplate(request)
    .then((res) => {
      if (res.response.statusCode != 200) {
        return cb(new Error('Encountered an issue while template file form Aspose ' + res.response.statusCode + ': ' + res.response.statusMessage))
      }
      cb();
    })
    .catch((err) => {
      log(err)
    })
}

function deleteFile(orgId, fileName, cb) {
  let filePath = orgId ? orgId + '/' : ''
  storageApi.DeleteFile(filePath + encodeURIComponent(fileName), null, null, cb);
}

function sign(url) {
  url = 'https://' + asposeHostname + url
  url = url.replace(' ', '%20')
  url += '&appsid=' + asposeID
  let hash = crypto.createHmac('sha1', asposeKey).update(url).digest('base64')
  if (hash.endsWith('=')) {
    hash = hash.substring(0, hash.length - 1)
  }
  return url + '&signature=' + encodeURIComponent(hash)
}


module.exports = {
  downloadFile,
  newFileFromTemplate,
  deleteFile,
  sign
}

function log(...args) {
  console.log(...args) /*eslint-disable-line no-console*/
}
