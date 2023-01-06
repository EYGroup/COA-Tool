const { accepts } = require('express/lib/request');
const oracleDb = require('oracledb');
const dbConfig = require("../config/db.config");
const connection = require('../models/db');

exports.getAllSegments = (req, res) => {
    getAllSegments(req, res);
}


exports.getSegmentsByApplicationId = (req, res) => {
    getAllSegmentsByApplicationId(req, res);
}

exports.create = (req, res) => {
    createSegment(req, res);
}

exports.update = (req, res) => {
    updateSegment(req, res);
}

exports.delete = (req, res) => {
    deleteSegment(req, res);
}

async function getAllSegments(req, res) {
    oracleDb.getConnection({
        user: dbConfig.USER,
        password: dbConfig.PASSWORD,
        connectString: dbConfig.CONNECTION_STRING
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return err.status(500).send({ message: err.message });
            //return;
        }
        let id=req.query.id
        let segName=req.query.name
        const pattern =`%${segName}%`
        let getSql=(req.query.name) ? `SELECT  * FROM
        "XX_COA_SEGMENT_DEFINITION" where application_id = ${id} AND UPPER(SEGMENT_NAME) LIKE  UPPER(:bv)`
        
        : `SELECT  * FROM "XX_COA_SEGMENT_DEFINITION" where application_id = ${id}`
        

        
        connection.execute(getSql, req.query.name ?{ bv: pattern } : {}, { outFormat: oracleDb.OUT_FORMAT_OBJECT },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send({ message: err.message });
                    //return res.send(err.message);

                }
                connection.commit();
                console.log("")
                connection.release();

                return res.send(result.rows);
            });
    });
}



async function getAllSegmentsByApplicationId(req, res) {
    oracleDb.getConnection({
        user: dbConfig.USER,
        password: dbConfig.PASSWORD,
        connectString: dbConfig.CONNECTION_STRING
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return err.status(500).send({ message: err.message });
            //return;
        }
       
        connection.execute(`SELECT  * FROM
        "XX_COA_SEGMENT_DEFINITION" WHERE APPLICATION_ID = :id`, { id: req.params.id }, { outFormat: oracleDb.OUT_FORMAT_OBJECT },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send({ message: err.message });
                    //return res.send(err.message);

                }
                connection.commit();
               
                connection.release();

                return res.send(result.rows);
            });
    });
}

async function createSegment(req, res) {
    oracleDb.getConnection({
        user: dbConfig.USER,
        password: dbConfig.PASSWORD,
        connectString: dbConfig.CONNECTION_STRING
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return res.sstat
                //return;
        }
        console.log(req.body);
        var _ds = 1;
        console.log("1. _ds: " + _ds);
        // connection.execute(`SELECT  MAX(DISPLAY_SEQUENCE) MAX FROM
        // "XX_COA_SEGMENT_DEFINITION" WHERE APPLICATION_ID = :id`, { id: req.body.applicationid }, { outFormat: oracleDb.OUT_FORMAT_OBJECT },
        //     function(err, result) {
        //         if (err) {
        //             console.error(err.message);
        //             connection.release();
        //             return res.status(500).send({ message: err.message });
        //             //return res.send(err.message);

        //         }
        //         connection.commit();
        //         console.log(result);
        //         //connection.release();

        //         //return res.send(result.rows);
        //         var maxVal = result.rows[0].MAX;
        //         console.log("2. maxVal: " + maxVal);

        //         if (maxVal != null) {
        //             if (req.body.displaysequence >= maxVal) {
        //                 _ds = maxVal + 1;
        //             } else {
        //                 //less 
        //                 var startVal = req.body.displaysequence;
        //                 connection.execute(`SELECT * FROM
        //                 "XX_COA_SEGMENT_DEFINITION" WHERE APPLICATION_ID = :id AND DISPLAY_SEQUENCE >= :displaySequence ORDER BY DISPLAY_SEQUENCE`, { id: req.body.applicationid, displaySequence: req.body.displaysequence }, { outFormat: oracleDb.OUT_FORMAT_OBJECT },
        //                     function(err, result) {
        //                         if (err) {
        //                             console.error(err.message);
        //                             connection.release();
        //                             return res.status(500).send({ message: err.message });
        //                             //return res.send(err.message);

        //                         }
        //                         connection.commit();
        //                         console.log(result);
        //                         //connection.release();

        //                         //return res.send(result.rows);

        //                         result.rows.forEach(row => {
        //                             startVal = startVal + 1;
        //                             console.log(startVal);
        //                             console.log(row.SEGMENT_ID);
        //                             //updateSegmentSequnce(row.SEGMENT_ID, startVal);
        //                             connection.execute(`UPDATE
        //                             "XX_COA_SEGMENT_DEFINITION" 
        //                             SET 
        //                             DISPLAY_SEQUENCE = :displaySequence,
        //                             WHERE SEGMENT_ID = :id`, {
        //                                     displaySequence: startVal,
        //                                     id: row.SEGMENT_ID
        //                                 }, { autoCommit: true },
        //                                 function(err, result) {
        //                                     if (err) {
        //                                         console.error(err.message);
        //                                         connection.release();
        //                                         //return res.status(500).send({ message: err.message });
        //                                     }
        //                                     connection.commit();
        //                                     console.log(result);
        //                                     //connection.release();

        //                                     //return res.send({ result: result, data: req.body });
        //                                 });
        //                         });
        //                     });
        //             }
        //         }
        //     });


        connection.execute(`INSERT INTO 
            "XX_COA_SEGMENT_DEFINITION" (SEGMENT_ID,
            APPLICATION_ID, 
            SEGMENT_NAME, 
            APPLICATION_DESCRIPTION,
            DISPLAY_SEQUENCE,
            SOURCE_APP_FLAG,
            TARGET_APP_FLAG,
            ENABLE_FLAG,
            START_DATE,
            END_DATE
            ) VALUES (XX_COA_SEGM_ID_S.nextval,:1, :2, :3, :4, :5, :6, :7, :8, :9)`, [
                req.body.applicationid,
                req.body.name,
                req.body.applicationdescription,
                req.body.displaysequence,
                req.body.issourceapp,
                req.body.istargetapp,
                req.body.isenabled,
                req.body.startDate,
                req.body.endDate
            ], { autoCommit: true },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send({ message: "Internal Server Error" });
                }
                connection.commit();
                console.log(result);
                connection.release();

                return res.send({ result: result, data: req.body });
            });
    });
}

