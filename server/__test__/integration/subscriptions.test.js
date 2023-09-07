const { getLoggedInAgent } = require('./utils/setup');
const db = require('../../db/db');
const { addSubscription, getNumRows } = require('./utils/dbHelpers');

let agent;
let serverAddress;
beforeAll(async () => {     
    await db.resetTables();
    agent = await getLoggedInAgent();
    serverAddress = agent.get('').url;
});

beforeEach(async () => {
    await db.resetTables(['subscriptions', 'feeds', 'posts']);
});

describe('GET /subscriptions', () => {
    test('Response subscriptions are valid', async () => {
        await addSubscription(agent, serverAddress + '/redditAll.xml', '');

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

        const res = await addSubscription(agent, serverAddress + '/redditAll.xml', '');
        expect(res.statusCode).toBe(201);
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
        expect(await getNumRows('posts')).toEqual(25);
    });

    test('Invalid feed urls should respond with 400 status code', async () => {
        const feeds = ['', 'aaa', 'https://www.reddit.com/'];
        for (const feed of feeds) {
            const res = await addSubscription(agent, feed, '');
            expect(res.statusCode).toBe(400);
        }
        expect(await getNumRows('subscriptions')).toEqual(0);
        expect(await getNumRows('feeds')).toEqual(0);
        expect(await getNumRows('posts')).toEqual(0);
    });
    
    test('Empty body should respond with 400 status code', async () => {
        const res = await agent 
            .post('/subscriptions')
        expect(res.statusCode).toBe(400);

        expect(await getNumRows('subscriptions')).toEqual(0);
        expect(await getNumRows('feeds')).toEqual(0);
        expect(await getNumRows('posts')).toEqual(0);
    });
    
    test('Duplicate subscription should respond with 400', async () => {
        await addSubscription(agent, serverAddress + '/redditAll.xml', '');
        expect(await getNumRows('subscriptions')).toEqual(1);
        expect(await getNumRows('feeds')).toEqual(1);
        expect(await getNumRows('posts')).toEqual(25);
        const res = await addSubscription(agent, serverAddress + '/redditAll.xml', '');
        expect(res.statusCode).toBe(400);
        expect(await getNumRows('subscriptions')).toEqual(1);
        expect(await getNumRows('feeds')).toEqual(1);
        expect(await getNumRows('posts')).toEqual(25);
    });
});

describe('DELETE /subscriptions', () => {
    test('Subscription deletion is successful', async () => {
        const res = await addSubscription(agent, serverAddress + '/redditAll.xml', '');
        expect(await getNumRows('subscriptions')).toEqual(1);
        expect(await getNumRows('feeds')).toEqual(1);
        expect(await getNumRows('posts')).toEqual(25);

        const id = res.body.subscription.id;
        const res2 = await agent
            .delete('/subscriptions')    
            .query({subscriptionid: id});
        expect(res2.statusCode).toBe(204);
        expect(await getNumRows('subscriptions')).toEqual(0);
        expect(await getNumRows('feeds')).toEqual(0);
        expect(await getNumRows('posts')).toEqual(0);
        
    });
    
    test('Invalid subscription returns 400', async () => {
        const res = await agent
            .delete('/subscriptions')
            .query({subscriptionid: -1});
        expect(res.statusCode).toBe(400);
    });

    test('Missing query params returns 400', async () => {
        const res = await agent
            .delete('/subscriptions');
        expect(res.statusCode).toBe(400);
    }); 
});

describe('PATCH /subscriptions/rename', () => {
    test('Renaming subscription is successful', async () => {
        const subRes = await addSubscription(agent, serverAddress + '/redditAll.xml', '');
        const id = subRes.body.subscription.id;
        const res = await agent
            .patch('/subscriptions/rename')
            .send({subscriptionid: id, newName: 'new name'});
        expect(res.statusCode).toBe(204);
        
        const query = await db.query(`SELECT * FROM subscriptions WHERE id = ${id}`);
        const subscription = query.rows[0];
        expect(subscription.name).toBe('new name');
    });
    
    test('Renaming non existant subscription returns 400', async () => {
        const res = await agent
            .patch('/subscriptions/rename')
            .send({subscriptionid: -1, newName: 'new name'});
        expect(res.statusCode).toBe(400);
    })
    
    test('Missing query params returns 400', async () => {
        const res = await agent
            .patch('/subscriptions/rename')
        expect(res.statusCode).toBe(400);
    });
});

describe('PATCH /subscriptions/rename/folder', () => {
    test('Renaming folder is successful', async () => {
        const res = await addSubscription(agent, serverAddress + '/redditAll.xml', 'old');
        const id = res.body.subscription.id;
        const res2 = await agent
            .patch('/subscriptions/rename/folder')
            .send({oldName: 'old', newName: 'new'});
        expect(res2.statusCode).toBe(204);

        const query = await db.query(`SELECT * FROM subscriptions WHERE id = ${id}`);
        const subscription = query.rows[0];
        expect(subscription.folder).toBe('new');
    }); 
    
    test('Renaming non existant folder returns 400', async () => {
        const res = await agent
            .patch('/subscriptions/rename/folder')
            .send({oldName: 'old', newName: 'new'});
        expect(res.statusCode).toBe(400);
    });
    
    test('Missing query params returns 400', async () => {
        const res = await agent
            .patch('/subscriptions/rename/folder')
        expect(res.statusCode).toBe(400);
        
    });
});

describe('DELETE /folder', () => {
    test('Deleting folder is successful', async () => {
        await addSubscription(agent, serverAddress + '/redditAll.xml', 'test');
        await addSubscription(agent, serverAddress + '/hackerNews.xml', 'test');
        const pre = await db.query('SELECT * FROM subscriptions WHERE folder = \'test\'');
        expect(pre.rowCount).toBe(2);
        const res = await agent
            .delete('/subscriptions/folder') 
            .query({folder: 'test'});
        expect(res.statusCode).toBe(204);

        const post = await db.query('SELECT * FROM subscriptions WHERE folder = \'test\'');
        expect(post.rowCount).toBe(0);
    });  
    
    test('Deleting non existant folder returns 400', async () => {
        const res = await agent
            .delete('/subscriptions/folder') 
            .query({folder: 'test'});
        expect(res.statusCode).toBe(400);
    });
    
    test('Missing query params returns 400', async () => {
        const res = await agent
            .delete('/subscriptions/folder') 
        expect(res.statusCode).toBe(400);
    });
});

describe('POST /opml', () => {    
    test('Uploading opml file is successful', async () => {
        expect(await getNumRows('subscriptions')).toBe(0);
        const res = await agent
            .post('/subscriptions/opml')
            .attach("opml", `${__dirname}/test.opml`);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('rejected');
        
        expect(await getNumRows('subscriptions')).toBe(4);
        expect(await getNumRows('feeds')).toBe(4);
    }, 10000);
    
    test.todo('Uploading invalid opml file returns error');
});