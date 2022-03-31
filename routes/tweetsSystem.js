"use strict";
//Imported packages
const express = require("express");
require("dotenv").config();

//Importing local file dependencies
const validation = require("../validation/validation");
const tbl_user_login_information = require("../database/tbl_user_login_information");
const tbl_tweets = require("../database/tbl_tweets");
const tbl_likes = require("../database/tbl_likes");
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
        dataIn: res.body,
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
        const usernameForParticularUserID =
          await tbl_user_login_information.getUsernameByUserID(
            row["author_user_id"]
          );
        const howLongAgoDays = parseInt(
          Math.abs(row["tweet_posted_datetime"] - today) / (1000 * 60 * 60 * 24)
        );
        console.log("Days ago: ");
        console.log(howLongAgoDays);
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
            } else if (howLongAgoMinutes < 1) {
              return {
                tweetID: row["tweet_id"],
                content: row["content"],
                authorUsername: usernameForParticularUserID,
                howLongAgo: "Just now",
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
              } else if (howLongAgoMinutes < 1) {
                return {
                  tweetID: row["tweet_id"],
                  content: row["content"],
                  authorUsername: usernameForParticularUserID,
                  howLongAgo: "Just now",
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

router.route("/likeTweet").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        message: "notLoggedIn",
      });
    }

    const userID = parseInt(req.session.user.userID);
    const tweetID = parseInt(req.body.tweetID);

    //Check that all the parameters are not null
    if (userID === null || tweetID === null) {
      return res.send({
        status: "failure",
        message: "missingParameters",
        parameterPresenceCheckDetails: {
          userID: userID !== null,
          tweetID: tweetID !== null,
        },
      });
    }
    //Validate inputs
    const validationCheckDetails = {
      userID: validation.validateID(userID),
      tweetID: validation.validateID(tweetID),
    };
    if (!(validationCheckDetails.userID && validationCheckDetails.tweetID)) {
      return res.send({
        status: "failure",
        reason: "invalidInputFormat",
        validationCheckDetails: validationCheckDetails,
        dataIn: res.body,
      });
    }

    // const dbResult = await tbl_likes.addNewRecord(userID, tweetID);
    const dbResult = await tbl_likes.addNewRecord(userID, tweetID);

    //Check that all the parameters are not null
    if (userID === null || tweetID === null) {
      return res.send({
        status: "failure",
        message: "missingParameters",
        parameterPresenceCheckDetails: {
          userID: userID !== null,
          tweetID: tweetID !== null,
        },
      });
    }

    const dbResult2 = await tbl_likes.checkIfUserLikedComment(tweetID, userID);
    console.log(dbResult2);
    console.log(dbResult2[0].like_id);
    const likeCount = dbResult2.length;

    if (likeCount < 1) {
      return res.send({
        status: "success",
        liked: false,
      });
    } else {
      return res.send({
        status: "success",
        message: "Tweet successfully liked",
        likeID: dbResult2[0].like_id,
      });
    }

    //Add a like to the database
  } catch (error) {
    console.log(error);
    return res.send({ status: "error" });
  }
});

router.route("/unlikeTweet").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        message: "notLoggedIn",
      });
    }

    const likeID = parseInt(req.body.likeID);

    //Check that all the parameters are not null
    if (likeID === null) {
      return res.send({
        status: "failure",
        message: "missingParameters",
        parameterPresenceCheckDetails: {
          likeID: likeID !== null,
        },
      });
    }
    //Validate inputs
    const validationCheckDetails = {
      likeID: validation.validateID(likeID),
    };
    if (!validationCheckDetails.likeID) {
      return res.send({
        status: "failure",
        reason: "invalidInputFormat",
        validationCheckDetails: validationCheckDetails,
        dataIn: res.body,
      });
    }

    const dbResult = await tbl_likes.deleteLike(likeID);

    return res.send({
      status: "success",
      message: "Tweet successfully unliked",
    });
  } catch (error) {
    console.log(error);
    return res.send({ status: "error" });
  }
});

router.route("/getLikeCount").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        message: "notLoggedIn",
      });
    }

    const tweetID = parseInt(req.body.tweetID);
    console.log("Tweet ID: " + tweetID);
    console.log("Request Body: " + req.body.tweetID);

    //Check that all the parameters are not null
    if (tweetID === null) {
      return res.send({
        status: "failure",
        message: "missingParameters",
        parameterPresenceCheckDetails: {
          tweetID: tweetID !== null,
        },
      });
    }
    //Validate inputs
    const validationCheckDetails = {
      tweetID: validation.validateID(tweetID),
    };
    if (!validationCheckDetails.tweetID) {
      return res.send({
        status: "failure",
        reason: "invalidInputFormat",
        validationCheckDetails: validationCheckDetails,
        route: "getLikeCount",
        dataIn: res.body,
      });
    }

    const dbResult = await tbl_likes.getLikeCount(tweetID);
    const likeCount = dbResult.length;

    if (likeCount < 1) {
      return res.send({
        status: "success",
        message: "Like count fetched",
        likeCount: "",
      });
    } else {
      return res.send({
        status: "success",
        message: "Like count fetched",
        likeCount: likeCount,
      });
    }
  } catch (error) {
    console.log(error);
    return res.send({
      status: "error",
    });
  }
});

router.route("/doesUserLikeTweet").post(async (req, res) => {
  try {
    //Check if the user is logged in
    if (!req.session.user) {
      return res.send({
        status: "failure",
        message: "notLoggedIn",
      });
    }

    const tweetID = parseInt(req.body.tweetID);
    const userID = parseInt(req.session.user.userID);

    //Check that all the parameters are not null
    if (userID === null || tweetID === null) {
      return res.send({
        status: "failure",
        message: "missingParameters",
        parameterPresenceCheckDetails: {
          userID: userID !== null,
          tweetID: tweetID !== null,
        },
      });
    }
    //Validate inputs
    const validationCheckDetails = {
      userID: validation.validateID(userID),
      tweetID: validation.validateID(tweetID),
    };
    if (!(validationCheckDetails.userID && validationCheckDetails.tweetID)) {
      return res.send({
        status: "failure",
        reason: "invalidInputFormat",
        validationCheckDetails: validationCheckDetails,
        dataIn: res.body,
      });
    }

    const dbResult = await tbl_likes.checkIfUserLikedComment(tweetID, userID);
    console.log(dbResult);
    console.log(dbResult[0].like_id);
    const likeCount = dbResult.length;

    if (likeCount < 1) {
      return res.send({
        status: "success",
        liked: false,
      });
    } else {
      return res.send({
        status: "success",
        liked: true,
        likeID: dbResult[0].like_id,
      });
    }
  } catch (error) {
    console.log(error);
    return res.send({
      status: "error",
    });
  }
});

module.exports = router;
