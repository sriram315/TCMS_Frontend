import { ChevronLeft } from "lucide-react";
import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  backNav?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  backNav = false,
}) => {
  const navigate = useNavigate();
  return (
    <div className="mb-6">
      <div className="md:flex md:items-center md:justify-between">
        {backNav && (
          <div
            className="inline-flex justify-center items-center text-lg font-medium text-gray-900 cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-8 w-8 text-black" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold leading-7 text-gray-700 sm:truncate truncate sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-neutral-600 truncate">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="mt-4 flex md:ml-4 md:mt-0">{actions}</div>}
      </div>
    </div>
  );
};

export default React.memo(PageHeader);
