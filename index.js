// letiables
const express = require('express')
const app = express()
const bodyParser = require('body-parser')

// app Configuration
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}))
app.listen((process.env.PORT || 8080))

app.get('/', (req, res) => res.send('live'))

app.use('/', require('./api/v0'))
app.use('/', require('./api/v1'))

//TODO: to create new version, duplicate latest api version folder and use the following line to create the route
// app.use('/v1', require('./api/v1'))

// only first time use
// app.get('/db/createTable', function (req, res) {
//   Database.createTable((msg) => { res.send(msg) })
// })
// app.get('/db/dropTable', function(req, res){
//   Database.dropTable((msg) => { res.send(msg) });
// });
