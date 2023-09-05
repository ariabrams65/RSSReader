const app = require('../../../app');
const request = require('supertest');
const db = require('../../../db/db');


async function getLoggedInAgent() {
    const agent = request.agent(app);
    await db.resetTables();
    
    await agent
        .post('/register')
        .send({email: 'test@test', password: 'test'});
    
    await agent
        .post('/login')
        .send({email: 'test@test', password: 'test'});
    
    return agent;
}

module.exports = { getLoggedInAgent };