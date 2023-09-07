const Parser = require('rss-parser');
const removeTrailingSlash = require('../helpers/commonHelpers');
const db = require('../db/db');
const { updateFeedsPosts } = require('../jobs/updatePosts');
const { readFile } = require('fs/promises');
const xml2js = require('xml2js');
const { ServerError, QueryError} = require('../customErrors');

async function getSubscriptions(req, res, next) {
    try {
        const subscriptions = await db.getUserSubscriptions(req.user.id);
        res.status(200).json({subscriptions: subscriptions});
    } catch(e) {
        next(e);
    }
}

async function addSubscription(req, res, next) {
    try {
        if (!req.body.feed) {
            throw new ServerError('Missing parameters', 400);
        }
        const subscription = await saveSubscription(req.user.id, req.body.feed, req.body.folder || 'feeds');
        res.status(201).json({subscription: subscription});
    } catch (e) {
        console.log(e);
        next(e);
    }
}

async function saveSubscription(userid, url, folder) {
    if (await db.subscriptionExists(userid, url, folder)) {
        throw new ServerError('Cannot add duplicate subscription', 400);
    }
    let feedHeaders;
    try {
        feedHeaders = await getFeedHeaders(url);
    } catch {
        throw new ServerError('URL is invalid', 400);
    }
    const subscription = await db.addUserSubscription(userid, feedHeaders, folder);
    const feed = await db.getFeed(subscription.feedid);
    if (feed.numposts === 0) {
        await updateFeedsPosts(feed);
    }
    return subscription;
}

async function deleteSubscription(req, res, next) {
    try {
        if (!req.query.subscriptionid) {
            throw new ServerError('Missing parameters', 400);
        }
        await db.deleteUserSubscription(req.user.id, req.query.subscriptionid);
        res.sendStatus(204);
    } catch(e) {
        console.log(e);
        if (e instanceof QueryError) {
            next(new ServerError('Invalid deletion request', 400))
        }
        next(e);
    }
}

async function renameSubscription(req, res, next) {
    try {
        if (!req.body.subscriptionid || !req.body.newName) {
            throw new ServerError('Missing parameters', 400);
        }
        await db.renameSubscription(req.user.id, req.body.subscriptionid, req.body.newName);
        res.sendStatus(204);
    } catch(e) {
        console.log(e);
        if (e instanceof QueryError) {
            next(new ServerError('Invalid subscription rename request', 400));
        }
        next(e);
    }
}

async function renameFolder(req, res, next) {
    try {
        if (!req.body.oldName || !req.body.newName) {
            throw new ServerError('Missing parameters', 400);
        }
        await db.renameFolder(req.user.id, req.body.oldName, req.body.newName);
        res.sendStatus(204);
    } catch(e) {
        console.log(e);
        if (e instanceof QueryError) {
            next(new ServerError('Invalid folder rename request', 400));
        }
        next(e);
    }
}

async function deleteFolder(req, res, next) {
    try {
        if (!req.query.folder) {
            throw new ServerError('Missing parameters', 400);
        }
        await db.deleteFolder(req.user.id, req.query.folder);
        res.sendStatus(204);
    } catch(e) {
        console.log(e);
        if (e instanceof QueryError) {
            next(new ServerError('Invalid folder delete request', 400));
        }
        next(e);
    }
}

async function importOPML(req, res, next) {
    try {
        const xml = await readFile(req.file.path, 'utf8');
        const parser = new xml2js.Parser();    
        const xmlObj = await parser.parseStringPromise(xml);
        const folders = getFoldersFromOPML(xmlObj);

        const promises = [];
        for (const [folder, feeds] of Object.entries(folders)) {
            for (const feed of feeds) {
                promises.push(saveSubscription(req.user.id, feed.url, folder));
            }
        }
        const results = await Promise.allSettled(promises);
        const rejected = results
            .filter(result => result.status === 'rejected')
            .map(result => result.reason);
        res.status(201).json({rejected: rejected});
    } catch (e) {
        next(e);
    }
}

function getFoldersFromOPML(xml) {
    const folders = {};
    const outlines = xml.opml.body[0].outline;
    getFoldersR(folders, outlines, 'feeds');
    return folders;
}

function getFoldersR(folders, outlines, folder) {
    for (const outline of outlines) {
        const attrs = outline['$'];
        if (attrs.type === undefined) {
            getFoldersR(folders, outline.outline, attrs.text);
        } else {
            const feed = {
                'url': attrs.xmlUrl,
                'name': attrs.text
            };
            folders[folder] ? folders[folder].push(feed) : folders[folder] = [feed];
        }
    }
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

module.exports = { getSubscriptions, addSubscription, deleteSubscription, renameSubscription , renameFolder, deleteFolder, importOPML};