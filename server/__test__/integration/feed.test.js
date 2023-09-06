const { getLoggedInAgent } = require('./utils/setup');
const db = require('../../db/db');
const { addSubscription } = require('./utils/dbHelpers');

let agent;
beforeAll(async () => {
    await db.resetTables();
    agent = await getLoggedInAgent();
});

beforeEach(async () => {
    await db.resetTables(['subscriptions', 'feeds', 'posts']);
});

describe('GET /feed', () => {
    test('Getting posts from all feeds is successful', async () => {
        await addSubscription(agent, 'https://www.reddit.com/r/all/.rss', '');
        await addSubscription(agent, 'https://www.reddit.com/r/space/.rss', '');
        const res = await agent
            .get('/feed')
            .query({allFeeds: true});
        expect(res.statusCode).toBe(200);
        expect(res.body.posts.length).toBeGreaterThan(30);
        expect(res.body.oldestPostDate).toBeDefined();
    });

    test('Getting posts from folder is successful', async () => {
        await addSubscription(agent, 'https://www.reddit.com/r/all/.rss', 'reddit');
        await addSubscription(agent, 'https://www.reddit.com/r/space/.rss', 'space');
        const res = await agent
            .get('/feed')
            .query({folder: 'space'});
        expect(res.statusCode).toBe(200);
        expect(res.body.posts.length).toBeGreaterThan(15);
        expect(res.body.posts.length).toBeLessThan(30);
        expect(res.body.oldestPostDate).toBeDefined();   
        res.body.posts.forEach(post => {
            expect(post.feedurl).toBe('https://www.reddit.com/r/space/.rss');
        });
    });

    test('Getting posts from specific feed is successful', async () => {
        await addSubscription(agent, 'https://www.reddit.com/r/all/.rss', '');
        const subRes = await addSubscription(agent, 'https://www.reddit.com/r/space/.rss', '');
        const res = await agent
            .get('/feed')
            .query({subscriptionid: subRes.body.subscription.id});
        expect(res.statusCode).toBe(200);
        expect(res.body.posts.length).toBeGreaterThan(15);
        expect(res.body.posts.length).toBeLessThan(30);
        expect(res.body.oldestPostDate).toBeDefined();
        res.body.posts.forEach(post => {
            expect(post.feedurl).toBe('https://www.reddit.com/r/space/.rss');
        });

    });

    test.todo('Getting posts older than date is successful');
    test.todo('Getting limited number of posts is successful');
    
    test.todo('Getting posts with invalid params returns 400');  
    test.todo('Getting posts with missing paramas returns 400');
});