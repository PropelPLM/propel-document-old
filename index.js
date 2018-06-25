// letiables
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const Watermark = require('./lib/Watermark')
const Template = require('./lib/Template')
const Database = require('./lib/Database')
const Json2csvParser = require('json2csv').Parser
const parser = new Json2csvParser({ fields: ['org_id', 'call_type', 'file_name', 'datetime', 'page_count',] })

// app Configuration
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}))
app.use(express.static(__dirname + '/public'))
app.listen((process.env.PORT || 8080))

app.get('/', (req, res) => res.send('live'))

app.post('/watermark', (req, res) => {
  console.log('watermark')
  const { documents, approvalData, hostUrl, sessionId, orgId } = req.body
  let hostUrlArray = hostUrl.split('//')
  let hostname = hostUrlArray[hostUrlArray.length - 1];
  new Watermark(documents, approvalData, hostname, sessionId, orgId, res)
})

app.post('/template', (req, res) => {
  console.log('template')
  const { hostUrl, sessionId, orgId, recordId, templateNameOnAspose, newFileName, dataToPopulate } = req.body
  let hostUrlArray = hostUrl.split('//')
  let hostname = hostUrlArray[hostUrlArray.length - 1];
  new Template(hostname, sessionId, orgId, recordId, templateNameOnAspose, newFileName, dataToPopulate, res)
})

app.get('/getOrgTable', function (req, res) {
  const orgId = req.query.orgId
  const month = req.query.month
  const year = req.query.year
  const secret = req.query.secret
  if (secret == 'iloveboms') {
    new Database().getOrgTable(orgId, month, year, (records) => {
      const csv = parser.parse(records)
      res.setHeader('Content-disposition', 'attachment; filename=testing.csv')
      res.set('Content-Type', 'text/csv')
      res.status(200).write(csv)
      res.end()
    })
  } else {
    res.send('error secret')
  }
})

app.get('/getOrgMonthPageCount', function (req, res) {
  const orgId = req.query.orgId
  const cMonth = (new Date).getMonth() + 1
  const cYear = (new Date).getFullYear()
  new Database().getOrgTable(orgId, cMonth, cYear, (records) => {
    let count = 0
    for (let r of records) {
      count += r.page_count
    }
    res.status(200)
    res.send({ page_count: count })
  })
})
// only first time use
app.get('/db/createTable', function (req, res) {
  new Database().createTable((msg) => { res.send(msg) })
})
// app.get('/db/dropTable', function(req, res){
//   new Database().dropTable((msg) => { res.send(msg) });
// });
