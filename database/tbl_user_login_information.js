const mysql2 = require('mysql2/promise');
const fs = require('fs');

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
      await db.query('CALL rt_add_new_record_tbl_user_login_information(?,?)', [
        usernameIn,
        passwordIn,
      ]);
      return resolve(true);
    } catch (err) {
      resolve(false);
      throw '\nThere was an error when adding a new record to tbl_user_login_information';
    }
  });
}

async function selectSingleRecordByUsername(usernameIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        'CALL rt_select_record_tbl_user_login_information_by_username(?)',
        [usernameIn]
      );
      if (dbResult[0].length < 1) {
        return resolve(false);
      }
      return resolve(dbResult[0][0]);
    } catch (err) {
      resolve(false);
      throw err;
      throw '\nThere was an error when selecting a single record from tbl_user_login_information';
    }
  });
}

async function doesUsernameExist(usernameIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        'CALL rt_check_if_username_exists(?, @doesUsernameExist); SELECT @doesUsernameExist;',
        [usernameIn]
      );
      return resolve(Boolean(dbResult[1][0]['@doesUsernameExist']));
    } catch (err) {
      resolve(false);
      throw '\nThere was an error when checking if a username exists in tbl_user_login_information';
    }
  });
}

module.exports = {
  addNewRecord: addNewRecord,
  doesUsernameExist: doesUsernameExist,
  selectSingleRecordByUsername: selectSingleRecordByUsername,
};
