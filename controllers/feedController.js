const Parser = require('rss-parser')

async function getAllPosts(feeds) {
    const posts = []
    for (const feed of feeds) {
        posts.push(...await getPosts(feed))
    }
    console.log(posts)
    return posts.sort((a, b) => b.isoDate.localeCompare(a.isoDate))
}

async function getPosts(feedURL) {
    const parser = new Parser()
    try {
        const feed = await parser.parseURL(feedURL)
        return feed.items
    } catch (e) {
        console.error(e)
        return []
    } 
}

module.exports = getAllPosts