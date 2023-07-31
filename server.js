if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const passport = require('passport')
const flash = require('express-flash') 
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

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

const index = require('./routes/index')
const login = require('./routes/login')
const logout = require('./routes/logout')
const register = require('./routes/register')

app.use('/', index)
app.use('/login', login)
app.use('/logout', logout)
app.use('/register', register)

const users = []

app.listen(3000)

module.exports = passport