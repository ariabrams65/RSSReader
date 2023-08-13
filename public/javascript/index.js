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
                await postNewSubscription(newSubInput.value);
                renderSubscribedFeeds();
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
    if (!response.ok) {
        const json = await response.json();
        throw new Error(json.message);
    }
}

function addSubscription(subscribedFeeds, subscription) {
    const li = document.createElement('li');
    
    const button = document.createElement('button');
    button.classList.add('feed');
    button.addEventListener('click', () => onButtonClick(button));

    const img = document.createElement('img');
    img.addEventListener('error', function () {
        this.src = '/images/default-feed-icon.png';
    });
    img.classList.add('feed-icon');
    img.src = subscription.iconurl;
    button.appendChild(img);

    const span = document.createElement('span');
    span.classList.add('feed-name');
    span.innerText = subscription.title;
    button.appendChild(span);
    button.dataset.subscriptionid = subscription.subscriptionid;
    li.appendChild(button);
    subscribedFeeds.appendChild(li);
}

async function unsubscribe(subscriptionid) {
    await fetch(`/subscriptions?subscriptionid=${subscriptionid}`, {
        method: 'DELETE'
    });
    renderSubscribedFeeds();
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
   
    const source = document.createElement('div');
    source.classList.add('item-source');
    if (item.feedIcon !== undefined) {
        const icon = document.createElement('img');
        icon.addEventListener('error', function () {
            this.src = '/images/default-feed-icon.png';
        });
        icon.classList.add('item-icon');
        icon.src = item.feedIcon;
        source.appendChild(icon);
    }
    const sourceTitle = document.createElement('span');
    sourceTitle.innerText = item.sourceTitle;
    source.appendChild(sourceTitle);
    li.appendChild(source);

    const titleAnchor = document.createElement('a');
    titleAnchor.href = item.link;
    titleAnchor.innerText = item.title;
    titleAnchor.classList.add('item-title');
    li.appendChild(titleAnchor);
    if (item.comments !== undefined) {
        const commentAnchor = document.createElement('a');
        commentAnchor.href = item.comments;
        commentAnchor.innerText = 'Comments';
        commentAnchor.classList.add('item-comments');
        li.appendChild(commentAnchor);
    }
    if (item.media !== undefined) {
        const img = document.createElement('img');
        img.classList.add('item-image');
        img.src = item.media;
        img.alt = 'Image unavailable';
        li.appendChild(img);
    }

    if (item.isoDate !== undefined) {
        const time = document.createElement('h3');
        time.datetime = item.isoDate;
        time.innerText = formatTimeSince(item.isoDate);
        time.classList.add('item-time')
        li.appendChild(time);
    }
    return li;
}
function formatTimeSince(isoDate) {
    const timeDifference = new Date() - new Date(isoDate);
    if (timeDifference < 60000) { 
        return Math.floor(timeDifference / 1000) + 's';
    } else if (timeDifference < 3600000) {
        return Math.floor(timeDifference / 60000) + 'm';
    } else if (timeDifference < 86400000) {
        return Math.floor(timeDifference / 3600000) + 'h';
    } else {
        return Math.floor(timeDifference / 86400000) + 'd';
    }
}

async function renderSubscribedFeeds() {
    const subscriptions = await getSubscribedFeeds();
    const subscribedFeeds = document.getElementById('subscribedFeeds');
    subscribedFeeds.replaceChildren();
    subscriptions.forEach(subscription => {addSubscription(subscribedFeeds, subscription)});
}

async function getSubscribedFeeds() {
    const response = await fetch('/subscriptions');
    const json = await response.json();
    return json['subscriptions'];
}

async function getPosts() {
    let params = '';
    const activeButton = document.querySelector('.feed.active');
    if (activeButton.dataset.subscriptionid !== undefined) {
        params = `?subscriptionid=${activeButton.dataset.subscriptionid}`;
    }
    const response = await fetch(`/get-feed${params}`);
    const json = await response.json();
    return json['posts'];
}