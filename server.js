if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const initializePassport = require('./config/passportConfig');
const query = require('./db/queries');
const Bree = require('bree');

query.createTables();

initializePassport(passport);

// const bree = new Bree({
//     jobs: [{
//         name: 'updatePosts',
//         cron: '0 * * * *'
//     }]
// });
// (async () => {
//     await bree.start();
// })();

// bree.on('worker created', (name) => {
//     console.log('worker created', name);
// });
// bree.on('worker deleted', (name) => {
//     console.log('worker deleted', name);
// });

const app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(express.json());

app.use('/', require('./routes/index'));
app.use('/login', require('./routes/login'));
app.use('/logout', require('./routes/logout'));
app.use('/register', require('./routes/register'));
app.use('/get-feed', require('./routes/feed'));
app.use('/subscriptions', require('./routes/subscriptions'));

app.listen(3000);