import React, { useState } from "react";

// Define the TestCase interface with specific fields
interface TestCase {
  _id: string;
  testCaseId: string;
  module: string;
  description: string;
  preRequisite: string;
  steps: string;
  expectedResult: string;
  priority: string;
  automationStatus: string;
  [key: string]: any; // For flexibility; remove if all fields are known
}

// Define component props
interface TestCaseGridProps {
  currentTestCases: TestCase[];
  onEdit: (testCase: TestCase) => void;
  handleDelete: (id: string) => void;
}

export function TestCaseGrid({
  currentTestCases,
  onEdit,
  handleDelete,
}: TestCaseGridProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string | null>(
    null
  );

  const handleDeleteClick = (testCaseId: string) => {
    setSelectedTestCaseId(testCaseId);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedTestCaseId) {
      handleDelete(selectedTestCaseId);
    }
    setShowModal(false);
    setSelectedTestCaseId(null);
  };

  const cancelDelete = () => {
    setShowModal(false);
    setSelectedTestCaseId(null);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full px-2 sm:px-4">
      {currentTestCases.length > 0 ? (
        currentTestCases.map((tc) => (
          <div
            key={tc._id}
            className="flex flex-col bg-white rounded-md py-3 sm:py-4 px-4 sm:px-6 border shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <h3 className="text-center font-bold text-lg sm:text-xl text-gray-800 pb-2 truncate">
              {tc.testCaseId}
            </h3>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
              Module: {tc.module}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 pb-3 line-clamp-2">
              {tc.description}
            </p>
            <div className="text-xs sm:text-sm text-[rgb(134,134,134)] flex-grow">
              <p className="mb-1 line-clamp-1">
                <strong>Pre-Requisite:</strong> {tc.preRequisite}
              </p>
              <p className="mb-1 line-clamp-2">
                <strong>Steps:</strong> {tc.steps}
              </p>
              <p className="mb-1 line-clamp-1">
                <strong>Expected:</strong> {tc.expectedResult}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-500 border-b pb-2 mt-3">
              <p>Priority: {tc.priority}</p>
              <p className="hidden sm:block">•</p>
              <p>Automation: {tc.automationStatus}</p>
            </div>
            <div className="flex justify-around items-center py-2 sm:py-3">
              <div className="flex gap-1 sm:gap-2 text-gray-600 hover:scale-110 duration-200 hover:cursor-pointer">
                <svg
                  className="w-4 sm:w-6 stroke-green-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                <button
                  onClick={() => onEdit(tc)}
                  className="font-semibold text-xs sm:text-sm text-green-700"
                >
                  Edit
                </button>
              </div>
              <div className="flex gap-1 sm:gap-2 text-gray-600 hover:scale-110 duration-200 hover:cursor-pointer">
                <svg
                  className="w-4 sm:w-6 stroke-red-700"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                <button
                  onClick={() => handleDeleteClick(tc._id)}
                  className="font-semibold text-xs sm:text-sm text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-4 text-gray-500 text-sm sm:text-base">
          No test cases found
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white rounded-md p-4 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete this test case?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
