import { useSubscriptions } from '../context/SubscriptionContext';
import { useSelection } from '../context/SelectionContext';
import { useEffect, useState } from 'react';
import SidebarButton from './SidebarButton';
import styles from './SidebarContent.module.css';

function SidebarContent() {
    const { allFeedsSelected, selectAllFeeds } = useSelection();
    const { updateSubscriptions } = useSubscriptions();

    useEffect(() => {
            updateSubscriptions();
        }, []);

    return (
        <div className={styles['sidebar-content']}>
            <SidebarButton
                className={styles['all-feeds']}
                selected={allFeedsSelected}
                onClick={selectAllFeeds}
                iconSrc={'/images/all-feeds-icon.png'}
                isStaticIcon={true}
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
    let sortedFolders = [];
    for (const folder in groupedSubscriptions) {
        sortedFolders.push({
            name: folder, 
            subscriptions: groupedSubscriptions[folder]
        });
    }
    sortedFolders.sort((a, b) => a.name.localeCompare(b.name));
    const folders = sortedFolders.map(folder => <FeedFolder key={folder.name} folder={folder}/>);
    
    return (
        <ul>{folders}</ul>
    );
}

function FeedFolder({ folder }) {
    const { selectedFolder, selectFolder } = useSelection();
    const [ open, setOpen ] = useState(false);

    const feedElements = folder.subscriptions.map(subscription => <SubscribedFeed key={subscription.id} subscription={subscription}/>); 
    
    if (folder.name === '') {
        return (
            <li className={styles['folder']}>
                <SidebarButton
                    selected={selectedFolder === folder.name}
                    onClick={() => selectFolder(folder.name)}
                    text={'feeds'}
                />
                <ul>{feedElements}</ul>
            </li>
        );
    }
    return (
        <li className={styles['folder']}>
            <SidebarButton
                selected={selectedFolder === folder.name}
                onClick={() => selectFolder(folder.name)}
                text={folder.name}
                editable={true}
                iconSrc={'/images/chevron-icon.png'}
                onIconClick={() => setOpen(open => !open)}
                iconRotated={!open}
                isStaticIcon={true}
            />
            {open && <ul>{feedElements}</ul>}
        </li>
    );
}

function SubscribedFeed({ subscription }) {
    const { selectedFeed, selectFeed } = useSelection();
    return (
        <li>
            <SidebarButton
                className={styles['subscription']}
                selected={selectedFeed?.id === subscription.id}
                onClick={() => selectFeed(subscription)}
                iconSrc={subscription.iconurl || ''}
                handleImageError={(e) => {
                    e.target.src = '/images/default-feed-icon.png';
                    e.target.classList.add('static-icon')
                }}
                text={subscription.name}
                editable={true}
                subscription={subscription}
            />
        </li>
    );
}

export default SidebarContent;