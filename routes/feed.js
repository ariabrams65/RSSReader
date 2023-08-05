const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const getAllPosts = require('../controllers/feedController')

router.get('/', auth.checkAuthenticated, async (req, res) => {
    json = {posts: await getAllPosts(req.user.feeds)}
    console.log(json)
    res.json(json)
})

module.exports = router