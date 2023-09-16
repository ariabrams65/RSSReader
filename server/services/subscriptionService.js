const db = require('../db/db');
const { updateFeedsPosts } = require('./feedService');
const { UserError, QueryError } = require('../customErrors');
const { readFile } = require('fs/promises');
const xml2js = require('xml2js');
const { Worker } = require('node:worker_threads');
const { parseFeed, requestFeed } = require('../services/feedService');
const  feedFinder = require('@arn4v/feed-finder');

//If contentType is html we need check if a feed url is linked in the html
async function getFeedUrlAndXml(contentType, url, text) {
    if (contentType.includes('xml')) {
        return {feedurl: url, xml: text};
    } else if (contentType.includes('text/html')) {
        let feedUrls
        try {
            feedUrls = await feedFinder(url); //Should  try catch prob
        } catch {
            throw new UserError(`URL ${url} faild to load`);
        }
        if (feedUrls.length === 0) {
            throw new UserError(`Couldn't find any feeds for ${url}`);
        }
        for (const feedUrl of feedUrls) {
            try {
                const res = await requestFeed(feedUrl);
                if (!res.ok || !res.headers.get('Content-Type').includes('xml')) continue;
                return {feedurl: feedUrl, xml: await res.text()};
            } catch {}
        }
        throw new UserError(`Couldn't find any valid feeds for ${url}`);
    } else {
        throw new UserError(`URL ${url} is not a valid feed`);
    }
}

async function parseAndAddFeed(xml, feedurl) {
    let parsedFeed;
    try {
        parsedFeed = await parseFeed(xml, feedurl);
    } catch (e) {
        throw new UserError(`Error parsing feed ${feedurl}`);
    }
    feed = await db.addFeed(parsedFeed);
    await updateFeedsPosts(feed.id, parsedFeed.posts); 
    return feed;
}

async function saveSubscription(userid, url, folder) {  
    let res;
    try {
        res = await requestFeed(url);
    } catch (e) {
        throw new UserError(`URL ${url} failed to load`);
    }
    if (res.status === 429) {
        //Do something to handle rate limiting
        throw new UserError(`${url} responded with ${res.status}`);
    }
    const contentType = res.headers.get('Content-Type');
    let text;
    try {
        text = await res.text();
    } catch (e) {
        throw new UserError(`Couldn't get text content of ${url}`);
    }
    const { feedurl, xml } = await getFeedUrlAndXml(contentType, url, text);
    if (await db.subscriptionExists(userid, feedurl, folder)) {
        throw new UserError('Cannot add duplicate subscription');
    }
    let feed = await db.getFeedFromUrl(feedurl);
    if (feed === undefined) {
        feed = await parseAndAddFeed(xml, feedurl);
    }
    return await db.addUserSubscription(userid, feed.id, feed.title, folder);
}

async function getSubscriptions(userid) {
    return await db.getUserSubscriptions(userid);
}

async function deleteSubscription(userid, subscriptionid) {
    try {
        await db.deleteUserSubscription(userid, subscriptionid);
    } catch (e) {
        if (e instanceof QueryError) {
            throw new UserError('Invalid deletion request');
        }
    }
}

async function renameSubscription(userid, subscriptionid, newName) {
    try {
        await db.renameSubscription(userid, subscriptionid, newName);
    } catch (e) {
        if (e instanceof QueryError) {
            throw new UserError('Invalid subscription rename request');
        }
    }
}

async function renameFolder(userid, oldName, newName) {
    try {
        await db.renameFolder(userid, oldName, newName);
    } catch (e) {
        if (e instanceof QueryError) {
            throw new UserError('Invalid folder rename request');
        }
    }
}

async function deleteFolder(userid, folder) {
    try {
        await db.deleteFolder(userid, folder);
    } catch (e) {
        if (e instanceof QueryError) {
            throw new UserError('Invalid folder delete request');
        }
    }
}

async function importOpml(userid, filePath) {
    const xml = await readFile(filePath, 'utf8');
    const parser = new xml2js.Parser();    
    const opmlObj = await parser.parseStringPromise(xml);
    console.log('done parsing opml');

    const worker = new Worker('./jobs/updateFromOpml', {
        workerData: {
            userid: userid,
            opmlObj: opmlObj
        } 
    });
}

module.exports = { saveSubscription, getSubscriptions, deleteSubscription, renameSubscription, renameFolder, deleteFolder, importOpml };