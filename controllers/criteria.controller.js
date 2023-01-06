const oracleDb = require('oracledb');
const dbConfig = require("../config/db.config");
const connection = require('../models/db');

exports.getAllCriteria = (req, res) => {
    getAllCriteria(req, res);
}
exports.getCriteriaById = (req, res) => {
    getCriteriaById(req, res);
}
exports.create = (req, res) => {
    createCriteria(req, res);
}

exports.update = (req, res) => {
    updateCriteria(req, res);
    //deleteSegmentMapping(req, res);
}

exports.delete = (req, res) => {
    deleteCriteria(req, res);
}

async function getAllCriteria(req, res) {
    oracleDb.getConnection({
        user: dbConfig.USER,
        password: dbConfig.PASSWORD,
        connectString: dbConfig.CONNECTION_STRING
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return res.status(500).send({ message: err.message });
        }
        console.log('query name is',req.query.name)
        let getSql=(req.query.name   ? `SELECT  a.CRITERIA_ID,
        a.SOURCE_APP_ID,
        b.APPLICATION_NAME AS SOURCE_APP_NAME,
        a.TARGET_APP_ID,
        c.APPLICATION_NAME AS TARGET_APP_NAME,
        a.CRITERIA_NAME,
        a.CRITERIA_DESCRIPTION,
        a.ENABLE_FLAG, 
        a.START_DATE,
        a.END_DATE
        FROM "XX_COA_CRITERIA_MAPPING" a
        INNER JOIN "XX_COA_APPLICATION_DEFINITION" b
        ON a.SOURCE_APP_ID = b.APPLICATION_ID
        INNER JOIN "XX_COA_APPLICATION_DEFINITION" c
        ON a.TARGET_APP_ID = c.APPLICATION_ID
        WHERE UPPER(a.Criteria_Name) LIKE  UPPER(:bv)`:
        `SELECT  a.CRITERIA_ID,
        a.SOURCE_APP_ID,
        b.APPLICATION_NAME AS SOURCE_APP_NAME,
        a.TARGET_APP_ID,
        c.APPLICATION_NAME AS TARGET_APP_NAME,
        a.CRITERIA_NAME,
        a.CRITERIA_DESCRIPTION,
        a.ENABLE_FLAG, 
        a.START_DATE,
        a.END_DATE
        FROM "XX_COA_CRITERIA_MAPPING" a
        INNER JOIN "XX_COA_APPLICATION_DEFINITION" b
        ON a.SOURCE_APP_ID = b.APPLICATION_ID
        INNER JOIN "XX_COA_APPLICATION_DEFINITION" c
        ON a.TARGET_APP_ID = c.APPLICATION_ID`)

        let query=req.query.name
       
        const pattern =`%${query}%`
        
        connection.execute(getSql, req.query.name ?{ bv: pattern } : {}, { outFormat: oracleDb.OUT_FORMAT_OBJECT },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send({ message: err.message });
                }
                connection.commit();
                console.log(result);
                connection.release();
                console.log("result is",result)
                return res.send(result.rows);
            });
    });
}

async function getCriteriaById(req, res) {
    oracleDb.getConnection({
        user: dbConfig.USER,
        password: dbConfig.PASSWORD,
        connectString: dbConfig.CONNECTION_STRING
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return res.status(500).send({ message: "Internal Server Error" });
        }
        console.log(req.body);
        connection.execute(`SELECT 
        "XX_COA_SEGMENT_MAPPING".SOURCE_SEGMENT_ID,
        "XX_COA_SEGMENT_MAPPING".TARGET_SEGMENT_ID,
        "XX_COA_CRITERIA_MAPPING".*
        FROM "XX_COA_CRITERIA_MAPPING" 
        INNER JOIN "XX_COA_SEGMENT_MAPPING" 
        ON "XX_COA_CRITERIA_MAPPING".CRITERIA_ID = "XX_COA_SEGMENT_MAPPING".CRITERIA_ID
        WHERE "XX_COA_CRITERIA_MAPPING".CRITERIA_ID = :id`, { id: req.params.id }, { outFormat: oracleDb.OUT_FORMAT_OBJECT },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send({ message: "Internal Server Error" });
                }
                connection.commit();
                console.log(result);
                connection.release();

                return res.send(result.rows);
            });
    });
}

