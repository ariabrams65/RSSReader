const Parser = require('rss-parser');
const parser = new Parser({
    customFields: {
        feed: ['image', 'icon'],
        item: [
            ['media:thumbnail', 'mediaThumbnail'], 
            ['media:group', 'mediaGroup'],
            ['media:content', 'mediaContent']
        ] 
    }
});

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
    try {
        const feed = await parser.parseURL(feedURL);
        feed.items.forEach(item => {
            item.sourceTitle = feed.title;
            if (feed.icon !== undefined) {
                item.feedIcon = feed.icon;
            } else if (feed.image !== undefined) {
                item.feedIcon = feed.image.url[0];
            }
            if (item.mediaThumbnail !== undefined) {
                item.media = item.mediaThumbnail['$'].url;
                delete item.mediaThumbnail;
            } else if (item.mediaGroup !== undefined) {
                item.media = item.mediaGroup['media:content'][0]['$'].url;
                delete item.mediaGroup;
            } else if (item.mediaContent !== undefined) {
                item.media = item.mediaContent['$'].url;
                delete item.mediaContent;
            }
        });
        return feed.items;
    } catch (e) {
        console.error(e);
        return [];
    } 
}

async function getRssHeaders(feedUrl) {
    const feed = await parser.parseURL(feedUrl);
    feed.feedUrl = feedUrl;
    if (feed.image !== undefined) {
        feed.icon = feed.image.url[0];
    }
    delete feed.items;
    return feed;
}

module.exports =  { getAllPosts, getRssHeaders };