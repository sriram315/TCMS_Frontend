import React, { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, MinusCircle } from "lucide-react";
import axios from "axios";
import { API_URL } from "../../config";

export type TestStatus =
  | "passed"
  | "failed"
  | "blocked"
  | "untested"
  | "retest";

interface StatusBadgeProps {
  status: TestStatus;
  size?: "sm" | "md";
  testCaseId: string; // Pass test case ID for the API call
  edit?: boolean;
  onClick?: (arg: any) => void;
  url?: string;
}

const STATUS_OPTIONS: Record<
  TestStatus,
  {
    icon: React.ElementType;
    className: string;
    text: string;
  }
> = {
  passed: {
    icon: CheckCircle,
    className: "status-badge-passed text-green-600",
    text: "Passed",
  },
  failed: {
    icon: XCircle,
    className: "status-badge-failed text-red-600",
    text: "Failed",
  },
  blocked: {
    icon: AlertTriangle,
    className: "status-badge-blocked text-yellow-600",
    text: "Blocked",
  },
  untested: {
    icon: MinusCircle,
    className: "status-badge-untested text-gray-400",
    text: "Untested",
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  testCaseId,
  edit = false,
  onClick = () => {},
  url = "",
}) => {
  const initialStatus = (
    STATUS_OPTIONS[status] ? status : "untested"
  ) as TestStatus;
  const [currentStatus, setCurrentStatus] = useState<TestStatus>(initialStatus);
  const [editing, setEditing] = useState(false);
  const token = sessionStorage.getItem("token") || ""; // Replace with your actual token retrieval method
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = e.target.value as TestStatus;
    setCurrentStatus(newStatus);
    setEditing(false);

    try {
      // Replace with your actual endpoint
      const response = await axios.put(
        url.length === 0 ? `${API_URL}/testcases/${testCaseId}` : url,
        {
          status: newStatus,
          updatedBy: user.name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // replace `token` with your actual token variable
          },
        }
      );

      onClick(url.length === 0 ? Date.now() : response.data.data);
    } catch (error) {
      console.error("Failed to update status:", error);
      // Optionally revert status or show error toast
    }
  };

  if (!STATUS_OPTIONS[currentStatus]) {
    return null; // or render fallback UI
  }

  const { icon: Icon, className, text } = STATUS_OPTIONS[currentStatus];

  return edit && editing ? (
    <select
      className="border text-sm rounded px-2 py-1"
      value={currentStatus}
      onChange={handleStatusChange}
      onBlur={() => setEditing(false)}
      autoFocus
    >
      {Object.entries(STATUS_OPTIONS).map(([key, option]) => (
        <option key={key} value={key}>
          {option.text}
        </option>
      ))}
    </select>
  ) : (
    <span
      onClick={() => setEditing(true)}
      className={`inline-flex items-center gap-1 ${
        edit && "cursor-pointer"
      } rounded ${className} ${
        size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2 py-1"
      }`}
    >
      <Icon className={`${size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
      <span>{text}</span>
    </span>
  );
};

export default React.memo(StatusBadge);
