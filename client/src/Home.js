import './App.css';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import usePosts from './usePosts';
import { useState, useEffect } from 'react';


function Home() {
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [allFeedsSelected, setAllFeedsSelected] = useState(true);
    
    const { posts, loading, hasMore, error } = usePosts(selectedFolder, selectedFeed, allFeedsSelected);
  
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
            <MainContent posts={posts}/>
        </>
    );
}

export default Home;
