"use client";

import dynamic from "next/dynamic";
import { useUI } from "@/context/UIContext";

const LoginModal = dynamic(() => import("./Auth/LoginModal"), { ssr: false });
const JoinUsModal = dynamic(() => import("./JoinUsModal/JoinUsModal"), {
  ssr: false,
});

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoginModalOpen, isJoinUsModalOpen } = useUI();

  return (
    <>
      {children}
      {isLoginModalOpen && <LoginModal />}
      {isJoinUsModalOpen && <JoinUsModal />}
    </>
  );
}
