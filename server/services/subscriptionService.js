const db = require('../db/db');
const { updateFeedsPosts } = require('./feedService');
const { UserError, QueryError } = require('../customErrors');
const { readFile } = require('fs/promises');
const xml2js = require('xml2js');
const { Worker } = require('node:worker_threads');
const { parseFeed, requestFeed } = require('../services/feedService');

async function saveSubscription(userid, url, folder) {
    if (await db.subscriptionExists(userid, url, folder)) {
        throw new UserError('Cannot add duplicate subscription');
    }
    let feed = await db.getFeedFromUrl(url);
    if (feed === undefined) {
        let parsedFeed;
        try {
            const res = await requestFeed(url);
            parsedFeed = await parseFeed(await res.text(), url);
        } catch (e) {
            throw new UserError(`URL ${url} is invalid`);
        }
        feed = await db.addFeed(parsedFeed);
        await updateFeedsPosts(feed.id, parsedFeed.posts); 
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

module.exports = { saveSubscription, getSubscriptions, deleteSubscription, renameSubscription, renameFolder, deleteFolder, importOPML };