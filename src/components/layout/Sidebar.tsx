import React from "react";
import { NavLink } from "react-router-dom";
import {
  X,
  LayoutDashboard,
  CheckSquare,
  ListChecks,
  PlayCircle,
  PieChart,
  FolderKanban,
  Settings,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}
import TestServ from "../../assets/logo-white-testserve.svg";

const Sidebar: React.FC<SidebarProps> = ({ isOpen, closeSidebar }) => {
  const navigation = [
    { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", to: "/projects", icon: FolderKanban },
    { name: "Test Cases", to: "/test-cases", icon: CheckSquare },
    { name: "Test Runs", to: "/test-runs", icon: PlayCircle },
    { name: "Reports", to: "/reports", icon: PieChart },
    { name: "Test Plans", to: "/test-plans", icon: ListChecks },
    { name: "Settings", to: "/settings", icon: Settings },
  ];

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  !String(user.role).toLowerCase().includes("admin") && delete navigation[1];
  !String(user.role).toLowerCase().includes("admin") && delete navigation[6];

  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${isOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600" onClick={closeSidebar}></div>

        <div className="fixed inset-0 flex z-40">
          <div
            className={`relative flex-1 flex flex-col max-w-xs w-full transform transition ease-in-out duration-300 ${
              isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={closeSidebar}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex-1 h-0 overflow-y-auto pt-5 pb-4">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-primary-600 font-bold text-2xl flex justify-center">
                  <img onClick={closeSidebar} src={TestServ} className="h-12 w-auto cursor-pointer" />
                </h1>
              </div>
              <nav className="mt-8 space-y-1 px-2">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isActive
                          ? "bg-primary-50 text-primary-600"
                          : "text-gray-200 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                    onClick={closeSidebar}
                  >
                    <item.icon className="mr-4 h-6 w-6 flex-shrink-0" aria-hidden="true" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-indigo-900 rounded-r-2xl">
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex items-center flex-shrink-0 px-6">
              <h1 className="text-primary-600 font-bold text-2xl flex  w-full justify-center">
                <div onClick={toggleCollapse} className="cursor-pointer">
                  <img src={TestServ} className="h-12 w-auto" />
                </div>
              </h1>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-4">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-xl text-white ${
                      isActive ? "bg-[#3C4791]" : "hover:bg-[#3C4791]"
                    }`
                  }
                >
                  <div className="bg-[#303E9C] rounded-[6px] shadow-[0px_4px_6px_0px_rgba(0,_0,_0,_0.2)] mr-3 p-1">
                    <item.icon className=" h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  </div>
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(Sidebar);
