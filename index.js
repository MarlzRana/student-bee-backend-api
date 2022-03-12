//Imported packages
const express = require('express');
const mysql = require('mysql');
const mysql2 = require('mysql2/promise');
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

//POST request logic to handle the registration of a user
app.post('/register', async (req, res) => {
  try {
    //Get the entered username and password
    const enteredUsername = req.body.username;
    const enteredPassword = req.body.password;
    //Check is a user already exists with that username
    const [dbResult] = await db.query(
      'SELECT username FROM tbl_user_login_information WHERE username = ?',
      [enteredUsername]
    );
    if (dbResult.length > 0) {
      return res.send({ status: 'usernameIsTaken' });
    }
    //Create the salt to use and then hash the enteredPassword to be
    const saltToUse = await bcrypt.genSalt(SALTROUNDS);
    const hashedPassword = await bcrypt.hash(enteredPassword, saltToUse);
    await db.query(
      'INSERT INTO tbl_user_login_information (username, password) VALUES (?, ?)',
      [enteredUsername, hashedPassword]
    );
    return res.send({ status: 'success' });
  } catch (err) {
    console.log(err);
    return res.send({ error: true });
  }
});

//GET request that reads and compares the cookie sent to active cookies on the server to check is a user is logged in
app.get('/isLoggedIn', (req, res) => {
  if (req.session.user) {
    res.send({ isLoggedIn: true, user: req.session.user });
  } else {
    res.send({ isLoggedIn: false });
  }
});

//POST request used to login and create a login session with a cookie
app.post('/login', async (req, res) => {
  try {
    const enteredUsername = req.body.username;
    const enteredPassword = req.body.password;
    const [dbResult] = await db.query(
      'SELECT username, password FROM tbl_user_login_information where username = ?',
      [enteredUsername]
    );
    if (dbResult.length < 1) {
      return res.send({ status: 'invalidCredentials' });
    }
    const actualHashedPassword = dbResult[0].password;
    const isCorrectPassword = await bcrypt.compare(
      enteredPassword,
      actualHashedPassword
    );
    if (!isCorrectPassword) {
      return res.send({ status: 'invalidCredentials' });
    }
    req.session.user = {
      username: enteredUsername,
      password: actualHashedPassword,
    };
    return res.send({
      status: 'validCredentials',
    });
  } catch (err) {
    console.log(err);
    return res.send({ error: true });
  }
});

//Tells the API what port to listen to and display's that port in the console
app.listen(PORT, () =>
  console.log(`The server is running and listening on port: ${PORT}`)
);
