import { useState, useEffect } from 'react';
import Modal from './Modal';
import EditModal from './EditModal';
import { useSubscriptions } from './SubscriptionContext';
import { useSelection } from './SelectionContext';

function Sidebar() {
    const { updateSubscriptions } = useSubscriptions();

    useEffect(() => {
            updateSubscriptions();
        }, []);

    return (
        <div className="sidebar">
            <Header/>
            <Content/>
        </div>
    );
}

function Header() {
    const [isAddFeedOpen, setAddFeedOpen] = useState(false);

    return (
        <div className='sidebar-header'>
            <SidebarButton
                selected={false}
                onClick={() => setAddFeedOpen(prev => !prev)}
                text={'Add Feed'}
                editable={false}
            />
            <FeedInput open={isAddFeedOpen}/>
        </div>
    );
}

function FeedInput({ open }) {
    const [feedInput, setFeedInput] = useState('');
    const [folderInput, setFolderInput] = useState('');
    const { selectedFolder, selectedFeed } = useSelection();
    const { subscriptions, updateSubscriptions } = useSubscriptions();

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

function Content() {
    const { allFeedsSelected, selectAllFeeds } = useSelection();
    return (
        <div className="sidebar-content">
            <SidebarButton
                classNames={'all-feeds'}
                selected={allFeedsSelected}
                onClick={selectAllFeeds}
                imageSrc={'/all-feeds-icon.png'}
                text={'All Feeds'}
                editable={false}
            />
            <Folders/>
        </div>
    );
}

function Folders() {
    const { subscriptions } = useSubscriptions();
    const groupedSubscriptions= {};
    subscriptions.forEach(subscription => {
        if (!groupedSubscriptions[subscription.folder]) {
        groupedSubscriptions[subscription.folder] = [];
        }
        groupedSubscriptions[subscription.folder].push(subscription);
    });
    const folders = Object.values(groupedSubscriptions).map(group => {
        return <FeedFolder subscriptions={group}/>
    });
    return (
        <ul>{folders}</ul>
    );
}

function FeedFolder({ subscriptions }) {
    const { selectedFolder, selectFolder } = useSelection();

    const feedElements = subscriptions.map(subscription => <SubscribedFeed subscription={subscription}/>); 
    const folderName = subscriptions[0].folder;
    return (
        <li key={folderName} className="folder">
            <SidebarButton
                selected={selectedFolder === folderName}
                onClick={() => selectFolder(folderName)}
                text={folderName}
                editable={true}
            />
            <ul>{feedElements}</ul>
        </li>
    );
}

function SubscribedFeed({ subscription }) {
    const { selectedFeed, selectFeed } = useSelection();
    return (
        <li key={subscription.id}>
            <SidebarButton
                selected={selectedFeed === subscription.id}
                onClick={() => selectFeed(subscription.id)}
                imageSrc={subscription.iconurl || ''}
                handleImageError={(e) => e.target.src = '/default-feed-icon.png'}
                text={subscription.title}
                editable={true}
                id={subscription.id}
            />
        </li>
    );
}

function SidebarButton({ classNames, selected, onClick, imageSrc, handleImageError, text, editable, id }) {
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
                <EditModal name={text} id={id} onClose={() => setEditModalOpen(false)} />
            </Modal>
        </div>
    );
}

export default Sidebar;