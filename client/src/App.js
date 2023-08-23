import './App.css';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import { useState } from 'react';


const POSTS = [
  {id: 1, title: 'title1', feedtitle: 'feedtitle1', url: 'url1', commentsurl: 'comments1', mediaurl: 'https://preview.redd.it/6frxhaztwwib1.jpg?width=320&crop=smart&auto=webp&s=8fcf3863ae15290a868cb39a8646e610d10ca716', date: '5h'},
  {id: 2, title: 'title2', feedtitle: 'feedtitle2' ,url: 'url2', commentsurl: 'comments2', mediaurl: 'https://preview.redd.it/6frxhaztwwib1.jpg?width=320&crop=smart&auto=webp&s=8fcf3863ae15290a868cb39a8646e610d10ca716', date: '5h'},
  {id: 3, title: 'title3', feedtitle: 'feedtitle3', url: 'url3', commentsurl: 'comments3', mediaurl: 'https://preview.redd.it/6frxhaztwwib1.jpg?width=320&crop=smart&auto=webp&s=8fcf3863ae15290a868cb39a8646e610d10ca716', date: '5h'},
  {id: 4, title: 'title4', feedtitle: 'feedtitle4', url: 'url4', commentsurl: 'comments4', mediaurl: 'https://preview.redd.it/6frxhaztwwib1.jpg?width=320&crop=smart&auto=webp&s=8fcf3863ae15290a868cb39a8646e610d10ca716', date: '5h'},
  {id: 5, title: 'title5', feedtitle: 'feedtitle5', url: 'url5', commentsurl: 'comments5', mediaurl: 'https://preview.redd.it/6frxhaztwwib1.jpg?width=320&crop=smart&auto=webp&s=8fcf3863ae15290a868cb39a8646e610d10ca716', date: '5h'},
];

function App() {
  const [posts, setPost] = useState(POSTS);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [allFeedsSelected, setAllFeedsSelected] = useState(true);

  function selectFolder(folderName) {
    setSelectedFolder(folderName);
    setSelectedFeed(null);
    setAllFeedsSelected(false);
  }
  
  function selectFeed(feedid) {
    setSelectedFeed(feedid);
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

export default App;
