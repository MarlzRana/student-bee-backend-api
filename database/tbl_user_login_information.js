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

async function addNewRecord(usernameIn, passwordIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_add_new_record_tbl_user_login_information(?,?, @user_id_used); SELECT @user_id_used",
        [usernameIn, passwordIn]
      );
      return resolve(dbResult[1][0]["@user_id_used"]);
    } catch (err) {
      resolve(false);
      throw "\nThere was an error when adding a new record to tbl_user_login_information";
    }
  });
}

async function selectSingleRecordByUsername(usernameIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_select_record_tbl_user_login_information_by_username(?)",
        [usernameIn]
      );
      if (dbResult[0].length < 1) {
        return resolve(false);
      }
      return resolve(dbResult[0][0]);
    } catch (err) {
      resolve(false);
      throw err;
      throw "\nThere was an error when selecting a single record from tbl_user_login_information";
    }
  });
}

async function doesUsernameExist(usernameIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_check_if_username_exists(?, @doesUsernameExist); SELECT @doesUsernameExist;",
        [usernameIn]
      );
      return resolve(Boolean(dbResult[1][0]["@doesUsernameExist"]));
    } catch (err) {
      resolve(false);
      throw "\nThere was an error when checking if a username exists in tbl_user_login_information";
    }
  });
}

async function getUsernameByUserID(userIDIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_get_username_by_user_id_tbl_user_login_information(?)",
        [userIDIn]
      );
      if (dbResult[0].length < 1) {
        return resolve(false);
      }
      return resolve(dbResult[0][0].username);
    } catch (err) {
      resolve(false);
      throw "\nThere was an error when getting the username from tbl_user_login_information";
    }
  });
}

async function editRecord(userIDIn, usernameIn, passwordIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_edit_record_tbl_user_login_information(?,?,?)",
        [userIDIn, usernameIn, passwordIn]
      );
      console.log(dbResult);
      return resolve(true);
    } catch (err) {
      resolve(false);
      throw "\nThere was an error when editing a record from tbl_user_login_information";
    }
  });
}

module.exports = {
  addNewRecord: addNewRecord,
  doesUsernameExist: doesUsernameExist,
  selectSingleRecordByUsername: selectSingleRecordByUsername,
  getUsernameByUserID: getUsernameByUserID,
  editRecord: editRecord,
};
