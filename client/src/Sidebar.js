import { useState, useEffect } from 'react';
import Modal from './Modal';
import AddFeedModal from './AddFeedModal';

function Sidebar({ selectedFolder, selectedFeed, allFeedsSelected, selectFolder, selectFeed, selectAllFeeds}) {
    return (
        <div className="sidebar">
            <Header
                selectedFolder={selectedFolder}
                selectedFeed={selectedFeed}
            />
            <Content 
                selectedFolder={selectedFolder}
                selectedFeed={selectedFeed}
                allFeedsSelected={allFeedsSelected}
                selectFolder={selectFolder}
                selectFeed={selectFeed} 
                selectAllFeeds={selectAllFeeds}
            />
        </div>
    );
}

function Header({ selectedFolder, selectedFeed}) {
    // const [feedInput, setFeedInput] = useState('');
    // const [folderInput, setFolderInput] = useState('');
    const [isAddFeedModalOpen, setAddFeedModalOpen] = useState(false);

//     function getSelectedFolder() {
//         if (selectedFolder) {
//             return selectedFolder;
//         } else if (selectedFeed) {
//             const subscription = subscriptions.find(sub => sub.id === selectedFeed);
//             return subscription.folder;
//         } else {
//             return '';
//         }
//     }

//     async function handleSubmit(e) {
//         e.preventDefault();
//         const res = await fetch('/subscriptions', {
//             method: "POST", 
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 feed: feedInput,
//                 folder: folderInput || getSelectedFolder() 
//             })
//         });
//         if (!res.ok) {
//             const json = await res.json();
//             console.log(json.message);
//         }
//         setFeedInput('');
//         setFolderInput('');
//         // updateSubscriptions();
//   }

    return (
        <div className='sidebar-header'>
            {/* <form method="post" onSubmit={handleSubmit}>
                <input
                    onChange={(e) => setFeedInput(e.target.value)}
                    value={feedInput} 
                    type="text" 
                    name="feed" 
                    className="input new-sub-input" 
                    placeholder="Enter RSS feed URL"
                />
                <input 
                    onChange={(e) => setFolderInput(e.target.value)} 
                    value={folderInput} 
                    type="text" 
                    name="folder" 
                    className="input folder-input" 
                    placeholder="Enter folder (optional)"
                />
                <button type="submit" style={{display: 'none'}}></button>
            </form> */}
            <button className="sidebar-btn" onClick={() => setAddFeedModalOpen(true)}>Add Feed</button>
            
            <Modal open={isAddFeedModalOpen} onClose={() => setAddFeedModalOpen(false)}>
                <AddFeedModal/>
            </Modal>
        </div>
    );
}

function Content({ selectedFolder, selectedFeed, allFeedsSelected, selectFolder, selectFeed, selectAllFeeds}) {
    const [subscriptions, setSubscriptions] = useState([]);

    useEffect(() => {
            updateSubscriptions();
        }, []);

    async function updateSubscriptions() {
        const res = await fetch('/subscriptions');
        const json = await res.json();
        setSubscriptions(json.subscriptions);
    }

    return (
        <div className="sidebar-content">
            <button className={`all-feeds sidebar-btn ${allFeedsSelected ? 'selected' : ''}`} onClick={() => selectAllFeeds()}>
                <img className="feed-icon" src="/all-feeds-icon.png"></img>
                <span className="feed-name">All Feeds</span>
            </button>
            <Folders 
                subscriptions={subscriptions} 
                selectedFolder={selectedFolder} 
                selectedFeed={selectedFeed} 
                selectFolder={selectFolder} 
                selectFeed={selectFeed}
            />
        </div>
    );
}

function Folders({ subscriptions, selectedFolder, selectedFeed, selectFolder, selectFeed}) {
    const groupedSubscriptions= {};
    subscriptions.forEach(subscription=> {
        if (!groupedSubscriptions[subscription.folder]) {
        groupedSubscriptions[subscription.folder] = [];
        }
        groupedSubscriptions[subscription.folder].push(subscription);
    });
    const folders = Object.values(groupedSubscriptions).map(subscriptions => {
        return <FeedFolder
            subscriptions={subscriptions}
            selectedFolder={selectedFolder}
            selectedFeed={selectedFeed}
            selectFolder={selectFolder}
            selectFeed={selectFeed}
        />
    });
    return (
        <ul>{folders}</ul>
    );
}

function FeedFolder({ subscriptions, selectedFolder, selectedFeed, selectFolder, selectFeed}) {
    const feedElements = subscriptions.map(subscription=> <SubscribedFeed subscription={subscription} selectedFeed={selectedFeed} selectFeed={selectFeed}/>); 
    const folderName = subscriptions[0].folder;
    return (
        <li key={folderName} className="folder">
            <button className={`sidebar-btn ${selectedFolder === folderName ? 'selected' : ''}`} onClick={() => selectFolder(folderName)}>{folderName}</button>
            <ul>{feedElements}</ul>
        </li>
    );
}

function SubscribedFeed({ subscription, selectedFeed, selectFeed}) {
    function handleImageError(e) {
        e.target.src = '/default-feed-icon.png';
    }
    return (
        <li key={subscription.id}>
            <button className={`feed sidebar-btn ${selectedFeed === subscription.id ? 'selected' : ''}`} onClick={() => selectFeed(subscription.id)}>
                <img className="feed-icon" onError={handleImageError} src={subscription.iconurl || ''}></img>
                <span className="feed-name">{subscription.title}</span>
            </button>
        </li>
    );
}

export default Sidebar;