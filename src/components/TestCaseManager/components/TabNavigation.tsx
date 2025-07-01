import React from "react";

// Define possible values for activeTab
type ActiveTab = "testcases" | "stats";

// Define component props
interface TabNavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  return (
    <div className="flex flex-wrap border-b mb-4">
      <button
        className={`py-2 px-4 font-medium text-sm sm:text-base ${
          activeTab === "testcases"
            ? "border-b-2 border-indigo-700 text-indigo-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
        onClick={() => setActiveTab("testcases")}
      >
        Test Cases
      </button>
      <button
        className={`py-2 px-4 font-medium text-sm sm:text-base ${
          activeTab === "stats"
            ? "border-b-2 border-indigo-700 text-indigo-600"
            : "text-gray-500 hover:text-gray-700"
        }`}
        onClick={() => setActiveTab("stats")}
      >
        Stats
      </button>
    </div>
  );
}
