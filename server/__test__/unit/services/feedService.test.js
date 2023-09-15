const { parseFeed } = require('../../../services/feedService');
const { readFile } = require('fs/promises');

describe('parseFeed tests', () => {
    test('Valid xml feed is parsed correctly for hackerNews', async () => {
        const xml = await readFile('./__test__/testFeeds/hackerNews.xml' , 'utf8');
        const parsedFeed = await parseFeed(xml, 'the/test/url');
    
        expect(parsedFeed.feedurl).toBe('the/test/url');
        expect(parsedFeed.iconurl).toBeUndefined();
        expect(parsedFeed.title).toBe('Hacker News: Front Page');

        expect(parsedFeed.posts.length).toBe(20); 
        parsedFeed.posts.forEach(post => {
            expect(post.mediaurl).toBeUndefined();
            expect(post.url).toBeDefined();
            expect(post.title).toBeDefined();
            expect(post.commentsurl).toBeDefined();
            expect(post.date).toBeDefined();
            expect(post.identifier).toBeDefined();
        });
    });
    
    test.todo('Valid xml feed is parsed correctly for redditAll');

    test('Non-feed xml throws error', async () => {
        const xml = await readFile('./__test__/testFeeds/validXmlInvalidFeed.xml' , 'utf8');
        await expect(parseFeed(xml, 'the/test/url')).rejects.toThrow();
    });

    test('Invalid xml throws error', async () => {
        const xml = await readFile('./__test__/testFeeds/invalidXml.xml' , 'utf8');
        await expect(parseFeed(xml, 'the/test/url')).rejects.toThrow();
    });

    test('Empty xml throws error', async () => {
        const xml = await readFile('./__test__/testFeeds/empty.xml' , 'utf8');
        await expect(parseFeed(xml, 'the/test/url')).rejects.toThrow();
    });

    test('Missing params throws error', async () => {
        await expect(parseFeed()).rejects.toThrow();
    });
});