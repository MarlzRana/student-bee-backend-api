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
  jobTitleIn,
  wageIn,
  workingHoursIn,
  locationIn,
  startDateIn,
  descriptionIn,
  employerContactEmailIn,
  employerContactPhoneNumberIn,
  employerUserIDIn,
  applicationLinkIn
) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_add_new_record_tbl_jobs(?,?,?,?,?,?,?,?,?,?, @jobs_id_used_out); SELECT @jobs_id_used_out;",
        [
          jobTitleIn,
          wageIn,
          workingHoursIn,
          locationIn,
          startDateIn,
          descriptionIn,
          employerContactEmailIn,
          employerContactPhoneNumberIn,
          employerUserIDIn,
          applicationLinkIn,
        ]
      );

      return resolve(dbResult[1][0]["@jobs_id_used_out"]);
    } catch (err) {
      resolve(false);
      console.log(
        employerUserIDIn,
        wageIn +
          workingHoursIn +
          locationIn +
          startDateIn +
          descriptionIn +
          employerContactEmailIn +
          employerContactPhoneNumberIn +
          applicationLinkIn
      );
      throw "\nThere was an error when adding a new record to tbl_jobs\n";
    }
  });
}

module.exports = {
  addNewRecord: addNewRecord,
};
