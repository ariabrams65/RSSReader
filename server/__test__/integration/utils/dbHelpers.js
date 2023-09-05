async function addSubscription(agent, feed, folder) {
    const res = await agent
        .post('/subscriptions')
        .send({feed: feed, folder: folder});
    
    return res;
}

module.exports = { addSubscription };