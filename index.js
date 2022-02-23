//Imported packages
const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const cors = require('cors');
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
    `The server has successfully connected to ${process.env.DBSERVERDATABASENAME}`
  );
});

app.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  db.query(
    'INSERT INTO studentbee.tbl_user_login_information (username, password) VALUES (?, ?)',
    [username, password],
    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.send({ status: 'SUCCESS' });
      }
    }
  );
});

app.listen(PORT, () =>
  console.log(`The server is running and listening on port: ${PORT}`)
);
