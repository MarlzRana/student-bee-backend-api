'use strict';
//Imported packages
const express = require('express');
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
    message: 'Default gateway of student-bee-backend-api route:/eventsSystem',
  });
});

router.route('/addEvent').post(async (req, res) => {
  //Get the parameters provided in the response
  const eventName = req.body.eventName;
  const eventDescription = req.body.eventDescription;
  const eventDate = req.body.eventDate;
  const eventTime = req.body.eventTime;
  const eventLocation = req.body.eventLocation;
  const eventCapacity = req.body.eventCapacity;
});

router.route('/getEventByEventName').get(async (req, res) => {});
module.exports = router;
