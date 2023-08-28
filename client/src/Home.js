import './App.css';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import usePosts from './usePosts';
import { useState, useCallback, useRef } from 'react';


function Home() {
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [allFeedsSelected, setAllFeedsSelected] = useState(true);
    
    const { posts, loading, hasMore, updatePosts } = usePosts(selectedFolder, selectedFeed, allFeedsSelected);
    
    const observer = useRef();
    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) {
            observer.current.disconnect();
        }
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                updatePosts();
            }
        })
        if (node) {
            observer.current.observe(node);
        }
    }, [loading, hasMore]);
  
    function selectFolder(folderName) {
        setSelectedFolder(folderName);
        setSelectedFeed(null);
        setAllFeedsSelected(false);
    }
  
    function selectFeed(subscriptionid) {
        setSelectedFeed(subscriptionid);
        setSelectedFolder(null);
        setAllFeedsSelected(false);
    }
  
    function selectAllFeeds() {
        setAllFeedsSelected(true);
        setSelectedFeed(null);
        setSelectedFolder(null);
    }
  
    return (
        <>
            <Sidebar 
                selectedFolder={selectedFolder}
                selectedFeed={selectedFeed}
                allFeedsSelected={allFeedsSelected}
                selectFolder={selectFolder}
                selectFeed={selectFeed} 
                selectAllFeeds={selectAllFeeds}
            />
            <MainContent 
                posts={posts}
                lastPostElementRef={lastPostElementRef}
            />
        </>
    );
}

export default Home;