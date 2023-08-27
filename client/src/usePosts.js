import { useEffect, useState } from 'react';

function usePosts(selectedFolder, selectedFeed, allFeedsSelected){
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState(false);
    
    useEffect(() => {
        async function updatePosts() {
            let urlParams;
            if (selectedFolder) {
                urlParams = `folder=${selectedFolder}&`;
            } else if (selectedFeed) {
                urlParams = `subscriptionid=${selectedFeed}&`;
            } else {
                urlParams = `allFeeds=true&`;
            }
            urlParams += 'limit=10';
            const res = await fetch(`/get-feed?${urlParams}`); 
            const json = await res.json();
            setPosts(json.posts);
        }
        updatePosts();
    }, [selectedFolder, selectedFeed, allFeedsSelected]);
    
    return { posts, loading, hasMore, error };
}

export default usePosts;