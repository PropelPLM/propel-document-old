const fs = require('fs')
const crypto = require('crypto')

const hummusUtils = require('./hummusUtils')
const Database = require('./Database')
const Aspose = require('./Aspose')
const FileService = require('./FileService')

const approvalTemplateName = 'Approval_Template.doc'

class Watermark {
  constructor(body, res) {
    const { documents, approvalData, hostUrl, sessionId, orgId } = body
    let hostUrlArray = hostUrl.split('//')
    this.hostname = hostUrlArray[hostUrlArray.length - 1]
    this.documents = documents
    this.approvalData = approvalData
    this.orgId = orgId
    this.sessionId = sessionId
    this.res = res

    this.versionIds = {}

    this.start()
  }

  async start() {
    try {
      await this.makeApprovalPage()
      for (let doc of this.documents) {
        await this.convertDoc(doc)
      }
      await this.removeApprovalPage()

      this.res.writeHead(200, { 'Content-Type': 'application/json' })
      this.res.write(JSON.stringify(this.versionIds))
      this.res.end()
    } catch (e) {
      console.error(e.stack)
      this.res.status(400).json({ error: e.toString() })
    }
  }

  async convertDoc(doc) {
    try {
      const { templateName, templateExtension, templateVersionId, itemId, pdfDocumentId, itemRevisionId, stamps } = doc
      let fileName = templateName
      let fileNameNoExt = templateName
      if (templateExtension) {
        const ext = '.' + templateExtension
        fileNameNoExt = fileName.replace(new RegExp(ext + '$', 'i'), '')
        fileName = fileNameNoExt + ext
      }
      const hex = fileName.replace('.', '_') + crypto.randomBytes(10).toString('hex')
      const hexDOCName = hex + '.doc'
      const hexPDFName = hex + '.pdf'

      // move doc from sf to aspose
      await Aspose.moveFileToAspose(this.hostname, this.sessionId, hexDOCName, templateVersionId)

      // download file as pdf (convert on aspose)
      await Aspose.downloadFile(hexDOCName, '', 'pdf', hexPDFName)

      // add watermark
      hummusUtils.main(stamps, hexPDFName)

      // append approval data
      if (this.approvalData && this.templateHexNewName) {
        await hummusUtils.appendPage(hexPDFName, this.templateHexNewName)
      }

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
      await Aspose.deleteFile('', hexDOCName, null)
    } catch (e) {
      console.error(e)
    }
  }

  async makeApprovalPage() {
    if (this.approvalData == null) { return }
    try {
      this.templateHexName = approvalTemplateName.replace('.', '_') + crypto.randomBytes(10).toString('hex') + '.doc'
      this.templateHexNewName = this.templateHexName.replace('.doc', '.pdf')
      await Aspose.newFileFromTemplate(approvalTemplateName, 'Templates', this.templateHexName, JSON.stringify(this.approvalData))
      await Aspose.downloadFile(this.templateHexName, 'Templates', 'pdf', this.templateHexNewName)
    } catch (e) {
      console.error(e.stack)
    }
  }

  async removeApprovalPage() {
    if (this.approvalData == null) { return }
    try {
      fs.unlinkSync(this.templateHexNewName)
      await Aspose.deleteFile('Templates', this.templateHexName, null)
    } catch (e) {
      console.error(e.stack)
    }
  }
}

module.exports = Watermark
