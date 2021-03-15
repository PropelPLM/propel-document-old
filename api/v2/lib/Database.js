const { Client } = require('pg')
const dbClientConfig = {
  connectionString: (process.env.DATABASE_URL || 'watermark_local_test'),
  ssl: { rejectUnauthorized: false },
}

const insertRecord = async (orgId, callType, fileName, pageCount) => {
  const client = new Client(dbClientConfig)
  client.connect()
  try {
    const qText = 'INSERT INTO user_execute_log(org_id, call_type, file_name, page_count, datetime) values($1, $2, $3, $4, $5)'
    await client.query(qText, [orgId, callType, fileName, pageCount, new Date()])
    client.end()
  } catch (e) {
    console.error(e.stack)
  }
}

const getOrgTable = async (orgId, month, year) => {
  const client = new Client(dbClientConfig)
  client.connect();
  orgId = orgId + '%'
  year = year ? year : (new Date).getFullYear()
  let extractMonth = month ? 'EXTRACT(MONTH FROM datetime) = ' + month + ' and ' : ''
  let extractYear = ' EXTRACT(YEAR FROM datetime) = ' + year + ' and '
  try {
    const { rows } = await client.query('SELECT * FROM user_execute_log WHERE ' + extractMonth + extractYear + ' org_id LIKE $1', [orgId]);
    client.end()
    return rows
  } catch (e) {
    console.error(e.stack)
  }
}

const clearTable = async(cb) => {
  const client = new Client(dbClientConfig)
  client.connect()
  const date = new Date()
  const firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  try {
    await client.query(`DELETE FROM user_execute_log WHERE datetime < '${firstDay.toISOString()}'`);
    client.end()
    cb('Table Cleared')
  } catch (e) {
    console.error(e.stack)
    cb(e.stack)
  }
}
const createTable = async(cb) => {
  const client = new Client(dbClientConfig)
  client.connect()
  client.query('CREATE TABLE user_execute_log(' +
    'org_id varchar(20),' +
    'call_type varchar(30),' +
    'file_name varchar(220),' +
    'datetime timestamp with time zone,' +
    'page_count integer,' +
    'id serial PRIMARY KEY NOT NULL )',
    (err, res) => {
      if (err) throw err
      client.end()
      cb('Table Schema Created')
    }
  )
}

const dropTable = async(cb) => {
  const client = new Client(dbClientConfig)
  client.connect()
  client.query('DROP TABLE user_execute_log',
    (err, res) => {
      if (err) throw err
      client.end()
      cb('Dropped table')
    }
  )
}
module.exports = {
  insertRecord,
  getOrgTable,
  dropTable,
  createTable,
  clearTable,
}


