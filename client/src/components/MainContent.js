import formatTimeSince from "../utils/formatTime";

function MainContent({ posts, lastPostElementRef }) {
    return (
        <div className="main-content">
            <Topnav/>
            <ItemList 
                posts={posts} 
                lastPostElementRef={lastPostElementRef} 
            />
        </div>
    ); 
}

function Topnav() {
    return (
        <ul className="topnav">
            <li>
                <form method="POST" enctype="multipart/form-data" action="/subscriptions/opml">
                    <input name="opml" type="file" />
                    <button>Upload</button>
                </form>
            </li>
        </ul>
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