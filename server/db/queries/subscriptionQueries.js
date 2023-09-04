const query = require('../dbConn');
const { QueryError } = require('../../customErrors');

async function getUserSubscriptions(userid) {
    const getSubscriptionsQuery = 
    `
    SELECT subscriptions.id, feeds.iconurl, subscriptions.name, subscriptions.folder
    FROM feeds JOIN subscriptions ON feeds.id = subscriptions.feedid
    WHERE subscriptions.userid = $1
    ORDER BY subscriptions.id;
    `;
    const res = await query(getSubscriptionsQuery, [userid]);
    return res.rows;
}

async function addUserSubscription(userid, feedHeaders, folder) {
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
    VALUES ($1, $2, $3, $4)
    RETURNING id, userid, feedid, name, folder;
    `;
    await query(insertFeedQuery, [
        feedHeaders.feedurl,
        feedHeaders.iconurl,
        feedHeaders.title
    ]);
    const idRes = await query(getFeedIdQuery, [feedHeaders.feedurl]);
    const feedid = idRes.rows[0].id;
    const subscriptionRes = await query(insertSubscriptionQuery, [userid, feedid, feedHeaders.title, folder]);
    const subscription = subscriptionRes.rows[0];
    return subscription;
}

async function deleteUserSubscription(userid, subscriptionid) {
    const deleteSubscriptionQuery =
    `
    DELETE FROM subscriptions 
    WHERE userid = $1 AND id = $2;
    `;
    const res = await query(deleteSubscriptionQuery, [userid, subscriptionid]);
    if (res.rowCount === 0) {
        throw new QueryError('Deletion unsuccesful');
    }
    await deleteUnsubscribedFeeds();
}

async function deleteUnsubscribedFeeds() {
    //deletes all feeds that aren't subscribed to by any users
    const deleteFeedsQuery =
    `
    DELETE FROM feeds
    WHERE id NOT IN (
        SELECT feedid
        FROM subscriptions
    );
    `;
    await query(deleteFeedsQuery);
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

async function renameSubscription(userid, subscriptionid, newName) {
    const renameQuery = 
    `
    UPDATE subscriptions
    SET name = $1
    WHERE userid = $2 AND id = $3;
    `;
    await query(renameQuery, [newName, userid, subscriptionid]);
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

async function deleteFolder(userid, folder) {
    const deleteQuery = 
    `
    DELETE from subscriptions
    WHERE userid = $1 AND folder = $2;
    `;
    await query(deleteQuery, [userid, folder]);
    if (res.rowCount === 0) {
        throw new QueryError('Deletion unsuccesful');
    }
    deleteUnsubscribedFeeds();
}

module.exports = { getUserSubscriptions, addUserSubscription, deleteUserSubscription, subscriptionExists, renameSubscription, renameFolder, deleteFolder};