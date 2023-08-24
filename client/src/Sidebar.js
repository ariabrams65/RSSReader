import { useState } from 'react';

const FEEDS = [
  {folder: 'folder1', id: 1, feedurl: 'https://www.reddit.com/r/fish/.rss', iconurl: 'https://www.redditstatic.com/icon.png', title: 'All about the worlds enormous population of amazing fish'},
  {folder: 'folder2', id: 2, feedurl: 'https://www.reddit.com/r/dogs/.rss', iconurl: 'https://www.redditstatic.com/icon.png', title: 'r/dogs'},
  {folder: 'folder3', id: 3, feedurl: 'https://www.reddit.com/r/cats/.rss', iconurl: 'https://www.redditstatic.com/icon.png', title: 'r/cats'},
  {folder: 'folder1', id: 4, feedurl: 'https://www.reddit.com/r/cats/.rss', iconurl: 'https://www.redditstatic.com/icon.png', title: 'r/cats'},
  {folder: 'folder1', id: 5, feedurl: 'https://www.reddit.com/r/cats/.rss', iconurl: 'https://www.redditstatic.com/icon.png', title: 'r/cats'}
];

function Sidebar({ selectedFolder, selectedFeed, allFeedsSelected, selectFolder, selectFeed, selectAllFeeds}) {
  const [feeds, setFeeds] = useState(FEEDS);

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    //fetch('/api', formData);
    //https://react.dev/reference/react-dom/components/input
  }
  return (
    <div className="sidebar">
      <form method="post" onSubmit={handleSubmit}>
        <input type="text" className="new-sub-input" placeholder="Enter RSS feed URL"></input>
      </form>
      <button className={`all-feeds feed ${allFeedsSelected ? 'selected' : ''}`} onClick={() => selectAllFeeds()}>
        <img className="feed-icon" src="/all-feeds-icon.png"></img>
        <span className="feed-name">All Feeds</span>
      </button>
      <Folders 
        feeds={feeds} 
        selectedFolder={selectedFolder} 
        selectedFeed={selectedFeed} 
        selectFolder={selectFolder} 
        selectFeed={selectFeed}
      />
    </div>
  );
}

function Folders({ feeds, selectedFolder, selectedFeed, selectFolder, selectFeed}) {
  const groupedFeeds = {};
  feeds.forEach(feed => {
    if (!groupedFeeds[feed.folder]) {
      groupedFeeds[feed.folder] = [];
    }
    groupedFeeds[feed.folder].push(feed);
  });
  const folders = Object.values(groupedFeeds).map(feeds => {
    return <FeedFolder
      feeds={feeds}
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

function FeedFolder({ feeds, selectedFolder, selectedFeed, selectFolder, selectFeed}) {
  const feedElements = feeds.map(feed => <SubscribedFeed feed={feed} selectedFeed={selectedFeed} selectFeed={selectFeed}/>); 
  const folderName = feeds[0].folder;
  return (
    <li key={folderName}>
      <button className={`folder ${selectedFolder === folderName ? 'selected' : ''}`} onClick={() => selectFolder(folderName)}>{folderName}</button>
      <ul>{feedElements}</ul>
    </li>
  );
}

function SubscribedFeed({ feed, selectedFeed, selectFeed}) {
  return (
    <li key={feed.id}>
      <button className={`feed ${selectedFeed === feed.id ? 'selected' : ''}`} onClick={() => selectFeed(feed.id)}>
        <img className="feed-icon" src={feed.iconurl}></img>
        <span className="feed-name">{feed.title}</span>
      </button>
    </li>
  );
}

export default Sidebar;