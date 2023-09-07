const app = require("../../app");
const request = require('supertest');
const db = require("../../db/db");
const { getLoggedInAgent } = require("./utils/setup");

beforeEach(async () => {
    await db.resetTables();
});

describe('POST /login' , () => {
    test('Logging in is successful', async () => {
        const agent = await getLoggedInAgent();
        
        const res = await agent
            .get('/authenticated');
        expect(res.statusCode).toBe(204);
    });
    test('Logging in with unregistered user returns 401', async () => {
        const agent = request.agent(app);

        const res = await agent        
            .post('/login')
            .send({email: 'test@test', password: 'test'});
        expect(res.statusCode).toBe(401);
        
        const res2 = await agent
            .get('/authenticated');
        expect(res2.statusCode).toBe(401);
    });
    
    test('Logging in with already logged in user returns 403', async () => {
        const agent = await getLoggedInAgent();
        
        const res = await agent
            .post('/login')
            .send({email: 'newUser', password: 'password'});
        expect(res.statusCode).toBe(403); 
    });

    test('Logging in with missing params returns 401', async () => {
        const agent = request.agent(app);

        const res = await agent 
            .post('/login');
        expect(res.statusCode).toBe(401);
        
        const res2 = await agent
            .get('/authenticated');
        expect(res2.statusCode).toBe(401);
    });
});

describe('DELETE /logout' ,() => {
    test('Logging out is successful', async () => {
        const agent = await getLoggedInAgent();

        const res = await agent
            .delete('/logout');
        expect(res.statusCode).toBe(204);
        
        const res2 = await agent
            .get('/authenticated');
        expect(res2.statusCode).toBe(401);
    });

    test('Logging out user who isnt logged in returns 401', async () => {
        const agent = request.agent(app);

        const res = await agent
            .delete('/logout');
        expect(res.statusCode).toBe(401);
    });
});

describe('GET /authenticated' , () => {
    test('Returns 204 for user who is authenticated', async () => {
        const agent = await getLoggedInAgent();
        
        const res = await agent
            .get('/authenticated');
        expect(res.statusCode).toBe(204);
    });

    test('Returns 401 for user who is not authenticated', async () => {
        const agent = request.agent(app);

        const res = await agent
            .get('/authenticated');
        expect(res.statusCode).toBe(401);
    });
});