import React, { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "danger";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = "primary",
}) => {
  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return "bg-primary-50 text-primary-700";
      case "secondary":
        return "bg-secondary-50 text-secondary-700";
      case "accent":
        return "bg-accent-50 text-accent-700";
      case "success":
        return "bg-success-50 text-success-700";
      case "warning":
        return "bg-warning-50 text-warning-700";
      case "danger":
        return "bg-danger-50 text-danger-700";
      default:
        return "bg-primary-50 text-primary-700";
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`rounded-full p-3 ${getColorClasses()}`}>{icon}</div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-xl font-semibold text-gray-900">{value}</div>
              {trend && (
                <div
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend.positive ? "text-success-600" : "text-danger-600"
                  }`}
                >
                  <span className="sr-only">
                    {trend.positive ? "Increased" : "Decreased"} by
                  </span>
                  {trend.value}%
                </div>
              )}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
