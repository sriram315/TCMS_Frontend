import React, { useState, ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAuth } from "../../context/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return <div className="min-h-screen bg-gray-100">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header openSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 xl:p-8">{children}</main>

        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} TestServ. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">Version 1.0.0</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default React.memo(Layout);