async function updateSegment(req, res) {
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
        connection.execute(`UPDATE
            "XX_COA_SEGMENT_DEFINITION" 
            SET 
            APPLICATION_ID = :applicationId, 
            SEGMENT_NAME = :segmentName, 
            APPLICATION_DESCRIPTION = :applicationDescription,
            DISPLAY_SEQUENCE = :displaySequence,
            SOURCE_APP_FLAG = :isSourceapp,
            TARGET_APP_FLAG = :isTargetApp,
            ENABLE_FLAG = :isEnable,
            START_DATE = :startdate,
            END_DATE = :enddate
            WHERE SEGMENT_ID = :segmentId`, {
                applicationId: req.body.applicationid,
                segmentName: req.body.name,
                applicationDescription: req.body.applicationdescription,
                displaySequence: req.body.displaysequence,
                isSourceapp: req.body.issourceapp,
                isTargetApp: req.body.istargetapp,
                isEnable: req.body.isenabled,
                startdate: req.body.startDate,
                enddate: req.body.endDate,
                segmentId: req.body.segmentid
            }, { autoCommit: true },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send({ message: err.message });
                }
                connection.commit();
                console.log(result);
                connection.release();

                return res.send({ result: result, data: req.body });
            });
    });
}

async function deleteSegment(req, res) {
    oracleDb.getConnection({
        user: dbConfig.USER,
        password: dbConfig.PASSWORD,
        connectString: dbConfig.CONNECTION_STRING
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return res.status(500).send({ message: "Internal Server Error" });
            //return;
        }
        console.log(req.params.id);
        connection.execute(`DELETE FROM 
            "XX_COA_SEGMENT_DEFINITION"
            WHERE SEGMENT_ID = :id`, {
                id: req.params.id
            }, { autoCommit: true },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send({ message: "Internal Server Error" });
                }
                connection.commit();
                console.log(result);
                connection.release();

                return res.send();
            });
    });
}

async function updateSegmentSequnce(id, displaySequence) {
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
        //console.log(req.body);
        connection.execute(`UPDATE
            "XX_COA_SEGMENT_DEFINITION" 
            SET 
            DISPLAY_SEQUENCE = :displaySequence,
            WHERE SEGMENT_ID = :id`, {
                displaySequence: displaySequence,
                id: id
            }, { autoCommit: true },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    //return res.status(500).send({ message: err.message });
                }
                connection.commit();
                console.log(result);
                connection.release();

                //return res.send({ result: result, data: req.body });
            });
    });
}