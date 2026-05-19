"use client";

import dynamic from "next/dynamic";
import { useUI } from "@/context/UIContext";
import { usePathname } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

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
  const pathname = usePathname();

  // Admin routes have their own layout (DashboardShell), so hide public Header/Footer
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Header />}
      {children}
      {!isAdminRoute && <Footer />}
      {isLoginModalOpen && <LoginModal />}
      {isJoinUsModalOpen && <JoinUsModal />}
    </>
  );
}
