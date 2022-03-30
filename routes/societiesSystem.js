'use strict';
//Imported packages
const express = require('express');
const { route } = require('express/lib/router');
require('dotenv').config();

//Importing local file dependencies
const validation = require('../validation/validation');
const tbl_societies = require('../database/tbl_societies');
const tbl_user_login_information = require('../database/tbl_user_login_information');
//Environmental variables

//Package setup
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//A default gateway to test if API server is accessible
router.route('/').get((req, res) => {
  return res.send({
    message:
      'Default gateway of student-bee-backend-api route:/societiesSystem',
  });
});

router.route('/add').post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        message: 'notLoggedIn',
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
        status: 'failure',
        message: 'missingParameters',
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
        status: 'failure',
        reason: 'invalidInputFormat',
        validationCheckDetails: validationCheckDetails,
      });
    }
    //Add the society to the database
    const dbResult = await tbl_societies.addNewRecord(
      societyLeaderUserIDIn,
      societyNameIn,
      societyLeaderNameIn,
      societyMainSocialLinkIn,
      societyDescriptionIn
    );
    return res.send({
      status: 'success',
      message: 'societyAdded',
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: 'failure',
      reason: 'internalError',
    });
  }
});

//Get the most recent societies from tbl_societies
router.route('/10RandomSocieties').get(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        reason: 'notLoggedIn',
      });
    }

    const dbResult = await tbl_societies.get10RandomSocieties();
    console.log(dbResult);

    const arrOfObjToSend = await Promise.all(
      dbResult.map(async (row) => {
        return {
          societyID: row['society_id'],
          societyName: row['name'],
        };
      })
    );
    // return res.send(arrOfObjToSend);
    console.log(arrOfObjToSend);
    return res.send({ status: 'success', returnObjects: arrOfObjToSend });
  } catch (err) {
    console.log(err);
    return res.send({
      status: 'failure',
      reason: 'internalError',
    });
  }
});

router.route('/getSocietyDetails').post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        reason: 'notLoggedIn',
      });
    }

    const enteredSocietyID = parseInt(req.body.societyID);

    //Presence check + validation check for enteredSocietyID
    const validID = validation.validateID(enteredSocietyID);

    if (!validID) {
      return res.send({
        status: 'failure',
        reason: 'Invalid ID format',
      });
    }

    const dbResult = await tbl_societies.getSocietyInformation(
      enteredSocietyID
    );
    console.log(dbResult);
    if (dbResult === undefined) {
      return res.send({
        status: 'failure',
        reason: 'This society does not exist',
      });
    }

    const returnedInformation = {
      societyID: dbResult.society_id,
      userID: dbResult.leader_user_id,
      title: dbResult.name,
      leaderName: dbResult.leader_name,
      contactLinks: dbResult.main_social_link,
      description: dbResult.description,
    };

    return res.send({
      status: 'success',
      societyInformation: returnedInformation,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 'error',
    });
  }
});

router.route('/editSocietyDetails').post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        message: 'notLoggedIn',
      });
    }
    //Get the parameters provided in the response
    const societyIDIn = req.body.societyID;
    const societyNameIn = req.body.societyNameIn;
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
        status: 'failure',
        message: 'missingParameters',
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
        status: 'failure',
        reason: 'invalidInputFormat',
        validationCheckDetails: validationCheckDetails,
      });
    }

    //Presence check + validation check for enteredSocietyID
    const validID = validation.validateID(societyIDIn);

    if (!validID) {
      return res.send({
        status: 'failure',
        reason: 'Invalid ID format',
      });
    }

    const dbResult = await tbl_societies.getSocietyInformation(societyIDIn);
    if (dbResult === undefined) {
      return res.send({
        status: 'failure',
        reason: 'This society does not exist',
      });
    }

    // Check if society belongs to user
    const userID = req.session.user.userID;
    if (dbResult.leader_user_id !== userID) {
      return res.send({
        status: 'failure',
        reason: 'You do not own this society',
      });
    }

    // Edit the society in the database
    const dbResult2 = await tbl_societies.editSociety(
      societyIDIn,
      societyNameIn,
      societyLeaderNameIn,
      societyMainSocialLinkIn,
      societyDescriptionIn
    );

    return res.send({
      status: 'success',
      message: 'Society successfully edited',
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: 'error',
    });
  }
});

router.route('/ownsSociety').post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        reason: 'notLoggedIn',
      });
    }

    const societyID = req.body.societyID;
    const userID = req.session.user.userID;

    //Presence check + validation check for societyID
    const validID = validation.validateID(societyID);

    if (!validID) {
      return res.send({
        status: 'failure',
        reason: 'Invalid ID format',
      });
    }

    const dbResult = await tbl_societies.getSocietyInformation(societyID);
    if (dbResult === undefined) {
      return res.send({
        status: "failure",
        reason: "This society does not exist",
      });
    }

    if (dbResult.leader_user_id !== userID) {
      return res.send({
        status: 'success',
        owned: false,
      });
    } else {
      return res.send({
        status: 'success',
        owned: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.send({
      status: 'error',
    });
  }
});

router.route('/search').post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        reason: 'notLoggedIn',
      });
    }
    //Get the parameter
    const query = req.body.query;
    //Performing a presence check
    const parameterPresenceCheckDetails = {
      query: query !== null && query !== undefined,
    };
    if (
      !Object.keys(parameterPresenceCheckDetails).every(
        (key) => parameterPresenceCheckDetails[key]
      )
    ) {
      return res.send({
        status: 'failure',
        message: 'missingParameters',
        parameterPresenceCheckDetails: parameterPresenceCheckDetails,
      });
    }
    //Validating the query string
    const validationCheckDetails = {
      query: validation.validateLongName(query),
    };
    if (
      !Object.keys(validationCheckDetails).every((key) => {
        return validationCheckDetails[key];
      })
    ) {
      return res.send({
        status: 'failure',
        reason: 'invalidInputFormat',
        validationCheckDetails: validationCheckDetails,
      });
    }
    //Searching for an event with a name that begins with query
    const dbResult = await tbl_societies.findRecordsByName(query);
    return res.send(
      dbResult.map((obj) => {
        return {
          societyID: obj.society_id,
          userID: obj.leader_user_id,
          title: obj.name,
          leaderName: obj.leader_name,
          contactLinks: obj.main_social_link,
          description: obj.description,
        };
      })
    );
  } catch (err) {
    console.log(err);
    return res.send({
      status: 'failure',
      reason: 'internalError',
    });
  }
});

router.route("/deleteSociety").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        reason: "notLoggedIn",
      });
    }

    const societyID = req.body.societyID;
    const userID = req.session.user.userID;

    const validID = validation.validateID(societyID);

    //Validate ID
    if (!validID) {
      return res.send({
        status: "failure",
        reason: "Invalid ID format",
      });
    }

    //Check if society exists
    const dbResult = await tbl_societies.getSocietyInformation(societyID);

    console.log("User ID: " + userID);
    console.log("DBResult: " + dbResult.leader_user_id);

    if (dbResult === undefined) {
      return res.send({
        status: "failure",
        reason: "This society does not exist",
      });
    }

    //Check if user owns society
    if (dbResult.leader_user_id !== userID) {
      return res.send({
        status: "failure",
        owned: false,
      });
    }

    //Delete if they do
    const dbResult2 = await tbl_societies.deleteSociety(societyID);

    return res.send({ status: "success" });
  } catch (error) {
    return res.send({ status: "error" });
  }
});

module.exports = router;
