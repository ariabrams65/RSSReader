const { getLoggedInAgent } = require('../../utils/setup');
const db = require('../../../db/db');
const { addSubscription, getNumRows } = require('../../utils/dbHelpers');
const updatePostsQueue = require('../../../jobs/queues/updatePostsQueue'); 

let agent;
let serverAddress;
beforeAll(async () => {     
    db.createTables();
    await db.resetTables();
    agent = await getLoggedInAgent();
    serverAddress = agent.get('').url;
});

beforeEach(async () => {
    await db.resetTables(['subscriptions', 'feeds', 'posts']);
    
    const repeatableJobs = await updatePostsQueue.getRepeatableJobs();
    repeatableJobs.forEach(async job => {
        await updatePostsQueue.removeRepeatableByKey(job.key);
    });
    updatePostsQueue.drain();
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
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(0);

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
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(1);
    });
    
    test('Subscribing to HTML url finds finds linked feed in HTML header and subscribes to it', async () => {
        const res = await addSubscription(agent, 'https://www.macsparky.com/blog/2020/08/blogging-from-space/?format=rss', '');
        expect(res.statusCode).toBe(201);

        expect(await getNumRows('subscriptions')).toEqual(1);
        expect(await getNumRows('feeds')).toEqual(1);
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(1);
    }, 10000);

    test('Subscribing to HTML url finds finds linked feed in HTML body and subscribes to it', async () => {
        const res = await addSubscription(agent, 'https://www.recode.net/feed/', '');
        expect(res.statusCode).toBe(201);

        expect(await getNumRows('subscriptions')).toEqual(1);
        expect(await getNumRows('feeds')).toEqual(1);
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(1);
    }, 10000);

    test('Invalid feed urls should respond with 400 status code', async () => {
        const feeds = ['', 'aaa', 'https://www.reddit.com/'];
        for (const feed of feeds) {
            const res = await addSubscription(agent, feed, '');
            expect(res.statusCode).toBe(400);
        }
        expect(await getNumRows('subscriptions')).toEqual(0);
        expect(await getNumRows('feeds')).toEqual(0);
        expect(await getNumRows('posts')).toEqual(0);
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(0);
    }, 15000);
    
    test('Empty body should respond with 400 status code', async () => {
        const res = await agent 
            .post('/subscriptions')
        expect(res.statusCode).toBe(400);

        expect(await getNumRows('subscriptions')).toEqual(0);
        expect(await getNumRows('feeds')).toEqual(0);
        expect(await getNumRows('posts')).toEqual(0);
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(0);
    });
    
    test('Duplicate subscription should respond with 400', async () => {
        await addSubscription(agent, serverAddress + '/redditAll.xml', '');

        expect(await getNumRows('subscriptions')).toEqual(1);
        expect(await getNumRows('feeds')).toEqual(1);
        expect(await getNumRows('posts')).toEqual(25);
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(1);

        const res = await addSubscription(agent, serverAddress + '/redditAll.xml', '');
        expect(res.statusCode).toBe(400);
        expect(await getNumRows('subscriptions')).toEqual(1);
        expect(await getNumRows('feeds')).toEqual(1);
        expect(await getNumRows('posts')).toEqual(25);
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(1);
    });

    test('Same feed can be added to multiple folders', async () => {
        await addSubscription(agent, serverAddress + '/redditAll.xml', 'folder1');

        expect(await getNumRows('subscriptions')).toEqual(1);
        expect(await getNumRows('feeds')).toEqual(1);
        expect(await getNumRows('posts')).toEqual(25);
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(1);

        await addSubscription(agent, serverAddress + '/redditAll.xml', 'folder2');
        expect(await getNumRows('subscriptions')).toEqual(2);
        expect(await getNumRows('feeds')).toEqual(1);
        expect(await getNumRows('posts')).toEqual(25);
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(1);
    });
    test('Subscribing to feed that is already subscribed to by other users uses already existing feed', async () => {
        await addSubscription(agent, serverAddress + '/redditAll.xml', '');

        expect(await getNumRows('subscriptions')).toEqual(1);
        expect(await getNumRows('feeds')).toEqual(1);
        expect(await getNumRows('posts')).toEqual(25);
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(1);

        const agent2 = await getLoggedInAgent(2);
        await addSubscription(agent2, serverAddress + '/redditAll.xml', '');
        expect(await getNumRows('subscriptions')).toEqual(2);
        expect(await getNumRows('feeds')).toEqual(1);
        expect(await getNumRows('posts')).toEqual(25);
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(1);
    });
});

