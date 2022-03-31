const mysql2 = require("mysql2/promise");
const fs = require("fs");

//Environmental variables
const DBHOSTSERVERADDRESS = process.env.DBHOSTSERVERADDRESS;
const DBSERVERUSERNAME = process.env.DBSERVERUSERNAME;
const DBSERVERPASSWORD = process.env.DBSERVERPASSWORD;
const DBSERVERDATABASENAME = process.env.DBSERVERDATABASENAME;
const DBSERVERPORT = process.env.DBSERVERPORT;
const DBCERTIFICATEFILEPATH = process.env.DBCERTIFICATEFILEPATH;

//The dbConfig object is used to connect to the database
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
//Create a pool of connections to the database
const db = mysql2.createPool(dbConfig);

async function addRecord(userIDIn, societyID) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_add_rec_tbl_society_participators(?,?, @participator_id_used_out); SELECT @participator_id_used_out;",
        [userIDIn, societyID]
      );
      return resolve(dbResult[1][0]["@participator_id_used_out"]);
    } catch (err) {
      console.log(err);
      throw "\nThere was an error when adding a record to tbl_society_participators\n";
      resolve(false);
    }
  });
}

async function selectRecordByUserIDAndSocietyID(userIDIn, societyID) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_sel_rec_tbl_society_participators_by_user_id_and_society_id(?,?);",
        [userIDIn, societyID]
      );
      return resolve(dbResult[0][0]);
    } catch (err) {
      console.log(err);
      throw "\nThere was an error when selecting a record from tbl_society_participators\n";
      resolve(false);
    }
  });
}

async function deleteRecordByUserIDAndSocietyID(userIDIn, societyID) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_del_rec_tbl_society_participators_by_user_id_and_society_id(?,?);",
        [userIDIn, societyID]
      );
      return resolve(true);
    } catch (err) {
      console.log(err);
      throw "\nThere was an error when deleting a record from tbl_society_participators\n";
      resolve(false);
    }
  });
}

async function findAllUserParticipatingSocieties(userIDIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_sel_all_user_participating_records_tbl_society_participators(?);",
        [userIDIn]
      );
      return resolve(dbResult[0]);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw "\nThere was an error when finding records being participated in by user from tbl_societies\n";
    }
  });
}

module.exports = {
  selectRecordByUserIDAndSocietyID: selectRecordByUserIDAndSocietyID,
  addRecord: addRecord,
  deleteRecordByUserIDAndSocietyID: deleteRecordByUserIDAndSocietyID,
  findAllUserParticipatingSocieties: findAllUserParticipatingSocieties,
};
