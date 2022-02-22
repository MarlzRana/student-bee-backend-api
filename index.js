//Imported packages
const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
require('dotenv').config();

//Environmental variables
const PORT = process.env.PORT;
const app = express();

//Package parameter setup
app.use(express.json());

//Setting up the database connection
var db = mysql.createConnection({
  host: process.env.DBHOSTSERVERADDRESS,
  user: process.env.DBSERVERUSERNAME,
  password: process.env.DBSERVERPASSWORD,
  database: process.DBSERVERDATABASENAME,
  port: process.env.DBSERVERPORT,
  ssl: { ca: fs.readFileSync(process.env.DBCERTIFICATEFILEPATH) },
});

app.listen(PORT, () =>
  console.log(`The server is running and listening on port: ${PORT}`)
);
