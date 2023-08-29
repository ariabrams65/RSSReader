import ReactDom from 'react-dom';

function Modal({ open, children, onClose}) {
    if (!open) return null;
    return ReactDom.createPortal(
        <>
        <div className='overlay' onClick={onClose}/>
            <div className='modal'>
                {children}
            </div>        
        </>,
        document.getElementById('portal')
    );
}

export default Modal;