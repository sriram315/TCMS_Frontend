import React from "react";

// Define component props
interface ExcelOperationsProps {
  uniqueModules: string[];
  moduleFilter: string;
  setModuleFilter: (value: string) => void;
  handleExcelUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleExcelDownload: () => void;
  uploading: boolean;
  uploadError: string | null;
}

export function ExcelOperations({
  uniqueModules,
  moduleFilter,
  setModuleFilter,
  handleExcelUpload,
  handleExcelDownload,
  uploading,
  uploadError,
}: ExcelOperationsProps) {
  return (
    <div className="mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
      <div className="w-full sm:w-auto">
        <select
          value={moduleFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setModuleFilter(e.target.value)
          }
          className="w-full sm:w-64 border rounded px-3 py-2"
        >
          <option value="">All Modules</option>
          {uniqueModules.map((module) => (
            <option key={module} value={module}>
              {module}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full sm:w-auto">
        <label className="hidden md:block mb-2 font-medium text-gray-700">
          Upload Test Cases (Excel):
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleExcelUpload}
            placeholder="Upload Excel File"
            className="w-full sm:w-auto border px-3 py-1 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-indigo-700 file:text-white hover:file:bg-indigo-600"
          />
          <button
            onClick={handleExcelDownload}
            className="w-full sm:w-auto bg-indigo-700 hover:bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Download Excel
          </button>
        </div>
        {uploading && <p className="text-blue-500 mt-1">Uploading...</p>}
        {uploadError && <p className="text-red-500 mt-1">{uploadError}</p>}
      </div>
    </div>
  );
}
