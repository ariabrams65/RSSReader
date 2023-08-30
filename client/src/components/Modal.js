import ReactDom from 'react-dom';

function Modal({ open, children, onClose}) {
   
    function handleClick(e) {
        onClose();
        e.stopPropagation();
    }
    
    if (!open) return null;
    return ReactDom.createPortal(
        <>
        <div className='overlay' onClick={handleClick}/>
            <div className='modal' onClick={(e) => e.stopPropagation()}>
                {children}
            </div>        
        </>,
        document.getElementById('portal')
    );
}

export default Modal;