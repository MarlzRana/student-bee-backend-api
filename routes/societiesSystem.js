"use strict";
//Imported packages
const express = require("express");
require("dotenv").config();

//Importing local file dependencies
const validation = require("../validation/validation");
const tbl_events = require("../database/tbl_events");
const tbl_user_login_information = require("../database/tbl_user_login_information");
const { validateBio } = require("../validation/validation");
//Environmental variables

//Package setup
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//A default gateway to test if API server is accessible
router.route("/").get((req, res) => {
  return res.send({
    message:
      "Default gateway of student-bee-backend-api route:/societiesSystem",
  });
});

//Route to add new society
router.route("/addSociety").post(async (req, res) => {
  try {
    const enteredSocietyName = req.body.societyName;
    const enteredUsername = req.body.username;
    const enteredName = req.body.name;
    const enteredLink = req.body.link;
    const enteredSocietyDesc = req.body.societyDesc;

    const validationCheckDetails = {
      societyName: validation.validateMediumName(enteredSocietyName),
      username: validation.validateUsername(enteredUsername),
      name: validation.validateName(enteredName),
      link: validation.validateLink(enteredLink),
      societyDesc: validation.validateShortDescription(enteredSocietyDesc),
    };

    if (
      !(
        validationCheckDetails.societyName &&
        validationCheckDetails.username &&
        validationCheckDetails.name &&
        validationCheckDetails.link &&
        validationCheckDetails.societyDesc
      )
    ) {
      return res.send({
        status: "failure",
        reason: "Invalid Input Format",
        validationCheckDetails: validationCheckDetails,
      });
    }
    return res.send({
      status: "success",
    });
  } catch (error) {
    return res.send({
      error: true,
    });
  }
});

module.exports = router;
