require('dotenv').config();
const Parser = require('rss-parser');
const db = require('../db/db');

async function updatePosts() {
    const feeds = await db.getAllFeeds();
    await Promise.all(feeds.map(feed => updateFeedsPosts(feed)));
}

async function updateFeedsPosts(feed) {
    const headers = {};
    if (feed.lastmodified !== null && feed.lastmodified !== undefined) {
        headers['If-Modified-Since'] = feed.lastmodified;
    }
    if (feed.etag !== null && feed.etag !== undefined) {
        headers['If-None-Match'] = feed.etag;
    }
    const response = await fetch(feed.feedurl, {
        method: 'GET',
        headers: headers
    });
    if (response.status === 304) {
        console.log('Already have latest posts');
        return;
    }
    if (response.headers.has('Last-Modified')) {
        await db.updateFeedLastModified(feed.id, response.headers.get('Last-Modified'));
    }
    if (response.headers.has('ETag')) {
        await db.updatefeedETag(feed.id, response.headers.get('ETag'));
    }
    const xmlText = await response.text();
    const parserConfig = {
        customFields: {
            item: [
                ['media:thumbnail', 'mediaThumbnail'], 
                ['media:group', 'mediaGroup'],
                ['media:content', 'mediaContent']
            ] 
        }
    };
    const parser = new Parser(parserConfig);
    const feedData = await parser.parseString(xmlText);
    const posts = getPosts(feedData, feed.id);
    await Promise.all(posts.map(post => db.insertPost(post)));
    console.log('updated feed: ', feed.title);
}

function getPosts(feedData, feedid) {
    const posts = [];
    feedData.items.forEach(item => {
        const post = {};
        if (item.mediaThumbnail !== undefined) {
            post.mediaurl = item.mediaThumbnail['$'].url;
        } else if (item.mediaGroup !== undefined) {
            post.mediaurl = item.mediaGroup['media:content'][0]['$'].url;
        } else if (item.mediaContent !== undefined) {
            post.mediaurl = item.mediaContent['$'].url;
        }
        post.url = item.link;
        post.title = item.title;
        post.commentsurl = item.comments;
        post.date = item.isoDate;
        post.feedid = feedid;
        post.identifier = createPostIdentifier(item, feedid);
        
        posts.push(post);
    });
    return posts;
}

function createPostIdentifier(item, feedid) {
    const prefix = feedid + '_';

    if (item.guid !== undefined) {
        return prefix + item.guid;
    }
    if (item.link !== undefined) {
        return prefix + item.link;
    }
    if (item.title !== undefined) {
        return prefix + item.title;
    }
    return null;
}

//Should I await this???
//When does the worker thread get removed??? 
if (require.main === module) {
    updatePosts()
}

module.exports = { updateFeedsPosts };