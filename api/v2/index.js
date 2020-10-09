var express = require('express');
const Watermark = require('./lib/Watermark')
const Template = require('./lib/Template')
const Database = require('./lib/Database')
const Json2csvParser = require('json2csv').Parser
const parser = new Json2csvParser({ fields: ['org_id', 'call_type', 'file_name', 'datetime', 'page_count',] })

var app = module.exports = express()

app.get('/status', (req, res) => {
  res.status(200)
  res.send(__dirname.split('/').pop())
})

app.post('/watermark', (req, res) => {
  new Watermark(req.body, res)
})

app.post('/template', (req, res) => {
  new Template(req.body, res)
})

app.get('/getOrgTable', async (req, res) => {
  const { orgId, month, year, secret } = req.query
  if (secret != 'iloveboms') { return res.status(403).end() }
  const records = await Database.getOrgTable(orgId, month, year)
  const csv = parser.parse(records)
  res.setHeader('Content-disposition', 'attachment; filename=testing.csv')
  res.set('Content-Type', 'text/csv')
  res.status(200).write(csv)
  res.end()
})

app.get('/getOrgMonthPageCount', async (req, res) => {
  const orgId = req.query.orgId
  const cMonth = (new Date).getMonth() + 1
  const cYear = (new Date).getFullYear()
  const records = await Database.getOrgTable(orgId, cMonth, cYear)
  let count = 0
  for (let r of records) {
    count += r.page_count
  }
  res.status(200)
  res.send({ page_count: count })
})
// app.get('/db/createTable', function (req, res) {
//   Database.createTable((msg) => { res.send(msg) })
// })
// app.get('/db/dropTable', function(req, res){
//   Database.dropTable((msg) => { res.send(msg) });
// });
app.get('/db/clearTable', function(req, res){
  Database.clearTable((msg) => { res.send(msg) });
});
