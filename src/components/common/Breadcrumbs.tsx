import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
}) => {
  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {showHome && (
          <li>
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-700 flex items-center"
            >
              <Home className="h-4 w-4 flex-shrink-0" />
              <span className="sr-only">Home</span>
            </Link>
          </li>
        )}

        {showHome && items.length > 0 && (
          <li className="flex items-center">
            <ChevronRight
              className="h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
          </li>
        )}

        {items.map((item, index) => (
          <React.Fragment key={index}>
            <li>
              {item.path ? (
                <Link
                  to={item.path}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </li>
            {index < items.length - 1 && (
              <li className="flex items-center">
                <ChevronRight
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default React.memo(Breadcrumbs);
