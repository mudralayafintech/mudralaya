"use client";

import React, { createContext, useContext, useState } from "react";

interface UIContextType {
  isJoinUsModalOpen: boolean;
  isLoginModalOpen: boolean;
  selectedPlan: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modalData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openJoinUsModal: (plan?: string, data?: any) => void;
  closeJoinUsModal: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const [isJoinUsModalOpen, setIsJoinUsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [modalData, setModalData] = useState<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openJoinUsModal = (plan = "", data: any = null) => {
    setSelectedPlan(plan);
    setModalData(data);
    setIsJoinUsModalOpen(true);
  };

  const closeJoinUsModal = () => {
    setIsJoinUsModalOpen(false);
    setSelectedPlan("");
    setModalData(null);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <UIContext.Provider
      value={{
        isJoinUsModalOpen,
        isLoginModalOpen,
        selectedPlan,
        modalData,
        openJoinUsModal,
        closeJoinUsModal,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
};
