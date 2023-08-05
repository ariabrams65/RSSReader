const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')

router.get('/', auth.checkAuthenticated, (req, res) => {
    res.json({subscriptions: req.user.feeds})
})

router.post('/', auth.checkAuthenticated, (req, res) => {
    const newSubscription = req.body.newSubscription
    console.log(newSubscription)
    //add subscription to database
})

module.exports = router