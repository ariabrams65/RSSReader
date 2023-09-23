const { Queue } = require('bullmq');


const updatePostsQueue = new Queue('updatePosts', {
    connection: {
        host: process.env.REDISHOST,
        port: process.env.REDISPORT
    }
});

module.exports = updatePostsQueue;