const { getPosts } = require('../services/feedService');

async function getFeed(req, res, next) {
    try {
        const posts = await getPosts(
            req.user.id,
            req.query.folder, 
            req.query.subscriptionid, 
            req.query.olderThan, 
            req.query.limit
        );
        const oldestPost = posts.slice(-1)[0];
        res.json({
            posts: posts,
            oldestPostDate: oldestPost ? oldestPost.date : undefined
    });
    } catch(e) {
        console.log(e);
        next(e);
    }
}

module.exports =  getFeed;