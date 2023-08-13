const Parser = require('rss-parser');
const removeTrailingSlash = require('../helpers/commonHelpers');

async function getFeed(req, res) {
    let json;
    // if (req.query.url === undefined) {
    //     json = {posts: await getAllPosts(req.user.subscriptions.map(sub => sub.feedUrl))};
    // } else {
    //     json = {posts: await getAllPosts([req.query.url])};
    // }
    json = {posts: [{title: 'Test title', link: 'https://old.reddit.com/r/startups/comments/15p8qrx/my_0100m0_in_5_years_story/', isoDate: '2015-11-12T21:16:39.000Z'}]};
    res.json(json);
}

async function getAllPosts(subscriptionUrls) {
    const posts = await Promise.all(subscriptionUrls.map(url => getPosts(url)));

    const sortedPosts = posts.flat().sort((a, b) => {
        const defaultDate = new Date(0);
        const aDate = a.isoDate ? new Date(a.isoDate) : defaultDate;
        const bDate = b.isoDate ? new Date(b.isoDate) : defaultDate;
        return bDate - aDate;
    });
    return sortedPosts;
}

async function getPosts(feedURL) {
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

module.exports =  getFeed;