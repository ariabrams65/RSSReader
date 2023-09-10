import { useState } from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';
import { useSelection } from '../context/SelectionContext';
import styles from './EditModal.module.css';

function EditModal({ name, subscription, onClose}) {
    const [nameInput, setNameInput] = useState(name);
    const { updateSubscriptions } = useSubscriptions();
    const { selectedFolder, selectedFeed, selectAllFeeds} = useSelection();
    
    const isFeed = (subscription !== undefined);
    
    async function sendPatch(url, body) {
        await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
    }
    
    async function handleSubmit(e) {
        e.preventDefault();
        
        if (isFeed) {
            await sendPatch('/subscriptions/rename', {
                subscriptionid: subscription.id,
                newName: nameInput
            });
        } else {
            await sendPatch('/subscriptions/rename/folder', {
                oldName: name,
                newName: nameInput
            });
        }
        updateSubscriptions();
        onClose();
    }
    
    function selectionExists(currentSubscriptions) {
        return (
            currentSubscriptions.some(sub => sub.folder === selectedFolder) ||
            currentSubscriptions.some(sub => sub.id === selectedFeed?.id)
        );
    }
    
    async function handleDelete(e) {
        e.preventDefault();
        if (isFeed) {
            if (!window.confirm(`Are you sure you want to unsubscribe from "${name}"?`)) return;
            await fetch(`/subscriptions?subscriptionid=${subscription.id}`, {
                method: 'DELETE'
            });
        } else {
            if (!window.confirm(`Are you sure you want to unsubscribe from all feeds in "${name}"?`)) return;
            await fetch(`/subscriptions/folder?folder=${name}`, {
                method: 'DELETE'
            });
        }
        const currentSubscriptions = await updateSubscriptions();
        if (!selectionExists(currentSubscriptions)) {
            selectAllFeeds();
        }
        onClose();
    }
    
    return (
        <form className={styles['edit-modal']} onSubmit={handleSubmit}>
            <input 
                className={styles['rename-input']}
                onChange={(e) => setNameInput(e.target.value)} 
                value={nameInput} 
                type="text" 
            />
            <div className={styles['footer']}>
                <button className={`${styles['button']} ${styles['delete-btn']}`} type="button" onClick={handleDelete}>
                    {isFeed ? 'Unsubscribe' : 'Delete'}
                </button> 
                <button className={styles['button']}>Cancel</button>
                <button className={`${styles['button']} ${styles['save-btn']}`} type="submit">Save</button>
            </div>
        </form>
    );
}

export default EditModal;