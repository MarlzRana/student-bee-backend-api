"use strict";
//Imported packages
const express = require("express");
require("dotenv").config();

//Importing local file dependencies
const validation = require("../validation/validation");
const tbl_jobs = require("../database/tbl_jobs");
const tbl_user_login_information = require("../database/tbl_user_login_information");
//Environmental variables

//Package setup
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//A default gateway to test if API server is accessible
router.route("/").get((req, res) => {
  return res.send({
    message: "Default gateway of student-bee-backend-api route:/eventsSystem",
  });
});

router.route("/addJob").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        message: "notLoggedIn",
      });
    }
    //Get the parameters provided in the response
    const employerUserIDIn = req.session.user.userID;
    const jobNamein = req.body.jobName;
    const wageIn = req.body.wage;
    const workingHoursIn = req.body.workingHours;
    const locationIn = req.body.location;
    const startDateIn = req.body.startDate;
    const descriptionIn = req.body.description;
    const employerEmailIn = req.body.employerEmail;
    const employerPhoneNumberIn = req.body.employerPhoneNumber;
    const applicationLinkIn = req.body.link;
    //Check that all the parameters are not null
    if (
      wageIn === null ||
      jobNamein === null ||
      workingHoursIn === null ||
      locationIn === null ||
      startDateIn === null ||
      descriptionIn === null ||
      employerEmailIn === null ||
      employerPhoneNumberIn === null ||
      employerUserIDIn === null ||
      applicationLinkIn === null
    ) {
      return res.send({
        status: "failure",
        message: "missingParameters",
        parameterPresenceCheckDetails: {
          jobName: jobNamein !== null,
          wage: wageIn !== null,
          workingHours: workingHoursIn !== null,
          startDateTime: startDateTimeIn !== null,
          location: locationIn !== null,
          employerUserID: employerUserIDIn !== null,
          employerEmail: employerEmailIn !== null,
          employerPhoneNumber: employerPhoneNumberIn !== null,
          description: descriptionIn !== null,
          applicationLink: applicationLinkIn !== null,
        },
      });
    }
    //Validate inputs
    const validationCheckDetails = {
      jobNameIn: validation.validateLongName(jobNamein),
      wageIn: validation.validateWeeklyWage(wageIn),
      workingHoursIn: validation.validateWeeklyWorkingHours(workingHoursIn),
      locationIn: validation.validateLongName(locationIn),
      startDateIn: validation.validateDate(startDateIn),
      descriptionIn: validation.validateShortDescription(descriptionIn),
      employerEmailIn: validation.validateEmail(employerEmailIn),
      employerPhoneNumberIn: validation.validateInternationalPhoneNumber(
        employerPhoneNumberIn
      ),
      employerUserIDIn: validation.validateID(employerUserIDIn),
      applicationLinkIn: validation.validateLink(applicationLinkIn),
    };
    if (
      !(
        validationCheckDetails.jobNameIn &&
        validationCheckDetails.wageIn &&
        validationCheckDetails.workingHoursIn &&
        validationCheckDetails.locationIn &&
        validationCheckDetails.startDateIn &&
        validationCheckDetails.descriptionIn &&
        validationCheckDetails.employerEmailIn &&
        validationCheckDetails.employerPhoneNumberIn &&
        validationCheckDetails.employerUserIDIn &&
        validationCheckDetails.applicationLinkIn
      )
    ) {
      return res.send({
        status: "failure",
        reason: "invalidInputFormat",
        validationCheckDetails: validationCheckDetails,
      });
    }

    //Add the event to the database
    const dbResult = await tbl_jobs.addNewRecord(
      jobNamein,
      wageIn,
      workingHoursIn,
      locationIn,
      startDateIn,
      descriptionIn,
      employerEmailIn,
      employerPhoneNumberIn,
      employerUserIDIn,
      applicationLinkIn
    );
    console.log("Success");
    return res.send({
      status: "success",
      message: "eventAdded",
    });
  } catch (err) {
    console.log();
    console.log(err);
    return res.send({
      status: "failure",
      reason: "internalError",
    });
  }
});

router.route("/getEventByEventName").get(async (req, res) => {});
module.exports = router;
