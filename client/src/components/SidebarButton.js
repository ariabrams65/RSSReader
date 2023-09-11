import { useState } from 'react';
import Modal from '../modals/Modal';
import EditModal from '../modals/EditModal';
import styles from './SidebarButton.module.css';


function SidebarButton({ className, selected, onClick, isStaticIcon, iconSrc, onIconClick, iconRotated, handleImageError, text, editable, subscription }) {
    const [editModalOpen, setEditModalOpen] = useState(false);
    
    function handleIconClick(e) {
        onIconClick(); 
        e.stopPropagation();
    }
    
    function handleEditButtonClick(e) {
        setEditModalOpen(true);
        e.stopPropagation();
    }

    return (
        <div className={`${className ? className : ''} ${styles['sidebar-btn']} ${selected ? styles['selected'] : ''}`} onClick={onClick}>
            {iconSrc!== undefined && <img 
                className={`${styles['btn-icon']} ${iconRotated ? styles['icon-rotated'] : ''} ${isStaticIcon ? 'static-icon' : ''}`} 
                onError={handleImageError} src={iconSrc} 
                {...(onIconClick && {onClick: handleIconClick})}
            />}
                
            <span className={styles['btn-text']}>{text}</span>
            {editable && 
            <button className={styles['edit-btn']} onClick={handleEditButtonClick}>
                <img className={`${styles['edit-icon']} static-icon`} src="/images/edit-icon.png"/>
            </button>}
            <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                <EditModal name={text} subscription={subscription} onClose={() => setEditModalOpen(false)} />
            </Modal>
        </div>
    );
}

export default SidebarButton;