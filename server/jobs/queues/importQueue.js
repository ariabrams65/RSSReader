const { Queue } = require('bullmq');

const importQueue = new Queue('import', {
    connection: {
        host: process.env.REDISHOST,
        port: process.env.REDISPORT
    }
});

module.exports = importQueue;