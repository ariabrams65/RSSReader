const app = require('../../../app');
const request = require('supertest');

async function getLoggedInAgent(num=0) {
    const agent = request.agent(app);

    await agent
        .post('/register')
        .send({email: 'test@test' + num, password: 'test'});
    
    await agent
        .post('/login')
        .send({email: 'test@test' + num, password: 'test'});
    
    return agent;
}

module.exports = { getLoggedInAgent };