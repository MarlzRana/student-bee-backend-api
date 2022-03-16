'use strict';
//Imported packages
const express = require('express');
const mysql2 = require('mysql2/promise');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();

//Environmental variables
const PORT = process.env.PORT || 3001;
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
    secret: bcrypt.genSaltSync(SALTROUNDS),
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

//Importing our routes
const loginSystem = require('./routes/loginSystem');

//Configuring our routes as "middleware"
app.use('/loginSystem', loginSystem);

//Setting up the database connection
const dbConfig = {
  host: DBHOSTSERVERADDRESS,
  user: DBSERVERUSERNAME,
  password: DBSERVERPASSWORD,
  database: DBSERVERDATABASENAME,
  port: DBSERVERPORT,
  ssl: { ca: fs.readFileSync(DBCERTIFICATEFILEPATH) },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
};
const db = mysql2.createPool(dbConfig);

//Testing our connection to the database
const testDbConnection = async () => {
  try {
    await db.query(
      'SELECT * from tbl_user_login_information WHERE username="user"'
    );
    console.log('The server is connected to studentbee-db');
  } catch (error) {
    console.log('WARNING: Server not connected to studentbee-db');
  }
};
testDbConnection();

//A default gateway to test if API server is accessible
app.get('/', (req, res) => {
  res.send({ message: 'Default gateway of student-bee-backend-api' });
});

//Tells the API what port to listen to and display's that port in the console
app.listen(PORT, () =>
  console.log(`The server is running and listening on port: ${PORT}`)
);
