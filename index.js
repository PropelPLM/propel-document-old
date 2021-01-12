// letiables
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

// app Configuration
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}))
app.listen((process.env.PORT || 8080))

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => res.send('live'))

app.use('/', require('./api/v0'))
app.use('/v1', require('./api/v1'))
app.use('/v2', require('./api/v2'))

// only first time use
// app.get('/db/createTable', function (req, res) {
//   Database.createTable((msg) => { res.send(msg) })
// })
// app.get('/db/dropTable', function(req, res){
//   Database.dropTable((msg) => { res.send(msg) });
// });
