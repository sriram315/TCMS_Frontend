import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlignLeft,
  Key,
  ChevronDown,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import TokenModal from "../TestCaseManager/TokenModal";

interface HeaderProps {
  openSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ openSidebar }) => {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const role = user?.role;
  const navigate = useNavigate();

  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
    if (notificationsOpen) setNotificationsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // const toggleNotifications = () => {
  //   setNotificationsOpen(!notificationsOpen);
  //   if (profileOpen) setProfileOpen(false);
  // };

  return (
    <>
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <button
                type="button"
                className="px-4 text-gray-500 lg:hidden focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={openSidebar}
              >
                <span className="sr-only">Open sidebar</span>
                <AlignLeft className="h-6 w-6" aria-hidden="true" />
              </button>

              <div className="flex-shrink-0 flex items-center lg:hidden">
                <Link to="/" className="text-primary-600 font-bold text-xl">
                  TestServ
                </Link>
              </div>
            </div>

            <div className="flex items-center">
              {/* <div className="flex-shrink-0">
              <button 
                type="button" 
                className="btn btn-primary btn-sm"
              >
                + New Test Run
              </button>
            </div> */}

              {/* <div className="ml-4 relative">
              <button
                type="button"
                className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={toggleNotifications}
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
              </button>
              
              {notificationsOpen && (
                <div className="dropdown animate-fade-in">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <strong>Notifications</strong>
                    </div>
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No new notifications
                    </div>
                  </div>
                </div>
              )}
            </div> */}

              <div className="ml-4 relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onClick={toggleProfile}
                >
                  <span className="sr-only">Open user menu</span>
                  {/* <img 
                  className="h-8 w-8 rounded-full" 
                  src={user?.avatar} 
                  alt={user?.name} 
                /> */}
                  <span className="hidden md:flex md:items-center ml-2">
                    <span className="text-sm font-medium text-gray-700">
                      {user?.name}
                    </span>
                    <ChevronDown
                      className="ml-1 h-4 w-4 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </button>

                {profileOpen && (
                  <div className="dropdown animate-fade-in">
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                    >
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-gray-500 ">{user?.email}</p>
                      </div>
                      <Link
                        to="/userProfile"
                        className="dropdown-item flex items-center"
                        role="menuitem"
                        onClick={() => setProfileOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Your Profile</span>
                      </Link>

                      <button
                        className="dropdown-item flex items-center w-full"
                        onClick={() => setTokenModalOpen(true)}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        <span>Jira Token</span>
                      </button>

                      {String(role).toLowerCase()?.includes("admin") && (
                        <Link
                          to="/settings"
                          className="dropdown-item flex items-center"
                          role="menuitem"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        className="dropdown-item flex items-center w-full text-left"
                        role="menuitem"
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                          navigate("/login");
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      <TokenModal
        open={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
      />
    </>
  );
};

export default Header;
