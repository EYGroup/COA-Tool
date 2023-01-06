const oracleDb = require("oracledb");
const dbConfig = require("../config/db.config");
const connection = require("../models/db");
const Busboy = require("busboy");
const XLSX = require("xlsx");
const path = require("path");


exports.create = (req, res) => {
  upload(req, res);
};


function getConnection() {
  return new Promise((resolve, reject) => {
    oracleDb.getConnection({user: dbConfig.USER,
      password: dbConfig.PASSWORD,
      connectString: dbConfig.CONNECTION_STRING}
      , function(err, connection) {
      if (err) {
        reject(err);
      } 
      resolve(connection);
    });

  });
}

function get(connection, item) {
 
  return new Promise((resolve, reject) => {
    connection.execute(`select a.criteria_id,a.source_value,a.target_value
    from xx_coa_mapping_values a
    where 
    a.criteria_id = :cId
    AND a.source_value  = :sId
    AND a.target_value  = : tId`,
        {
          cId: item.CRITERIA_ID,
          sId: item.SOURCE_VALUE,
          tId: item.TARGET_VALUE,
        },
        { outFormat: oracleDb.OUT_FORMAT_OBJECT },
        function(err,result){
      if (err) {
        reject(err);
      } 
      resolve(result);
    });
  });
}

async function verifyUpload(resultData,duplicateRows,uniqueRows) {
  const connection = await getConnection();
 
  for (i in resultData) 
  {
       
      let result = resultData[i]
      const results = await get(connection, result);
      let cnt = results.rows.length;
     
      if (cnt > 0) {
        duplicateRows.push(result);
      } else {
        uniqueRows.push(result);
      }
     
  }

}

