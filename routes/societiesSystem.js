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

route.route('/addSociety').post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        message: 'notLoggedIn',
      });
    }
    //Get the parameters provided in the response
    const societyNameIn = req.body.societyName;
    const societyLeaderUsernameIn = req.session.user.userID;
    const societyLeaderNameIn = req.body.societyLeaderName;
    const societyMainSocialLinkIn = req.body.societyMainSocialLink;
    const societyDescriptionIn = req.body.societyDescription;
    //Check that all the parameters are not null
    if (
      societyNameIn === null ||
      societyLeaderUsernameIn === null ||
      societyLeaderNameIn === null ||
      societyMainSocialLinkIn === null ||
      societyDescriptionIn === null
    ) {
      return res.send({
        status: 'failure',
        message: 'missingParameters',
        parameterPresenceCheckDetails: {
          societyName: societyNameIn !== null,
          societyLeaderUsername: societyLeaderUsernameIn !== null,
          societyLeaderName: societyLeaderNameIn !== null,
          societyMainSocialLink: societyMainSocialLinkIn !== null,
          societyDescription: societyDescriptionIn !== null,
        },
      });
    }
  } catch (err) {
    console.log(err);
    return res.send({
      status: 'failure',
      reason: 'internalError',
    });
  }
});

module.exports = router;
