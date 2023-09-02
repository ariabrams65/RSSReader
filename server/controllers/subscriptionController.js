const Parser = require('rss-parser');
const removeTrailingSlash = require('../helpers/commonHelpers');
const subscriptionQueries = require('../db/queries/subscriptionQueries');
const feedQueries = require('../db/queries/feedQueries');
const { updateFeedsPosts } = require('../jobs/updatePosts');
const { readFile } = require('fs/promises');
const xml2js = require('xml2js');

async function getSubscriptions(req, res, next) {
    try {
        res.json({subscriptions: await subscriptionQueries.getUserSubscriptions(req.user.id)});
    } catch(e) {
        next(e);
    }
}

async function addSubscription(req, res, next) {
    try {
        const folder = req.body.folder || 'feeds';
        if (await subscriptionQueries.subscriptionExists(req.user.id, req.body.feed, folder)) {
            return res.status(400).json({
                message: 'Cannot add duplucate subscriptions'
            });
        }
        let feedHeaders;
        try {
            feedHeaders = await getFeedHeaders(req.body.feed);
        } catch {
            return res.status(400).json({
                message: 'URL is invalid'
            });
        }
        const subscription = await subscriptionQueries.addUserSubscription(req.user.id, feedHeaders, folder);
        const feed = await feedQueries.getFeed(subscription.feedid);
        if (feed.numposts === 0) {
            await updateFeedsPosts(feed);
        }
        res.status(200).json({subscription: subscription});
    } catch(e) {
        next(e);
    }
}

async function deleteSubscription(req, res, next) {
    try {
        await subscriptionQueries.deleteUserSubscription(req.query.subscriptionid);
        res.sendStatus(200);
    } catch(e) {
        console.log(e);
        next(e);
    }
}

async function renameSubscription(req, res, next) {
    try {
        await subscriptionQueries.renameSubscription(req.body.subscriptionid, req.body.newName);
        res.sendStatus(204);
    } catch(e) {
        next(e);
    }
}

async function renameFolder(req, res, next) {
    try {
        await subscriptionQueries.renameFolder(req.user.id, req.body.oldName, req.body.newName);
        res.sendStatus(204);
    } catch(e) {
        next(e);
    }
}

async function deleteFolder(req, res, next) {
    try {
        await subscriptionQueries.deleteFolder(req.user.id, req.query.folder);
        res.sendStatus(204);
    } catch(e) {
        console.log(e);
        next(e);
    }
}

async function importOPML(req, res, next) {
    try {
        const xml = await readFile(req.file.path, 'utf8');
        const parser = new xml2js.Parser();    
        const xmlObj = await parser.parseStringPromise(xml);
        const folders = getFoldersFromOPML(xmlObj);

        for (const [folder, feeds] of Object.entries(folders)) {
            
        }
        
        res.sendStatus(204);
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
        }
    });
    const feed = await parser.parseURL(feedurl);
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