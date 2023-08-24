const feedQueries = require('../db/queries/feedQueries');
const postQueries = require('../db/queries/postQueries');

async function getFeed(req, res, next) {
    // REMOVE!!!
    // REMOVE!!!
    // REMOVE!!!
    req.user = {id: 1};
    // REMOVE!!!
    // REMOVE!!!
    // REMOVE!!!
    let feedIds;
    try {
        if (req.query.subscriptionid === undefined) {
            feedIds = await feedQueries.getAllSubscribedFeedIds(req.user.id);
        } else {
            feedIds = [await feedQueries.getFeedId(req.query.subscriptionid)];
        }
        const posts = await postQueries.getPosts({
            feedIds: feedIds,
            olderThan: req.query.olderThan,
            limit: req.query.limit
        });
        const oldestPost = posts.slice(-1)[0];
        res.json({
            posts: posts,
            oldestPostDate: oldestPost ? oldestPost.date : undefined
    });
    } catch(e) {
        next(e);
    }
}

module.exports =  getFeed;