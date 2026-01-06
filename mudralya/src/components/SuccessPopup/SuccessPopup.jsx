import React, { useEffect } from 'react';
import './SuccessPopup.css';

const SuccessPopup = ({ message, onClose }) => {

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="success-popup-overlay" onClick={onClose}>
            <div className="success-popup" onClick={e => e.stopPropagation()}>
                <div className="success-popup-icon">
                    <i className="fas fa-check"></i>
                </div>
                <div className="success-popup-message">
                    {message}
                </div>
                <button className="success-popup-btn" onClick={onClose}>
                    OK
                </button>
            </div>
        </div>
    );
};

export default SuccessPopup;




