const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
getAllPosts = require('../controllers/feedController')

router.get('/', auth.checkAuthenticated, async (req, res) => {
    res.render('index.ejs', {
        name: req.user.name,
        posts: await getAllPosts(req.user.feeds)
    })
})

module.exports = router