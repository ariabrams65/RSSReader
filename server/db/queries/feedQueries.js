const query = require('../dbConn');

async function getFeedId(subscriptionid) {
    const getFeedIdQuery =
    `
    SELECT feedid
    FROM subscriptions
    WHERE id = $1;
    `;
    const res = await query(getFeedIdQuery, [subscriptionid]);
    return res.rows[0].feedid;
}

async function getAllSubscribedFeedIds(userid) {
    const getFeedIdsQuery = 
    `
    SELECT feedid
    FROM subscriptions
    WHERE userid = $1;
    `;
    const res = await query(getFeedIdsQuery, [userid]);
    return res.rows.map(row => row.feedid);
}

async function getFeed(id) {
   const getFeedQuery = 
   `
    SELECT id, iconurl, feedurl, title, numposts, etag, TO_CHAR(lastmodified AT TIME ZONE 'GMT', 'Dy, DD Mon YYYY HH24:MI:SS TZ') || 'GMT' as lastmodified
    FROM feeds
    WHERE id = $1;
   `;
    const res = await query(getFeedQuery, [id]);
    return res.rows[0];
}

async function getAllFeeds() {
    const getAllFeedsQuery = 
    `
    SELECT id, iconurl, feedurl, title, numposts, etag, TO_CHAR(lastmodified AT TIME ZONE 'GMT', 'Dy, DD Mon YYYY HH24:MI:SS TZ') || 'GMT' as lastmodified
    FROM feeds;
    `;
    const res = await query(getAllFeedsQuery);
    return res.rows;
}

async function getFolderFeedIds(id, folder) {
    const getFeedIdsQuery = 
    `
    SELECT feedid
    FROM subscriptions
    WHERE userid = $1 AND folder = $2;
    `;
    const res = await query(getFeedIdsQuery, [id, folder]);
    return res.rows.map(row => row.feedid);
    
}

async function updateFeedLastModified(id, lastmodified) {
    const updateQuery = 
    `
    UPDATE feeds
    SET lastmodified = $1
    WHERE id = $2;
    `;
    await query(updateQuery, [lastmodified, id]);
}

async function updatefeedETag(id, etag) {
    const updateQuery = 
    `
    UPDATE feeds
    SET etag = $1
    WHERE id = $2;
    `;
    await query(updateQuery, [etag, id]);
}
module.exports = { getFeedId, getAllSubscribedFeedIds, getFeed, getAllFeeds, getFolderFeedIds, updateFeedLastModified, updatefeedETag};