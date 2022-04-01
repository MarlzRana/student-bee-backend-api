'use strict';
//Imported packages
const express = require('express');
require('dotenv').config();

//Importing local file dependencies
const validation = require('../validation/validation');
const tbl_events = require('../database/tbl_events');
const tbl_event_participators = require('../database/tbl_event_participators');
const tbl_user_login_information = require('../database/tbl_user_login_information');
//Environmental variables

//Package setup
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//A default gateway to test if API server is accessible
router.route('/').get((req, res) => {
  return res.send({
    message: 'Default gateway of student-bee-backend-api route:/eventsSystem',
  });
});

router.route('/addEvent').post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        message: 'notLoggedIn',
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
        status: 'failure',
        message: 'missingParameters',
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
        status: 'failure',
        reason: 'invalidInputFormat',
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
      status: 'success',
      message: 'eventAdded',
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: 'failure',
      reason: 'internalError',
    });
  }
});

router.route('/top10MostRecentEvents').get(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        reason: 'notLoggedIn',
      });
    }

    const dbResult = await tbl_events.getTop10MostRecentEvents();

    const arrOfObjToSend = await Promise.all(
      dbResult.map(async (row) => {
        const usernameForParticularUserID =
          await tbl_user_login_information.getUsernameByUserID(row['user_id']);
        return {
          eventID: row['event_id'],
          username: usernameForParticularUserID,
          title: row['title'],
          startDateTime: row['start_datetime'],
          endDateTime: row['end_datetime'],
          location: row['location'],
          organizerName: row['organizer_name'],
          contactEmail: row['contact_email'],
          contactPhoneNumber: row['contact_phone_number'],
          description: row['description'],
        };
      })
    );
    return res.send({ events: arrOfObjToSend });
  } catch (err) {
    console.log(err);
    return res.send({
      status: 'failure',
      reason: 'internalError',
    });
  }
});

router.route('/getEventDetails').post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        reason: 'notLoggedIn',
      });
    }

    const enteredEventID = parseInt(req.body.eventID);

    //Presence check + validation check for enteredEventID
    const validID = validation.validateID(enteredEventID);

    if (!validID) {
      return res.send({
        status: 'failure',
        reason: 'Invalid ID format',
      });
    }

    const dbResult = await tbl_events.getEventInformation(enteredEventID);
    if (dbResult === undefined) {
      return res.send({
        status: 'failure',
        reason: 'This event does not exist',
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
      status: 'success',
      eventInformation: returnedInformation,
    });
  } catch (error) {
    return res.send({
      status: 'error',
    });
  }
});

router.route('/editEventDetails').post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        reason: 'notLoggedIn',
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
        status: 'failure',
        message: 'missingParameters',
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
        status: 'failure',
        reason: 'invalidInputFormat',
        validationCheckDetails: validationCheckDetails,
      });
    }

    //Presence check + validation check for enteredEventID
    const validID = validation.validateID(enteredEventID);

    if (!validID) {
      return res.send({
        status: 'failure',
        reason: 'Invalid ID format',
      });
    }

    const dbResult = await tbl_events.getEventInformation(enteredEventID);
    if (dbResult === undefined) {
      return res.send({
        status: 'failure',
        reason: 'This event does not exist',
      });
    }

    // Check if event belongs to user
    const userID = req.session.user.userID;
    if (dbResult.user_id !== userID) {
      return res.send({
        status: 'failure',
        reason: 'You do not own this event',
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
      status: 'success',
      message: 'Event successfully edited',
    });
  } catch (error) {
    return res.send({
      status: 'error',
    });
  }
});

