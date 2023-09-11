import { useState, useEffect } from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { useSelection } from '../context/SelectionContext';
import SidebarButton from './SidebarButton';
import styles from './SidebarHeader.module.css';

function SidebarHeader() {
    const [isAddFeedOpen, setAddFeedOpen] = useState(false);

    return (
        <div className={`${styles['sidebar-header']} ${isAddFeedOpen ? styles['open'] : ''}`}>
            <SidebarButton
                className={styles['add-feed-btn']}
                selected={false}
                iconSrc={'/images/add-feed-icon.png'}
                isStaticIcon={true}
                onClick={() => setAddFeedOpen(prev => !prev)}
                text={'Add Feed'}
                editable={false}
            />
            <FeedInput open={isAddFeedOpen}/>
        </div>
    );
}

function FeedInput({ open }) {
    const { selectedFolder, selectedFeed, selectFeed } = useSelection();
    const { updateSubscriptions } = useSubscriptions();
    const [feedInput, setFeedInput] = useState('');
    const [folderInput, setFolderInput] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFolderInput(getCurrentFolder());
    }, [selectedFolder, selectedFeed]);

    function getCurrentFolder() {
        return selectedFolder || selectedFeed?.folder || '';
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (loading) {
            console.log('loading');
            return;
        }
        setLoading(true);
        const res = await fetch('/subscriptions', {
            method: "POST", 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                feed: feedInput,
                folder: folderInput 
            })
        });
        const json = await res.json();
        setLoading(false);
        if (!res.ok) {
            console.log(json.message);
            return;
        }
        const subscription = json.subscription;
        
        setFeedInput('');
        setFolderInput('');
        updateSubscriptions();
        selectFeed(subscription);
    }

    if (!open) return null;
    return (
        <form className={styles['form']} onSubmit={handleSubmit}>
            <label htmlFor="new-sub-input">Feed</label>
            <input
                id="new-sub-input"
                onChange={(e) => setFeedInput(e.target.value)}
                value={feedInput} 
                type="text" 
                name="feed" 
                className={`${styles['new-sub-input']} ${styles['input']}`}
                placeholder="Enter RSS feed URL"
            />
            <label htmlFor="folder-input">Folder</label>
            <input 
                onChange={(e) => setFolderInput(e.target.value)} 
                value={folderInput} 
                type="text" 
                name="folder" 
                className={`${styles['folder-input']} ${styles['input']}`}
                placeholder="Enter folder (optional)"
            />
            <button type="submit" style={{display: 'none'}}></button>
        </form>
    );
}

export default SidebarHeader;