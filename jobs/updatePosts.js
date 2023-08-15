const Client = require('pg').Client;
const client = new Client();
const Parser = require('rss-parser');
const query = require('../db/dbConn');

async function updatePosts() {
    const feeds = await query.getAllFeeds();
    await Promise.all(feeds.map(feed => updateFeedsPosts(feed)));
}

async function updateFeedsPosts(feed) {
    const parserConfig = {
        customFields: {
            item: [
                ['media:thumbnail', 'mediaThumbnail'], 
                ['media:group', 'mediaGroup'],
                ['media:content', 'mediaContent']
            ] 
        }
    };
    if (feed.lastmodified !== null && feed.lastmodified !== undefined) {
        parserConfig.headers = {'If-Modified-Since': feed.lastModified};
    }
    const parser = new Parser(parserConfig);
    const feedData = await parser.parseURL(feed.feedurl);
    const posts = getPosts(feedData, feed.id);
    await Promise.all(posts.map(post => query.insertPost(post)));
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
        post.identifier = createPostIdentifier(item);
        
        posts.push(post);
    });
    return posts;
}

function createPostIdentifier(item) {
    if (item.guid !== undefined) {
        return item.guid;
    }
    if (item.link !== undefined) {
        return item.link;
    }
    if (item.title !== undefined) {
        return item.title;
    }
    return null;
}

//Should I await this???
//When does the worker thread get removed??? 
updatePosts()