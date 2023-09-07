const { getLoggedInAgent } = require('./utils/setup');
const db = require('../../db/db');
const { addSubscription } = require('./utils/dbHelpers');

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

describe('GET /feed', () => {
    test('Getting posts from all feeds is successful', async () => {
        await addSubscription(agent, serverAddress + '/hackerNews.xml', '');
        await addSubscription(agent, serverAddress + '/redditAll.xml', '');
        const res = await agent
            .get('/feed');
        expect(res.statusCode).toBe(200);
        expect(res.body.posts.length).toBe(45);
        expect(res.body.oldestPostDate).toBeDefined();
    });

    test('Getting posts from folder is successful', async () => {
        await addSubscription(agent, serverAddress + '/redditAll.xml', 'reddit');
        await addSubscription(agent, serverAddress + '/hackerNews.xml', 'hacker');
        const res = await agent
            .get('/feed')
            .query({folder: 'hacker'});
        expect(res.statusCode).toBe(200);
        expect(res.body.posts.length).toBe(20);
        expect(res.body.oldestPostDate).toBeDefined();   
        res.body.posts.forEach(post => {
            expect(post.feedurl).toBe(serverAddress + '/hackerNews.xml');
        });
    });

    test('Getting posts from specific feed is successful', async () => {
        await addSubscription(agent, serverAddress + '/redditAll.xml', '');
        const subRes = await addSubscription(agent, serverAddress + '/hackerNews.xml', '');
        const res = await agent
            .get('/feed')
            .query({subscriptionid: subRes.body.subscription.id});
        expect(res.statusCode).toBe(200);
        expect(res.body.posts.length).toBe(20);
        expect(res.body.oldestPostDate).toBeDefined();
        res.body.posts.forEach(post => {
            expect(post.feedurl).toBe(serverAddress + '/hackerNews.xml');
        });

    });

    test('Getting posts older than date is successful', async () => {
        await addSubscription(agent, serverAddress + '/redditAll.xml', '');
        const testDate = '2023-09-06T19:31:34.000Z';
        const res = await agent
            .get('/feed')
            .query({olderThan: testDate}); 
        expect(res.statusCode).toBe(200);
        expect(res.body.oldestPostDate).toBeDefined();   
        res.body.posts.forEach(post => {
            expect(post.date < testDate).toBe(true);
        });
    });

    test('Getting limited number of posts is successful', async () => {
        await addSubscription(agent, serverAddress + '/redditAll.xml', '');
        
        const res = await agent
            .get('/feed')
            .query({limit: 5}); 
        expect(res.statusCode).toBe(200); 
        expect(res.body.oldestPostDate).toBeDefined();   
        expect(res.body.posts.length).toBe(5);
    });
    
    test("Posts are sent sorted", async () => {
        function isSorted(posts) {
            for (let i = 0; i < posts.length - 1; i++) {
                if (posts[i].date < posts[i + 1].date) {
                    return false;
                }
            }
            return true;
        }
        await addSubscription(agent, serverAddress + '/redditAll.xml', '');
        await addSubscription(agent, serverAddress + '/hackerNews.xml', '');
        const res = await agent
            .get('/feed')
        expect(res.statusCode).toBe(200);
        expect(res.body.oldestPostDate).toBeDefined();   
        expect(isSorted(res.body.posts)).toBe(true);
    });
});