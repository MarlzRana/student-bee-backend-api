"use strict";
//Imported packages
const express = require("express");
const { route } = require("express/lib/router");
require("dotenv").config();

//Importing local file dependencies
const validation = require("../validation/validation");
const tbl_societies = require("../database/tbl_societies");
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

router.route("/add").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        message: "notLoggedIn",
      });
    }
    //Get the parameters provided in the response
    const societyNameIn = req.body.societyNameIn;
    const societyLeaderUserIDIn = req.session.user.userID;
    const societyLeaderNameIn = req.body.societyLeaderNameIn;
    const societyMainSocialLinkIn = req.body.societyMainSocialLinkIn;
    const societyDescriptionIn = req.body.societyDescriptionIn;
    //Check that all the parameters are not null
    const parameterPresenceCheckDetails = {
      societyNameIn: societyNameIn !== null && societyNameIn !== undefined,
      societyLeaderNameIn:
        societyLeaderNameIn !== null && societyLeaderNameIn !== undefined,
      societyMainSocialLinkIn:
        societyMainSocialLinkIn !== null &&
        societyMainSocialLinkIn !== undefined,
      societyDescriptionIn:
        societyDescriptionIn !== null && societyDescriptionIn !== undefined,
    };
    console.log();

    if (
      !Object.keys(parameterPresenceCheckDetails).every((key) => {
        return parameterPresenceCheckDetails[key];
      })
    ) {
      return res.send({
        status: "failure",
        message: "missingParameters",
        parameterPresenceCheckDetails: parameterPresenceCheckDetails,
      });
    }
    //Validate inputs
    const validationCheckDetails = {
      societyNameIn: validation.validateLongName(societyNameIn),
      societyLeaderNameIn: validation.validateMediumName(societyLeaderNameIn),
      societyMainSocialLinkIn: validation.validateLink(societyMainSocialLinkIn),
      societyDescriptionIn:
        validation.validateMediumDescription(societyDescriptionIn),
    };
    if (
      !Object.keys(validationCheckDetails).every((key) => {
        return validationCheckDetails[key];
      })
    ) {
      return res.send({
        status: "failure",
        reason: "invalidInputFormat",
        validationCheckDetails: validationCheckDetails,
      });
    }
    //Add the society to the database
    const dbResult = await tbl_societies.addNewRecord(
      societyLeaderUserIDIn,
      societyLeaderNameIn,
      societyNameIn,
      societyMainSocialLinkIn,
      societyDescriptionIn
    );
    return res.send({
      status: "success",
      message: "societyAdded",
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: "failure",
      reason: "internalError",
    });
  }
});

//Get the most recent societies from tbl_societies
router.route("/10RandomSocieties").get(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        reason: "notLoggedIn",
      });
    }

    const dbResult = await tbl_societies.get10RandomSocieties();
    console.log(dbResult);

    const arrOfObjToSend = await Promise.all(
      dbResult.map(async (row) => {
        const usernameForParticularUserID =
          await tbl_user_login_information.getUsernameByUserID(row["user_id"]);
        return {
          societyID: row["society_id"],
          title: row["title"],
        };
      })
    );
    return res.send(arrOfObjToSend);
  } catch (err) {
    console.log(err);
    return res.send({
      status: "failure",
      reason: "internalError",
    });
  }
});

router.route("/getSocietyDetails").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        reason: "notLoggedIn",
      });
    }

    const enteredSocietyID = parseInt(req.body.societyID);

    //Presence check + validation check for enteredSocietyID
    const validID = validation.validateID(enteredSocietyID);

    if (!validID) {
      return res.send({
        status: "failure",
        reason: "Invalid ID format",
      });
    }

    const dbResult = await tbl_societies.getSocietyInformation(
      enteredSocietyID
    );
    console.log(dbResult);
    if (dbResult === undefined) {
      return res.send({
        status: "failure",
        reason: "This society does not exist",
      });
    }

    const returnedInformation = {
      societyID: dbResult.society_id,
      userID: dbResult.user_id,
      title: dbResult.title,
      leaderName: dbResult.organizer_name,
      contactLinks: dbResult.contactLinks,
      description: dbResult.description,
    };

    return res.send({
      status: "success",
      societyInformation: returnedInformation,
    });
  } catch (error) {
    return res.send({
      status: "error",
    });
  }
});

module.exports = router;
