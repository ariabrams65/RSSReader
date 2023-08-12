const query = require('./dbConn');

async function createTables() { 
    const createTablesQuery = 
    `
    CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT
    );

    CREATE TABLE IF NOT EXISTS feeds (
        feed_id SERIAL PRIMARY KEY,
        feed_url TEXT UNIQUE,
        icon_url TEXT,
        title TEXT
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
        subscription_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(user_id),
        feed_id INT REFERENCES feeds(feed_id)
    );

    CREATE TABLE IF NOT EXISTS posts (
        post_id SERIAL PRIMARY KEY,
        feed_id INT REFERENCES feeds(feed_id),
        title TEXT,
        url TEXT,
        comments_url TEXT,
        media_url TEXT,
        date TIMESTAMPTZ
    );
    `;
    await query(createTablesQuery);
}

async function getUserSubscriptions(userId) {
    const getSubscriptionsQuery = 
    `
    SELECT feed_id, feed_url, icon_url, title
    FROM feeds JOIN subscriptions ON feeds.feed_id = subscriptions.feed_id
    WHERE user_id = $1;
    `;
    try {
        return await query(getSubscriptionsQuery, [userId]);
    } catch (e) {
        console.log(e);
    }
}

async function addUserSubscription(userId, subscription) {
    const insertFeedQuery = 
    `
    INSERT INTO feeds (feed_url, icon_url, title)
    VALUES ($1, $2, $3)
    ON CONFLICT (feed_url) DO NOTHING;
    `;
    const getFeedIdQuery=
    `
    SELECT feed_id
    FROM feeds
    WHERE feed_url = $1;
    `;
    const insertSubscriptionQuery =
    `
    INSERT INTO subscriptions (user_id, feed_id)
    VALUES ($1, $2);
    `;
    try {
        await query(insertFeedQuery, [
            subscription.feedUrl,
            subscription.iconUrl,
            subscription.title
        ]);
        const res = await query(getFeedIdQuery, [subscription.feedUrl]);
        const feedId = res[0].feed_id;
        await query(insertSubscriptionQuery, [userId, feedId]);
    } catch (e) {
        console.log(e);
    }
}

async function deleteUserSubscription(userId, subscriptionId) {
    const getFeedIdQuery =
    `
    SELECT feed_id
    FROM subscriptions
    WHERE subscription_id = $1;
    `;
    const deleteSubscriptionQuery =
    `
    DELETE FROM subscriptions WHERE subscription_id = $1;
    `;
    const deleteFeedQuery =
    `
    DELETE FROM feeds
    WHERE NOT EXISTS (
        SELECT feed_id
        FROM subscriptions
        WHERE feed_id = feeds.feed_id
    );
    `;
    try {
        const res = await query(getFeedIdQuery, [subscriptionId]);
        const feedId = res[0].feed_id;
        await query(deleteSubscriptionQuery, [subscriptionId]);
        await query(deleteFeedQuery, [feedId]);
    } catch (e) {
        console.log(e);
    }
}

async function addUser(email, password) {
    const addUserQuery =
    `
    INSERT INTO users (email, password)
    VALUES ($1, $2);
    `
    try {
        await query(addUserQuery, [email, password]);
    } catch (e) {
        console.log(e);
    }
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
    getFeedPosts,
    getAllPosts
}