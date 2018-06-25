const { Client } = require('pg')

const dbClientConfig = { connectionString: (process.env.DATABASE_URL || 'watermark_local_test') }

module.exports = Database

function Database() {}

Database.prototype.insertRecord = (orgId, callType, fileName, pageCount, cb) => {
  const client = new Client(dbClientConfig)
  client.connect()
  client.query(
    'INSERT INTO user_execute_log(org_id, call_type, file_name, page_count, datetime) values($1, $2, $3, $4, $5)',
    [orgId, callType, fileName, pageCount, new Date()],
    (err) => {
      if (err) {throw err}
      client.end()
      cb('log inserted')
    }
  )
}

Database.prototype.getOrgTable = (orgId, month, year, cb) => {
  const client = new Client(dbClientConfig)
  client.connect();
  year = year ? year : (new Date).getFullYear()
  let extractMonth = month ? 'EXTRACT(MONTH FROM datetime) = ' + month + ' and ' : ''
  let extractYear = ' EXTRACT(YEAR FROM datetime) = ' + year + ' and '
  client.query('SELECT * FROM user_execute_log WHERE ' + extractMonth + extractYear + ' org_id = $1', [orgId], (err, res) => {
    if (err) {throw err}
    client.end()
    cb(res.rows)
  });
}

// Database.prototype.createTable = (cb) => {
//   const client = new Client(dbClientConfig)
//   client.connect()
//   client.query('CREATE TABLE user_execute_log(' +
//     'org_id varchar(20),' +
//     'call_type varchar(30),' +
//     'file_name varchar(220),' +
//     'datetime timestamp with time zone,' +
//     'page_count integer,' +
//     'id serial PRIMARY KEY NOT NULL )',
//     (err, res) => {
//       if (err) throw err
//       client.end()
//       cb('Table Schema Created')
//     }
//   )
// }

// Database.prototype.dropTable = (cb) => {
//   const client = new Client(dbClientConfig)
//   client.connect()
//   client.query('DROP TABLE user_execute_log',
//     (err, res) => {
//       if (err) throw err
//       client.end()
//       cb('Dropped table')
//     }
//   )
// }
