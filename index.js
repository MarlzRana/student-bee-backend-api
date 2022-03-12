//Imported packages
const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();

//Environmental variables
const PORT = process.env.PORT;
const DBHOSTSERVERADDRESS = process.env.DBHOSTSERVERADDRESS;
const DBSERVERUSERNAME = process.env.DBSERVERUSERNAME;
const DBSERVERPASSWORD = process.env.DBSERVERPASSWORD;
const DBSERVERDATABASENAME = process.env.DBSERVERDATABASENAME;
const DBSERVERPORT = process.env.DBSERVERPORT;
const DBCERTIFICATEFILEPATH = process.env.DBCERTIFICATEFILEPATH;
const SALTROUNDS = parseInt(process.env.SALTROUNDS);

//Package setup
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(
  session({
    key: '',
    secret: 'testSecret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

//Setting up the database connection
var db = mysql.createConnection({
  host: DBHOSTSERVERADDRESS,
  user: DBSERVERUSERNAME,
  password: DBSERVERPASSWORD,
  database: DBSERVERDATABASENAME,
  port: DBSERVERPORT,
  ssl: { ca: fs.readFileSync(DBCERTIFICATEFILEPATH) },
});

//Testing our connection to the database
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log(
    `The server has successfully connected to the database: ${DBSERVERDATABASENAME}`
  );
});

//A default gateway to test if API server is accessible
app.get('/', (req, res) => {
  res.send({ message: 'Default gateway of student-bee-backend-api' });
});

//POST request logic to handle the registration of a user
app.post('/register', (req, res) => {
  //Get the entered username and password from the request body
  const username = req.body.username;
  const password = req.body.password;
  //Generate salt to hash the entered password
  bcrypt.genSalt(SALTROUNDS).then((salt) =>
    // Hash the password with the generated salt
    bcrypt.hash(password, salt).then((hashedPassword) => {
      //Insert the user into the database with their respectively hashed password
      db.query(
        'INSERT INTO studentbee.tbl_user_login_information (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        (dbErr, dbResult) => {
          if (dbErr) {
            console.log(dbErr);
            res.send({ status: 'FAILURE' });
          } else {
            res.send({ status: 'SUCCESS' });
          }
        }
      );
    })
  );
});

app.get('/isLoggedIn', (req, res) => {
  console.log(req.session);
  if (req.session.user) {
    res.send({ isLoggedIn: true, user: req.session.user });
  } else {
    res.send({ isLoggedIn: false });
  }
});

//POST request logic to handle the login of a user
app.post('/login', (req, res) => {
  const enteredUsername = req.body.username;
  const enteredPassword = req.body.password;
  //Get the hashed password of a user with that username
  db.query(
    'SELECT user_id, username, password FROM studentbee.tbl_user_login_information where username = ?',
    [enteredUsername],
    (dbErr, dbResult) => {
      if (dbErr) {
        res.send({ error: dbErr });
      } else {
        if (dbResult.length > 0) {
          //Hash the enteredPassword using the salt found prepended to the hashed password in the database
          bcrypt.compare(
            enteredPassword,
            dbResult[0].password,
            (bcryptError, bcryptResult) => {
              //Return the appropriate response depending on the enteredPassword == hashedPasswordInDB
              if (bcryptResult) {
                req.session.user = dbResult;
                res.send({ status: 'validCredentials' });
              } else {
                res.send({ status: 'incorrectPassword' });
              }
            }
          );
        } else {
          //If the username does not exist return
          res.send({ status: 'nonExistentUsername' });
        }
      }
    }
  );
});

//Tells the API what port to listen to and display's that port in the console
app.listen(PORT, () =>
  console.log(`The server is running and listening on port: ${PORT}`)
);