describe('DELETE /subscriptions', () => {
    test('Subscription deletion is successful', async () => {
        const res = await addSubscription(agent, serverAddress + '/redditAll.xml', '');
        const id = res.body.subscription.id;

        expect(await getNumRows('subscriptions')).toEqual(1);
        expect(await getNumRows('feeds')).toEqual(1);
        expect(await getNumRows('posts')).toEqual(25);
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(1);

        const res2 = await agent
            .delete('/subscriptions')    
            .query({subscriptionid: id});
        expect(res2.statusCode).toBe(204);
        expect(await getNumRows('subscriptions')).toEqual(0);
        expect(await getNumRows('feeds')).toEqual(0);
        expect(await getNumRows('posts')).toEqual(0);
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(0);
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

    test('Deleting subscription that is subscribed by multiple users does not delete feed or posts', async () => {
        const res = await addSubscription(agent, serverAddress + '/redditAll.xml', '');

        const agent2 = await getLoggedInAgent(2);
        await addSubscription(agent2, serverAddress + '/redditAll.xml', '');
        expect(await getNumRows('subscriptions')).toEqual(2);
        expect(await getNumRows('feeds')).toEqual(1);
        expect(await getNumRows('posts')).toEqual(25);
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(1);
        
         const res2 = await agent
            .delete('/subscriptions')
            .query({subscriptionid: res.body.subscription.id});
        expect(res2.statusCode).toBe(204);
        expect(await getNumRows('subscriptions')).toEqual(1);
        expect(await getNumRows('feeds')).toEqual(1);
        expect(await getNumRows('posts')).toEqual(25);
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(1);
    });
});

describe('PATCH /subscriptions/rename', () => {
    test('Renaming subscription is successful', async () => {
        const res = await addSubscription(agent, serverAddress + '/redditAll.xml', '');
        const id = res.body.subscription.id;

        const res2 = await agent
            .patch('/subscriptions/rename')
            .send({subscriptionid: id, newName: 'new name'});
        expect(res2.statusCode).toBe(204);
        
        const query = await db.query(`SELECT * FROM subscriptions WHERE id = ${id}`);
        const subscription = query.rows[0];
        expect(subscription.name).toBe('new name');
    });
    
    test('Renaming non existant subscription returns 400', async () => {
        const res = await agent
            .patch('/subscriptions/rename')
            .send({subscriptionid: -1, newName: 'new name'});
        expect(res.statusCode).toBe(400);
    });
    
    test('Missing query params returns 400', async () => {
        const res = await agent
            .patch('/subscriptions/rename');
        expect(res.statusCode).toBe(400);
    });
    
    test('Renaming subscription empty string returns 400', async () => {
        const res = await addSubscription(agent, serverAddress + '/redditAll.xml', '');
        const id = res.body.subscription.id;
        
        await agent
            .patch('/subscriptions/rename')
            .send({subscriptionid: id, newName: 'sub name'});

        const res2 = await agent
            .patch('/subscriptions/rename')
            .send({subscriptionid: id, newName: ''});
        expect(res2.statusCode).toBe(400);
        
        const query = await db.query(`SELECT * FROM subscriptions WHERE id = ${id}`);
        const subscription = query.rows[0];
        expect(subscription.name).toBe('sub name');
    })
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
            .patch('/subscriptions/rename/folder');
        expect(res.statusCode).toBe(400);
    });
    
    test('Renaming folder empty string returns 400', async () => {
        const res = await addSubscription(agent, serverAddress + '/redditAll.xml', 'old');
        const id = res.body.subscription.id;

        const res2 = await agent
            .patch('/subscriptions/rename/folder')
            .send({oldName: 'old', newName: ''});
        expect(res2.statusCode).toBe(400);

        const query = await db.query(`SELECT * FROM subscriptions WHERE id = ${id}`);
        const subscription = query.rows[0];
        expect(subscription.folder).toBe('old');
    }) 
});

describe('DELETE /folder', () => {
    test('Deleting folder is successful', async () => {
        await addSubscription(agent, serverAddress + '/redditAll.xml', 'test');
        await addSubscription(agent, serverAddress + '/hackerNews.xml', 'test');

        const pre = await db.query('SELECT * FROM subscriptions WHERE folder = \'test\'');
        expect(pre.rowCount).toBe(2);
        expect(await getNumRows('feeds')).toBe(2);
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(2);

        const res = await agent
            .delete('/subscriptions/folder') 
            .query({folder: 'test'});
        expect(res.statusCode).toBe(204);

        const post = await db.query('SELECT * FROM subscriptions WHERE folder = \'test\'');
        expect(post.rowCount).toBe(0);
        expect(await getNumRows('feeds')).toBe(0);
        expect((await updatePostsQueue.getRepeatableJobs()).length).toBe(0);
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
    test('Uploading valid opml file is successful', async () => {
        const res = await agent
            .post('/subscriptions/opml')
            .attach("opml", `${__dirname}/../../testFeeds/test.opml`);
        expect(res.statusCode).toBe(202);
    });
    
    test('Uploading invalid xml file returns 400', async () => {
        const res = await agent
            .post('/subscriptions')
            .attach('opml', `${__dirname}/../../testFeeds/invalidXml.xml`)
        expect(res.statusCode).toBe(400);
    });
    
    test('Uploading valid xml but invalid opml file returns 400', async () => {
        const res = await agent
            .post('/subscriptions')
            .attach('opml', `${__dirname}/../../testFeeds/hackerNews.xml`);
        expect(res.statusCode).toBe(400);
    });
    test('Uploading with empty params returns 400', async () => {
        const res = await agent
            .post('/subscriptions')
        expect(res.statusCode).toBe(400);
    });
});