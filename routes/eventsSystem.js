"use strict";
//Imported packages
const express = require("express");
require("dotenv").config();

//Importing local file dependencies
const validation = require("../validation/validation");
const tbl_events = require("../database/tbl_events");
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

router.route("/addEvent").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        message: "notLoggedIn",
      });
    }
    //Get the parameters provided in the response
    const userID = req.session.user.userID;
    const titleIn = req.body.title;
    const startDateTimeIn = req.body.startDateTime;
    const endDateTimeIn = req.body.endDateTime;
    const locationIn = req.body.location;
    const organizerNameIn = req.body.organizerName;
    const contactEmailIn = req.body.contactEmail;
    const contactPhoneNumberIn = req.body.contactPhoneNumber;
    const descriptionIn = req.body.description;
    //Check that all the parameters are not null
    if (
      titleIn === null ||
      startDateTimeIn === null ||
      endDateTimeIn === null ||
      locationIn === null ||
      organizerNameIn === null ||
      contactEmailIn === null ||
      contactPhoneNumberIn === null ||
      descriptionIn === null
    ) {
      return res.send({
        status: "failure",
        message: "missingParameters",
        parameterPresenceCheckDetails: {
          title: titleIn !== null,
          startDateTime: startDateTimeIn !== null,
          endDateTime: endDateTimeIn !== null,
          location: locationIn !== null,
          organizerName: organizerNameIn !== null,
          contactEmail: contactEmailIn !== null,
          contactPhoneNumber: contactPhoneNumberIn !== null,
          description: descriptionIn !== null,
        },
      });
    }
    //Validate inputs
    const validationCheckDetails = {
      titleIn: validation.validateLongName(titleIn),
      startDateTimeIn: validation.validateDateTime(startDateTimeIn),
      endDateTimeIn: validation.validateDateTime(endDateTimeIn),
      locationIn: validation.validateLongName(locationIn),
      organizerNameIn: validation.validateMediumName(organizerNameIn),
      contactEmailIn: validation.validateEmail(contactEmailIn),
      contactPhoneNumberIn:
        validation.validateInternationalPhoneNumber(contactPhoneNumberIn),
      descriptionIn: validation.validateShortDescription(descriptionIn),
    };
    if (
      !(
        validationCheckDetails.titleIn &&
        validationCheckDetails.startDateTimeIn &&
        validationCheckDetails.endDateTimeIn &&
        validationCheckDetails.locationIn &&
        validationCheckDetails.organizerNameIn &&
        validationCheckDetails.contactEmailIn &&
        validationCheckDetails.contactPhoneNumberIn &&
        validationCheckDetails.descriptionIn
      )
    ) {
      return res.send({
        status: "failure",
        reason: "invalidInputFormat",
        validationCheckDetails: validationCheckDetails,
      });
    }
    //Add the event to the database
    const dbResult = await tbl_events.addNewRecord(
      userID,
      titleIn,
      startDateTimeIn,
      endDateTimeIn,
      locationIn,
      organizerNameIn,
      contactEmailIn,
      contactPhoneNumberIn,
      descriptionIn
    );
    return res.send({
      status: "success",
      message: "eventAdded",
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: "failure",
      reason: "internalError",
    });
  }
});

router.route("/top10MostRecentEvents").get(async (req, res) => {
  try {
    const dbResult = await tbl_events.getTop10MostRecentEvents();
    // console.log(dbResult);

    const arrOfObjToSend = await Promise.all(
      dbResult.map(async (row) => {
        const usernameForParticularUserID =
          await tbl_user_login_information.getUsernameByUserID(row["user_id"]);
        return {
          eventID: row["event_id"],
          username: usernameForParticularUserID,
          title: row["title"],
          startDateTime: row["start_datetime"],
          endDateTime: row["end_datetime"],
          location: row["location"],
          organizerName: row["organizer_name"],
          contactEmail: row["contact_email"],
          contactPhoneNumber: row["contact_phone_number"],
          description: row["description"],
        };
      })
    );
    return res.send({ events: arrOfObjToSend });
  } catch (err) {
    console.log(err);
    return res.send({
      status: "failure",
      reason: "internalError",
    });
  }
});

router.route("/getEventDetails/:eventID").get(async (req, res) => {
  try {
    // const enteredEventID = parseInt(req.body.eventID);
    const enteredEventID = parseInt(req.params.eventID);
    //Presence check + validation check for enteredEventID
    const validID = validation.validateID(enteredEventID);

    if (!validID) {
      return res.send({
        status: "failure",
        reason: "Invalid ID format",
        enteredID: enteredEventID,
      });
    }

    const dbResult = await tbl_events.getEventInformation(enteredEventID);
    console.log(dbResult);
    if (dbResult === undefined) {
      return res.send({
        status: "failure",
        reason: "This event does not exist",
      });
    }

    const returnedInformation = {
      eventID: dbResult.event_id,
      userID: dbResult.user_id,
      title: dbResult.title,
      startDatetime: dbResult.start_datetime,
      endDatetime: dbResult.end_datetime,
      location: dbResult.location,
      organizerName: dbResult.organizer_name,
      contactEmail: dbResult.contact_email,
      contactPhoneNumber: dbResult.contact_phone_number,
      description: dbResult.description,
    };

    return res.send({
      status: "success",
      eventInformation: returnedInformation,
    });
  } catch (error) {
    return res.send({
      status: "failure",
    });
  }
});

router.route("/getEventByEventName").get(async (req, res) => {});
module.exports = router;
