if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const passport = require('passport');
const session = require('express-session');
const initializePassport = require('./config/passportConfig');
const tableQueries = require('./db/queries/tableQueries');
const Bree = require('bree');
const cors = require('cors');

tableQueries.createTables();

initializePassport(passport);

const bree = new Bree({
    jobs: [{
        name: 'updatePosts',
        cron: '*/10 * * * *'
    }]
});
(async () => {
    await bree.start();
})();

bree.on('worker created', (name) => {
    console.log('worker created', name);
});
bree.on('worker deleted', (name) => {
    console.log('worker deleted', name);
});

const app = express();
app.use(express.static('public'));
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

app.listen(5000);