const { Worker } = require('bullmq');
const path = require('path');

const worker = new Worker('import', path.join(__dirname, '../processors/importProcessor.js'), {
    connection: {
        host: process.env.REDISHOST,
        port: process.env.REDISPORT
    }
});

worker.on('failed', (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
});

module.exports = worker;