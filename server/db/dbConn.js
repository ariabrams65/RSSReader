const Pool = require('pg').Pool;
let config = {};
if (process.env.NODE_ENV === 'test') {
    config = {
        user: process.env.TEST_PGUSER,
        host: process.env.TEST_PHOST,
        database: process.env.TEST_PGDATABASE,
        password: process.env.TEST_PGPASSWORD,
        port: process.env.TEST_PGPORT
    };
}
pool = new Pool(config);

function query(text, params, callback) {
    return pool.query(text, params, callback);
}

module.exports = query;