const oracleDb = require('oracledb');
const dbConfig = require("../config/db.config");
const connection = require('../models/db');


exports.getAll = (req, res) => {
    getAllSegmentMapping(req, res);
}

exports.create = (req, res) => {
    createSegmentMapping(req, res);
}

exports.update = (req, res) => {
    updateSegmentMapping(req, res);
}

exports.delete = (req, res) => {
    deleteSegmentMapping(req, res);
}


async function getAllSegmentMapping(req, res) {
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
        connection.execute(`SELECT * FROM
            "XX_COA_SEGMENT_MAPPING"`, {}, {},
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

                if (result.rows.length > 0) {
                    return res.send(result);
                } else {
                    return res.status(404).send();
                }
            });
    });
}

async function createSegmentMapping(req, res) {
    oracleDb.getConnection({
        user: dbConfig.USER,
        password: dbConfig.PASSWORD,
        connectString: dbConfig.CONNECTION_STRING
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return res.send(500).send(err.message);
            //return;
        }
        console.log(req.body);
        connection.execute(`INSERT INTO 
            "XX_COA_SEGMENT_MAPPING" (SEGMENT_MAPPING_ID, 
            CRITERIA_ID, 
            SOURCE_SEGMENT_ID,
            TARGET_SEGMENT_ID,
            ENABLE_FLAG,
            START_DATE,
            END_DATE
            ) VALUES (:1, :2, :3, :4, :5, :6, :7)`, [
                req.body.id,
                req.body.criteriaId,
                req.body.sourceSegmentId,
                req.body.targetSegmentId,
                req.body.isEnable,
                req.body.startDate,
                req.body.endDate
            ], { autoCommit: true },
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

async function updateSegmentMapping(req, res) {
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
            "XX_COA_SEGMENT_MAPPING" SET  
            CRITERIA_ID = :criteriaId, 
            SOURCE_SEGMENT_ID = :sourceSegmentId,
            TARGET_SEGMENT_ID = :targetSegmentId,
            ENABLE_FLAG = :isEnabled,
            START_DATE = :startDate,
            END_DATE = :endDate
            WHERE SEGMENT_MAPPING_ID = :id`, {
                id: req.body.id,
                criteriaId: req.body.criteriaId,
                sourceSegmentId: req.body.sourceSegmentId,
                targetSegmentId: req.body.targetSegmentId,
                isEnabled: req.body.isEnable,
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

async function deleteSegmentMapping(req, res) {
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
        console.log(req.params.id);
        connection.execute(`DELETE FROM 
            "XX_COA_SEGMENT_MAPPING"
            WHERE SEGMENT_MAPPING_ID = :id`, {
                id: req.params.id
            }, { autoCommit: true },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.send(err.message);
                }
                connection.commit();
                console.log(result);
                connection.release();

                return res.send();
            });
    });
}