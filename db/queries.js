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
        feedUrl TEXT UNIQUE,
        iconUrl TEXT,
        title TEXT
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        userId INT REFERENCES users(user_id),
        feedId INT REFERENCES feeds(feed_id)
    );

    CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        feedId INT REFERENCES feeds(feed_id),
        title TEXT,
        url TEXT,
        comments_url TEXT,
        mediaUrl TEXT,
        date TIMESTAMPTZ
    );
    `;
    await query(createTablesQuery);
}

async function getUserSubscriptions(userId) {
    const getSubscriptionsQuery = 
    `
    SELECT feed.id AS feedId, feedUrl, iconUrl, title
    FROM feeds JOIN subscriptions ON feeds.id = subscriptions.feedId
    WHERE userId = $1;
    `;
    const res = await query(getSubscriptionsQuery, [userId]);
    return res.rows;
}

async function addUserSubscription(userId, subscription) {
    const insertFeedQuery = 
    `
    INSERT INTO feeds (feedUrl, iconUrl, title)
    VALUES ($1, $2, $3)
    ON CONFLICT (feedUrl) DO NOTHING;
    `;
    const getFeedIdQuery=
    `
    SELECT id
    FROM feeds
    WHERE feedUrl = $1;
    `;
    const insertSubscriptionQuery =
    `
    INSERT INTO subscriptions (userId, feedId)
    VALUES ($1, $2);
    `;
    await query(insertFeedQuery, [
        subscription.feedUrl,
        subscription.iconUrl,
        subscription.title
    ]);
    const res = await query(getFeedIdQuery, [subscription.feedUrl]);
    const feedId = res.rows[0].id;
    await query(insertSubscriptionQuery, [userId, feedId]);
}

async function deleteUserSubscription(userId, subscriptionId) {
    const getFeedIdQuery =
    `
    SELECT feedId
    FROM subscriptions
    WHERE id = $1;
    `;
    const deleteSubscriptionQuery =
    `
    DELETE FROM subscriptions WHERE id = $1;
    `;
    const deleteFeedQuery =
    `
    DELETE FROM feeds
    WHERE NOT EXISTS (
        SELECT feedId
        FROM subscriptions
        WHERE feedId = feeds.id
    );
    `;
    const res = await query(getFeedIdQuery, [subscriptionId]);
    const feedId = res.rows[0].feedId;
    await query(deleteSubscriptionQuery, [subscriptionId]);
    await query(deleteFeedQuery, [feedId]);
}

async function addUser(email, password) {
    const addUserQuery =
    `
    INSERT INTO users (email, password)
    VALUES ($1, $2);
    `
    await query(addUserQuery, [email, password]);
}

async function getUser(email) {
    const getUserQuery =
    `
    SELECT email, password
    FROM users
    WHERE email = $1;
    `;
    const res = await query(getUserQuery, [email]);
    return res[0]
} 

async function getFeedPosts(subscriptionId) {
    
}

async function getAllPosts(userId) {
    
}

module.exports = { 
    createTables,
    getUserSubscriptions,
    addUserSubscription,
    deleteUserSubscription,
    addUser,
    getUser,
    getFeedPosts,
    getAllPosts
}