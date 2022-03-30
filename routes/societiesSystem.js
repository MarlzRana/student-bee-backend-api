'use strict';
//Imported packages
const express = require('express');
const { route } = require('express/lib/router');
require('dotenv').config();

//Importing local file dependencies
const validation = require('../validation/validation');
const tbl_societies = require('../database/tbl_societies');
const tbl_society_participators = require('../database/tbl_society_participators');
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

    const dbResult = await tbl_societies.getSocietyInformation(societyID);
    if (dbResult === undefined) {
      return res.send({
        status: 'failure',
        reason: 'This society does not exist',
      });
    }

    //Presence check + validation check for societyID
    const validID = validation.validateID(societyID);

    if (!validID) {
      return res.send({
        status: 'failure',
        reason: 'Invalid ID format',
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
    //Searching for an society with a name that begins with query
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

router.route('/isUserPartOfSociety').post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        reason: 'notLoggedIn',
      });
    }
    //Getting the societyID of the society the user is checking they are part of
    const societyID = req.body.societyID;
    //Getting their userID from the session
    const userID = req.session.user.userID;
    //Presence checking our parameter
    const parameterPresenceCheckDetails = {
      societyID: societyID !== null && societyID !== undefined,
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
    //Validating the format of our parameters
    const validationCheckDetails = {
      societyID: validation.validateID(societyID),
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
    //Checking if the user has already said they are part of the society
    //DB query checking if the user is part of the society
    const dbResult =
      await tbl_society_participators.selectRecordByUserIDAndSocietyID(
        userID,
        societyID
      );
    //If the user is already part of the society return true
    if (dbResult) {
      return res.send({
        status: 'success',
        reason: { userIsPartOfSociety: true },
      });
    }
    //Else return false
    return res.send({
      status: 'success',
      reason: { userIsPartOfSociety: false },
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: 'failure',
      reason: 'internalError',
    });
  }
});

router.route('/invertIsUserPartOfSociety').post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        reason: 'notLoggedIn',
      });
    }
    //Getting the societyID of the society the user is trying to invert their part of status on
    const societyID = req.body.societyID;
    //Getting their userID from the session
    const userID = req.session.user.userID;
    //Presence checking our parameter
    const parameterPresenceCheckDetails = {
      societyID: societyID !== null && societyID !== undefined,
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
    //Validating the format of our parameters
    const validationCheckDetails = {
      societyID: validation.validateID(societyID),
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
    //Check if the user is currently part of the society
    //DB query checking if the user is part of the society
    const dbResult =
      await tbl_society_participators.selectRecordByUserIDAndSocietyID(
        userID,
        societyID
      );
    //If the user is already part of the society remove their participation
    if (dbResult) {
      await tbl_society_participators.deleteRecordByUserIDAndSocietyID(
        userID,
        societyID
      );
      //Send a response letting the API user know that the user was removed as a participant of that society
      return res.send({
        status: 'success',
        reason: 'userParticipationDeleted',
      });
    }
    //Else add them as a participant of the society
    await tbl_society_participators.addRecord(userID, societyID);
    //Send a response letting the API user know that the user was added as a participant of that society
    return res.send({
      status: 'success',
      reason: 'userParticipationAdded',
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: 'failure',
      reason: 'internalError',
    });
  }
});

module.exports = router;
