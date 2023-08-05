const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
getAllPosts = require('../controllers/feedController')

router.get('/', auth.checkAuthenticated, (req, res) => {
    res.render('index.ejs')
})

module.exports = router