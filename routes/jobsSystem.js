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
    message: "Default gateway of student-bee-backend-api route:/jobsSystem",
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
    const jobNameIn = req.body.jobName;
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
      jobNameIn === null ||
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
          jobName: jobNameIn !== null,
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
      jobNameIn: validation.validateLongName(jobNameIn),
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
      jobNameIn,
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

router.route("/8RandomJobs").get(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        reason: "notLoggedIn",
      });
    }

    const dbResult = await tbl_jobs.get8RandomJobs();

    const arrOfObjToSend = await Promise.all(
      dbResult.map(async (row) => {
        return {
          jobID: row["job_id"],
          employerUserID: row["employer_user_id"],
          jobTitle: row["job_title"],
          location: row["location"],
          startDate:
            row["start_date"].getUTCDate() +
            "/" +
            (row["start_date"].getUTCMonth() + 1) +
            "/" +
            row["start_date"].getUTCFullYear(),
          description: row["description"],
          employerContactEmail: row["contact_email"],
          employerContactPhoneNumber: row["contact_phone_number"],
          wage: row["wage"],
          link: row["link"],
          workingHours: row["working_hours"],
        };
      })
    );
    return res.send({ events: arrOfObjToSend });
  } catch (err) {
    return res.send({
      status: "failure",
      reason: "internalError",
    });
  }
});

router.route("/getJobDetails").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        reason: "notLoggedIn",
      });
    }

    const enteredJobID = parseInt(req.body.jobID);

    //Presence check + validation check for enteredEventID
    const validID = validation.validateID(enteredJobID);

    if (!validID) {
      return res.send({
        status: "failure",
        reason: "Invalid ID format",
        enteredID: enteredJobID,
        enteredBody: req.body,
      });
    }

    const dbResult = await tbl_jobs.getJobInformation(enteredJobID);
    if (dbResult === undefined) {
      return res.send({
        status: "failure",
        reason: "This event does not exist",
      });
    }

    const returnedInformation = {
      jobID: dbResult.job_id,
      employerUserID: dbResult.employer_user_id,
      jobTitle: dbResult.job_title,
      location: dbResult.location,
      startDate:
        dbResult.start_date.getUTCDate() +
        "/" +
        (dbResult.start_date.getUTCMonth() + 1) +
        "/" +
        dbResult.start_date.getUTCFullYear(),
      description: dbResult.description,
      employerContactEmail: dbResult.contact_email,
      employerContactPhoneNumber: dbResult.contact_phone_number,
      wage: dbResult.wage,
      applicationLink: dbResult.link,
      workingHours: dbResult.working_hours,
    };

    return res.send({
      status: "success",
      jobInformation: returnedInformation,
    });
  } catch (error) {
    return res.send({
      status: "error",
    });
  }
});

