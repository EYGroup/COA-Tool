const oracleDb = require('oracledb');
const dbConfig = require("../config/db.config");
const connection = require('../models/db');

exports.getAll = (req, res) => {
    getAllMappingValues(req, res);
}

exports.create = (req, res) => {
    createMappingValue(req, res);
}

exports.update = (req, res) => {
    updateMappingValue(req, res);
}

exports.delete = (req, res) => {
    deleteMappingValue(req, res);
}



async function getAllMappingValues(req, res) {
    oracleDb.getConnection({
        user: dbConfig.USER,
        password: dbConfig.PASSWORD,
        connectString: dbConfig.CONNECTION_STRING
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return err.status(500).send(err.message);
            //return;
        }
        let getSql=(req.query.name   ? `SELECT 
        "XX_COA_MAPPING_VALUES".VALUE_ID,
        "XX_COA_CRITERIA_MAPPING".CRITERIA_ID,
        "XX_COA_CRITERIA_MAPPING".CRITERIA_NAME,
        "XX_COA_MAPPING_VALUES".DESCRIPTION,
        "XX_COA_MAPPING_VALUES".SOURCE_VALUE,
        "XX_COA_MAPPING_VALUES".TARGET_VALUE,
        "XX_COA_MAPPING_VALUES".ENABLE_FLAG,
        "XX_COA_MAPPING_VALUES".START_DATE,
        "XX_COA_MAPPING_VALUES".END_DATE
        FROM 
        "XX_COA_MAPPING_VALUES"
        INNER JOIN "XX_COA_CRITERIA_MAPPING"
        ON "XX_COA_MAPPING_VALUES".CRITERIA_ID = "XX_COA_CRITERIA_MAPPING".CRITERIA_ID
        WHERE UPPER("XX_COA_CRITERIA_MAPPING".CRITERIA_NAME) LIKE  UPPER(:bv)` :
         `SELECT 
        "XX_COA_MAPPING_VALUES".VALUE_ID,
        "XX_COA_CRITERIA_MAPPING".CRITERIA_ID,
        "XX_COA_CRITERIA_MAPPING".CRITERIA_NAME,
        "XX_COA_MAPPING_VALUES".DESCRIPTION,
        "XX_COA_MAPPING_VALUES".SOURCE_VALUE,
        "XX_COA_MAPPING_VALUES".TARGET_VALUE,
        "XX_COA_MAPPING_VALUES".ENABLE_FLAG,
        "XX_COA_MAPPING_VALUES".START_DATE,
        "XX_COA_MAPPING_VALUES".END_DATE
        FROM 
        "XX_COA_MAPPING_VALUES"
        INNER JOIN "XX_COA_CRITERIA_MAPPING"
        ON "XX_COA_MAPPING_VALUES".CRITERIA_ID = "XX_COA_CRITERIA_MAPPING".CRITERIA_ID`)

        let query=req.query.name
       
        const pattern =`%${query}%`

        connection.execute(getSql, req.query.name ?{ bv: pattern } : {}, { outFormat: oracleDb.OUT_FORMAT_OBJECT },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send();
                    //return res.send(err.message);

                }
                connection.commit();
                console.log(result);
                connection.release();

                return res.send(result.rows);
            });
    });
}

async function createMappingValue(req, res) {
    oracleDb.getConnection({
        user: dbConfig.USER,
        password: dbConfig.PASSWORD,
        connectString: dbConfig.CONNECTION_STRING
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return err.send(err.message);
            //return;
        }
        console.log(req.body);
        connection.execute(`INSERT INTO 
            "XX_COA_MAPPING_VALUES" (
            VALUE_ID, 
            CRITERIA_ID, 
            DESCRIPTION,
            SOURCE_VALUE,
            TARGET_VALUE,
            ENABLE_FLAG,
            START_DATE,
            END_DATE
            ) VALUES (XX_COA_VALUE_ID_S.nextval, :1, :2, :3, :4, :5, :6, :7)`, [
                req.body.criteriaId,
                req.body.description,
                req.body.sourceValue,
                req.body.targetValue,
                req.body.isEnable,
                req.body.startDate,
                req.body.endDate
            ], { autoCommit: true },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(400).send(err.message);
                }
                connection.commit();
                console.log(result);
                connection.release();

                return res.send({ result: result, data: req.body });
            });
    });
}

async function updateMappingValue(req, res) {
    oracleDb.getConnection({
        user: dbConfig.USER,
        password: dbConfig.PASSWORD,
        connectString: dbConfig.CONNECTION_STRING
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return res.status(500).send(err.message);
            //return;
        }
        console.log(req.body);
        connection.execute(`UPDATE
            "XX_COA_MAPPING_VALUES" SET            
            CRITERIA_ID = :criteriaId, 
            DESCRIPTION = :description,
            SOURCE_VALUE = :sourceValue,
            TARGET_VALUE = :targetValue,
            ENABLE_FLAG = :isEnable,
            START_DATE = :startDate,
            END_DATE = :endDate
            WHERE VALUE_ID = :id`, {
                id: req.body.valueId,
                criteriaId: req.body.criteriaId,
                description: req.body.description,
                sourceValue: req.body.sourceValue,
                targetValue: req.body.targetValue,
                isEnable: req.body.isEnable,
                startDate: req.body.startDate,
                endDate: req.body.endDate
            }, { autoCommit: true },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send(err.message);
                }
                connection.commit();
                console.log(result);
                connection.release();

                return res.send({ result: result, data: req.body });
            });
    });
}

async function deleteMappingValue(req, res) {
    oracleDb.getConnection({
        user: dbConfig.USER,
        password: dbConfig.PASSWORD,
        connectString: dbConfig.CONNECTION_STRING
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return res.status(500).send(err.message);
            //return;
        }
        console.log(req.params.id);
        connection.execute(`DELETE FROM 
            "XX_COA_MAPPING_VALUES"
            WHERE VALUE_ID = :id`, {
                id: req.params.id
            }, { autoCommit: true },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send(err.message);
                }
                connection.commit();
                console.log(result);
                connection.release();

                return res.send();
            });
    });
}