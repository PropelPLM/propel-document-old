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

    console.log('>>> documents', documents);
    console.log('>>> approvalData', approvalData);

    this.versionIds = {}
    this.changeTemplateMap = {}

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

      const { templateName, templateExtension, templateVersionId, itemId, pdfDocumentId, itemRevisionId, stamps, changeId } = doc
      let fileName = templateName
      let fileNameNoExt = templateName
      if (templateExtension) {
        const ext = '.' + templateExtension
        fileNameNoExt = fileName.replace(new RegExp(ext + '$', 'i'), '')
        fileName = fileNameNoExt + ext
      }
      const hex = crypto.randomBytes(20).toString('hex')
      const hexDOCName = hex + '.doc'
      const hexPDFName = hex + '.pdf'

      // move doc from sf to aspose
      await Aspose.moveFileToAspose(this.hostname, this.sessionId, hexDOCName, templateVersionId)

      // download file as pdf (convert on aspose)
      await Aspose.downloadFile(hexDOCName, '', 'pdf', hexPDFName)

      // add watermark
      hummusUtils.main(stamps, hexPDFName)

      // append approval data
      if (this.approvalData && this.changeTemplateMap[changeId]) {
        const templateHexName = this.changeTemplateMap[changeId];
        const templateHexNewName = templateHexName.replace('.doc', '.pdf')
        await hummusUtils.appendPage(hexPDFName, templateHexNewName)

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
}

module.exports = Watermark
