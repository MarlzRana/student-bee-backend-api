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
  userIDIn,
  titleIn,
  startDateTimeIn,
  endDateTimeIn,
  locationIn,
  organizerNameIn,
  contactEmailIn,
  contactPhoneNumberIn,
  descriptionIn
) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_add_new_record_tbl_events(?,?,?,?,?,?,?,?,?, @events_id_used_out); SELECT @events_id_used_out;",
        [
          userIDIn,
          titleIn,
          startDateTimeIn,
          endDateTimeIn,
          locationIn,
          organizerNameIn,
          contactEmailIn,
          contactPhoneNumberIn,
          descriptionIn,
        ]
      );
      return resolve(dbResult[1][0]["@events_id_used_out"]);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw "\nThere was an error when adding a new record to tbl_events\n";
    }
  });
}

async function getTop10MostRecentEvents() {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_get_top_10_most_recent_events_tbl_events();"
      );
      return resolve(dbResult[0]);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw "\nThere was an error when adding a new record to tbl_events\n";
    }
  });
}

async function getEventInformation(eventID) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_select_record_tbl_events(?);",
        [eventID]
      );
      return resolve(dbResult[0][0]);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw "\nThere was an error when adding a new record to tbl_events\n";
    }
  });
}

async function editEvent(
  eventIDIn,
  titleIn,
  startDateTimeIn,
  endDateTimeIn,
  locationIn,
  organizerNameIn,
  contactEmailIn,
  contactPhoneNumberIn,
  descriptionIn
) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_edit_record_tbl_events(?,?,?,?,?,?,?,?,?)",
        [
          eventIDIn,
          titleIn,
          startDateTimeIn,
          endDateTimeIn,
          locationIn,
          organizerNameIn,
          contactEmailIn,
          contactPhoneNumberIn,
          descriptionIn,
        ]
      );
      console.log(dbResult);
      return resolve(true);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw "\nThere was an error when editing a record from tbl_user_login_information";
    }
  });
}

async function findRecordsByTitle(titleIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_find_records_by_title_tbl_events(?);",
        [titleIn]
      );
      return resolve(dbResult[0]);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw "\nThere was an error when finding records by title from tbl_events\n";
    }
  });
}

async function deleteEvent(eventIDIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query("CALL rt_delete_record_tbl_events(?)", [
        eventIDIn,
      ]);
      console.log(dbResult);
      return resolve(true);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw "\nThere was an error when deleting a record from tbl_events";
    }
  });
}

async function findAllUserOwnedEvents(userIDIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_select_all_user_owned_records_tbl_events(?);",
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
  getTop10MostRecentEvents: getTop10MostRecentEvents,
  getEventInformation: getEventInformation,
  editEvent: editEvent,
  deleteEvent: deleteEvent,
  findRecordsByTitle: findRecordsByTitle,
  findAllUserOwnedEvents: findAllUserOwnedEvents,
};
