const { Worker } = require('bullmq');
const path = require('path');

const worker = new Worker('updatePosts', path.join(__dirname, '../processors/updatePostsProcessor.js'), {
    connection: {
        host: process.env.REDISHOST,
        port: process.env.REDISPORT
    },
    concurrency: 20 
});

worker.on('failed', (job, err) => {
  console.log(`${job.data.feedid} has failed with ${err.message}`);
});

module.exports = worker;