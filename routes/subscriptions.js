const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')

router.get('/', auth.checkAuthenticated, (req, res) => {
    res.json({subscriptions: req.user.subscriptions})
})

router.post('/', auth.checkAuthenticated, (req, res) => {
    const newSubscription = req.body.newSubscription
    console.log(newSubscription)
    req.user.subscriptions
    //add subscription to database
})

module.exports = router