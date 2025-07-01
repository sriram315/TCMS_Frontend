import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

interface IssuePopupProps {
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issueData: IssueData) => void;
  testCaseInfo?: {
    id: string;
    title: string;
    project?: string; // add project if not present
  };
}

export interface IssueData {
  projectKey: string;
  issueType: string;
  summary: string;
  description: string;
  testCase?: string;
}

// Validation schema
const IssueSchema = Yup.object().shape({
  projectKey: Yup.string().required("Project key is required"),
  issueType: Yup.string().required("Issue type is required"),
  summary: Yup.string().required("Summary is required"),
  description: Yup.string().required("Description is required"),
  testCase: Yup.string().optional(),
});

const IssuePopup: React.FC<IssuePopupProps> = ({
  isOpen,
  isLoading,
  onClose,
  onSubmit,
  testCaseInfo,
}) => {
  // Helper to get project key from project name or fallback
  const getInitialProjectKey = () => {
    if (testCaseInfo?.project && typeof testCaseInfo.project === "string") {
      return testCaseInfo.project.substring(0, 3).toUpperCase();
    }
    return "";
  };

  if (!isOpen) return null;

  const initialValues: IssueData = {
    projectKey: getInitialProjectKey(),
    issueType: "Bug",
    summary: testCaseInfo?.title ? `Failed: ${testCaseInfo.title}` : "",
    description: "",
    testCase: testCaseInfo?.id || "", // <-- ensure testCase is set
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">Create Issue</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={IssueSchema}
          onSubmit={(values) => {
            onSubmit(values); // testCase will be included
          }}
        >
          {({ errors, touched }) => (
            <Form className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Key
                </label>
                <Field
                  type="text"
                  name="projectKey"
                  className={`w-full border ${
                    errors.projectKey && touched.projectKey
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                />
                <ErrorMessage
                  name="projectKey"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issue Type
                </label>
                <Field
                  as="select"
                  name="issueType"
                  className={`w-full border ${
                    errors.issueType && touched.issueType
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                >
                  <option value="Bug">Bug</option>
                  <option value="Task">Task</option>
                  <option value="Story">Story</option>
                </Field>
                <ErrorMessage
                  name="issueType"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary
                </label>
                <Field
                  type="text"
                  name="summary"
                  className={`w-full border ${
                    errors.summary && touched.summary
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                />
                <ErrorMessage
                  name="summary"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Field
                  as="textarea"
                  name="description"
                  rows={4}
                  className={`w-full border ${
                    errors.description && touched.description
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="text-red-500 text-xs mt-1"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  disabled={isLoading}
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                >
                  Create
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default IssuePopup;
