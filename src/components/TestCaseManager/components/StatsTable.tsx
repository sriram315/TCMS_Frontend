import React from "react";

// Define the ModuleStats interface (consistent with TestCaseList.tsx)
interface ModuleStats {
  module: string;
  count: number;
}

// Define component props
interface StatsTableProps {
  moduleStats: ModuleStats[];
  totalTestCases: number;
}

export function StatsTable({ moduleStats, totalTestCases }: StatsTableProps) {
  return (
    <div className="bg-white rounded shadow p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-semibold mb-4">
        Test Case Statistics
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Module
              </th>
              <th className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test Case Count
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {moduleStats.map((stat, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                  {stat.module}
                </td>
                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                  {stat.count}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100">
              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-gray-900">
                Total
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-bold text-gray-900">
                {totalTestCases}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