async function upload(req, res) {
  oracleDb.getConnection(
    {
      user: dbConfig.USER,
      password: dbConfig.PASSWORD,
      connectString: dbConfig.CONNECTION_STRING,
    },
    function (err, connection) {
      if (err) {
        console.error(err.message);
        return err.status(500).send(err.message);
      }

      const { busboy, files, formData } = ReadFormData(req);
      let fileData;
      let filename;

      busboy.on("finish", function () {
        for (const file of files) {
          const { fileBuffer, fileName } = file;
          filename = path.parse(fileName).name;
          const workbook = XLSX.read(fileBuffer, { type: "buffer", cellDates:true, dateNF:"dd-mm-yyyy;@" });
          fileData = XLSX.utils.sheet_to_json(
            workbook.Sheets[workbook.SheetNames[0]], {raw:true}
          );
        }
        let parentFileId =
          filename + "_" + Math.floor(Math.random() * (999 - 100 + 1) + 100);
        console.log("fileData: ", fileData)
        //--------stage 1-------Inserting to XX_BULK_UPLOAD_STAGE_TBL----
        connection.executeMany(
          `INSERT INTO 
              "XX_BULK_UPLOAD_STAGE_TBL" (SEQUENCE_ID, 
              FILE_NAME,
              CRITERIA_ID,
              PARENT_FILE_ID,
              SOURCE_VALUE,
              TARGET_VALUE,
              DESCRIPTION,
              ENABLE_FLAG,
              START_DATE,
              END_DATE
              ) VALUES (XX_BULK_UPLOAD_STAGE_SEQ_ID.nextval, :1, :2, :3, :4, :5, :6, :7, :8, :9)`,
          fileData.map((item) => {
            return [
              filename,
              formData.get("CriteriaId"),
              parentFileId,
              item.SourceValue.toString(),
              item.TargetValue.toString(),
              item.Description.toString(),
              item.EnableFlag.toString(),
              getLocalDate(item.StartDate),
              getLocalDate(item.EndDate)
            ];
          }),
          { autoCommit: true },
          function (err, result) {
            if (err) {
              console.error("err.message: ", err.message);
              connection.release();
              return res.status(400).send(err.message);
            }
          }
        );

        //----------stage 2----inserting to XX_COA_MAPPING_VALUES----
        connection.execute(
          `SELECT "XX_BULK_UPLOAD_STAGE_TBL".SOURCE_VALUE, 
            "XX_BULK_UPLOAD_STAGE_TBL".TARGET_VALUE,
            "XX_BULK_UPLOAD_STAGE_TBL".CRITERIA_ID,
            "XX_BULK_UPLOAD_STAGE_TBL".DESCRIPTION,
            "XX_BULK_UPLOAD_STAGE_TBL".ENABLE_FLAG,
            "XX_BULK_UPLOAD_STAGE_TBL".START_DATE,
            "XX_BULK_UPLOAD_STAGE_TBL".END_DATE
            FROM "XX_BULK_UPLOAD_STAGE_TBL" 
            WHERE "XX_BULK_UPLOAD_STAGE_TBL".PARENT_FILE_ID= :pId`,
          { pId: parentFileId },
          { outFormat: oracleDb.OUT_FORMAT_OBJECT },
          async function (err, result) {
            if (err) {
              console.error(err.message);
              connection.release();
              return res.status(400).send(err.message);
            }
            const resultData = result.rows;
          
            let duplicateRows=[];
            let uniqueRows=[];
            let successRows =0;
           await verifyUpload(resultData,duplicateRows,uniqueRows);


           
           if(uniqueRows.length > 0){
            connection.executeMany(
              `INSERT INTO 
                  "XX_COA_MAPPING_VALUES" (
                    VALUE_ID,
                    CRITERIA_ID,
                    SOURCE_VALUE,
                    TARGET_VALUE,
                    DESCRIPTION,
                    ENABLE_FLAG,
                    START_DATE,
                    END_DATE
                  ) VALUES (XX_COA_VALUE_ID_S.nextval, :1, :2, :3, :4, :5, :6, :7)`,
              uniqueRows.map((item) => {
                return [item.CRITERIA_ID, item.SOURCE_VALUE, item.TARGET_VALUE, item.DESCRIPTION, item.ENABLE_FLAG, item.START_DATE, item.END_DATE];
              }),
              { autoCommit: true },
              function (err, result) {
                if (err) {
                  console.error(err.message);
                  connection.release();
                  return res.status(400).send(err.message);
                }
                 successRows = result.rowsAffected;

                //------------phase 3----inserting in reults table-------
                connection.execute(
                  `INSERT INTO
                          "XX_BULK_UPLOAD_RESULTS_TBL" (
                            PARENT_FILE_ID,
                            CRITERIA_ID,
                            TOTAL_ROWS,
                            SUCCESS_ROWS,
                            FAILED_ROWS
                          ) VALUES (:1, :2, :3, :4, :5)`,
                  [
                    parentFileId,
                    resultData[0].CRITERIA_ID,
                    fileData.length,
                    result.rowsAffected,
                    fileData.length - result.rowsAffected,
                  ],
                  { autoCommit: true },
                  function (err, result) {
                    if (err) {
                      console.error(err.message);
                      connection.release();
                      return res.status(400).send(err.message);
                    }
                    connection.commit();
                    connection.release();
                   
                    return res.send({
                      result: {
                        TotalRows: fileData.length,
                        SuccessRows: successRows,
                        FailedRows: fileData.length - successRows,
                        duplicateRows,
                        
                      },
                    });
                  }
                );
              }
            )
           }else{
            res.send({
              result: {
                TotalRows: fileData.length,
                SuccessRows: successRows,
                FailedRows: fileData.length - successRows,
                duplicateRows,
               
              },
            });
              
           }
          }
        );
      });
      return req.pipe(busboy);
    }
  );
}




const ReadFormData = (req) => {
  const busboy = Busboy({ headers: req.headers });
  const formData = new Map();
  busboy.on("field", (fieldname, val) => {
    formData.set(fieldname, val);
  });

  const files = [];
  const buffers = {};
  busboy.on("file", (field, file, info) => {
    const { filename, encoding, mimeType } = info;
    buffers[field] = [];
    file.on("data", (data) => {
      buffers[field].push(data);
    });
    file.on("end", () => {
      files.push({
        fileBuffer: Buffer.concat(buffers[field]),
        fileType: mimeType,
        fileName: filename,
        fileEnc: encoding,
      });
    });
  });
  return { busboy, files, formData };
};

const getLocalDate = (date) => {
  const timezoneOffset = new Date().getTimezoneOffset() / 60;
  // console.log("timezoneOffset",  timezoneOffset);
  const localDate = new Date(date.getTime() - timezoneOffset * 3602000);
  // console.log("Local time:",  time);
  return localDate;
}
