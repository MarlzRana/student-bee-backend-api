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

async function addRecord(userIDIn, eventIDIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_add_record_tbl_event_participators(?,?, @participator_id_used_out); SELECT @participator_id_used_out;",
        [userIDIn, eventIDIn]
      );
      return resolve(dbResult[1][0]["@participator_id_used_out"]);
    } catch (err) {
      console.log(err);
      throw "\nThere was an error when adding a record to tbl_event_participators\n";
      resolve(false);
    }
  });
}

async function selectRecordByUserIDAndEventID(userIDIn, eventIDIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_select_record_tbl_event_participators_by_user_id_and_event_id(?,?);",
        [userIDIn, eventIDIn]
      );
      return resolve(dbResult[0][0]);
    } catch (err) {
      console.log(err);
      throw "\nThere was an error when selecting a record from tbl_event_participators\n";
      resolve(false);
    }
  });
}

async function deleteRecordByUserIDAndEventID(userIDIn, eventIDIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_delete_record_tbl_event_participators_by_user_id_and_event_id(?,?);",
        [userIDIn, eventIDIn]
      );
      return resolve(true);
    } catch (err) {
      console.log(err);
      throw "\nThere was an error when deleting a record from tbl_event_participators\n";
      resolve(false);
    }
  });
}

async function findAllUserParticipatingEvents(userIDIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_select_all_user_participating_records_tbl_event_participators(?);",
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
  selectRecordByUserIDAndEventID: selectRecordByUserIDAndEventID,
  addRecord: addRecord,
  deleteRecordByUserIDAndEventID: deleteRecordByUserIDAndEventID,
  findAllUserParticipatingEvents: findAllUserParticipatingEvents,
};
