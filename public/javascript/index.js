document.addEventListener('DOMContentLoaded', () => {
    renderFeed()
    renderSubscribedFeeds()
})
const newSubInput = document.getElementById('newSubInput')
newSubInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        const newSubscription = newSubInput.value
        newSubInput.value = ''
        addSubscription(document.getElementById('subscribedFeeds'), newSubscription)
        postNewSubscription(newSubscription)
    }
})

function postNewSubscription(newSubscription) {
    fetch('/subscriptions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({newSubscription: newSubscription})
    })
}

function addSubscription(subscribedFeeds, newSubscription) {
    const li = document.createElement('li')
    li.textContent = newSubscription
    subscribedFeeds.appendChild(li)
}

async function renderFeed() {
    const posts = await getPosts()
    const articleList = document.getElementById('articleList') 
    posts.forEach(post => {
        const li = document.createElement('li')
        li.textContent = post['title']
        articleList.appendChild(li) 
    })
}

async function renderSubscribedFeeds() {
    const subscriptions = await getSubscribedFeeds()
    const subscribedFeeds = document.getElementById('subscribedFeeds')
    subscriptions.forEach(subscription=> {addSubscription(subscribedFeeds, subscription)})
}

async function getSubscribedFeeds() {
    const response = await fetch('/subscriptions')
    const json = await response.json()
    return json['subscriptions']
}

async function getPosts() {
    const response = await fetch('/get-feed')
    const json = await response.json()
    return json['posts']
}