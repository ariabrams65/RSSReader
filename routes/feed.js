const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllPosts } = require('../controllers/feedController');

router.get('/', auth.checkAuthenticated, async (req, res) => {
    let json;
    if (req.query.url === undefined) {
        json = {posts: await getAllPosts(req.user.subscriptions.map(sub => sub.feedUrl))};
    } else {
        json = {posts: await getAllPosts([req.query.url])};
    }
    res.json(json);
});

module.exports = router;