router.route('/ownsEvent').post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        reason: 'notLoggedIn',
      });
    }

    const eventID = req.body.eventID;
    const userID = req.session.user.userID;

    //Presence check + validation check for enteredEventID
    const validID = validation.validateID(eventID);

    if (!validID) {
      return res.send({
        status: 'failure',
        reason: 'Invalid ID format',
      });
    }

    const dbResult = await tbl_events.getEventInformation(eventID);
    if (dbResult === undefined) {
      return res.send({
        status: 'failure',
        reason: 'This event does not exist',
      });
    }

    if (dbResult.user_id !== userID) {
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
    const dbResult = await tbl_events.findRecordsByTitle(query);
    return res.send(
      dbResult.map((obj) => {
        return {
          eventID: obj.event_id,
          userID: obj.user_id,
          title: obj.title,
          startDatetime: obj.start_datetime,
          endDatetime: obj.end_datetime,
          location: obj.location,
          organizerName: obj.organizer_name,
          contactEmail: obj.contact_email,
          contactPhoneNumber: obj.contact_phone_number,
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

router.route('/isUserPartOfEvent').post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        reason: 'notLoggedIn',
      });
    }
    //Getting the eventID of the event the user is checking they are part of
    const eventID = req.body.eventID;
    //Getting their userID from the session
    const userID = req.session.user.userID;
    //Presence checking our parameter
    const parameterPresenceCheckDetails = {
      eventID: eventID !== null && eventID !== undefined,
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
      eventID: validation.validateID(eventID),
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
    //Checking if the user has already said they are part of the event
    //DB query checking if the user is part of the event
    const dbResult =
      await tbl_event_participators.selectRecordByUserIDAndEventID(
        userID,
        eventID
      );
    //If the user is already part of the event return true
    if (dbResult) {
      return res.send({
        status: 'success',
        reason: { userIsPartOfEvent: true },
      });
    }
    //Else return false
    return res.send({
      status: 'success',
      reason: { userIsPartOfEvent: false },
    });
  } catch (err) {
    console.log(err);
    return res.send({
      status: 'failure',
      reason: 'internalError',
    });
  }
});

router.route('/invertIsUserPartOfEvent').post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        reason: 'notLoggedIn',
      });
    }
    //Getting the eventID of the event the user is trying to invert their part of status on
    const eventID = req.body.eventID;
    //Getting their userID from the session
    const userID = req.session.user.userID;
    //Presence checking our parameter
    const parameterPresenceCheckDetails = {
      eventID: eventID !== null && eventID !== undefined,
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
      eventID: validation.validateID(eventID),
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
    //Check if the user is currently part of the event
    //DB query checking if the user is part of the event
    const dbResult =
      await tbl_event_participators.selectRecordByUserIDAndEventID(
        userID,
        eventID
      );
    //If the user is already part of the event remove their participation
    if (dbResult) {
      await tbl_event_participators.deleteRecordByUserIDAndEventID(
        userID,
        eventID
      );
      //Send a response letting the API user know that the user was removed as a participant of that event
      return res.send({
        status: 'success',
        reason: 'userParticipationDeleted',
      });
    }
    //Else add them as a participant of the event
    await tbl_event_participators.addRecord(userID, eventID);
    //Send a response letting the API user know that the user was added as a participant of that event
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

router.route('/deleteEvent').post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        reason: 'notLoggedIn',
      });
    }

    const eventID = req.body.eventID;
    const userID = req.session.user.userID;

    const validID = validation.validateID(eventID);

    //Validate ID
    if (!validID) {
      return res.send({
        status: 'failure',
        reason: 'Invalid ID format',
      });
    }

    //Check if event exists
    const dbResult = await tbl_events.getEventInformation(eventID);
    if (dbResult === undefined) {
      return res.send({
        status: 'failure',
        reason: 'This event does not exist',
      });
    }

    //Check if user owns event
    if (dbResult.user_id !== userID) {
      return res.send({
        status: 'failure',
        owned: false,
      });
    }

    //Delete if they do
    const dbResult2 = await tbl_events.deleteEvent(eventID);

    return res.send({ status: 'success' });
  } catch (error) {
    return res.send({ status: 'error' });
  }
});

router.route('/myEvents').get(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: 'failure',
        reason: 'notLoggedIn',
      });
    }

    const userID = req.session.user.userID;

    const validID = validation.validateID(userID);

    //Validate ID
    if (!validID) {
      return res.send({
        status: 'failure',
        reason: 'Invalid ID format',
      });
    }

    //Find events owned by user
    const dbResult = await tbl_events.findAllUserOwnedEvents(userID);

    //Find all events participated in by user
    const dbResult2 =
      await tbl_event_participators.findAllUserParticipatingEvents(userID);

    //Return both results
    const object1 = dbResult.map((obj) => {
      return {
        eventID: obj.event_id,
        userID: obj.user_id,
      };
    });

    const object2 = dbResult2.map((obj) => {
      return {
        eventID: obj.event_id,
        userID: obj.user_id,
      };
    });

    const returnObject = object1.concat(object2);

    return res.send({ status: 'success', events: returnObject });
  } catch (error) {
    return res.send({ status: 'error' });
  }
});

module.exports = router;
