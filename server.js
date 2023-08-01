if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const passport = require('passport')
const flash = require('express-flash') 
const session = require('express-session')
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const initializePassport = require('./config/passportConfig')
const connectDB = require('./config/dbConnConfig')

connectDB()
mongoose.connection.once('open', () => console.log('Connected to Database'))

initializePassport(passport)

const app = express()
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.use('/', require('./routes/index'))
app.use('/login', require('./routes/login'))
app.use('/logout', require('./routes/logout'))
app.use('/register', require('./routes/register'))

app.listen(3000)