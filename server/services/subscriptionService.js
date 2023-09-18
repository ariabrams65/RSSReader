const db = require('../db/db');
const { updateFeedsPosts } = require('./feedService');
const { UserError, QueryError } = require('../customErrors');
const { readFile } = require('fs/promises');
const xml2js = require('xml2js');
const { Worker } = require('node:worker_threads');
const { parseFeed, requestFeed } = require('../services/feedService');
const feedFinder = require('@arn4v/feed-finder');

async function findFeedInHtml(url) {
    let feedUrls
    try {
        feedUrls = await feedFinder(url); 
    } catch {
        throw new UserError(`URL ${url} failed to load`);
    }
    if (feedUrls.length === 0) {
        throw new UserError(`Couldn't find any feeds for ${url}`);
    }
    for (const feedUrl of feedUrls) {
        try {
            const res = await requestFeed(feedUrl);
            if (!res.ok || !res.headers.get('Content-Type').includes('xml')) continue;
            return [feedUrl, await res.text()];
        } catch {}
    }
    throw new UserError(`Couldn't find any valid feeds for ${url}`);
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
    const res = await requestFeed(url);
    let feedurl, xml;
    const contentType = res.headers.get('Content-Type');
    if (contentType.includes('text/html')) {
        [feedurl, xml] = await findFeedInHtml(url); 
    } else if (contentType.includes('xml')) {
        feedurl = url;
        try {
            xml = await res.text();
        } catch (e) {
            throw new UserError(`Couldn't get text content of ${url}`);
        }
    } else {
        throw new UserError(`URL ${url} is not a valid feed`);
    }
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
    
    await runWorker(userid, opmlObj);
}

async function runWorker(userid, opmlObj) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./jobs/updateFromOpml', {
            workerData: {
                userid: userid,
                opmlObj: opmlObj
            } 
        });
        worker.on('error', reject);
        worker.on('exit', code => {
            if (code !== 0) {
                reject();
            } else {
                resolve();
            }
        })
    });
}

module.exports = { saveSubscription, getSubscriptions, deleteSubscription, renameSubscription, renameFolder, deleteFolder, importOpml };