const query = require('../dbConn');

async function getUserSubscriptions(userid) {
    const getSubscriptionsQuery = 
    `
    SELECT subscriptions.id, feeds.iconurl, feeds.title, subscriptions.folder
    FROM feeds JOIN subscriptions ON feeds.id = subscriptions.feedid
    WHERE subscriptions.userid = $1;
    `;
    const res = await query(getSubscriptionsQuery, [userid]);
    return res.rows;
}

async function addUserSubscription(userid, subscription, folder) {
    const insertFeedQuery = 
    `
    INSERT INTO feeds (feedurl, iconurl, title)
    VALUES ($1, $2, $3)
    ON CONFLICT (feedurl) DO NOTHING;
    `;
    const getFeedIdQuery=
    `
    SELECT id
    FROM feeds
    WHERE feedurl = $1;
    `;
    const insertSubscriptionQuery =
    `
    INSERT INTO subscriptions (userid, feedid, folder)
    VALUES ($1, $2, $3);
    `;
    await query(insertFeedQuery, [
        subscription.feedurl,
        subscription.iconurl,
        subscription.title
    ]);
    const res = await query(getFeedIdQuery, [subscription.feedurl]);
    const feedid = res.rows[0].id;
    await query(insertSubscriptionQuery, [userid, feedid, folder]);
    return feedid;
}

async function deleteUserSubscription(subscriptionid) {
    // const getFeedIdQuery =
    // `
    // SELECT feedid
    // FROM subscriptions
    // WHERE id = $1;
    // `;
    const deleteSubscriptionQuery =
    `
    DELETE FROM subscriptions WHERE id = $1;
    `;
    
    //deletes all posts whos feed doesn't have any subscriptions
    const deletePostsQuery =
    `
    DELETE FROM posts
    WHERE feedid NOT IN (
        SELECT feedid
        FROM subscriptions
    )
    `;

    //deletes all feeds that aren't subscribed to by any users
    const deleteFeedQuery =
    `
    DELETE FROM feeds
    WHERE id NOT IN (
        SELECT feedid
        FROM subscriptions
    );
    `;
    // const res = await query(getFeedIdQuery, [subscriptionid]);
    // const feedid = res.rows[0].feedid;
    await query(deleteSubscriptionQuery, [subscriptionid]);
    await query(deletePostsQuery);
    await query(deleteFeedQuery);
}

async function subscriptionExists(userid, feedurl) {
    const subscriptionExistsQuery = 
    `
    SELECT COUNT(*)
    FROM subscriptions JOIN feeds ON subscriptions.feedid = feeds.id
    WHERE subscriptions.userid = $1 AND feeds.feedurl = $2;
    `;
    const res = await query(subscriptionExistsQuery, [userid, feedurl]);
    return parseInt(res.rows[0].count);
}

module.exports = { getUserSubscriptions, addUserSubscription, deleteUserSubscription, subscriptionExists };