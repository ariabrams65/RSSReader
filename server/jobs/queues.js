const { Queue } = require('bullmq');

const connection = {
  host: 'localhost',
  port: 6379
}

const importQueue = new Queue('import', {connection});

module.exports = { importQueue };