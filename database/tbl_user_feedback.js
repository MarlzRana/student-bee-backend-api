const mysql2 = require("mysql2/promise");
const fs = require("fs");

//Environmental variables
const DBHOSTSERVERADDRESS = process.env.DBHOSTSERVERADDRESS;
const DBSERVERUSERNAME = process.env.DBSERVERUSERNAME;
const DBSERVERPASSWORD = process.env.DBSERVERPASSWORD;
const DBSERVERDATABASENAME = process.env.DBSERVERDATABASENAME;
const DBSERVERPORT = process.env.DBSERVERPORT;
const DBCERTIFICATEFILEPATH = process.env.DBCERTIFICATEFILEPATH;

const dbConfig = {
  host: DBHOSTSERVERADDRESS,
  user: DBSERVERUSERNAME,
  password: DBSERVERPASSWORD,
  database: DBSERVERDATABASENAME,
  port: DBSERVERPORT,
  ssl: { ca: fs.readFileSync(DBCERTIFICATEFILEPATH) },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
};
const db = mysql2.createPool(dbConfig);

async function addNewRecord(
  userIDin,
  firstImpressionRatingIn,
  recommendationRatingIn,
  easeOfUseRatingIn,
  wishedFeatureIn,
  howHeardIn,
  otherSuggestionsIn
) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_add_new_record_tbl_user_feedback(?,?,?,?,?,?,?, @feedback_id_used_out); SELECT @feedback_id_used_out;",
        [
          userIDin,
          firstImpressionRatingIn,
          recommendationRatingIn,
          easeOfUseRatingIn,
          wishedFeatureIn,
          howHeardIn,
          otherSuggestionsIn,
        ]
      );

      return resolve(dbResult[1][0]["@feedback_id_used_out"]);
    } catch (err) {
      resolve(false);
      throw "\nThere was an error when adding a new record to tbl_user_feedback\n";
    }
  });
}

module.exports = {
  addNewRecord: addNewRecord,
};
