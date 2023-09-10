import ReactDom from 'react-dom';
import styles from './Modal.module.css';

function Modal({ open, children, onClose}) {
   
    function handleClick(e) {
        onClose();
        e.stopPropagation();
    }
    
    if (!open) return null;
    return ReactDom.createPortal(
        <>
        <div className={styles['overlay']} onClick={handleClick}/>
            <div className={styles['modal']} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>        
        </>,
        document.getElementById('portal')
    );
}

export default Modal;