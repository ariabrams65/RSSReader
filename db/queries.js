const query = require('./dbConn');

async function createTables() { 
    const createTablesQuery = 
    `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT
    );

    CREATE TABLE IF NOT EXISTS feeds (
        id SERIAL PRIMARY KEY,
        feedurl TEXT UNIQUE,
        iconurl TEXT,
        title TEXT,
        numposts INT DEFAULT 0,
        lastmodified TIMESTAMPTZ,
        etag TEXT
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        userid INT REFERENCES users(id),
        feedid INT REFERENCES feeds(id)
    );

    CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        feedid INT REFERENCES feeds(id),
        title TEXT,
        url TEXT,
        commentsurl TEXT,
        mediaurl TEXT,
        identifier TEXT UNIQUE,
        date TIMESTAMPTZ
    );
    `;
    await query(createTablesQuery);
}

async function getUserSubscriptions(userid) {
    const getSubscriptionsQuery = 
    `
    SELECT subscriptions.id as subscriptionid, iconurl, title
    FROM feeds JOIN subscriptions ON feeds.id = subscriptions.feedid
    WHERE userid = $1;
    `;
    const res = await query(getSubscriptionsQuery, [userid]);
    return res.rows;
}

async function addUserSubscription(userid, subscription) {
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
    INSERT INTO subscriptions (userid, feedid)
    VALUES ($1, $2);
    `;
    await query(insertFeedQuery, [
        subscription.feedurl,
        subscription.iconurl,
        subscription.title
    ]);
    const res = await query(getFeedIdQuery, [subscription.feedurl]);
    const feedid = res.rows[0].id;
    await query(insertSubscriptionQuery, [userid, feedid]);
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

    //deletes all feeds that aren't subscribed to by any users
    const deleteFeedQuery =
    `
    DELETE FROM feeds
    WHERE NOT EXISTS (
        SELECT * 
        FROM subscriptions
        WHERE feeds.id = subscriptions.feedid
    );
    `;
    // const res = await query(getFeedIdQuery, [subscriptionid]);
    // const feedid = res.rows[0].feedid;
    await query(deleteSubscriptionQuery, [subscriptionid]);
    await query(deleteFeedQuery);
}

async function subscriptionExists(userid, feedurl) {
    const subscriptionExistsQuery = 
    `
    SELECT COUNT(*)
    FROM subscriptions JOIN feeds ON subscriptions.feedid = feeds.id
    WHERE userid = $1 AND feedurl = $2;
    `;
    const res = await query(subscriptionExistsQuery, [userid, feedurl]);
    return parseInt(res.rows[0].count);
}

async function createUser(email, password) {
    const addUserQuery =
    `
    INSERT INTO users (email, password)
    VALUES ($1, $2);
    `
    await query(addUserQuery, [email, password]);
}

async function getUserByEmail(email) {
    const getUserQuery =
    `
    SELECT id, email, password
    FROM users
    WHERE email = $1;
    `;
    const res = await query(getUserQuery, [email]);
    return res.rows[0];
} 

async function getUserById(id) {
    const getUserQuery = 
    `
    SELECT id, email, password
    FROM users
    WHERE id = $1;
    `;   
    const res = await query(getUserQuery, [id]);
    return res.rows[0];
}

async function getFeedId(subscriptionid) {
    const getFeedIdQuery =
    `
    SELECT feedid
    FROM subscriptions
    WHERE subscriptionid = $1;
    `;
    const res = await query(getFeedIdQuery, [subscriptionid]);
    return res.rows[0].feedid;
}

async function getAllSubscribedFeedIds(userid) {
    const getFeedIdsQuery = 
    `
    SELECT feedid
    FROM subscriptions
    WHERE userid = $1;
    `;
    const res = await query(getFeedIdsQuery, [userid]);
    return res.rows.map(row => row.feedid);
}

async function getFeed(id) {
   const getFeedQuery = 
   `
    SELECT id, iconurl, feedurl, title, numposts, etag, TO_CHAR(lastmodified AT TIME ZONE 'GMT', 'Dy, DD Mon YYYY HH24:MI:SS TZ') || 'GMT' as lastmodified
    FROM feeds
    WHERE id = $1;
   `;
    const res = await query(getFeedQuery, [id]);
    return res.rows[0];
}

async function getAllFeeds() {
    const getAllFeedsQuery = 
    `
    SELECT id, iconurl, feedurl, title, numposts, etag, TO_CHAR(lastmodified AT TIME ZONE 'GMT', 'Dy, DD Mon YYYY HH24:MI:SS TZ') || 'GMT' as lastmodified
    FROM feeds;
    `;
    const res = await query(getAllFeedsQuery);
    return res.rows;
}

async function insertPost(params) {
    const insertQuery =
    `
    INSERT INTO posts (feedid, title, url, commentsurl, mediaurl, identifier, date)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (identifier) DO NOTHING;
    `;
    const updateNumPostsQuery = 
    `
    UPDATE feeds
    SET numposts = numposts + 1
    WHERE id = $1;
    `; 
    const res = await query(insertQuery, [
        params.feedid,
        params.title,
        params.url,
        params.commentsurl,
        params.mediaurl,
        params.identifier,
        params.date
    ]);
    if (res.rowCount === 1) {
        await query(updateNumPostsQuery, [params.feedid]);
    }
}

async function updateFeedLastModified(id, lastmodified) {
    const updateQuery = 
    `
    UPDATE feeds
    SET lastmodified = $1
    WHERE id = $2;
    `;
    await query(updateQuery, [lastmodified, id]);
}

async function updatefeedETag(id, etag) {
    const updateQuery = 
    `
    UPDATE feeds
    SET etag = $1
    WHERE id = $2;
    `;
    await query(updateQuery, [etag, id]);
}


async function getPosts(params) {   
    const getPostsQuery = 
    `
    SELECT posts.id, posts.feedid, posts.title, posts.url, posts.commentsurl, posts.mediaurl, posts.identifier, posts.date, feeds.iconurl, feeds.title as feedtitle
    FROM posts JOIN feeds ON posts.feedid = feeds.id
    WHERE posts.feedid = ANY($1::int[]) AND date < $2
    ORDER BY posts.date DESC
    LIMIT $3;
    `;
    const res = await query(getPostsQuery, [
        params.feedIds,
        params.olderThan || 'infinity',
        params.limit
    ]);
    return res.rows;
}

module.exports = { 
    createTables,
    getUserSubscriptions,
    addUserSubscription,
    deleteUserSubscription,
    subscriptionExists,
    createUser,
    getUserByEmail,
    getUserById,
    getFeedId,
    getAllSubscribedFeedIds,
    getFeed,
    getAllFeeds,
    insertPost,
    updateFeedLastModified,
    updatefeedETag,
    getPosts
}