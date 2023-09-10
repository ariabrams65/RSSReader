import SidebarButton from '../components/SidebarButton';
import { useState } from 'react';
import styles from './SettingsModal.module.css';

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
        <div className={styles['settings-modal']}>
            <div className={styles['settings-title']}>
                <h2>Settings</h2>
            </div>
            <div className={styles['settings-container']}>
                <ul className={styles['settings-sidebar']}>
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
                <div className={styles['settings-content']}>
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
                    <label className={styles['settings-btn']}>
                        <input onChange={handleFileSelect} name="opml" type="file" style={{display: 'none'}}/>
                        {fileUploadText}
                    </label>
                    <button className={styles['settings-btn']}>Upload</button>
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
        <div className={styles['setting']}>
            <h3 className={styles['setting-name']}>{name}</h3>
            {children}
        </div>
    );
}

export default SettingsModal;