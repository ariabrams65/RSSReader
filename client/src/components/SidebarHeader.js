import { useState } from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { useSelection } from '../context/SelectionContext';
import SidebarButton from './SidebarButton';

function SidebarHeader() {
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

export default SidebarHeader;