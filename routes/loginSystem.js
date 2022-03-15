'use strict';
//Imported packages
const express = require('express');
const mysql2 = require('mysql2/promise');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();

//Environmental variables
const DBHOSTSERVERADDRESS = process.env.DBHOSTSERVERADDRESS;
const DBSERVERUSERNAME = process.env.DBSERVERUSERNAME;
const DBSERVERPASSWORD = process.env.DBSERVERPASSWORD;
const DBSERVERDATABASENAME = process.env.DBSERVERDATABASENAME;
const DBSERVERPORT = process.env.DBSERVERPORT;
const DBCERTIFICATEFILEPATH = process.env.DBCERTIFICATEFILEPATH;
const SALTROUNDS = parseInt(process.env.SALTROUNDS);

//Package setup
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(
  session({
    key: '',
    secret: bcrypt.genSaltSync(SALTROUNDS),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

//Setting up the database connection
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

//A default gateway to test if API server is accessible
router.route('/').get((req, res) => {
  res.send({
    message: 'Default gateway of student-bee-backend-api route:/loginSystem',
  });
});

//POST request logic to handle the registration of a user
router.route('/register').post(async (req, res) => {
  try {
    //Get the entered username and password
    const enteredUsername = req.body.username;
    const enteredPassword = req.body.password;
    //Check is a user already exists with that username
    const [dbResult] = await db.query(
      'CALL rt_check_if_username_exists(?, @doesUsernameExist); SELECT @doesUsernameExist;',
      [enteredUsername]
    );
    if (Boolean(dbResult[1][0]['@doesUsernameExist'])) {
      return res.send({ status: 'usernameIsTaken' });
    }
    //Create the salt to use and then hash the enteredPassword to be
    const saltToUse = await bcrypt.genSalt(SALTROUNDS);
    const hashedPassword = await bcrypt.hash(enteredPassword, saltToUse);
    await db.query('CALL rt_add_new_record_tbl_user_login_information(?,?)', [
      enteredUsername,
      hashedPassword,
    ]);
    return res.send({ status: 'success' });
  } catch (err) {
    console.log(err);
    return res.send({ error: true });
  }
});

//POST request used to login and create a login session with a cookie
router.route('/login').post(async (req, res) => {
  try {
    const enteredUsername = req.body.username;
    const enteredPassword = req.body.password;
    const [dbResult] = await db.query(
      'CALL rt_select_record_tbl_user_login_information_by_username(?)',
      [enteredUsername]
    );
    if (dbResult[0].length < 1) {
      return res.send({ status: 'invalidCredentials' });
    }
    const actualHashedPassword = dbResult[0][0].password;
    const isCorrectPassword = await bcrypt.compare(
      enteredPassword,
      actualHashedPassword
    );
    if (!isCorrectPassword) {
      return res.send({ status: 'invalidCredentials' });
    }
    req.session.user = {
      username: enteredUsername,
      password: actualHashedPassword,
    };
    return res.send({
      status: 'validCredentials',
    });
  } catch (err) {
    console.log(err);
    return res.send({ error: true });
  }
});

//GET request that reads and compares the cookie sent to active cookies on the server to check is a user is logged in
router.route('/isLoggedIn').get((req, res) => {
  if (req.session.user) {
    res.send({ isLoggedIn: true, user: req.session.user });
  } else {
    res.send({ isLoggedIn: false });
  }
});

module.exports = router;
