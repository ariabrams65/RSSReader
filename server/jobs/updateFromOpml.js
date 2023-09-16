const { workerData } = require('node:worker_threads');
const { saveSubscription } = require('../services/subscriptionService');

if (require.main === module) {
    update();
}

async function update() {
    const folders = getFoldersFromOpml(workerData.opmlObj);

    const promises = [];
    for (const [folder, feeds] of Object.entries(folders)) {
        for (const feed of feeds) {
            promises.push(saveSubscription(workerData.userid, feed.url, folder));
        }
    }
    const results = await Promise.allSettled(promises);
    console.log('done importing subscriptions');
    const rejected = results
        .filter(result => result.status === 'rejected')
        .map(result => result.reason);

    rejected.forEach(result => {
        console.log(result);
    });
    console.log(`${results.length - rejected.length}/${results.length}`);
}

function getFoldersFromOpml(opmlObj) {
    const folders = {};
    const outlines = opmlObj.opml.body[0].outline;
    getFoldersR(folders, outlines, '');
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

module.exports = { getFoldersFromOpml };