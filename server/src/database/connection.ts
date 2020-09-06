import knex from 'knex';
import path from 'path'
//npm install sqlite3 para usar o sqlite como database.
const connection = knex({
  client:'sqlite3',
  connection:{
    filename: path.resolve(__dirname,'database.sqlite')
  },
  useNullAsDefault: true
});

export default connection;