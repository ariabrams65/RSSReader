require('dotenv').config();
const { getLoggedInAgent } = require('./utils/setup');
const db = require('../../db/db');

let agent;
beforeAll(async () => {
    agent = await getLoggedInAgent();
});

describe('GET /feed', () => {
    test.todo('Getting posts from all feeds is successful');
    test.todo('Getting posts from folder is successful');
    test.todo('Getting posts from specific feed is successful');
    test.todo('Getting posts older than date is successful');
    test.todo('Getting limited number of posts is successful');
    
    test.todo('Getting posts with invalid params returns 400');  
    test.todo('Getting posts with missing paramas returns 400');
});