router.route("/editJobDetails").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        message: "notLoggedIn",
      });
    }
    //Get the parameters provided in the response
    const jobNameIn = req.body.jobName;
    const wageIn = parseInt(req.body.wage);
    const workingHoursIn = parseInt(req.body.workingHours);
    const locationIn = req.body.location;
    const startDateIn = req.body.startDate;
    const descriptionIn = req.body.description;
    const employerEmailIn = req.body.employerEmail;
    const employerPhoneNumberIn = req.body.employerPhoneNumber;
    const applicationLinkIn = req.body.link;
    //Check that all the parameters are not null
    if (
      wageIn === null ||
      jobNameIn === null ||
      workingHoursIn === null ||
      locationIn === null ||
      startDateIn === null ||
      descriptionIn === null ||
      employerEmailIn === null ||
      employerPhoneNumberIn === null ||
      applicationLinkIn === null
    ) {
      return res.send({
        status: "failure",
        message: "missingParameters",
        parameterPresenceCheckDetails: {
          jobName: jobNameIn !== null,
          wage: wageIn !== null,
          workingHours: workingHoursIn !== null,
          startDateTime: startDateTimeIn !== null,
          location: locationIn !== null,
          employerEmail: employerEmailIn !== null,
          employerPhoneNumber: employerPhoneNumberIn !== null,
          description: descriptionIn !== null,
          applicationLink: applicationLinkIn !== null,
        },
      });
    }
    //Validate inputs
    const validationCheckDetails = {
      jobNameIn: validation.validateLongName(jobNameIn),
      wageIn: validation.validateWeeklyWage(wageIn),
      workingHoursIn: validation.validateWeeklyWorkingHours(workingHoursIn),
      locationIn: validation.validateLongName(locationIn),
      startDateIn: validation.validateDate(startDateIn),
      descriptionIn: validation.validateShortDescription(descriptionIn),
      employerEmailIn: validation.validateEmail(employerEmailIn),
      employerPhoneNumberIn: validation.validateInternationalPhoneNumber(
        employerPhoneNumberIn
      ),
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
        validationCheckDetails.applicationLinkIn
      )
    ) {
      return res.send({
        status: "failure",
        reason: "invalidInputFormat",
        validationCheckDetails: validationCheckDetails,
      });
    }

    //Presence check + validation check for enteredJobID
    const jobID = req.body.jobID;
    const validID = validation.validateID(jobID);

    if (!validID) {
      return res.send({
        status: "failure",
        reason: "Invalid ID format",
      });
    }

    const dbResult = await tbl_jobs.getJobInformation(jobID);
    if (dbResult === undefined) {
      return res.send({
        status: "failure",
        reason: "This society does not exist",
      });
    }

    // Check if job belongs to user
    const userID = req.session.user.userID;
    if (dbResult.employer_user_id !== userID) {
      return res.send({
        status: "failure",
        reason: "You do not own this job",
      });
    }

    // Edit the job in the database
    const dbResult2 = await tbl_jobs.editJob(
      jobID,
      jobNameIn,
      locationIn,
      startDateIn,
      descriptionIn,
      employerEmailIn,
      employerPhoneNumberIn,
      wageIn,
      applicationLinkIn,
      workingHoursIn
    );

    return res.send({
      status: "success",
      message: "Job successfully edited",
    });
  } catch (error) {
    console.log(error);
    return res.send({
      status: "error",
    });
  }
});

router.route("/ownsJob").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        reason: "notLoggedIn",
      });
    }

    const jobID = req.body.jobID;
    const userID = req.session.user.userID;

    const dbResult = await tbl_jobs.getJobInformation(jobID);
    if (dbResult === undefined) {
      return res.send({
        status: "failure",
        reason: "This society does not exist",
      });
    }

    //Presence check + validation check for societyID
    const validID = validation.validateID(jobID);

    if (!validID) {
      return res.send({
        status: "failure",
        reason: "Invalid ID format",
      });
    }

    if (dbResult.employer_user_id !== userID) {
      return res.send({
        status: "success",
        owned: false,
      });
    } else {
      return res.send({
        status: "success",
        owned: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.send({
      status: "error",
    });
  }
});

router.route("/deleteJob").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        reason: "notLoggedIn",
      });
    }

    const jobID = req.body.jobID;
    const userID = req.session.user.userID;

    const validID = validation.validateID(jobID);

    //Validate ID
    if (!validID) {
      return res.send({
        status: "failure",
        reason: "Invalid ID format",
      });
    }

    //Check if job exists
    const dbResult = await tbl_jobs.getJobInformation(jobID);
    if (dbResult === undefined) {
      return res.send({
        status: "failure",
        reason: "This society does not exist",
      });
    }

    //Check if user owns job
    if (dbResult.employer_user_id !== userID) {
      return res.send({
        status: "failure",
        owned: false,
      });
    }

    //Delete if they do
    const dbResult2 = await tbl_jobs.deleteJob(jobID);

    return res.send({ status: "success" });
  } catch (error) {
    return res.send({ status: "error" });
  }
});

module.exports = router;
