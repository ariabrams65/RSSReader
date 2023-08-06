document.addEventListener('DOMContentLoaded', () => {
    renderFeed();
    renderSubscribedFeeds();
    const newSubInput = document.getElementById('newSubInput');
    newSubInput.addEventListener('keydown', async event => {
        if (event.key === 'Enter') {
            const newSubscription = newSubInput.value;
            newSubInput.value = '';
            addSubscription(document.getElementById('subscribedFeeds'), newSubscription);
            await postNewSubscription(newSubscription);
            renderFeed();
        }
    });
    const allFeedsBtn = document.getElementById('all-feeds');
    allFeedsBtn.addEventListener('click', () => onButtonClick(allFeedsBtn));
});

async function postNewSubscription(newSubscription) {
    await fetch('/subscriptions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({newSubscription: newSubscription})
    });
}

function addSubscription(subscribedFeeds, newSubscription) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.addEventListener('click', () => onButtonClick(button));
    button.textContent = newSubscription;
    button.classList.add('feed');
    button.dataset.url = newSubscription;
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
    const source = document.createElement('p');
    source.innerText = item.sourceTitle;
    li.appendChild(source);
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