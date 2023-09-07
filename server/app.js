if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const db = require('./db/db');
const initializePassport = require('./config/passportConfig');
const cors = require('cors');
const { ServerError } = require('./customErrors');

db.createTables();
initializePassport(passport);

const app = express();
app.use(express.static('__test__/integration/testFeeds'));
app.use(express.urlencoded({ extended: false }));
// app.use(cors({
//     origin: "http://localhost:5000",
//     credentials: true
// }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

app.use('/login', require('./routes/login'));
app.use('/logout', require('./routes/logout'));
app.use('/register', require('./routes/register'));
app.use('/feed', require('./routes/feed'));
app.use('/subscriptions', require('./routes/subscriptions'));
app.use('/authenticated', require('./routes/authentication'));

app.use((err, req, res, next) => {
    let status;
    let message;
    if (err instanceof ServerError) {
        status = err.status;
        message = err.message;
    } else {
        status = 500;
        message = 'Internal Server Error';
    }
    res.status(status).json({message: message});
});

module.exports = app;