require('dotenv').config();
const app = require('../../app');
const request = require('supertest');
const db = require('../../db/db');

const agent = request.agent(app);
beforeAll(async () => {     
    await db.resetTables();
    
    await agent
        .post('/register')
        .send({email: 'test@test', password: 'test'});
    
    await agent
        .post('/login')
        .send({email: 'test@test', password: 'test'});
});

describe('GET /subscriptions', () => {
    test('Response subscriptions are valid', async () => {
        await db.resetTables(['subscriptions', 'feeds', 'posts']);
        await agent
            .post('/subscriptions')
            .send({feed: 'https://www.reddit.com/r/all/.rss', folder: ''});
        const res = await agent 
            .get('/subscriptions')
        expect(res.headers['content-type']).toMatch(/json/);
        const subscriptions = res.body.subscriptions;
        expect(subscriptions).toBeDefined();
        expect(subscriptions[0].id).toBeDefined();
        expect(subscriptions[0].iconurl).toBeDefined();
        expect(subscriptions[0].name).toBeDefined();
        expect(subscriptions[0].folder).toBeDefined();
    });
});

describe('POST /subscriptions', () => {
    test('Valid feed url should respond with 200 status code', async () => {
        await db.resetTables(['subscriptions', 'feeds', 'posts']);
        const res = await agent 
            .post('/subscriptions')
            .send({feed: 'https://www.reddit.com/r/all/.rss', folder: ''});
        expect(res.statusCode).toBe(200);
    });
    
    test('Response content type is json', async () => {
        await db.resetTables(['subscriptions', 'feeds', 'posts']);
        const res = await agent 
            .post('/subscriptions')
            .send({feed: 'https://www.reddit.com/r/all/.rss', folder: ''});
        expect(res.headers['content-type']).toMatch(/json/);
    });
    
    test('Response subscription is valid', async () => {
        await db.resetTables(['subscriptions', 'feeds', 'posts']);
        const res = await agent 
            .post('/subscriptions')
            .send({feed: 'https://www.reddit.com/r/all/.rss', folder: ''});
        const subscription = res.body.subscription;
        expect(subscription).toBeDefined(); 
        expect(subscription.id).toBeDefined(); 
        expect(subscription.userid).toBeDefined(); 
        expect(subscription.feedid).toBeDefined(); 
        expect(subscription.name).toBeDefined(); 
        expect(subscription.folder).toBeDefined(); 
    });

    test('Invalid feed urls should respond with 400 status code', async () => {
        const feeds = ['', 'aaa', 'https://www.reddit.com/'];
        for (const feed of feeds) {
            const res = await agent 
                .post('/subscriptions')
                .send({feed: feed, folder: ''});
            expect(res.statusCode).toBe(400);
        }
    });
    
    test('Empty body should respond with 400 status code', async () => {
        const res = await agent 
            .post('/subscriptions')
        expect(res.statusCode).toBe(400);
    });
});

// describe('DELETE /subscriptions', () => {
    
// });

// describe('PATCH /subscriptions/rename', () => {
    
// });

// describe('PATCH /subscriptions/rename/folder', () => {
    
// });

// describe('DELETE /folder', () => {
    
// });

// describe('POST /opml' () => {
    
// });

