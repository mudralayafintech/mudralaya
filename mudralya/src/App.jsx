import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header.jsx';
import Footer from './components/Footer/Footer.jsx';
import JoinUsModal from './components/JoinUsModal/JoinUsModal.jsx';
import LoginModal from './components/Auth/LoginModal.jsx';
import { ModalProvider, useModal } from './context/ModalContext.jsx';
import './App.css';

import ScrollToTop from './components/Common/ScrollToTop.jsx';

// Lazy load components for code splitting
const Home = lazy(() => import('./components/Home/Home.jsx'));
const AboutUs = lazy(() => import('./components/AboutUs/AboutUs.jsx'));
const ContactUs = lazy(() => import('./components/ContactUs/ContactUs.jsx'));
const Advisor = lazy(() => import('./components/Advisor/Advisor.jsx'));
const Plans = lazy(() => import('./components/Home/Home.jsx'));

const Career = lazy(() => import('./components/Career/Career.jsx'));

// Loading component
const Loading = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const AppContent = () => {
  const { isJoinUsModalOpen, closeJoinUsModal, selectedPlan, isLoginModalOpen, closeLoginModal } = useModal();

  return (
    <div className="App">
      <ScrollToTop />
      <Header />
      <main style={{ paddingTop: '80px' }}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/advisor" element={<Advisor />} />

            <Route path="/career" element={<Career />} />
            <Route path="/career" element={<Career />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <JoinUsModal
        isOpen={isJoinUsModalOpen}
        onClose={closeJoinUsModal}
        initialPlan={selectedPlan}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
      />
    </div>
  );
};

function App() {
  return (
    <ModalProvider>
      <Router>
        <AppContent />
      </Router>
    </ModalProvider>
  );
}

export default App;
