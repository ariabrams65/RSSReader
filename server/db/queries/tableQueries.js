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
        feedid INT REFERENCES feeds(id) ON DELETE CASCADE,
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

async function resetTables(tables) {
    const allowedTables = ['users', 'feeds', 'subscriptions', 'posts'];
    let truncate = [];
    if (!tables) {
        truncate = allowedTables;
    } else {
        for (const table of tables) {
            if (allowedTables.includes(table)) {
                truncate.push(table);
            }
        }
    }
    const resetQuery = `TRUNCATE ${truncate.join(', ')};`;
    await query(resetQuery);
}

module.exports = { createTables, resetTables};