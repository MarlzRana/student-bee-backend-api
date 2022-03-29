"use strict";
//Imported packages
const express = require("express");
require("dotenv").config();

//Importing local file dependencies
const validation = require("../validation/validation");
const tbl_user_feedback = require("../database/tbl_user_feedback");
const tbl_user_login_information = require("../database/tbl_user_login_information");
const tbl_tweets = require("../database/tbl_tweets");
//Environmental variables

//Package setup
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//A default gateway to test if API server is accessible
router.route("/").get((req, res) => {
  return res.send({
    message: "Default gateway of student-bee-backend-api route:/tweetsSystem",
  });
});

router.route("/addTweet").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        message: "notLoggedIn",
      });
    }
    //Get the parameters provided in the response
    const authorID = req.session.user.userID;
    const tweetPostedDateTime = req.body.tweetPostedDateTime;
    const content = req.body.content;
    //Check that all the parameters are not null
    if (authorID === null || tweetPostedDateTime === null || content === null) {
      return res.send({
        status: "failure",
        message: "missingParameters",
        parameterPresenceCheckDetails: {
          tweetPostedDateTime: tweetPostedDateTime !== null,
          content: content !== null,
        },
      });
    }
    //Validate inputs
    const validationCheckDetails = {
      authorID: validation.validateID(authorID),
      tweetPostedDateTime: validation.validateDateTime(tweetPostedDateTime),
      content: validation.validateShortDescription(content),
    };
    if (
      !(
        validationCheckDetails.authorID &&
        validationCheckDetails.tweetPostedDateTime &&
        validationCheckDetails.content
      )
    ) {
      return res.send({
        status: "failure",
        reason: "invalidInputFormat",
        validationCheckDetails: validationCheckDetails,
      });
    }

    //Add the event to the database
    const dbResult = await tbl_tweets.addNewRecord(
      authorID,
      tweetPostedDateTime,
      content
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

router.route("/get20RecentTweets").get(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        reason: "notLoggedIn",
      });
    }

    const dbResult = await tbl_tweets.getTop20MostRecentTweets();

    const today = new Date();

    const arrOfObjToSend = await Promise.all(
      dbResult.map(async (row) => {
        console.log(today);
        console.log(row["tweet_posted_datetime"]);
        console.log();
        const usernameForParticularUserID =
          await tbl_user_login_information.getUsernameByUserID(
            row["author_user_id"]
          );
        const howLongAgoDays = parseInt(
          (row["tweet_posted_datetime"] - today) / (1000 * 60 * 60 * 24)
        );
        if (howLongAgoDays < 1) {
          const howLongAgoHours = parseInt(
            (Math.abs(row["tweet_posted_datetime"] - today) /
              (1000 * 60 * 60)) %
              24
          );
          if (howLongAgoHours < 1) {
            const howLongAgoMinutes = parseInt(
              (Math.abs(
                row["tweet_posted_datetime"].getTime() - today.getTime()
              ) /
                (1000 * 60)) %
                60
            );
            if (howLongAgoMinutes == 1) {
              return {
                tweetID: row["tweet_id"],
                content: row["content"],
                authorUsername: usernameForParticularUserID,
                howLongAgo: howLongAgoMinutes + " minute ago",
              };
            } else {
              return {
                tweetID: row["tweet_id"],
                content: row["content"],
                authorUsername: usernameForParticularUserID,
                howLongAgo: howLongAgoMinutes + " minutes ago",
              };
            }
          } else if (howLongAgoHours == 1) {
            const howLongAgoMinutes = parseInt(
              (Math.abs(
                row["tweet_posted_datetime"].getTime() - today.getTime()
              ) /
                (1000 * 60)) %
                60
            );
            if (howLongAgoMinutes < 59) {
              if (howLongAgoMinutes == 1) {
                return {
                  tweetID: row["tweet_id"],
                  content: row["content"],
                  authorUsername: usernameForParticularUserID,
                  howLongAgo: howLongAgoMinutes + " minute ago",
                };
              } else {
                return {
                  tweetID: row["tweet_id"],
                  content: row["content"],
                  authorUsername: usernameForParticularUserID,
                  howLongAgo: howLongAgoMinutes + " minutes ago",
                };
              }
            } else {
              return {
                tweetID: row["tweet_id"],
                content: row["content"],
                authorUsername: usernameForParticularUserID,
                howLongAgo: howLongAgoHours + " hour ago",
              };
            }
          } else {
            return {
              tweetID: row["tweet_id"],
              content: row["content"],
              authorUsername: usernameForParticularUserID,
              howLongAgo: howLongAgoHours + " hours ago",
            };
          }
        } else if (howLongAgoDays == 1) {
          return {
            tweetID: row["tweet_id"],
            content: row["content"],
            authorUsername: usernameForParticularUserID,
            howLongAgo: howLongAgoDays + " day ago",
          };
        } else {
          return {
            tweetID: row["tweet_id"],
            content: row["content"],
            authorUsername: usernameForParticularUserID,
            howLongAgo: howLongAgoDays + " days ago",
          };
        }
      })
    );
    return res.send({ status: "success", tweets: arrOfObjToSend });
  } catch (err) {
    console.log(err);
    return res.send({
      status: "failure",
      reason: "internalError",
    });
  }
});

router.route("/getTweetDetails").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        reason: "notLoggedIn",
      });
    }

    const enteredTweetID = parseInt(req.body.tweetID);

    //Presence check + validation check for enteredEventID
    const validID = validation.validateID(enteredTweetID);

    if (!validID) {
      return res.send({
        status: "failure",
        reason: "Invalid ID format",
      });
    }

    const dbResult = await tbl_tweets.getTweet(enteredTweetID);
    if (dbResult === undefined) {
      return res.send({
        status: "failure",
        reason: "This event does not exist",
      });
    }

    const returnedInformation = {
      tweetID: dbResult.tweet_id,
      authorID: dbResult.author_user_id,
      tweetPostedDateTime: dbResult.tweet_posted_datetime,
      content: dbResult.content,
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

module.exports = router;
