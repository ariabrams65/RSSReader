import './App.css';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import { useState, useEffect } from 'react';


function App() {
    const [posts, setPosts] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [allFeedsSelected, setAllFeedsSelected] = useState(true);
  
    useEffect(() => {
        updatePosts({allFeeds: true});
    },[]);

    async function updatePosts(params) {
        let urlParams;
        if (params.folder) {
            urlParams = `folder=${params.folder}&`;
        } else if (params.subscriptionid) {
            urlParams = `subscriptionid=${params.subscriptionid}&`;
        } else {
            urlParams = `allFeeds=true&`;
        }
        urlParams += 'limit=10';
        const res = await fetch(`/get-feed?${urlParams}`); 
        const json = await res.json();
        setPosts(json.posts);
    }
  
    function selectFolder(folderName) {
        setSelectedFolder(folderName);
        setSelectedFeed(null);
        setAllFeedsSelected(false);
        updatePosts({folder: folderName});  
    }
  
    function selectFeed(subscriptionid) {
        setSelectedFeed(subscriptionid);
        setSelectedFolder(null);
        setAllFeedsSelected(false);
        updatePosts({subscriptionid: subscriptionid});  
    }
  
    function selectAllFeeds() {
        setAllFeedsSelected(true);
        setSelectedFeed(null);
        setSelectedFolder(null);
        updatePosts({allFeeds: true});  
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

export default App;
