const { getFoldersFromOpml } = require('../../../services/subscriptionService');
const { readFile } = require('fs/promises');
const xml2js = require('xml2js');

describe('getFoldersFromOpml tests', () => {
    test('opml object is foldered correctly', async () => {
        const xml = await readFile('./__test__/testFeeds/test.opml' , 'utf8');
        const parser = new xml2js.Parser();    
        const opmlObj = await parser.parseStringPromise(xml);
        
        const folders = getFoldersFromOpml(opmlObj);
        const expectedFolders = {
            '': [
                {
                    url: 'https://www.reddit.com/r/singularity/.rss',
                    name: 'Singularity'
                }
            ],
            'folder1': [
                {
                    url: 'https://hnrss.org/frontpage',
                    name: 'Hacker News: Front Page'
                },
                {
                    url: 'https://www.reddit.com/r/SpaceXLounge/.rss',
                    name: 'r/SpaceXLounge, for casual SpaceX discussion.'
                }
            ],
            'folder2': [
                {
                    url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
                    name: 'Biz & IT – Ars Technica'
                }
            ]
        }
        expect(folders).toStrictEqual(expectedFolders);  
    });
    
    test('deeply nested folders are flatend', async () => {
        const xml = await readFile('./__test__/testFeeds/deeplyNested.opml' , 'utf8');
        const parser = new xml2js.Parser();    
        const opmlObj = await parser.parseStringPromise(xml);
        
        const folders = getFoldersFromOpml(opmlObj);
        const expectedFolders = {
            '': [
                {
                    url: 'https://www.reddit.com/r/singularity/.rss',
                    name: 'Singularity'
                }
            ],
            'folder1': [
                {
                    url: 'https://www.reddit.com/r/SpaceXLounge/.rss',
                    name: 'r/SpaceXLounge, for casual SpaceX discussion.'
                }
            ],
            'folder2': [
                {
                   url: 'https://test1.rss',
                   name: 'Test feed 1'
                },
                {
                   url: 'https://test2.rss',
                   name: 'Test feed 2'
                }
            ],
            'folder3': [
                {
                    url: 'https://hnrss.org/frontpage',
                    name: 'Hacker News: Front Page'
                }
            ],
            'folder4': [
                {
                    url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
                    name: 'Biz & IT – Ars Technica'
                }
            ]
        }
        expect(folders).toStrictEqual(expectedFolders);  
    });
    
    test('Invalid opml throws error', async () => {
        const xml = await readFile('./__test__/testFeeds/hackerNews.xml' , 'utf8');
        const parser = new xml2js.Parser();    
        const opmlObj = await parser.parseStringPromise(xml);
        expect(() => getFoldersFromOpml(opmlObj)).toThrow();
    });
});