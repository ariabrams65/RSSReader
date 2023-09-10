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
    const [ open, setOpen ] = useState(false);

    const feedElements = subscriptions.map(subscription => <SubscribedFeed subscription={subscription}/>); 
    const folderName = subscriptions[0].folder;
    return (
        <li key={folderName} className={styles['folder']}>
            <SidebarButton
                selected={selectedFolder === folderName}
                onClick={() => selectFolder(folderName)}
                text={folderName}
                editable={true}
                iconSrc={'/images/folder-dropdown-icon.png'}
                onIconClick={() => setOpen(open => !open)}
                iconRotated={!open}
            />
            {open && <ul>{feedElements}</ul>}
        </li>
    );
}

function SubscribedFeed({ subscription }) {
    const { selectedFeed, selectFeed } = useSelection();
    return (
        <li key={subscription.id}>
            <SidebarButton
                className={styles['subscription']}
                selected={selectedFeed?.id === subscription.id}
                onClick={() => selectFeed(subscription)}
                iconSrc={subscription.iconurl || ''}
                handleImageError={(e) => e.target.src = '/images/default-feed-icon.png'}
                text={subscription.name}
                editable={true}
                subscription={subscription}
            />
        </li>
    );
}

export default SidebarContent;