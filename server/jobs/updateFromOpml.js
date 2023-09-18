const { workerData } = require('node:worker_threads');
const { saveSubscription } = require('../services/subscriptionService');

if (require.main === module) {
    update();
}

async function update() {
    const promises = [];
    for (const [folder, feeds] of Object.entries(workerData.folders)) {
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