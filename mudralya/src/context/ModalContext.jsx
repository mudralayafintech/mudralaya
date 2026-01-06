import React, { createContext, useState, useContext, useEffect } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [isJoinUsModalOpen, setIsJoinUsModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('');
    const [modalData, setModalData] = useState({});
    const [user, setUser] = useState(null);

    const openJoinUsModal = (plan = '', data = {}) => {
        setSelectedPlan(plan);
        setModalData(data);
        setIsJoinUsModalOpen(true);
    };

    const closeJoinUsModal = () => {
        setIsJoinUsModalOpen(false);
        setSelectedPlan('');
        setModalData({});
    };

    const openLoginModal = () => {
        setIsLoginModalOpen(true);
    };

    const closeLoginModal = () => {
        setIsLoginModalOpen(false);
    };

    // Check for user in localStorage on mount (simple persistence)
    useEffect(() => {
        const storedUser = localStorage.getItem('mudralaya_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('mudralaya_user');
            }
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('mudralaya_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('mudralaya_user');
    };

    return (
        <ModalContext.Provider
            value={{
                isJoinUsModalOpen,
                selectedPlan,
                modalData,
                openJoinUsModal,
                closeJoinUsModal,
                isLoginModalOpen,
                openLoginModal,
                closeLoginModal,
                user,
                login,
                logout
            }}
        >
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
