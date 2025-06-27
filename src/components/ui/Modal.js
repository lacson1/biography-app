import React, { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    className = ''
}) => {
    const modalRef = useRef(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4'
    };

    if (!isOpen) return null;

    return ( <
        div className = "fixed inset-0 z-50 overflow-y-auto" >
        <
        div className = "flex min-h-screen items-center justify-center p-4" > { /* Backdrop */ } <
        div ref = { overlayRef }
        className = "fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick = { closeOnOverlayClick ? onClose : undefined }
        aria - hidden = "true" /
        >

        { /* Modal */ } <
        div ref = { modalRef }
        className = { `relative bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} ${className} transform transition-all duration-300 scale-100 opacity-100` }
        role = "dialog"
        aria - modal = "true"
        aria - labelledby = "modal-title"
        tabIndex = "-1" > { /* Header */ } {
            title && ( <
                    div className = "flex items-center justify-between p-6 border-b border-gray-200" >
                    <
                    h2 id = "modal-title"
                    className = "text-xl font-semibold text-gray-900" > { title } <
                    /h2> {
                    showCloseButton && ( <
                        button onClick = { onClose }
                        className = "p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        aria - label = "Close modal" >
                        <
                        X className = "h-5 w-5" / >
                        <
                        /button>
                    )
                } <
                /div>
        )
    }

    { /* Content */ } <
    div className = "p-6" > { children } <
        /div> < /
        div > <
        /div> < /
        div >
);
};

export default Modal;