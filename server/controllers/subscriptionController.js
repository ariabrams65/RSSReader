const { UserError } = require('../customErrors');
const subscriptionService = require('../services/subscriptionService');

async function getSubscriptions(req, res, next) {
    try {
        const subscriptions = await subscriptionService.getSubscriptions(req.user.id);
        res.status(200).json({subscriptions: subscriptions});
    } catch(e) {
        next(e);
    }
}

async function addSubscription(req, res, next) {
    try {
        if (!req.body.feed) {
            throw new UserError('Missing parameters');
        }
        const subscription = await subscriptionService.saveSubscription(req.user.id, req.body.feed, req.body.folder);
        res.status(201).json({subscription: subscription});
    } catch (e) {
        console.log(e);
        next(e);
    }
}

async function deleteSubscription(req, res, next) {
    try {
        if (!req.query.subscriptionid) {
            throw new UserError('Missing parameters');
        }
        await subscriptionService.deleteSubscription(req.user.id, req.query.subscriptionid);
        res.sendStatus(204);
    } catch(e) {
        console.log(e);
        next(e);
    }
}

async function renameSubscription(req, res, next) {
    try {
        if (!req.body.subscriptionid || !req.body.newName) {
            throw new UserError('Missing parameters');
        }
        await subscriptionService.renameSubscription(req.user.id, req.body.subscriptionid, req.body.newName);
        res.sendStatus(204);
    } catch(e) {
        console.log(e);
        next(e);
    }
}

async function renameFolder(req, res, next) {
    try {
        if (!req.body.oldName || !req.body.newName) {
            throw new UserError('Missing parameters');
        }
        await subscriptionService.renameFolder(req.user.id, req.body.oldName, req.body.newName);
        res.sendStatus(204);
    } catch(e) {
        console.log(e);
        next(e);
    }
}

async function deleteFolder(req, res, next) {
    try {
        if (!req.query.folder) {
            throw new UserError('Missing parameters');
        }
        await subscriptionService.deleteFolder(req.user.id, req.query.folder);
        res.sendStatus(204);
    } catch(e) {
        console.log(e);
        next(e);
    }
}

async function importOpml(req, res, next) {
    try {
        subscriptionService.importOpml(req.user.id, req.file.path);
        res.sendStatus(202);
    } catch (e) {
        next(e);
    }
}

module.exports = { getSubscriptions, addSubscription, deleteSubscription, renameSubscription , renameFolder, deleteFolder, importOpml};