async function createCriteria(req, res) {
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
        console.log(req.body);
        connection.execute(`INSERT INTO 
            "XX_COA_CRITERIA_MAPPING" (CRITERIA_ID, 
            CRITERIA_NAME, 
            CRITERIA_DESCRIPTION,
            SOURCE_APP_NAME,
            TARGET_APP_NAME,
            ENABLE_FLAG,
            START_DATE,
            END_DATE,
            SOURCE_APP_ID,
            TARGET_APP_ID
            ) VALUES (XX_COA_CRIT_ID_S.nextval, :1, :2, :3, :4, :5, :6, :7, :8, :9)`, [
                req.body.name,
                req.body.description,
                req.body.sourceApp,
                req.body.targetApp,
                req.body.isEnable,
                req.body.startDate,
                req.body.endDate,
                req.body.sourceApp,
                req.body.targetApp,
            ], { autoCommit: true },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send(err.message);
                }
                // connection.commit();
                // console.log(result);
                // //connection.release();

                // //return res.send({ result: result, data: req.body });
            });



        var _sourceSegments = req.body.sourceSegments.toString().split(",");
       
        var _targetSegments = req.body.targetSegments.toString().split(',');
        console.log(_targetSegments);

        _sourceSegments.forEach(sSegment => {
            _targetSegments.forEach(tSegment => {
                console.log("sSegment",sSegment)
                console.log("tSegmet",tSegment)
                connection.execute(`INSERT INTO "XX_COA_SEGMENT_MAPPING" (
                        SEGMENT_MAPPING_ID,
                        CRITERIA_ID,
                        SOURCE_SEGMENT_ID,
                        TARGET_SEGMENT_ID,
                        ENABLE_FLAG,
                        START_DATE,
                        END_DATE) VALUES (XX_COA_SEGM_MAP_ID_S.nextval, XX_COA_CRIT_ID_S.currval, :1, :2, :3, :4, :5)`, [
                        parseInt(sSegment),
                        parseInt(tSegment),
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
                    });
            });
        });

        connection.commit();
        connection.release();

        return res.send('success');
    });
}

async function updateCriteria(req, res) {
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
        console.log(req.body);

        connection.execute(`UPDATE
            "XX_COA_CRITERIA_MAPPING" SET 
            CRITERIA_NAME = :name, 
            CRITERIA_DESCRIPTION = :description,
            SOURCE_APP_NAME = :sourceApp,
            TARGET_APP_NAME = :targetApp,
            ENABLE_FLAG = :isEnable,
            START_DATE = :startDate,
            END_DATE = :endDate
            WHERE CRITERIA_ID = :id`, {
                id: req.body.id,
                name: req.body.name,
                description: req.body.description,
                sourceApp: req.body.sourceApp,
                targetApp: req.body.targetApp,
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
                //console.log(result);
                connection.release();
                deleteSegmentMapping(req, res);
                // return res.send({ result: result, data: req.body });
            });

        // connection.commit();
        // connection.release()

        return res.send('success');
    });

    // deleteSegmentMapping(req, res);
    // addNewSegmentMapping(req, res);

}

async function deleteSegmentMapping(req, res) {
    oracleDb.getConnection({
        user: dbConfig.USER,
        password: dbConfig.PASSWORD,
        connectString: dbConfig.CONNECTION_STRING
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            //return err.status(500).send(err.message);
            //return;
        }
        connection.execute(`DELETE FROM 
            "XX_COA_SEGMENT_MAPPING"
            WHERE CRITERIA_ID = :id`, {
                id: req.body.id
            }, { autoCommit: true },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send(err.message);
                }
                console.log('delete called');
                connection.commit();
                // console.log(result);
                connection.release();

                //return res.send();
            });
        addNewSegmentMapping(req, res);
    });
}

