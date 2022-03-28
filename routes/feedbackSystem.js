"use strict";
//Imported packages
const express = require("express");
require("dotenv").config();

//Importing local file dependencies
const validation = require("../validation/validation");
const tbl_user_feedback = require("../database/tbl_user_feedback");
//Environmental variables

//Package setup
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//A default gateway to test if API server is accessible
router.route("/").get((req, res) => {
  return res.send({
    message: "Default gateway of student-bee-backend-api route:/feedbackSystem",
  });
});

router.route("/submitFeedback").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        message: "notLoggedIn",
      });
    }
    //Get the parameters provided in the response
    const userIDIn = req.session.user.userID;
    const firstImpressionRatingIn = parseInt(req.body.firstImpressionRating);
    const recommendationRatingIn = parseInt(req.body.recommendationRating);
    const easeOfUseRatingIn = parseInt(req.body.easeOfUseRating);
    const wishedFeatureIn = req.body.wishedFeature;
    const howHeardIn = req.body.howHeard;
    const otherSuggestionsIn = req.body.otherSuggestions;

    //Check that all the parameters are not null
    if (
      firstImpressionRatingIn === null ||
      recommendationRatingIn === null ||
      easeOfUseRatingIn === null ||
      wishedFeatureIn === null ||
      howHeardIn === null ||
      otherSuggestionsIn === null
    ) {
      return res.send({
        status: "failure",
        message: "missingParameters",
        parameterPresenceCheckDetails: {
          firstImpressionRating: firstImpressionRatingIn !== null,
          recommendationRating: recommendationRatingIn !== null,
          easeOfUseRating: easeOfUseRatingIn !== null,
          wishedFeature: wishedFeatureIn !== null,
          howHeard: howHeardIn !== null,
          otherSuggestions: otherSuggestionsIn !== null,
        },
      });
    }
    //Validate inputs
    const validationCheckDetails = {
      firstImpressionRatingIn: validation.validateDigit(
        firstImpressionRatingIn
      ),
      recommendationRatingIn: validation.validateDigit(recommendationRatingIn),
      easeOfUseRatingIn: validation.validateDigit(easeOfUseRatingIn),
      wishedFeatureIn: validation.validateShortDescription(wishedFeatureIn),
      howHeardIn: validation.validateShortDescription(howHeardIn),
      otherSuggestionsIn:
        validation.validateShortDescription(otherSuggestionsIn),
    };
    if (
      !(
        validationCheckDetails.firstImpressionRatingIn &&
        validationCheckDetails.recommendationRatingIn &&
        validationCheckDetails.easeOfUseRatingIn &&
        validationCheckDetails.wishedFeatureIn &&
        validationCheckDetails.howHeardIn &&
        validationCheckDetails.otherSuggestionsIn
      )
    ) {
      return res.send({
        status: "failure",
        reason: "invalidInputFormat",
        validationCheckDetails: validationCheckDetails,
      });
    }

    //Add the event to the database
    const dbResult = await tbl_user_feedback.addNewRecord(
      userIDIn,
      firstImpressionRatingIn,
      recommendationRatingIn,
      easeOfUseRatingIn,
      wishedFeatureIn,
      howHeardIn,
      otherSuggestionsIn
    );
    return res.send({
      status: "success",
      message: "eventAdded",
    });
  } catch (err) {
    return res.send({
      status: "failure",
      reason: "internalError",
    });
  }
});

module.exports = router;
