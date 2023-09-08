const Pool = require('pg').Pool;
const pool = new Pool();

function query(text, params, callback) {
    return pool.query(text, params, callback);
}

module.exports = query;