const oracleDb = require('oracledb');
const dbConfig = require("../config/db.config");

const connection = oracleDb.getConnection({
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    connectString: dbConfig.CONNECTION_STRING
});

module.exports = connection;