const Parser = require('rss-parser');

async function getAllPosts(subscriptionUrls) {
    const posts = [];
    for (const sub of subscriptionUrls) {
        posts.push(...await getPosts(sub));
    }
    return posts.sort((a, b) => {
        if (a.isoDate === undefined || b.isoDate === undefined) {
            return Math.floor(Math.random() * 3) - 1;
        }
        return b.isoDate.localeCompare(a.isoDate);
    });
}

async function getPosts(feedURL) {
    const parser = new Parser({
        customFields: {
            item: [
                ['media:thumbnail', 'mediaThumbnail'], 
                ['media:group', 'mediaGroup'],
                ['media:content', 'mediaContent']
            ] 
        }
    });
    try {
        const feed = await parser.parseURL(feedURL);
        feed.items.forEach(item => {item.sourceTitle = feed.title});
        return feed.items;
    } catch (e) {
        console.error(e);
        return [];
    } 
}

async function getRssHeaders(feedURL) {
    const parser = new Parser();    
    const feed = await parser.parseURL(feedURL);
    delete feed.items;
    return feed;
}

module.exports =  { getAllPosts, getRssHeaders };