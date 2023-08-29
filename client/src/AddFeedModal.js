import { useState } from 'react';

function AddFeedModal() {
    const [feedInput, setFeedInput] = useState('');
    const [folderInput, setFolderInput] = useState('');
    return (
       <>
            {/* <form method="post" onSubmit={handleSubmit}> */}
            <form method="post">
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
            
       </> 
    );
}

export default AddFeedModal;