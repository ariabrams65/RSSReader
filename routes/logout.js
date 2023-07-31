const express = require('express')
const router = express.Router()

router.delete('/', (req, res) => {
    req.logout(err => {
        if (err) return next(err)
    })
    res.redirect('/login')
})

module.exports = router