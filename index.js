//Imported packages
const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

//Environmental variables
const PORT = process.env.PORT;
const DBHOSTSERVERADDRESS = process.env.DBHOSTSERVERADDRESS;
const DBSERVERUSERNAME = process.env.DBSERVERUSERNAME;
const DBSERVERPASSWORD = process.env.DBSERVERPASSWORD;
const DBSERVERDATABASENAME = process.env.DBSERVERDATABASENAME;
const DBSERVERPORT = process.env.DBSERVERPORT;
const DBCERTIFICATEFILEPATH = process.env.DBCERTIFICATEFILEPATH;

//Package setup
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

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
  const username = req.body.username;
  const password = req.body.password;
  db.query(
    'INSERT INTO studentbee.tbl_user_login_information (username, password) VALUES (?, ?)',
    [username, password],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send({ status: 'FAILURE' });
      } else {
        res.send({ status: 'SUCCESS' });
      }
    }
  );
});

//POST request logic to handle the login of a user
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  db.query(
    'SELECT username, password FROM studentbee.tbl_user_login_information where username = ? and password = ?',
    [username, password],
    (err, result) => {
      if (err) {
        res.send({ error: err });
      }
      if (result.length > 0) {
        res.send({ status: 'validCredentials' });
      } else {
        res.send({ status: 'invalidCredentials' });
      }
    }
  );
});

//Tells the API what port to listen to and display's that port in the console
app.listen(PORT, () =>
  console.log(`The server is running and listening on port: ${PORT}`)
);
