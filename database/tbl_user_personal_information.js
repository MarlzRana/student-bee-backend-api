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

async function addNewRecord(userIDIn, firstName, lastName, email, dob) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_add_new_record_tbl_user_personal_information(?,?,?,?,?, @personal_id_used); SELECT @personal_id_used",
        [userIDIn, firstName, lastName, email, dob]
      );
      return resolve(dbResult[1][0]["@personal_id_used"]);
    } catch (err) {
      resolve(false);
      console.log(err);
      throw "\nThere was an error when adding a new record to tbl_personal_login_information";
    }
  });
}

async function editRecord(
  userIDIn,
  firstNameIn,
  lastNameIn,
  emailAddressIn,
  dobIn,
  bioIn,
  studentYearIn,
  courseNameIn
) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_edit_record_tbl_user_personal_information(?,?,?,?,?,?,?,?)",
        [
          userIDIn,
          firstNameIn,
          lastNameIn,
          emailAddressIn,
          dobIn,
          bioIn,
          studentYearIn,
          courseNameIn,
        ]
      );
      console.log(dbResult);
      return resolve(true);
    } catch (err) {
      resolve(false);
      throw "\nThere was an error when editing a record from tbl_user_personal_information";
    }
  });
}

async function getPersonalInformationByUserID(userIDIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_select_record_tbl_user_personal_information_by_user_id(?)",
        [userIDIn]
      );
      if (dbResult[0].length < 1) {
        return resolve(false);
      }
      return resolve(dbResult[0][0]);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw "\nThere was an error when getting the username from tbl_user_login_information";
    }
  });
}

module.exports = {
  addNewRecord: addNewRecord,
  editRecord: editRecord,
  getPersonalInformationByUserID: getPersonalInformationByUserID,
};
