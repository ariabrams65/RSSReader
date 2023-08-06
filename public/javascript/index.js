document.addEventListener('DOMContentLoaded', () => {
    renderFeed();
    renderSubscribedFeeds();
    addnewSubEventListener();
    addAllFeedsBtnEventListener();
});

function addAllFeedsBtnEventListener() {
    const allFeedsBtn = document.getElementById('all-feeds');
    allFeedsBtn.addEventListener('click', () => onButtonClick(allFeedsBtn));
}

async function addnewSubEventListener() {
    const newSubInput = document.getElementById('newSubInput');
    newSubInput.addEventListener('keydown', async event => {
        if (event.key === 'Enter') {
            try {
                const feedHeaders = await postNewSubscription(newSubInput.value);
                addSubscription(document.getElementById('subscribedFeeds'), feedHeaders);
                newSubInput.value = '';
                renderFeed();
            } catch (e) {
                //alert error message to user
                console.log(e);
                return;
            }
        }
    });
}

async function postNewSubscription(newSubscription) {
    const response = await fetch('/subscriptions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({newSubscription: newSubscription})
    });
    if (response.status === 400) {
        throw new Error('URL is not a valid rss feed');
    } else if (!response.ok) {
        throw new Error('Cannot add new feed');
    }
    const json = await response.json();
    return json['subscription'];
}

function addSubscription(subscribedFeeds, feedHeaders) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.addEventListener('click', () => onButtonClick(button));
    button.textContent = feedHeaders.title;
    button.classList.add('feed');
    button.dataset.url = feedHeaders.feedUrl;
    li.appendChild(button);
    subscribedFeeds.appendChild(li);
}

function onButtonClick(button) {
    const buttons = document.getElementsByClassName("feed");
    [...buttons].forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    renderFeed();
}

async function renderFeed() {
    const itemList = document.getElementById('itemList');
    itemList.innerHTML = '';
    const items = await getPosts();
    items.forEach(item => {
        const itemElement = createItemElement(item);
        itemList.appendChild(itemElement) ;
    });
}

function createItemElement(item) {
    const li = document.createElement('li');
    li.classList.add('item');

    const titleAnchor = document.createElement('a');
    titleAnchor.href = item.link;
    titleAnchor.innerText = item.title;
    li.appendChild(titleAnchor);
    if (item.comments !== undefined) {
        const commentAnchor = document.createElement('a');
        commentAnchor.href = item.comments;
        commentAnchor.innerText = 'Comments';
        li.appendChild(commentAnchor);
    }
    const source = document.createElement('div');
    source.innerText = item.sourceTitle;
    li.appendChild(source);
    if (item.media !== undefined) {
        const img = document.createElement('img');
        img.classList.add('image');
        img.src = item.media['$'].url;
        img.alt = 'Image unavailable';
        li.appendChild(img);
    } else if (item.mediaGroup !== undefined) {
        const img = document.createElement('img');
        img.classList.add('image');
        img.src = item.mediaGroup['media:content'][0]['$'].url;
        img.alt = 'Image unavailable';
        li.appendChild(img);
    }
    return li;
}

async function renderSubscribedFeeds() {
    const subscriptions = await getSubscribedFeeds();
    const subscribedFeeds = document.getElementById('subscribedFeeds');
    subscriptions.forEach(subscription => {addSubscription(subscribedFeeds, subscription)});
}

async function getSubscribedFeeds() {
    const response = await fetch('/subscriptions');
    const json = await response.json();
    return json['subscriptions'];
}

async function getPosts() {
    let params = '';
    const activeButton = document.querySelector('#subscribedFeeds button.active');
    if (activeButton.dataset.url !== undefined) {
        params = `?url=${activeButton.dataset.url}`;
    }
    const response = await fetch(`/get-feed${params}`);
    const json = await response.json();
    return json['posts'];
}