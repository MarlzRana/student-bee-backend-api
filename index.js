//Imported packages
const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const cors = require('cors');
const e = require('express');
require('dotenv').config();

//Package setup

// //Environmental variables
const PORT = process.env.PORT;
const app = express();

// //Package parameter setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//Setting up the database connection
var db = mysql.createConnection({
  host: process.env.DBHOSTSERVERADDRESS,
  user: process.env.DBSERVERUSERNAME,
  password: process.env.DBSERVERPASSWORD,
  database: process.DBSERVERDATABASENAME,
  port: process.env.DBSERVERPORT,
  ssl: { ca: fs.readFileSync(process.env.DBCERTIFICATEFILEPATH) },
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log(
    `The server has successfully connected to the database: ${process.env.DBSERVERDATABASENAME}`
  );
});

app.get('/', (req, res) => {
  res.send({ message: 'Default gateway of student-bee-backend-api' });
});

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

app.listen(PORT, () =>
  console.log(`The server is running and listening on port: ${PORT}`)
);
