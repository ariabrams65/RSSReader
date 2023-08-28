import ReactDom from 'react-dom';

function Modal({ open, children, onClose}) {
    if (!open) return null;
    return ReactDom.createPortal(
        <>
        <div className='overlay'/>
            <div className='modal'>
                <button onClick={onClose}>Close</button>       
                {children}
            </div>        
        </>,
        document.getElementById('portal')
    );
}

export default Modal;