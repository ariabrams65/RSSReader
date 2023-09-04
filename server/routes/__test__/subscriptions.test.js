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

beforeEach(async () => {
    await db.resetTables(['subscriptions', 'feeds', 'posts']);
});

async function addSubscription(feed, folder) {
    const res = await agent
        .post('/subscriptions')
        .send({feed: feed, folder: folder});
    
    return res;
}

async function getNumRows(table) {
    const res = await db.query(`SELECT * FROM ${table};`);
    return res.rowCount;
}

describe('GET /subscriptions', () => {
    test('Response subscriptions are valid', async () => {
        await addSubscription('https://www.reddit.com/r/all/.rss', '');

        const res = await agent 
            .get('/subscriptions')
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toMatch(/json/);
        const subscriptions = res.body.subscriptions;
        expect(subscriptions).toBeDefined();
        expect(subscriptions[0]).toHaveProperty('id');
        expect(subscriptions[0]).toHaveProperty('iconurl');
        expect(subscriptions[0]).toHaveProperty('name');
        expect(subscriptions[0]).toHaveProperty('folder');
    });
});

describe('POST /subscriptions', () => {
    test('Subscription should be added', async () => {
        expect(await getNumRows('subscriptions')).toEqual(0);

        const res = await addSubscription('https://www.reddit.com/r/all/.rss', '');
        expect(res.statusCode).toBe(200);
        expect(res.headers['content-type']).toMatch(/json/);
        const subscription = res.body.subscription;
        expect(subscription).toBeDefined(); 
        expect(subscription).toHaveProperty('id'); 
        expect(subscription).toHaveProperty('userid'); 
        expect(subscription).toHaveProperty('feedid'); 
        expect(subscription).toHaveProperty('name'); 
        expect(subscription).toHaveProperty('folder'); 
        
        expect(await getNumRows('subscriptions')).toEqual(1);
        expect(await getNumRows('feeds')).toEqual(1);
    });

    test('Invalid feed urls should respond with 400 status code', async () => {
        const feeds = ['', 'aaa', 'https://www.reddit.com/'];
        for (const feed of feeds) {
            const res = await addSubscription(feed, '');
            expect(res.statusCode).toBe(400);
        }
        expect(await getNumRows('subscriptions')).toEqual(0);
        expect(await getNumRows('feeds')).toEqual(0);
    });
    
    test('Empty body should respond with 400 status code', async () => {
        const res = await agent 
            .post('/subscriptions')
        expect(res.statusCode).toBe(400);

        expect(await getNumRows('subscriptions')).toEqual(0);
        expect(await getNumRows('feeds')).toEqual(0);
    });
    
    test('Duplicate subscription should respond with 400', async () => {
        await addSubscription('https://www.reddit.com/r/all/.rss', '');
        expect(await getNumRows('subscriptions')).toEqual(1);
        const res = await addSubscription('https://www.reddit.com/r/all/.rss', '');
        expect(res.statusCode).toBe(400);
        expect(await getNumRows('subscriptions')).toEqual(1);
    });
});

describe('DELETE /subscriptions', () => {
    test('Subscription deletion is successful', async () => {
        const subRes = await addSubscription('https://www.reddit.com/r/all/.rss', '');
        expect(await getNumRows('subscriptions')).toEqual(1);

        const id = subRes.body.subscription.id;
        const res = await agent
            .delete('/subscriptions')    
            .query({subscriptionid: id});
        expect(res.statusCode).toBe(200);
        
        
        expect(await getNumRows('subscriptions')).toEqual(0);
        
    });
    
    test('Invalid subscription returns 400', async () => {
        const res = await agent
            .delete('/subscriptions')
            .query({subscriptionid: 1});
        expect(res.statusCode).toBe(400);
    });

    test('Missing query params returns 400', async () => {
        const res = await agent
            .delete('/subscriptions');
        expect(res.statusCode).toBe(400);
    }); 
});

// describe('PATCH /subscriptions/rename', () => {
    
// });

// describe('PATCH /subscriptions/rename/folder', () => {
    
// });

// describe('DELETE /folder', () => {
    
// });

// describe('POST /opml' () => {
    
// });

