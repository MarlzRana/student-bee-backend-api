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
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        reason: "notLoggedIn",
      });
    }

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

router.route("/getEventDetails").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        reason: "notLoggedIn",
      });
    }

    const enteredEventID = parseInt(req.body.eventID);

    //Presence check + validation check for enteredEventID
    const validID = validation.validateID(enteredEventID);

    if (!validID) {
      return res.send({
        status: "failure",
        reason: "Invalid ID format",
      });
    }

    const dbResult = await tbl_events.getEventInformation(enteredEventID);
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
      status: "error",
    });
  }
});

router.route("/editEventDetails").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        reason: "notLoggedIn",
      });
    }

    const enteredEventID = parseInt(req.body.eventID);
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

    //Presence check + validation check for enteredEventID
    const validID = validation.validateID(enteredEventID);

    if (!validID) {
      return res.send({
        status: "failure",
        reason: "Invalid ID format",
      });
    }

    const dbResult = await tbl_events.getEventInformation(enteredEventID);
    if (dbResult === undefined) {
      return res.send({
        status: "failure",
        reason: "This event does not exist",
      });
    }

    // Check if event belongs to user
    const userID = req.session.user.userID;
    if (dbResult.user_id !== userID) {
      return res.send({
        status: "failure",
        reason: "You do not own this event",
      });
    }

    // Edit the event in the database
    const dbResult2 = await tbl_events.editEvent(
      enteredEventID,
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
      message: "Event successfully edited",
    });
  } catch (error) {
    return res.send({
      status: "error",
    });
  }
});

router.route("/ownsEvent").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        reason: "notLoggedIn",
      });
    }

    const eventID = req.body.eventID;
    const userID = req.session.user.userID;

    //Presence check + validation check for enteredEventID
    const validID = validation.validateID(eventID);

    if (!validID) {
      return res.send({
        status: "failure",
        reason: "Invalid ID format",
      });
    }

    const dbResult = await tbl_events.getEventInformation(eventID);
    if (dbResult === undefined) {
      return res.send({
        status: "failure",
        reason: "This event does not exist",
      });
    }

    if (dbResult.user_id !== userID) {
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

router.route("/deleteEvent").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        reason: "notLoggedIn",
      });
    }

    const eventID = req.body.eventID;
    const userID = req.session.user.userID;

    const validID = validation.validateID(eventID);

    //Validate ID
    if (!validID) {
      return res.send({
        status: "failure",
        reason: "Invalid ID format",
      });
    }

    //Check if event exists
    const dbResult = await tbl_events.getEventInformation(eventID);
    if (dbResult === undefined) {
      return res.send({
        status: "failure",
        reason: "This event does not exist",
      });
    }

    //Check if user owns event
    if (dbResult.user_id !== userID) {
      return res.send({
        status: "failure",
        owned: false,
      });
    }

    //Delete if they do
    const dbResult2 = await tbl_events.deleteEvent(eventID);

    return res.send({ status: "success" });
  } catch (error) {
    return res.send({ status: "error" });
  }
});

module.exports = router;
