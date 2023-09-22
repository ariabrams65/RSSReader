const { Worker } = require('bullmq');
const path = require('path');

const connection = {
  host: 'localhost',
  port: 6379
}

const worker = new Worker('import', path.join(__dirname, 'processImport.js'), {connection});

worker.on('failed', (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
});