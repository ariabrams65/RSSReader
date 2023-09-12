import { useEffect, useState, useRef } from 'react';
import { useSelection } from '../context/SelectionContext';

function usePosts() {
    const [posts, setPosts] = useState([]);
    const [oldestPostDate, setOldestPostDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const inUseEffect = useRef(false);
    
    const {
        selectedFolder,
        selectedFeed,
        allFeedsSelected
    } = useSelection();
    
    
    useEffect(() => {
        if (inUseEffect.current) return;
        
        async function updateInitialPosts() {
            inUseEffect.current = true;
            setPosts([]);
            setOldestPostDate(null);
            await updatePosts(null);
            inUseEffect.current = false;
        }
        updateInitialPosts();
    }, [selectedFolder, selectedFeed, allFeedsSelected]);

    async function updatePosts(olderThan=oldestPostDate) {
        setLoading(true);
        let urlParams;
        if (selectedFeed) {
            urlParams = `subscriptionid=${selectedFeed.id}&`;
        } else if (selectedFolder) {
            urlParams = `folder=${selectedFolder}&`;
        } else {
            urlParams = `allFeeds=true&`;
        }
        if (olderThan) {
            urlParams += `olderThan=${olderThan}&`;
        }
        urlParams += 'limit=10';
        const res = await fetch(`/feed?${urlParams}`); 
        const json = await res.json();
        setOldestPostDate(json.oldestPostDate);
        setPosts(prevPosts => [...prevPosts, ...json.posts]);
        setHasMore(json.posts.length > 0);
        setLoading(false);
    }
    
    return { posts, loading, hasMore, updatePosts };
}

export default usePosts;