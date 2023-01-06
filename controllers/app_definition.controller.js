const oracleDb = require('oracledb');
const dbConfig = require("../config/db.config");
const connection = require('../models/db');


exports.getAll = (req, res) => {
    getAllAppDefinition(req, res);
}

exports.getById = (req, res) => {
    getAppDefinitionById(req, res);
}

exports.getAllAppByType = (req, res) => {
    //var appType = req.params.type;

    var appType = req.query.type;
    console.log("appType: " + appType);

    if (appType == null) {
        return res.status(400).send();
    } else {
        if (appType == "source") {
            getAllSourceApp(req, res);
        } else if (appType == "target") {
            getAllTargetApp(req, res);
        } else {
            return res.status(400).send();
        }
    }
}

exports.create = (req, res) => {
    createAppDefinition(req, res);
}

exports.update = (req, res) => {
    updateAppDefinition(req, res);
}

exports.delete = (req, res) => {
    deleteAppDefinition(req, res);
}

async function getAllAppDefinition(req, res) {
    oracleDb.getConnection({
        user: dbConfig.USER,
        password: dbConfig.PASSWORD,
        connectString: dbConfig.CONNECTION_STRING
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return res.status(500).send({ message: "Internal Server Error" });
        }
      
        
        let getSql=(req.query.name   ? `SELECT * FROM XX_COA_APPLICATION_DEFINITION WHERE UPPER(APPLICATION_Name) LIKE  UPPER(:bv)` : `SELECT * FROM
        "XX_COA_APPLICATION_DEFINITION" `)
        let query=req.query.name
        const pattern =`%${query}%`
       
       
        connection.execute( getSql,
            req.query.name ?{ bv: pattern } : {},{ outFormat: oracleDb.OUT_FORMAT_OBJECT },
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


    //   const pattern = "%abc%";
    //   let result = connection.execute(
    //         `SELECT * FROM XX_COA_APPLICATION_DEFINITION WHERE APPLICATION_Name LIKE :bv`,
    //         { bv: pattern }
    //       );
    //       console.log(result);
    });
}

async function getAppDefinitionById(req, res) {
    oracleDb.getConnection({
        user: dbConfig.USER,
        password: dbConfig.PASSWORD,
        connectString: dbConfig.CONNECTION_STRING
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return res.status(500).send({ message: err.message });
        }
        console.log(req.body);
        connection.execute(`SELECT * FROM
            "XX_COA_APPLICATION_DEFINITION" WHERE APPLICATION_ID = :id`, { id: req.params.id }, { outFormat: oracleDb.OUT_FORMAT_OBJECT },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send({ message: err.message });
                    //return res.send(err.message);

                }
                connection.commit();
                console.log(result);
                connection.release();

                return res.send(result.rows[0]);
            });
    });
}

async function getAllSourceApp(req, res) {
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
        connection.execute(`SELECT * FROM
            "XX_COA_APPLICATION_DEFINITION" WHERE SOURCE_APP_FLAG = 1`, {}, { outFormat: oracleDb.OUT_FORMAT_OBJECT },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.status(500).send();
                    // return res.send(err.message);

                }
                connection.commit();
                console.log(result);
                connection.release();

                return res.send(result.rows);
            });
    });
}

async function getAllTargetApp(req, res) {
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
        connection.execute(`SELECT * FROM
            "XX_COA_APPLICATION_DEFINITION" WHERE TARGET_APP_FLAG = 1`, {}, { outFormat: oracleDb.OUT_FORMAT_OBJECT },
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

async function createAppDefinition(req, res) {
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
            "XX_COA_APPLICATION_DEFINITION" (APPLICATION_ID, 
            APPLICATION_NAME, 
            APPLICATION_DESCRIPTION,
            SOURCE_APP_FLAG,
            TARGET_APP_FLAG,
            ENABLE_FLAG,
            START_DATE,
            END_DATE
            ) VALUES (XX_COA_SEGM_ID_S.nextval, :1, :2, :3, :4, :5, :6, :7)`, [
                req.body.name,
                req.body.description,
                req.body.isSourceApp,
                req.body.isTargetApp,
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

async function updateAppDefinition(req, res) {
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
            "XX_COA_APPLICATION_DEFINITION"
            SET 
            APPLICATION_NAME = :name,
            APPLICATION_DESCRIPTION = :description,
            SOURCE_APP_FLAG = :isSourceApp,
            TARGET_APP_FLAG = :isTargetApp,
            ENABLE_FLAG = :isEnabled,
            START_DATE = :startDate,
            END_DATE = :endDate
            WHERE APPLICATION_ID = :id`, {
                name: req.body.name,
                description: req.body.description,
                isSourceApp: req.body.isSourceApp,
                isTargetApp: req.body.isTargetApp,
                isEnabled: req.body.isEnable,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                id: req.body.id
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

                return res.send({ result: result, data: req.body });
            });
    });
}

async function deleteAppDefinition(req, res) {
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
            "XX_COA_APPLICATION_DEFINITION"
            WHERE APPLICATION_ID = :id`, {
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

                return res.send(result);
            });
    });
}


function doRelease(connection) {
    connection.release(
        function(err) {
            if (err) { console.error(err.message); }
        }
    );
}

async function test(req, res) {
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
        connection.execute(`SELECT * FROM  "XX_COA_APPLICATION_DEFINITION"`, [], {
                maxRows: 1
            },
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    connection.release();
                    return res.send(err.message);
                }
                console.log(result.rows);
                connection.release();

                return res.send();
            });
    });
}