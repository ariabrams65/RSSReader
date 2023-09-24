const { Worker } = require('bullmq');
const path = require('path');

const worker = new Worker('updatePosts', path.join(__dirname, '../processors/updatePostsProcessor.js'), {
    connection: {
        host: process.env.REDISHOST,
        port: process.env.REDISPORT
    }
});

worker.on('failed', (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
});

module.exports = worker;