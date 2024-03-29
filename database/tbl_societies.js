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
  societyNameIn,
  leaderNameIn,
  mainSocialLinkIn,
  descriptionIn
) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_add_new_record_tbl_societies(?,?,?,?,?, @events_id_used_out); SELECT @society_id_used_out;",
        [
          leaderUserIDIn,
          societyNameIn,
          leaderNameIn,
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

async function editSociety(
  societyIDIn,
  nameIn,
  leaderNameIn,
  mainSocialLinkIn,
  descriptionIn
) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_edit_record_tbl_societies(?,?,?,?,?)",
        [societyIDIn, nameIn, leaderNameIn, mainSocialLinkIn, descriptionIn]
      );
      console.log(dbResult);
      return resolve(true);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw "\nThere was an error when editing a record from tbl_societies";
    }
  });
}

async function deleteSociety(societyIDIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_delete_record_tbl_societies(?)",
        [societyIDIn]
      );
      console.log(dbResult);
      return resolve(true);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw "\nThere was an error when deleting a record from tbl_societies";
    }
  });
}

async function findRecordsByName(nameIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_find_records_by_name_tbl_societies(?);",
        [nameIn]
      );
      return resolve(dbResult[0]);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw "\nThere was an error when finding records by title from tbl_societies\n";
    }
  });
}

async function findAllUserOwnedSocieties(userIDIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_select_all_user_owned_records_tbl_societies(?);",
        [userIDIn]
      );
      return resolve(dbResult[0]);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw "\nThere was an error when finding records owned by user from tbl_societies\n";
    }
  });
}

module.exports = {
  addNewRecord: addNewRecord,
  get10RandomSocieties: get10RandomSocieties,
  getSocietyInformation: getSocietyInformation,
  editSociety: editSociety,
  deleteSociety: deleteSociety,
  findRecordsByName: findRecordsByName,
  findAllUserOwnedSocieties: findAllUserOwnedSocieties,
};
