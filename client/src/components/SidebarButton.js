import { useState } from 'react';
import Modal from '../modals/Modal';
import EditModal from '../modals/EditModal';
import styles from './SidebarButton.module.css';


function SidebarButton({ className, selected, onClick, imageSrc, handleImageError, text, editable, subscription }) {
    const [editModalOpen, setEditModalOpen] = useState(false);
    
    function handleButtonClick(e) {
        setEditModalOpen(true);
        e.stopPropagation();
    }

    return (
        <div className={`${className ? className : ''} ${styles['sidebar-btn']} ${selected ? styles['selected'] : ''}`} onClick={onClick}>
            {imageSrc !== undefined && <img className={styles['btn-icon']} onError={handleImageError} src={imageSrc}/>}
            <span className={styles['btn-text']}>{text}</span>
            {editable && 
            <button className={styles['edit-btn']} onClick={handleButtonClick}>
                <img className={styles['edit-icon']} src="/images/edit-icon.png"/>
            </button>}
            <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                <EditModal name={text} subscription={subscription} onClose={() => setEditModalOpen(false)} />
            </Modal>
        </div>
    );
}

export default SidebarButton;