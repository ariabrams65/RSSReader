const query = require('../dbConn');

async function getFeedFromId(id) {
    const getFeedQuery =
    `
    SELECT id, feedurl, lastmodified, etag
    FROM feeds
    where id = $1;
    `;
    const res = await query(getFeedQuery, [id]);
    return res.rows[0];
}

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
    SELECT DISTINCT feedid
    FROM subscriptions
    WHERE userid = $1;
    `;
    const res = await query(getFeedIdsQuery, [userid]);
    return res.rows.map(row => row.feedid);
}

async function addFeed(parsedFeed) {
    const insertFeedQuery = 
    `
    INSERT INTO feeds (feedurl, iconurl, title, updatefreq)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (feedurl) DO NOTHING
    RETURNING id, title;
    `;
    const res = await query(insertFeedQuery, [
        parsedFeed.feedurl,
        parsedFeed.iconurl,
        parsedFeed.title,
        parsedFeed.updatefreq
    ]);
    return res.rows[0];
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

async function getFeedFromUrl(url) {
    const getFeedQuery = 
    `
    SELECT id, title
    FROM feeds
    WHERE feedurl = $1;
    `;
    const res = await query(getFeedQuery, [url]);
    return res.rows[0];
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

async function deleteFeed(id) {
    const deleteQuery =
    `
    DELETE FROM feeds
    WHERE id = $1;
    `;    
    await query(deleteQuery, [id]);
}

module.exports = { getFeedFromId, getFeedId, getAllSubscribedFeedIds, addFeed, getFolderFeedIds, getFeedFromUrl, updateFeedLastModified, updatefeedETag, deleteFeed};