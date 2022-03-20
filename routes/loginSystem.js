'use strict';
//Imported packages
const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();

//Importing local file dependencies
const tbl_user_login_information = require('../database/tbl_user_login_information');
const tbl_personal_login_information = require('../database/tbl_user_personal_information');
const validation = require('../validation/validation');
//Environmental variables
const SALTROUNDS = parseInt(process.env.SALTROUNDS);

//Package setup
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());

//A default gateway to test if API server is accessible
router.route('/').get((req, res) => {
  return res.send({
    message: 'Default gateway of student-bee-backend-api route:/loginSystem',
  });
});

//POST request logic to handle the registration of a user
router.route('/register').post(async (req, res) => {
  try {
    //Get the entered username and password and their personal information
    const enteredUsername = req.body.username;
    const enteredPassword = req.body.password;
    const enteredFirstName = req.body.firstName;
    const enteredLastName = req.body.lastName;
    const enteredEmail = req.body.email;
    const enteredDOB = req.body.dob;
    //Checking if the format of the username and password and their personal information is correct
    const validationCheckDetails = {
      username: validation.validateUsername(enteredUsername),
      password: validation.validatePassword(enteredPassword),
      firstName: validation.validateName(enteredFirstName),
      lastName: validation.validateName(enteredLastName),
      email: validation.validateEmail(enteredEmail),
      dob: validation.validateDOB(enteredDOB),
    };
    if (
      !(
        validationCheckDetails.username &&
        validationCheckDetails.password &&
        validationCheckDetails.firstName &&
        validationCheckDetails.lastName &&
        validationCheckDetails.email &&
        validationCheckDetails.dob
      )
    ) {
      return res.send({
        status: 'failure',
        reason: 'invalidInputFormat',
        validationCheckDetails: validationCheckDetails,
      });
    }
    //Check is a user already exists with that username
    const doesUsernameExist =
      await tbl_user_login_information.doesUsernameExist(enteredUsername);
    if (doesUsernameExist) {
      return res.send({ status: 'failure', reason: 'usernameIsTaken' });
    }
    //Create the salt to use and then hash the enteredPassword to be
    const saltToUse = await bcrypt.genSalt(SALTROUNDS);
    const hashedPassword = await bcrypt.hash(enteredPassword, saltToUse);
    //Then add the user to the database
    const userIDUsed = await tbl_user_login_information.addNewRecord(
      enteredUsername,
      hashedPassword
    );
    const personalIDUsed = await tbl_personal_login_information.addNewRecord(
      userIDUsed,
      enteredFirstName,
      enteredLastName,
      enteredEmail,
      enteredDOB
    );
    return res.send({ status: 'success' });
  } catch (err) {
    console.log(err);
    return res.send({ error: true });
  }
});

//POST request used to login and create a login session with a cookie
router.route('/login').post(async (req, res) => {
  try {
    //Get the entered username and password
    const enteredUsername = req.body.username;
    const enteredPassword = req.body.password;
    //Checking if the format of the username and password is correct (helps prevent SQL injection)
    const validationCheckDetails = {
      username: validation.validateUsername(enteredUsername),
      password: validation.validatePassword(enteredPassword),
    };
    if (!(validationCheckDetails.username && validationCheckDetails.password)) {
      return res.send({
        status: 'failure',
        reason: 'invalidInputFormat',
        validationCheckDetails: validationCheckDetails,
      });
    }
    //Check if the user exists and grab their credentials
    const dbResult =
      await tbl_user_login_information.selectSingleRecordByUsername(
        enteredUsername
      );
    if (dbResult == false) {
      return res.send({ status: 'failure', reason: 'invalidCredentials' });
    }
    //Check if the entered password matches the hashed password in the database
    const actualHashedPassword = dbResult.password;
    const isCorrectPassword = await bcrypt.compare(
      enteredPassword,
      actualHashedPassword
    );
    //Get the userID of the particular user from the database
    const userID = dbResult['user_id'];
    //If the password is correct, create a session and return a cookie and a message letting the API user know that the login was successful
    req.session.user = {
      userID: userID,
      username: enteredUsername,
      password: actualHashedPassword,
    };
    return res.send({
      status: 'success',
      reason: 'validCredentials',
    });
  } catch (err) {
    console.log(err);
    return res.send({ error: true });
  }
});

//GET request that reads and compares the cookie sent to active cookies on the server to check is a user is logged in
router.route('/isLoggedIn').get((req, res) => {
  try {
    if (req.session.user) {
      res.send({
        status: 'success',
        isLoggedIn: true,
        username: req.session.user.username,
      });
    } else {
      res.send({ status: 'failure', isLoggedIn: false });
    }
  } catch (err) {
    console.log(err);
    return res.send({ error: true });
  }
});

//GET request that logs the user out and destroys the cookie
router.route('/logout').get((req, res) => {
  req.session.destroy();
  return res.send({ status: 'success' });
});

module.exports = router;
