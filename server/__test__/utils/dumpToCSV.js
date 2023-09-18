require('dotenv').config();
const db = require('../../db/db');
const fs = require('fs');

if (require.main === module) {
    dumpToCSV();
}

async function dumpToCSV() {
    const queries = [
      `COPY users TO '/tmp/users.csv' DELIMITER ',' CSV HEADER;`,
      `COPY subscriptions TO '/tmp/subscriptions.csv' DELIMITER ',' CSV HEADER;`,
      `COPY feeds TO '/tmp/feeds.csv' DELIMITER ',' CSV HEADER;`,
      `COPY posts TO '/tmp/posts.csv' DELIMITER ',' CSV HEADER;`
    ];
    
    for (const query of queries) {
        await db.query(query);
    }
    process.exit();
}
  