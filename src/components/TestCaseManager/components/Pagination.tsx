import React from "react";

// Define the TestCase interface (consistent with TestCaseGrid.tsx)
interface TestCase {
  _id?: string;
  testCaseId?: string;
  module?: string;
  description?: string;
  preRequisite?: string;
  steps?: string;
  expectedResult?: string;
  priority?: string;
  automationStatus?: string;
}

// Define component props
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  filteredTestCases: TestCase[];
  paginate: (pageNumber: number) => void;
  prevPage: () => void;
  nextPage: () => void;
}

export function Pagination({
  currentPage,
  totalPages,
  filteredTestCases,
  paginate,
  prevPage,
  nextPage,
}: PaginationProps) {
  return (
    filteredTestCases.length > 0 && (
      <div className="mt-6 flex flex-col items-center justify-center space-y-4 pb-8">
        <div className="text-xs sm:text-sm text-indigo-700 text-center px-2">
          Showing {currentPage * 6 - 5} to{" "}
          {Math.min(currentPage * 6, filteredTestCases.length)} of{" "}
          {filteredTestCases.length} test cases
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm cursor-pointer ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-indigo-700 hover:bg-indigo-600 text-white"
            }`}
          >
            Previous
          </button>
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
            {[...Array(totalPages).keys()].map((number) => (
              <button
                key={number + 1}
                onClick={() => paginate(number + 1)}
                className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${
                  currentPage === number + 1
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {number + 1}
              </button>
            ))}
          </div>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm cursor-pointer ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-indigo-700 hover:bg-indigo-600 text-white"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    )
  );
}
