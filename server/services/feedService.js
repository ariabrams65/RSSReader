const db = require('../db/db');
const Parser = require('rss-parser');
const removeTrailingSlash = require('../utils/commonHelpers');
const { UserError } = require('../customErrors');
const axios = require('axios');

async function getPosts(userid, folder, subscriptionid, olderThan, limit) {
    if (folder) {
        feedIds = await db.getFolderFeedIds(userid, folder);
    } else if (subscriptionid) {
        feedIds = [await db.getFeedId(subscriptionid)];
    } else {
        feedIds = await db.getAllSubscribedFeedIds(userid);
    }
    const posts = await db.getPosts({
        feedIds: feedIds,
        olderThan: olderThan,
        limit: limit || 100
    });
    return posts;
}

async function updateFeedsPosts(feedid, posts) {
    await Promise.all(posts.map(post => {
        post.feedid = feedid;
        post.identifier = feedid + '_' + post.identifier;
        db.insertPost(post)
    }));
    // console.log('updated feed: ', feedid);
}

async function requestFeed(url, headers={}) {
    // headers.timeout = 5000;
    try {
        const res = await axios.get(url, headers);
        return res;
    } catch (e) {
        if (!e.response) {
            throw new UserError(`URL ${url} failed to load`);
        }
        return e.response;
    }
}

async function parseFeed(xml, url) {
    const parser = new Parser({
        customFields: {
            feed: ['image', 'icon'],
            item: [
                ['media:thumbnail', 'mediaThumbnail'], 
                ['media:group', 'mediaGroup'],
                ['media:content', 'mediaContent']
            ] 
        }
    });
    let feedData;
    try {
        feedData = await parser.parseString(xml);
    } catch (e) {
        console.log(url);
        console.log(e);
        throw e;
    }
    const parsedFeed = {};
    parsedFeed.feedurl =  url || feedData.feedUrl;
    if (feedData.image !== undefined) {
        parsedFeed.iconurl = feedData.image.url[0];
    } else {
        parsedFeed.iconurl = feedData.icon;
    }
    parsedFeed.iconurl = removeTrailingSlash(parsedFeed.iconurl);
    parsedFeed.title = feedData.title;
    
    parsedFeed.posts = [];
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
        post.identifier = createPostIdentifier(item);
        
        parsedFeed.posts.push(post);
    });
    return parsedFeed;
}

function createPostIdentifier(item) {
    //for some reason guid seems to not be a string when it is empty
    if (item.guid !== undefined && typeof item.guid === 'string') {
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

module.exports = { getPosts, updateFeedsPosts, requestFeed, parseFeed };