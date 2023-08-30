import { useState } from 'react';

function EditModal({ name, id, updateSubscriptions, onClose}) {
    const [nameInput, setNameInput] = useState(name);
    
    function handleSubmit() {
        
        return null;
    }
    
    async function handleDelete(e) {
        e.preventDefault();
        await fetch(`/subscriptions?subscriptionid=${id}`, {
            method: 'DELETE'
        });
        updateSubscriptions();
        onClose();
    }
    
    return (
       <>
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
            
       </> 
    );
}

export default EditModal;