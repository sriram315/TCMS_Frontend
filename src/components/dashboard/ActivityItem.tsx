import { format } from "date-fns";
import React, { ReactNode } from "react";

export interface Activity {
  activity: ReactNode;
  activityModule: any;
  type: any;
  createdAt: string | number | Date;
  createdBy: any;
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  target: {
    type: "test-case" | "test-run" | "test-plan";
    name: string;
    id: string;
  };
  date: Date;
}



const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {


  return (
    <div className="flex space-x-3 py-3 items-center">
      <div className="h-8 w-8 rounded-full border flex items-center justify-center">
        {activity?.createdBy?.name?.trim("").charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{activity?.createdBy?.name}</h3>
          <p className="text-xs text-gray-500">
            {format(new Date(activity.createdAt), "MMM d, h:mm a")}
          </p>
        </div>
        {activity?.type?.toLowerCase() === "created" && (
          <p className="text-sm text-gray-500">
            {`Created ${activity.activityModule}`}
            <span className="text-blue-600 ml-2">{activity.activity}</span>
          </p>
        )}
        {activity?.type?.toLowerCase() === "updated" && (
          <p className="text-sm text-gray-500">
            {`Updated ${activity.activityModule}`}
            <span className="text-blue-600 ml-2">{activity.activity}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default React.memo(ActivityItem);
