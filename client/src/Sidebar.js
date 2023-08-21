import React from 'react';

function Sidebar({ feeds }) {
  return (
    <div className="sidebar">
      <input type="text" className="new-sub-input" placeholder="Enter RSS feed URL"></input>
      <button className="all-feeds feed active">
        <img className="feed-icon" src="/all-feeds-icon.png"></img>
        <span className="feed-name">All Feeds</span>
      </button>
      <SubscribedFeeds feeds={feeds}/>
    </div>
  );
}

function SubscribedFeeds({ feeds }) {
  const feedElements = feeds.map((feed) => {
    return (
      <li key={feed.id}>
        <button className="feed">
          <img className="feed-icon" src={feed.iconurl}></img>
          <span className="feed-name">{feed.title}</span>
        </button>
      </li>
    );
  })
  return (
    <ul className="subscribed-feeds">{feedElements}</ul>
  );
}

export default Sidebar;