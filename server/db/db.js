const feedQueries = require('./queries/feedQueries');
const postQueries = require('./queries/postQueries');
const subscriptionQueries = require('./queries/subscriptionQueries');
const tableQueries = require('./queries/tableQueries');
const userQueries = require('./queries/userQueries');
const query = require('./dbConn');

module.exports = {
    ...feedQueries,
    ...postQueries,
    ...subscriptionQueries,
    ...tableQueries,
    ...userQueries,
    query
}