//Imported packages
const express = require('express');
const mysql = require('mysql');
require('dotenv').config();

//Environmental variables
const PORT = process.env.PORT;
const app = express();

//Package parameter setup
app.use(express.json());

app.listen(PORT, () =>
  console.log(`The server is running and listening on port: ${PORT}`)
);
