const { saveSubscription } = require('../services/subscriptionService');

async function processImport(job) {
    const promises = [];
    for (const [folder, feeds] of Object.entries(job.data.folders)) {
        for (const feed of feeds) {
            promises.push(saveSubscription(job.data.userid, feed.url, folder));
        }
    }
    const results = await Promise.allSettled(promises);
    console.log('done importing subscriptions');
    const rejected = results
    .filter(result => result.status === 'rejected')
    .map(result => result.reason);
    
    rejected.forEach(result => {
        if (String(result).includes('failed to load')) {
            console.log(result);
        }
    });
    console.log(`${results.length - rejected.length}/${results.length}`);
}

module.exports = processImport;