import { createContext, useState, useContext } from 'react';

const SelectionContext = createContext(null);

function useSelection() {
    return useContext(SelectionContext);
}

function SelectionProvider({ children }) {
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedFeed, setSelectedFeed] = useState(null);
    const [allFeedsSelected, setAllFeedsSelected] = useState(true);

    function selectFolder(folderName) {
        setSelectedFolder(folderName);
        setSelectedFeed(null);
        setAllFeedsSelected(false);
    }
  
    function selectFeed(subscription) {
        setSelectedFeed(subscription);
        setSelectedFolder(null);
        setAllFeedsSelected(false);
    }
  
    function selectAllFeeds() {
        setAllFeedsSelected(true);
        setSelectedFeed(null);
        setSelectedFolder(null);
    }
    
    const value = {
        selectedFolder,
        selectedFeed,
        allFeedsSelected,
        selectFolder,
        selectFeed,
        selectAllFeeds
    };
    
    return (
        <SelectionContext.Provider value={value}>
            {children}
        </SelectionContext.Provider>
    );
    
}

export { useSelection, SelectionProvider }