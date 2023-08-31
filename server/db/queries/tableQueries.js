const query = require('../dbConn');

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
        feedid INT REFERENCES feeds(id),
        name TEXT,
        folder TEXT
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

module.exports = { createTables };