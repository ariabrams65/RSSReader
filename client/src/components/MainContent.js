import formatTimeSince from "../utils/formatTime";

function MainContent({ posts, lastPostElementRef }) {
    return (
        <div className="main-content">
            <ul className="topnav">
            </ul>
            <ItemList 
                posts={posts} 
                lastPostElementRef={lastPostElementRef} 
            />
        </div>
    ); 
}

function ItemList({ posts, lastPostElementRef }) {
    const postElements = posts.map((post, index) => {
        const attributes = {
            key: post.id,
            className: 'item'
        };
        if (posts.length === index + 1) {
            attributes.ref = lastPostElementRef;
        }
        return (
            <li {...attributes}>
                <div className="item-source">
                    {post.iconurl && <img className="item-icon" src={post.iconurl}/>}
                    <span>{post.feedtitle}</span>
                </div>
                <a href={post.url} className="item-title">{post.title}</a>
                {post.commentsurl && <a href={post.commentsurl} className="item-comments">Comments</a>}
                {post.mediaurl && <img className="item-image" src={post.mediaurl}/>}
                {post.date && <h3 className="item-time">{formatTimeSince(post.date)}</h3>}
            </li>
        );
    });
    return (
        <>
            <ul className="item-list">{postElements}</ul>
        </>
    );
}

export default MainContent;