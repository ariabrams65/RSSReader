import { useState, useEffect } from 'react';

const FEEDS = [
  {folder: 'folder1', id: 1, feedurl: 'https://www.reddit.com/r/fish/.rss', iconurl: 'https://www.redditstatic.com/icon.png', title: 'All about the worlds enormous population of amazing fish'},
  {folder: 'folder2', id: 2, feedurl: 'https://www.reddit.com/r/dogs/.rss', iconurl: 'https://www.redditstatic.com/icon.png', title: 'r/dogs'},
  {folder: 'folder3', id: 3, feedurl: 'https://www.reddit.com/r/cats/.rss', iconurl: 'https://www.redditstatic.com/icon.png', title: 'r/cats'},
  {folder: 'folder1', id: 4, feedurl: 'https://www.reddit.com/r/cats/.rss', iconurl: 'https://www.redditstatic.com/icon.png', title: 'r/cats'},
  {folder: 'folder1', id: 5, feedurl: 'https://www.reddit.com/r/cats/.rss', iconurl: 'https://www.redditstatic.com/icon.png', title: 'r/cats'}
];

function Sidebar({ selectedFolder, selectedFeed, allFeedsSelected, selectFolder, selectFeed, selectAllFeeds}) {
  const [subscriptions, setSubscriptions] = useState([]);
  
  useEffect(() => {
    updateSubscriptions();
  }, []);

  async function updateSubscriptions() {
    const res = await fetch('/subscriptions');
    const json = await res.json();
    setSubscriptions(json.subscriptions);
  }
  
  function getSelectedFolder() {
    if (selectedFolder) {
      return selectedFolder;
    } else if (selectedFeed) {
      const subscription = subscriptions.find(sub => sub.id === selectedFeed);
      return subscription.folder;
    } else {
      return '';
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const folder = e.target.folder.value || getSelectedFolder();
    const res = await fetch('/subscriptions', {
      method: "post", 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        feed: e.target.feed.value,
        folder: folder 
      })});
      if (!res.ok) {
        const json = await res.json();
        console.log(json.message);
      }
      e.target.feed.value = '';
      e.target.folder.value = '';
      updateSubscriptions();

    //https://react.dev/reference/react-dom/components/input
    
  }
  return (
    <div className="sidebar">
      <form method="post" onSubmit={handleSubmit}>
        <input type="text" name="feed" className="input new-sub-input" placeholder="Enter RSS feed URL"></input>
        <input type="text" name="folder" className="input folder-input" placeholder="Enter folder (optional)"></input>
        <button type="submit" style={{display: 'none'}}></button>
      </form>
      <button className={`all-feeds sidebar-btn ${allFeedsSelected ? 'selected' : ''}`} onClick={() => selectAllFeeds()}>
        <img className="feed-icon" src="/all-feeds-icon.png"></img>
        <span className="feed-name">All Feeds</span>
      </button>
      <Folders 
        subscriptions={subscriptions} 
        selectedFolder={selectedFolder} 
        selectedFeed={selectedFeed} 
        selectFolder={selectFolder} 
        selectFeed={selectFeed}
      />
    </div>
  );
}

function Folders({ subscriptions, selectedFolder, selectedFeed, selectFolder, selectFeed}) {
  const groupedSubscriptions= {};
  subscriptions.forEach(subscription=> {
    if (!groupedSubscriptions[subscription.folder]) {
      groupedSubscriptions[subscription.folder] = [];
    }
    groupedSubscriptions[subscription.folder].push(subscription);
  });
  const folders = Object.values(groupedSubscriptions).map(subscriptions => {
    return <FeedFolder
      subscriptions={subscriptions}
      selectedFolder={selectedFolder}
      selectedFeed={selectedFeed}
      selectFolder={selectFolder}
      selectFeed={selectFeed}
    />
  });
  return (
    <ul>{folders}</ul>
  );
}

function FeedFolder({ subscriptions, selectedFolder, selectedFeed, selectFolder, selectFeed}) {
  const feedElements = subscriptions.map(subscription=> <SubscribedFeed subscription={subscription} selectedFeed={selectedFeed} selectFeed={selectFeed}/>); 
  const folderName = subscriptions[0].folder;
  return (
    <li key={folderName} className="folder">
      <button className={`sidebar-btn ${selectedFolder === folderName ? 'selected' : ''}`} onClick={() => selectFolder(folderName)}>{folderName}</button>
      <ul>{feedElements}</ul>
    </li>
  );
}

function SubscribedFeed({ subscription, selectedFeed, selectFeed}) {
  return (
    <li key={subscription.id}>
      <button className={`feed sidebar-btn ${selectedFeed === subscription.id ? 'selected' : ''}`} onClick={() => selectFeed(subscription.id)}>
        <img className="feed-icon" src={subscription.iconurl}></img>
        <span className="feed-name">{subscription.title}</span>
      </button>
    </li>
  );
}

export default Sidebar;