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
async function addNewRecord(likerUserIDIn, tweetIDIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_add_new_record_tbl_tweets(?,?, @like_id_used_out); SELECT @like_id_used_out;",
        [likerUserIDIn, tweetIDIn]
      );

      return resolve(dbResult[1][0]["@like_id_used_out"]);
    } catch (err) {
      resolve(false);
      throw "\nThere was an error when adding a new record to tbl_likes\n";
    }
  });
}

async function deleteLike(likeIDin) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query("CALL rt_delete_record_tbl_likes(?)", [
        likeIDin,
      ]);
      console.log(dbResult);
      return resolve(true);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw "\nThere was an error when deleting a record from tbl_tweets";
    }
  });
}

module.exports = {
  addNewRecord: addNewRecord,
  deleteLike: deleteLike,
};

module.exports = {};
