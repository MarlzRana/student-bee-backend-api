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
        'CALL rt_add_new_record_tbl_jobs(?,?,?,?,?,?,?,?,?,?, @jobs_id_used_out); SELECT @jobs_id_used_out;',
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

      return resolve(dbResult[1][0]['@jobs_id_used_out']);
    } catch (err) {
      resolve(false);
      throw '\nThere was an error when adding a new record to tbl_jobs\n';
    }
  });
}

async function get8RandomJobs() {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query('CALL rt_select_8_records_tbl_jobs();');
      return resolve(dbResult[0]);
    } catch (err) {
      resolve(false);
      throw '\nThere was an error when getting 8 records to tbl_jobs\n';
    }
  });
}

async function getJobInformation(jobIDIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query('CALL rt_select_record_tbl_jobs(?);', [
        jobIDIn,
      ]);
      return resolve(dbResult[0][0]);
    } catch (err) {
      resolve(false);
      throw '\nThere was an error when getting event information from tbl_jobs\n';
    }
  });
}

async function editJob(
  jobIDIn,
  jobTitleIn,
  locationIn,
  startDateIn,
  descriptionIn,
  employerContactEmailIn,
  employerContactPhoneNumberIn,
  wageIn,
  linkIn,
  workingHoursIn
) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        'CALL rt_edit_record_tbl_jobs(?,?,?,?,?,?,?,?,?,?)',
        [
          jobIDIn,
          jobTitleIn,
          locationIn,
          startDateIn,
          descriptionIn,
          employerContactEmailIn,
          employerContactPhoneNumberIn,
          wageIn,
          linkIn,
          workingHoursIn,
        ]
      );
      console.log(dbResult);
      return resolve(true);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw '\nThere was an error when editing a record from tbl_jobs';
    }
  });
}

async function deleteJob(jobIDIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query("CALL rt_delete_record_tbl_jobs(?)", [
        jobIDIn,
      ]);
      console.log(dbResult);
      return resolve(true);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw "\nThere was an error when deleting a record from tbl_jobs";
    }
  });
}

async function findRecordsByJobTitle(jobTitleIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        'CALL rt_find_records_by_job_title_tbl_jobs(?);',
        [jobTitleIn]
      );
      return resolve(dbResult[0]);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw '\nThere was an error when finding records by job title from tbl_jobs\n';
    }
  });
}

module.exports = {
  addNewRecord: addNewRecord,
  get8RandomJobs: get8RandomJobs,
  getJobInformation: getJobInformation,
  editJob: editJob,
  deleteJob: deleteJob,
  findRecordsByJobTitle: findRecordsByJobTitle,
};
