// var express = require('express');
// var router = express.Router();
const oracleDb = require('oracledb');

exports.testConnection = (req, res) => {
    console.log("Oracle client library version is " + oracleDb.oracleClientVersionString);
    oracleDb.outFormat = oracleDb.OUT_FORMAT_OBJECT;

    run();
    res.status(200).send({ message: "successful db connection" });

}

async function run() {

    let connection;

    try {
        connection = await oracleDb.getConnection({
            user: "coa",
            password: "coa",
            connectString: "localhost:1521"
        });

        console.log('You are connected to the database');

        // const result = await connection.execute(
        //     `Insert into XX_COA_APPLICATION_DEFINITION Values` +
        //     `(:0, :1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13, :14, 
        // :15, :16, :17, :18, :19, :20, :21
        // )`, [], // bind value for :id
        // );
        // console.log(result.rows);

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}