const express = require('express');
const passport = require('passport');
const session = require('express-session');
const initializePassport = require('./config/passportConfig');
const cors = require('cors');

initializePassport(passport);

const app = express();
// app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
// app.use(cors({
//     origin: "http://localhost:3000",
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
app.use('/get-feed', require('./routes/feed'));
app.use('/subscriptions', require('./routes/subscriptions'));
app.use('/authenticated', require('./routes/authentication'))

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({message: message});
});

module.exports = app;