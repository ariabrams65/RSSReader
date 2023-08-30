import { useState, useEffect } from 'react';
import Modal from './Modal';
import EditModal from './EditModal';

function Sidebar({ selectedFolder, selectedFeed, allFeedsSelected, selectFolder, selectFeed, selectAllFeeds}) {
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
        <div className="sidebar">
            <Header
                selectedFolder={selectedFolder}
                selectedFeed={selectedFeed}
                subscriptions={subscriptions}
                updateSubscriptions={updateSubscriptions}
            />
            <Content 
                selectedFolder={selectedFolder}
                selectedFeed={selectedFeed}
                allFeedsSelected={allFeedsSelected}
                selectFolder={selectFolder}
                selectFeed={selectFeed} 
                selectAllFeeds={selectAllFeeds}
                subscriptions={subscriptions}
                updateSubscriptions={updateSubscriptions}
            />
        </div>
    );
}

function Header({ selectedFolder, selectedFeed, subscriptions, updateSubscriptions }) {
    const [isAddFeedOpen, setAddFeedOpen] = useState(false);

    function getSelectedFolder() {
        if (selectedFolder) {
            return selectedFolder;
        } else if (selectedFeed) {
            const subscription = subscriptions.find(sub => sub.id === selectedFeed);
            return subscription.folder;
        } else {
            return '';
        }
    }

    return (
        <div className='sidebar-header'>
            {/* <button className="sidebar-btn" onClick={() => setAddFeedOpen((prev => !prev))}>Add Feed</button> */}
            <SidebarButton
                selected={false}
                onClick={() => setAddFeedOpen(prev => !prev)}
                text={'Add Feed'}
                editable={false}
            />
            <FeedInput 
                open={isAddFeedOpen} 
                getSelectedFolder={getSelectedFolder}
                updateSubscriptions={updateSubscriptions}     
            />
        </div>
    );
}

function FeedInput({ open, getSelectedFolder, updateSubscriptions }) {
    const [feedInput, setFeedInput] = useState('');
    const [folderInput, setFolderInput] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        const res = await fetch('/subscriptions', {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                feed: feedInput,
                folder: folderInput || getSelectedFolder() 
            })
        });
        if (!res.ok) {
            const json = await res.json();
            console.log(json.message);
        }
        setFeedInput('');
        setFolderInput('');
        updateSubscriptions();
  }
    if (!open) return null;
    return (
        <form onSubmit={handleSubmit}>
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
        </form>
    );
}

function Content({ selectedFolder, selectedFeed, allFeedsSelected, selectFolder, selectFeed, selectAllFeeds, subscriptions, updateSubscriptions}) {
    return (
        <div className="sidebar-content">
            {/* <button className={`all-feeds sidebar-btn ${allFeedsSelected ? 'selected' : ''}`} onClick={() => selectAllFeeds()}>
                <img className="feed-icon" src="/all-feeds-icon.png"></img>
                <span className="feed-name">All Feeds</span>
            </button> */}
            <SidebarButton
                classNames={'all-feeds'}
                selected={allFeedsSelected}
                onClick={selectAllFeeds}
                imageSrc={'/all-feeds-icon.png'}
                text={'All Feeds'}
                editable={false}
            />
            <Folders 
                subscriptions={subscriptions} 
                updateSubscriptions={updateSubscriptions}
                selectedFolder={selectedFolder} 
                selectedFeed={selectedFeed} 
                selectFolder={selectFolder} 
                selectFeed={selectFeed}
            />
        </div>
    );
}

function Folders({ subscriptions, selectedFolder, selectedFeed, selectFolder, selectFeed, updateSubscriptions}) {
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
            updateSubscriptions={updateSubscriptions}
        />
    });
    return (
        <ul>{folders}</ul>
    );
}

function FeedFolder({ subscriptions, selectedFolder, selectedFeed, selectFolder, selectFeed, updateSubscriptions}) {
    const feedElements = subscriptions.map(subscription=> <SubscribedFeed subscription={subscription} selectedFeed={selectedFeed} selectFeed={selectFeed} updateSubscriptions={updateSubscriptions}/>); 
    const folderName = subscriptions[0].folder;
    return (
        <li key={folderName} className="folder">
            <SidebarButton
                selected={selectedFolder === folderName}
                onClick={() => selectFolder(folderName)}
                text={folderName}
                editable={true}
                updateSubscriptions={updateSubscriptions}
            />
            {/* <button className={`sidebar-btn ${selectedFolder === folderName ? 'selected' : ''}`} onClick={() => selectFolder(folderName)}>{folderName}</button> */}
            <ul>{feedElements}</ul>
        </li>
    );
}

function SubscribedFeed({ subscription, selectedFeed, selectFeed, updateSubscriptions}) {
    return (
        <li key={subscription.id}>
            {/* <button className={`feed sidebar-btn ${selectedFeed === subscription.id ? 'selected' : ''}`} onClick={() => selectFeed(subscription.id)}>
                <img className="feed-icon" onError={handleImageError} src={subscription.iconurl || ''}></img>
                <span className="feed-name">{subscription.title}</span>
            </button> */}
            <SidebarButton
                selected={selectedFeed === subscription.id}
                onClick={() => selectFeed(subscription.id)}
                imageSrc={subscription.iconurl || ''}
                handleImageError={(e) => e.target.src = '/default-feed-icon.png'}
                text={subscription.title}
                editable={true}
                id={subscription.id}
                updateSubscriptions={updateSubscriptions}
            />
        </li>
    );
}

function SidebarButton({ classNames, selected, onClick, imageSrc, handleImageError, text, editable, id, updateSubscriptions}) {
    const [editModalOpen, setEditModalOpen] = useState(false);
    
    function handleButtonClick(e) {
        setEditModalOpen(true);
        e.stopPropagation();
    }

    return (
        <div className={`${classNames ? classNames : ''} sidebar-btn ${selected ? 'selected' : ''}`} onClick={onClick}>
            {imageSrc !== undefined && <img className="feed-icon" onError={handleImageError} src={imageSrc}/>}
            <span className="feed-name">{text}</span>
            {editable && 
            <button className="edit-btn" onClick={handleButtonClick}>
                <img className="edit-icon" src="/edit-icon.png"/>
            </button>}
            <Modal open={editModalOpen} onClose={(() => setEditModalOpen(false))}>
                <EditModal name={text} id={id} updateSubscriptions={updateSubscriptions} onClose={() => setEditModalOpen(false)} />
            </Modal>
        </div>
    );
}

export default Sidebar;