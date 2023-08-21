const query = require('../dbConn');

async function insertPost(params) {
    const insertQuery =
    `
    INSERT INTO posts (feedid, title, url, commentsurl, mediaurl, identifier, date)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (identifier) DO NOTHING;
    `;
    const updateNumPostsQuery = 
    `
    UPDATE feeds
    SET numposts = numposts + 1
    WHERE id = $1;
    `; 
    const res = await query(insertQuery, [
        params.feedid,
        params.title,
        params.url,
        params.commentsurl,
        params.mediaurl,
        params.identifier,
        params.date
    ]);
    if (res.rowCount === 1) {
        await query(updateNumPostsQuery, [params.feedid]);
    }
}

async function getPosts(params) {   
    const getPostsQuery = 
    `
    SELECT posts.id, posts.feedid, posts.title, posts.url, posts.commentsurl, posts.mediaurl, posts.identifier, posts.date, feeds.iconurl, feeds.title as feedtitle
    FROM posts JOIN feeds ON posts.feedid = feeds.id
    WHERE posts.feedid = ANY($1::int[]) AND posts.date < $2
    ORDER BY posts.date DESC
    LIMIT $3;
    `;
    const res = await query(getPostsQuery, [
        params.feedIds,
        params.olderThan || 'infinity',
        params.limit
    ]);
    return res.rows;
}

module.exports = { insertPost, getPosts };