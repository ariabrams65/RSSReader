import { useState } from 'react';
import Modal from './Modal';
import EditModal from './EditModal';


function SidebarButton({ classNames, selected, onClick, imageSrc, handleImageError, text, editable, subscription }) {
    const [editModalOpen, setEditModalOpen] = useState(false);
    
    function handleButtonClick(e) {
        setEditModalOpen(true);
        e.stopPropagation();
    }

    return (
        <div className={`${classNames ? classNames : ''} sidebar-btn ${selected ? 'selected' : ''}`} onClick={onClick}>
            {imageSrc !== undefined && <img className="feed-icon" onError={handleImageError} src={imageSrc}/>}
            <span className="feed-name">{text}</span>
            {editable && 
            <button className="edit-btn" onClick={handleButtonClick}>
                <img className="edit-icon" src="/images/edit-icon.png"/>
            </button>}
            <Modal open={editModalOpen} onClose={(() => setEditModalOpen(false))}>
                <EditModal name={text} subscription={subscription} onClose={() => setEditModalOpen(false)} />
            </Modal>
        </div>
    );
}

export default SidebarButton;