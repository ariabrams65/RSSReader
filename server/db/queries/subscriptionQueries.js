const query = require('../dbConn');

async function getUserSubscriptions(userid) {
    const getSubscriptionsQuery = 
    `
    SELECT subscriptions.id, feeds.iconurl, subscriptions.name, subscriptions.folder
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
    INSERT INTO subscriptions (userid, feedid, name, folder)
    VALUES ($1, $2, $3, $4);
    `;
    await query(insertFeedQuery, [
        subscription.feedurl,
        subscription.iconurl,
        subscription.title
    ]);
    const res = await query(getFeedIdQuery, [subscription.feedurl]);
    const feedid = res.rows[0].id;
    await query(insertSubscriptionQuery, [userid, feedid, subscription.title, folder]);
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

async function subscriptionExists(userid, feedurl, folder) {
    const subscriptionExistsQuery = 
    `
    SELECT COUNT(*)
    FROM subscriptions JOIN feeds ON subscriptions.feedid = feeds.id
    WHERE subscriptions.userid = $1 AND feeds.feedurl = $2 AND subscriptions.folder = $3;
    `;
    const res = await query(subscriptionExistsQuery, [userid, feedurl, folder]);
    return parseInt(res.rows[0].count);
}

async function renameSubscription(subscriptionid, newName) {
    const renameQuery = 
    `
    UPDATE subscriptions
    SET name = $1
    WHERE id = $2;
    `;
    await query(renameQuery, [newName, subscriptionid]);
}

async function renameFolder(userid, oldName, newName) {
    const renameQuery = 
    `
    update subscriptions
    set folder = $1
    where userid = $2 AND folder = $3;
    `;
    await query(renameQuery, [newName, userid, oldName]);
}

module.exports = { getUserSubscriptions, addUserSubscription, deleteUserSubscription, subscriptionExists, renameSubscription, renameFolder };