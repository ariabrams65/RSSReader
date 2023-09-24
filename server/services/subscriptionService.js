const db = require('../db/db');
const { updateFeedsPosts } = require('./feedService');
const { UserError, QueryError } = require('../customErrors');
const { readFile } = require('fs/promises');
const { parseFeed, requestFeed } = require('../services/feedService');
const feedFinder = require('@arn4v/feed-finder');
const parseXml = require('../utils/parseXml');
const importQueue = require('../jobs/queues/importQueue');
const updatePostsQueue = require('../jobs/queues/updatePostsQueue');

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
            if (res.status >= 300 || !res.headers['content-type'].includes('xml')) continue;
            return [feedUrl, res.data];
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
    parsedFeed.updatefreq = 600000;
    feed = await db.addFeed(parsedFeed);
    await updatePostsQueue.add('updatePosts', {feedid: feed.id}, {
        repeat: {
            every: parsedFeed.updatefreq 
        },
        removeOnComplete: true,
        removeOnFail: true,
        jobId: '_' + feed.id.toString()
    });
    await updateFeedsPosts(feed.id, parsedFeed.posts); 
    return feed;
}

async function saveSubscription(userid, url, folder) {  
    const res = await requestFeed(url);
    let feedurl, xml;
    const contentType = res.headers['content-type'];
    if (contentType.includes('text/html')) {
        [feedurl, xml] = await findFeedInHtml(url); 
    } else if (contentType.includes('xml')) {
        feedurl = url;
        xml = res.data;
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
        await deleteUnsubscribedFeeds();
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
        await deleteUnsubscribedFeeds();
    } catch (e) {
        if (e instanceof QueryError) {
            throw new UserError('Invalid folder delete request');
        }
    }
}

async function importOpml(userid, filePath) {
    let folders;
    try {
        const xml = await readFile(filePath, 'utf8');
        const opmlObj = await parseXml(xml);
        folders = getFoldersFromOpml(opmlObj);
    } catch (e) {
        console.log(e);
        throw new UserError('OPML file is invalid');
    }
    console.log('done parsing opml');
    
    const job = await importQueue.add('import opml', {userid: userid, folders: folders});
    return job.id;
}

function getFoldersFromOpml(opmlObj) {
    const folders = {};
    const outlines = opmlObj.opml.body.outline;
    getFoldersR(folders, outlines, '');
    return folders;
}

function getFoldersR(folders, outlines, folder) {
    for (const outline of outlines) {
        if (outline['@_type'] === undefined) {
            getFoldersR(folders, outline.outline, outline['@_text']);
        } else {
            const feed = {
                'url': outline['@_xmlUrl'],
                'name': outline['@_text']
            };
            folders[folder] ? folders[folder].push(feed) : folders[folder] = [feed];
        }
    }
}

async function deleteUnsubscribedFeeds() {
    const feeds = await db.getUnsubscribedFeeds();
    for (const feed of feeds) {
        await updatePostsQueue.removeRepeatable('updatePosts', {
            repeat: {
                every: feed.updatefreq
            },
            jobId: '_' + feed.id.toString()
        });
        await db.deleteFeed(feed.id);
    }
}

module.exports = { saveSubscription, getSubscriptions, deleteSubscription, renameSubscription, renameFolder, deleteFolder, importOpml, getFoldersFromOpml };