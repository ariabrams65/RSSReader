import { useSubscriptions } from '../context/SubscriptionContext';
import { useSelection } from '../context/SelectionContext';
import SidebarButton from './SidebarButton';

function SidebarContent() {
    const { allFeedsSelected, selectAllFeeds } = useSelection();
    return (
        <div className="sidebar-content">
            <SidebarButton
                classNames={'all-feeds'}
                selected={allFeedsSelected}
                onClick={selectAllFeeds}
                imageSrc={'/images/all-feeds-icon.png'}
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
                handleImageError={(e) => e.target.src = '/images/default-feed-icon.png'}
                text={subscription.name}
                editable={true}
                id={subscription.id}
            />
        </li>
    );
}

export default SidebarContent;