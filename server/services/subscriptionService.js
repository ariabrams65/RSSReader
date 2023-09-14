const db = require('../db/db');
const Parser = require('rss-parser');
const removeTrailingSlash = require('../helpers/commonHelpers');
const { updateFeedsPosts } = require('./postService');
const { UserError, QueryError } = require('../customErrors');
const { readFile } = require('fs/promises');
const xml2js = require('xml2js');
const { Worker } = require('node:worker_threads');

async function saveSubscription(userid, url, folder) {
    if (await db.subscriptionExists(userid, url, folder)) {
        throw new UserError('Cannot add duplicate subscription');
    }
    let feedHeaders;
    try {
        feedHeaders = await getFeedHeaders(url);
    } catch {
        throw new UserError('URL is invalid');
    }
    const subscription = await db.addUserSubscription(userid, feedHeaders, folder);
    const feed = await db.getFeed(subscription.feedid);
    if (feed.numposts === 0) {
        await updateFeedsPosts(feed);
    }
    return subscription;
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

async function importOPML(userid, filePath) {
    const xml = await readFile(filePath, 'utf8');
    const parser = new xml2js.Parser();    
    const opmlObj = await parser.parseStringPromise(xml);
    console.log('done parsing opml');

    const worker = new Worker('./jobs/updateFromOPML', {
        workerData: {
            userid: userid,
            opmlObj: opmlObj
        } 
    });
}

async function getFeedHeaders(feedurl) {
    const parser = new Parser({
        customFields: {
            feed: ['image', 'icon']
        },
        timeout: 5000
    });
    let feed;
    try {
        feed = await parser.parseURL(feedurl);
    } catch (e) {
        console.log(e);
        throw e;
    }
    const headers = {};
    headers.feedurl = feedurl;
    if (feed.image !== undefined) {
        headers.iconurl = feed.image.url[0];
    } else {
        headers.iconurl = feed.icon;
    }
    headers.iconurl = removeTrailingSlash(headers.iconurl);
    headers.title = feed.title;

    return headers;
}

module.exports = { saveSubscription, getSubscriptions, deleteSubscription, renameSubscription, renameFolder, deleteFolder, importOPML };