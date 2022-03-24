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
  leaderUserIDIn,
  leaderNameIn,
  societyNameIn,
  mainSocialLinkIn,
  descriptionIn
) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_add_new_record_tbl_societies(?,?,?,?,?, @events_id_used_out); SELECT @society_id_used_out;",
        [
          leaderUserIDIn,
          leaderNameIn,
          societyNameIn,
          mainSocialLinkIn,
          descriptionIn,
        ]
      );
      return resolve(dbResult[1][0]["@society_id_used_out"]);
    } catch (err) {
      resolve(false);
      throw "\nThere was an error when adding a new record to tbl_events\n";
    }
  });
}

async function get10RandomSocieties() {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_select_10_records_tbl_societies();"
      );
      return resolve(dbResult[0]);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw "\nThere was an error when getting 10 random records from tbl_societies\n";
    }
  });
}

async function getSocietyInformation(societyID) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_select_record_tbl_societies(?);",
        [societyID]
      );
      return resolve(dbResult[0][0]);
    } catch (err) {
      console.log(err);
      throw "\nThere was an error when accessing a record to tbl_societies\n";
      resolve(false);
    }
  });
}

module.exports = {
  addNewRecord: addNewRecord,
  get10RandomSocieties: get10RandomSocieties,
  getSocietyInformation: getSocietyInformation,
};
