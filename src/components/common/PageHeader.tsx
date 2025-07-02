import React, { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
}) => {
  return (
    <div className="mb-6">
      <div className="md:flex md:items-center md:justify-between">
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
