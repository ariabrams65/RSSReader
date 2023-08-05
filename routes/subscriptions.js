const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')

router.get('/', auth.checkAuthenticated, (req, res) => {
    res.json({subscriptions: req.user.subscriptions})
})

router.post('/', auth.checkAuthenticated, async (req, res) => {
    const newSubscription = req.body.newSubscription
    console.log(newSubscription)
    req.user.subscriptions.push(newSubscription)
    try {
        await req.user.save()
    } catch {
        return res.sendStatus(500)
    }
    res.sendStatus(204)
})

module.exports = router