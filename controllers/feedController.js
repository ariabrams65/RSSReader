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
        const defaultDate = new Date(0);
        const aDate = a.isoDate ? new Date(a.isoDate) : defaultDate;
        const bDate = b.isoDate ? new Date(b.isoDate) : defaultDate;
        return bDate - aDate;
    });
}

async function getPosts(feedURL) {
    try {
        const feed = await parser.parseURL(feedURL);
        const posts = [];
        feed.items.forEach(item => {
            const post = {};
            post.sourceTitle = feed.title;
            if (feed.icon !== undefined) {
                post.feedIcon = feed.icon;
            } else if (feed.image !== undefined) {
                post.feedIcon = feed.image.url[0];
            }
            post.feedIcon = removeTrailingSlash(post.feedIcon);
            if (item.mediaThumbnail !== undefined) {
                post.media = item.mediaThumbnail['$'].url;
            } else if (item.mediaGroup !== undefined) {
                post.media = item.mediaGroup['media:content'][0]['$'].url;
            } else if (item.mediaContent !== undefined) {
                post.media = item.mediaContent['$'].url;
            }
            post.link = item.link;
            post.title = item.title;
            post.comments = item.comments;
            post.isoDate = item.isoDate;

            posts.push(post);
        });
        return posts;
    } catch (e) {
        console.error(e);
        return [];
    } 
}

async function getRssHeaders(feedUrl) {
    const feed = await parser.parseURL(feedUrl);
    console.log('here');
    feed.feedUrl = feedUrl;
    if (feed.image !== undefined) {
        feed.icon = feed.image.url[0];
    }
    feed.icon = removeTrailingSlash(feed.icon);
    delete feed.items;
    return feed;
}

function removeTrailingSlash(iconUrl) {
    if (iconUrl !== undefined && iconUrl.slice(-1) === '/') {
        return iconUrl.substring(0, iconUrl.length - 1);
    }
    return iconUrl;
}

module.exports =  { getAllPosts, getRssHeaders };