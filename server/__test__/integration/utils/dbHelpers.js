const db = require('../../../db/db');

async function addSubscription(agent, feed, folder) {
    const res = await agent
        .post('/subscriptions')
        .send({feed: feed, folder: folder});
    
    return res;
}

async function getNumRows(table) {
    const res = await db.query(`SELECT * FROM ${table};`);
    return res.rowCount;
}

async function seedDatabase() {
    await db.resetTables();
    const queries = [
      `COPY users FROM '/tmp/users.csv' DELIMITER ',' CSV HEADER;`,
      `COPY feeds FROM '/tmp/feeds.csv' DELIMITER ',' CSV HEADER;`,
      `COPY subscriptions FROM '/tmp/subscriptions.csv' DELIMITER ',' CSV HEADER;`,
      `COPY posts FROM '/tmp/posts.csv' DELIMITER ',' CSV HEADER;`
    ];
    for (const query of queries) {
        await db.query(query);
    }     
}

module.exports = { addSubscription, getNumRows, seedDatabase };