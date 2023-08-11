const query = require('./dbConn');

const createTablesText = `
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    email TEXT,
    password TEXT
);

CREATE TABLE IF NOT EXISTS feeds (
    feed_id SERIAL PRIMARY KEY,
    feed_url TEXT,
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

function createTables() { 
    query(createTablesText);
}

module.exports = createTables;