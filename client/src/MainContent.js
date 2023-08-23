import React from 'react';

function MainContent({ posts }) {
  return (
    <div className="main-content">
      <ul className="topnav">
        <li>
          <a id="user-btn">Account</a>
        </li>
      </ul>
      <ItemList posts={posts}/>
    </div>
  ); 
}

function ItemList({ posts }) {
  const postElements = posts.map((post) => {
    return (
      <li key={post.id} className="item">
        <div className="item-source">
          {post.iconurl && <img class="item-icon" src={post.iconurl}/>}
          <span>{post.feedtitle}</span>
        </div>
        <a href={post.url} className="item-title">{post.title}</a>
        <a href={post.commentsurl} className="item-comments">Comments</a>
        {post.mediaurl && <img className="item-image" src={post.mediaurl}/>}
        <h3 className="item-time">{post.date}</h3>
      </li>
    );
  });
  return (
    <ul className="item-list">{postElements}</ul>
  );
    
}

export default MainContent;