import { useState } from 'react';
import { useSubscriptions } from '../context/SubscriptionContext';

function EditModal({ name, id, onClose}) {
    const [nameInput, setNameInput] = useState(name);
    const { updateSubscriptions } = useSubscriptions();
    
    const isFeed = (id !== undefined);
    
    async function handleSubmit(e) {
        e.preventDefault();
        if (isFeed) {
            await fetch('/subscriptions/rename', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscriptionid: id,
                    newName: nameInput
                })
            });
        } else {
            await fetch('/subscriptions/rename-folder', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    oldName: name,
                    newName: nameInput
                })           
            });
        } 
        updateSubscriptions();
        onClose();
    }
    
    async function handleDelete(e) {
        e.preventDefault();
        if (isFeed) {
            await fetch(`/subscriptions?subscriptionid=${id}`, {
                method: 'DELETE'
            });
        } else {
            //todo
            //await fetch (`/subscriptions`)
        }
        updateSubscriptions();
        onClose();
    }
    
    return (
        <form onSubmit={handleSubmit}>
            <input 
                onChange={(e) => setNameInput(e.target.value)} 
                value={nameInput} 
                type="text" 
                className="input" 
            />
            <div>
                <button onClick={handleDelete}>Unsubscribe</button> 
                <button type="submit">Save</button>
            </div>
        </form>
    );
}

export default EditModal;