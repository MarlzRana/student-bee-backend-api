'use strict';
//Imported packages
const express = require('express');
const { route } = require('express/lib/router');
require('dotenv').config();

//Importing local file dependencies
const validation = require('../validation/validation');
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
    const societyLeaderUsernameIn = req.session.user.userID;
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
      societyMainSocialLinkIn: validation.validateLongName(
        societyMainSocialLinkIn
      ),
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
    // const dbResult = await db.query();

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

module.exports = router;
