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

async function addNewRecord(authorUserIDIn, tweetPostedDateTimeIn, contentIn) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_add_new_record_tbl_tweets(?,?,?, @tweet_id_used_out); SELECT @tweet_id_used_out;",
        [authorUserIDIn, tweetPostedDateTimeIn, contentIn]
      );

      return resolve(dbResult[1][0]["@tweet_id_used_out"]);
    } catch (err) {
      resolve(false);
      throw "\nThere was an error when adding a new record to tbl_tweets\n";
    }
  });
}

async function deleteTweet(tweetIDin) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query("CALL rt_delete_record_tbl_tweets(?)", [
        tweetIDin,
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

async function getTop20MostRecentTweets() {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_get_top_20_most_recent_tweets_tbl_tweets();"
      );
      return resolve(dbResult[0]);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw "\nThere was an error when getting 20 records from tbl_tweets\n";
    }
  });
}

async function getTweet(tweetID) {
  return new Promise(async (resolve, reject) => {
    try {
      const [dbResult] = await db.query(
        "CALL rt_select_record_tbl_tweets(?);",
        [tweetID]
      );
      return resolve(dbResult[0][0]);
    } catch (err) {
      console.log(err);
      resolve(false);
      throw "\nThere was an error when getting a tweet from tbl_tweets\n";
    }
  });
}

module.exports = {
  addNewRecord: addNewRecord,
  deleteTweet: deleteTweet,
  getTop20MostRecentTweets: getTop20MostRecentTweets,
  getTweet: getTweet,
};
