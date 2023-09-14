import SidebarButton from '../components/SidebarButton';
import { useState, useRef } from 'react';
import styles from './SettingsModal.module.css';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

    async function handleLogout() {
        await fetch('logout', {method: 'DELETE'});
        navigate('/login');
    } 
    
    return (
        <Setting name={'Logout'}>
            <button className={styles['settings-btn']} onClick={handleLogout}>Logout</button>
        </Setting>
    );
}

function ImportExportSettings() {
    const [fileUploadText, setFileUploadText] = useState('Select file');
    const inputRef = useRef();
    
    function handleFileSelect(e) {
        if (e.target.files.length === 0) {
            setFileUploadText('Select file');
            return;
        }
        const fileName = e.target.files[0].name;
        setFileUploadText(fileName);
    }
    
    async function handleFileSubmit(e) {
        e.preventDefault();
        
        if (inputRef.current.files.length === 0) {
            console.log('No file selected');
            return
        }
       
        const formData = new FormData();
        formData.append('opml', inputRef.current.files[0]);

        const res = await fetch('/subscriptions/opml', {
            method: 'POST',
            body: formData 
        });
        if (!res.ok) {
            console.log('Import failed');
        } else {
            inputRef.current.value = '';
            setFileUploadText('Select file');
            window.alert('Subscriptions will be uploaded shortly. Refresh in a little bit');
        }
    }

    return (
        <>
            <Setting name={'import'}>
                <form onSubmit={handleFileSubmit} method="POST" encType="multipart/form-data" action="/subscriptions/opml">
                    <label className={styles['settings-btn']}>
                        <input ref={inputRef} onChange={handleFileSelect} name="opml" type="file" style={{display: 'none'}}/>
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