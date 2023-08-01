const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const bcrypt = require('bcrypt')
const User = require('../models/User')
    
router.get('/', auth.checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

router.post('/', auth.checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        console.log(user)
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

module.exports = router