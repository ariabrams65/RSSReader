document.addEventListener('DOMContentLoaded', renderFeed)

async function renderFeed() {
    const posts = await getPosts()
    const articleList = document.getElementById('articleList') 
    posts.forEach(post => {
        const li = document.createElement('li')
        li.textContent = post['title'] +  '     ' + post['link']
        articleList.appendChild(li) 
    })
}

async function getPosts() {
    const response = await fetch('get-feed')
    const json = await response.json()
    return json['posts']
}