async function addNewSegmentMapping(req, res) {

    oracleDb.getConnection({
        user: dbConfig.USER,
        password: dbConfig.PASSWORD,
        connectString: dbConfig.CONNECTION_STRING
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            //return err.status(500).send(err.message);
            //return;
        }
        console.log(req.body);
        var _sourceSegments = req.body.sourceSegments.toString().split(",");
        console.log(_sourceSegments);

        var _targetSegments = req.body.targetSegments.toString().split(',');
        console.log(_targetSegments);


        console.log('add called');

        _sourceSegments.forEach(sSegment => {
            _targetSegments.forEach(tSegment => {
                connection.execute(`INSERT INTO "XX_COA_SEGMENT_MAPPING" (
                        SEGMENT_MAPPING_ID,
                        CRITERIA_ID,
                        SOURCE_SEGMENT_ID,
                        TARGET_SEGMENT_ID,
                        ENABLE_FLAG,
                        START_DATE,
                        END_DATE) VALUES (XX_COA_SEGM_MAP_ID_S.nextval, :1, :2, :3, :4, :5, :6)`, [
                        req.body.id,
                        parseInt(sSegment),
                        parseInt(tSegment),
                        req.body.isEnable,
                        req.body.startDate,
                        req.body.endDate
                    ], { autoCommit: true },
                    function(err, result) {
                        if (err) {
                            console.error(err.message);
                            connection.release();
                            //return res.status(500).send(err.message);
                        }
                    });
            });
        });

        connection.commit();
        connection.release();

    });
}

