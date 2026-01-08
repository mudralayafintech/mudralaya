"use client";

import { useUI } from "@/context/UIContext";
import LoginModal from "./Auth/LoginModal";
import JoinUsModal from "./JoinUsModal/JoinUsModal";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoginModalOpen, isJoinUsModalOpen } = useUI();

  return (
    <>
      {children}
      <LoginModal />
      <JoinUsModal />
    </>
  );
}
