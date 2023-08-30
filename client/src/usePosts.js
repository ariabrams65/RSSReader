import { useEffect, useState } from 'react';
import { useSelection } from './SelectionContext';

function usePosts() {
    const [posts, setPosts] = useState([]);
    const [oldestPostDate, setOldestPostDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    
    const {
        selectedFolder,
        selectedFeed,
        allFeedsSelected
    } = useSelection();
    
    useEffect(() => {
        setPosts([]);
        setOldestPostDate(null);
        updatePosts(null);
    }, [selectedFolder, selectedFeed, allFeedsSelected]);

    async function updatePosts(olderThan=oldestPostDate) {
        setLoading(true);
        let urlParams;
        if (selectedFolder) {
            urlParams = `folder=${selectedFolder}&`;
        } else if (selectedFeed) {
            urlParams = `subscriptionid=${selectedFeed}&`;
        } else {
            urlParams = `allFeeds=true&`;
        }
        if (olderThan) {
            urlParams += `olderThan=${olderThan}&`;
        }
        urlParams += 'limit=10';
        const res = await fetch(`/get-feed?${urlParams}`); 
        const json = await res.json();
        setOldestPostDate(json.oldestPostDate);
        setPosts(prevPosts => [...prevPosts, ...json.posts]);
        setHasMore(json.posts.length > 0);
        setLoading(false);
    }
    
    return { posts, loading, hasMore, updatePosts };
}

export default usePosts;