async function updateCriteria_depricated(req, res) {
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
        console.log(req.body);
        // connection.execute(`UPDATE
        //     "SYS"."XX_COA_CRITERIA_MAPPING" SET 
        //     CRITERIA_NAME = :name, 
        //     CRITERIA_DESCRIPTION = :description,
        //     SOURCE_APP_NAME = :sourceApp,
        //     TARGET_APP_NAME = :targetApp,
        //     ENABLE_FLAG = :isEnable,
        //     START_DATE = :startDate,
        //     END_DATE = :endDate
        //     WHERE CRITERIA_ID = :id`, {
        //         id: req.body.id,
        //         name: req.body.name,
        //         description: req.body.description,
        //         sourceApp: req.body.sourceApp,
        //         targetApp: req.body.targetApp,
        //         isEnable: req.body.isEnable,
        //         startDate: req.body.startDate,
        //         endDate: req.body.endDate
        //     }, { autoCommit: true },
        //     function(err, result) {
        //         if (err) {
        //             console.error(err.message);
        //             connection.release();
        //             return res.status(500).send(err.message);
        //         }
        //         // connection.commit();
        //         // console.log(result);
        //         // connection.release();

        //         // return res.send({ result: result, data: req.body });
        //     });

        var _sourceSegments = req.body.sourceSegments.toString().split(",");
        console.log(_sourceSegments);

        var _targetSegments = req.body.targetSegments.toString().split(',');
        console.log(_targetSegments);

        var existingSourceSegments = [];

        connection.execute(`SELECT SEGMENT_MAPPING_ID, SOURCE_SEGMENT_ID, TARGET_SEGMENT_ID FROM
            "XX_COA_SEGMENT_MAPPING" WHERE CRITERIA_ID = :id`, {
                id: req.body.id
            }, { outFormat: oracleDb.OUT_FORMAT_OBJECT },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send({ message: err.message });
                }

                existingSourceSegments = result.rows;

                //console.log("existingSourceSegments: " + existingSourceSegments);

                for (var i = 0; i < existingSourceSegments.length; i++) {
                    console.log(existingSourceSegments[i].SOURCE_SEGMENT_ID);

                    if (_sourceSegments.indexOf(existingSourceSegments[i].SOURCE_SEGMENT_ID.toString()) < 0) {
                        console.log("delete: " + existingSourceSegments[i].SOURCE_SEGMENT_ID);
                        //continue;

                        connection.execute(`DELETE FROM 
                    "XX_COA_SEGMENT_MAPPING"
                    WHERE SOURCE_SEGMENT_ID = :id`, {
                                id: existingSourceSegments[i].SOURCE_SEGMENT_ID
                            }, { autoCommit: true },
                            function(err, result) {
                                if (err) {
                                    console.error(err.message);
                                    connection.release();
                                    return res.status(500).send(err.message);
                                }
                            });
                        continue;
                    } else {
                        console.log("check for new targets: " + existingSourceSegments[i].SOURCE_SEGMENT_ID);


                        // var existingTargetSegmentsList = existingSourceSegments['TARGET_SEGMENT_ID'].toList();
                        var existingTargetSegmentsList = existingSourceSegments.map(e => e.TARGET_SEGMENT_ID.toString());

                        console.log(existingTargetSegmentsList);

                        //check body for new targets
                        for (var j = 0; j < _targetSegments.length; j++) {
                            console.log("tSegment: " + _targetSegments[j]);
                            if (existingTargetSegmentsList.indexOf(_targetSegments[j] > -1)) {
                                console.log('new target not found');
                                continue;
                            } else {

                                console.log('new target found');
                                //continue;

                                connection.execute(`INSERT INTO "XX_COA_SEGMENT_MAPPING" (
                                    SEGMENT_MAPPING_ID,
                                    CRITERIA_ID,
                                    SOURCE_SEGMENT_ID,
                                    TARGET_SEGMENT_ID,
                                    ENABLE_FLAG,
                                    START_DATE,
                                    END_DATE) VALUES (XX_COA_SEGM_MAP_ID_S.nextval, :1, :2, :3, :4, :5, :6)`, [
                                        req.body.id,
                                        parseInt(existingSourceSegments[i]),
                                        parseInt(_targetSegments[j]),
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
                                    });
                            }
                        }

                        for (var l = 0; l < existingTargetSegmentsList.length; l++) {
                            if (!(_targetSegments.indexOf(existingTargetSegmentsList[l]) > -1)) {
                                //delete target
                                console.log('delete target: ' + 'source: ' + existingSourceSegments[i].SOURCE_SEGMENT_ID + ' target: ' + existingTargetSegmentsList[l]);
                                //continue;
                                connection.execute(`DELETE FROM 
                    "XX_COA_SEGMENT_MAPPING"
                    WHERE TARGET_SEGMENT_ID = :targetId AND SOURCE_SEGMENT_ID = :sourceId`, {
                                        targetId: existingTargetSegmentsList[l],
                                        sourceId: existingSourceSegments[i].SOURCE_SEGMENT_ID
                                    }, { autoCommit: true },
                                    function(err, result) {
                                        if (err) {
                                            console.error(err.message);
                                            connection.release();
                                            return res.status(500).send();
                                        }
                                    });
                            }
                        }
                    }
                }


                var existingSourceSegmentsList = existingSourceSegments.map(e => e.SOURCE_SEGMENT_ID.toString());

                for (var k = 0; k < _sourceSegments.length; k++) {

                    if (existingSourceSegmentsList.indexOf(_sourceSegments[k]) < 0) {
                        //continue;
                        _targetSegments.forEach(tSegment => {
                            connection.execute(`INSERT INTO "XX_COA_SEGMENT_MAPPING" (
                                    SEGMENT_MAPPING_ID,
                                    CRITERIA_ID,
                                    SOURCE_SEGMENT_ID,
                                    TARGET_SEGMENT_ID,
                                    ENABLE_FLAG,
                                    START_DATE,
                                    END_DATE) VALUES (XX_COA_SEGM_MAP_ID_S.nextval, XX_COA_CRIT_ID_S.currval, :1, :2, :3, :4, :5)`, [
                                    parseInt(_sourceSegments[k]),
                                    parseInt(tSegment),
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
                                });
                        });
                    }
                }
            });

        connection.commit();
        //console.log(result);
        connection.release();

        return res.send('success');
    });
}

async function deleteCriteria(req, res) {
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
        console.log(req.params.id);
        connection.execute(`DELETE FROM 
            "XX_COA_CRITERIA_MAPPING"
            WHERE CRITERIA_ID = :id`, {
                id: req.params.id
            }, { autoCommit: true },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send(err.message);
                }
                // connection.commit();
                // console.log(result);
                // connection.release();

                // return res.send();
            });
        connection.execute(`DELETE FROM 
            "XX_COA_MAPPING_VALUES"
            WHERE CRITERIA_ID = :id`, {
                id: req.params.id
            }, { autoCommit: true },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send(err.message);
                }
                // connection.commit();
                // console.log(result);
                // connection.release();

                // return res.send();
            });

        connection.execute(`DELETE FROM 
            "XX_COA_SEGMENT_MAPPING"
            WHERE CRITERIA_ID = :id`, {
                id: req.params.id
            }, { autoCommit: true },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send(err.message);
                }
                // connection.commit();
                // console.log(result);
                // connection.release();

                // return res.send();
            });

        connection.commit();
        connection.release();

        return res.send('success');
    });
}