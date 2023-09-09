import SidebarButton from './SidebarButton';
import { useState } from 'react';

function SettingsModal() {
    const [selectedSetting, setSelectedSetting] = useState('General');
    
    function getSettingComponent() {
        if (selectedSetting === 'General') {
            return <GeneralSettings/>;
        } else if (selectedSetting === 'Account') {
            return <AccountSettings/>;
        } else if (selectedSetting === 'Import/Export') {
            return <ImportExportSettings/>;
        }
    }
    
    return (
        <div className="settings-modal">
            <div className="settings-title">
                <h2>Settings</h2>
            </div>
            <div className="settings-container">
                <ul className="settings-sidebar">
                    <li><SidebarButton
                        text={'General'}
                        selected={selectedSetting === 'General'}
                        onClick={() => setSelectedSetting('General')}
                     /></li> 
                    <li><SidebarButton
                        text={'Account'}
                        selected={selectedSetting === 'Account'}
                        onClick={() => setSelectedSetting('Account')}
                    /></li>
                    <li><SidebarButton 
                        text={'Import/Export'}
                        selected={selectedSetting === 'Import/Export'}
                        onClick={() => setSelectedSetting('Import/Export')}
                    /> </li>
                </ul> 
                <div className="settings-content">
                    {getSettingComponent()}
                </div>
            </div>
        </div>
    );
    
}

function GeneralSettings() {
    return (
        'General'
    );
}

function AccountSettings() {
    return (
        'Account'
    );
}

function ImportExportSettings() {
    const [fileUploadText, setFileUploadText] = useState('Select file');
    
    function handleFileSelect(e) {
        if (e.target.files.length === 0) {
            return;
        }
        const fileName = e.target.files[0].name;
        setFileUploadText(fileName);
    }

    return (
        <>
            <Setting name={'import'}>
                <form method="POST" enctype="multipart/form-data" action="/subscriptions/opml">
                    <label className="settings-btn">
                        <input onChange={handleFileSelect} name="opml" type="file" style={{display: 'none'}}/>
                        {fileUploadText}
                    </label>
                    <button className="settings-btn">Upload</button>
                </form>
            </Setting>
            <Setting name={'test title'}>
                test
            </Setting>
        </>
    );
}

function Setting({ name, children }) {  
    return (
        <div className="setting">
            <h3 className="setting-name">{name}</h3>
            {children}
        </div>
    );
}

export default SettingsModal;