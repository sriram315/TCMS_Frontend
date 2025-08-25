import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const Dropdown = ({ dataList, data, handleUpdate }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

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
  return (
    <div>
      <div className="flex items-center">
        <div className="ml-4 relative" ref={dropdownRef}>
          <button
            type="button"
            className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
            onClick={toggleProfile}
          >
            <span className="sr-only">Open user menu</span>
            <span className="hidden md:flex md:items-center ml-2">
              <span className="text-sm font-medium text-gray-700">{data}</span>
              <ChevronDown
                className="ml-1 h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </button>

          {profileOpen && (
            <div className="dropdown animate-fade-in">
              {dataList.map((list: any, index: number) => (
                <div
                  key={index}
                  className="py-1"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <button
                    className="dropdown-item flex items-center w-full"
                    onClick={() => {
                      handleUpdate(list);
                      setProfileOpen(false);
                    }}
                  >
                    <span>{list}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dropdown;
