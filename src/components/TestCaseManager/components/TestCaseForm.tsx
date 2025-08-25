import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config";
import { useGlobalContext } from "../../../context/GlobalContext";
// Define the TestCase interface (consistent with TestCaseGrid.tsx)
interface TestCase {
  _id?: string;
  // testCaseId: string;
  title: string;
  module: string;
  description: string;
  type: string;
  preRequisite: string;
  steps: string;
  expectedResult: string;
  priority: "Low" | "Medium" | "High";
  automationStatus: "Yes" | "No";
  userStory: string;
  projectId: string;
}

// Define component props
interface TestCaseFormProps {
  onSave: (data: TestCase) => Promise<void>;
  selected: TestCase | null;
}

// Define initial state
const initialState: TestCase = {
  // testCaseId: "",
  title: "",
  description: "",
  preRequisite: "",
  type: "functional",
  steps: "",
  expectedResult: "",
  priority: "Medium",
  automationStatus: "No",
  module: "",
  userStory: "",
  projectId: "",
};

// Define validation schema
const validationSchema = Yup.object({
  testCaseId: Yup.string().required("Test Id is required"),
  title: Yup.string().required("Title is required"),
  module: Yup.string().required("Module is required"),
  preRequisite: Yup.string().required("Pre-Requisite is required"),
  description: Yup.string()
    .required("Description is required")
    .min(10, "Description must be at least 10 characters"),
  steps: Yup.string()
    .required("Steps are required")
    .min(10, "Steps must be at least 10 characters"),
  expectedResult: Yup.string()
    .required("Expected Result is required")
    .min(5, "Expected Result must be at least 5 characters"),
  type: Yup.string().required("Type is required"),
  priority: Yup.string().required("Priority is required"),
  automationStatus: Yup.string().required("Automation Status is required"),
  userStory: Yup.string(),
  projectId: Yup.string().required("Project is required"),
});

export default function TestCaseForm({ selected }: TestCaseFormProps) {
  const { fetchTestCases, state, fetchTestRuns, dispatch } = useGlobalContext();
  const { projects } = state;
  const [initialValues, setInitialValues] = useState<TestCase>(initialState);
  const userId: string =
    JSON.parse(sessionStorage.getItem("user") || "{}")?._id || "";

  const navigate = useNavigate();
  const [userToken, setUserToken] = useState("");

  useEffect(() => {
    dispatch({ type: "SET_SEARCH", isSearch: false });
    const token = sessionStorage.getItem("token") || "";
    setUserToken(token);
  });

  // Function to create a test case
  const createTestCase = async (data: any) => {
    try {
      await axios.post(`${API_URL}/testcases`, data, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });
      fetchTestCases();
      fetchTestRuns();
      toast.success("Test case saved successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(() => {
        navigate("/test-cases");
      }, 1000);
    } catch (error: any) {
      toast.error(error?.response?.data?.message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      // Handle error (e.g., show error message)
      console.error("Error creating test case:", error);
    }
  };

  useEffect(() => {
    if (selected) {
      setInitialValues(selected);
    } else {
      setInitialValues(initialState);
    }
  }, [selected]);

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const handleSubmit = async (
    values: TestCase,
    { resetForm, setSubmitting }: FormikHelpers<TestCase>
  ) => {
    try {
      const trimmedValues = Object.fromEntries(
        Object.entries(values).map(([key, val]) => [
          key,
          typeof val === "string" ? val.trim() : val,
        ])
      ) as TestCase;
      createTestCase({ ...trimmedValues, createdBy: user.email });
      resetForm();
    } catch (error) {
      toast.error("Failed to save test case. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Failed to save test case:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-6 px-4 sm:px-6 lg:px-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="w-full bg-white ">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
          Add Test Case
        </h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched }) => (
            <Form className="space-y-4 sm:space-y-5">
              {[
                { label: "Test Id", name: "testCaseId", length: 50 },
                { label: "Test Case", name: "title", length: 100 },
                { label: "Module", name: "module", length: 30 },
                {
                  label: "Pre-Conditions",
                  name: "preRequisite",
                  type: "textarea",
                },
                {
                  label: "Description/Summary",
                  name: "description",
                  type: "textarea",
                },
                { label: "Test Steps", name: "steps", type: "textarea" },
                {
                  label: "Expected Result",
                  name: "expectedResult",
                  type: "textarea",
                },
                {
                  label: "Test Executed By",
                  name: "executedBy",
                  length: 50,
                },
                // {
                //   label: "User story ID",
                //   name: "userStory",
                //   length: 20,
                // },
              ].map((field) => (
                <div key={field.name} className="flex flex-col">
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {field.label}
                  </label>
                  <Field
                    as={field.type === "textarea" ? "textarea" : "input"}
                    id={field.name}
                    name={field.name}
                    maxLength={field.length}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700  ${
                      errors[field.name as keyof TestCase] &&
                      touched[field.name as keyof TestCase]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    rows={field.type === "textarea" ? 2 : undefined}
                  />
                  <ErrorMessage
                    name={field.name}
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Test Case Type
                  </label>
                  <Field
                    as="select"
                    id="type"
                    name="type"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
                      errors.type && touched.type
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                    <option value="functional">Functional</option>
                    <option value="performance">Performance</option>
                    <option value="regression">Regression</option>
                    <option value="security">Security</option>
                    <option value="smoke & sanity">Smoke & Sanity</option>
                    <option value="usability">Usability</option>
                    <option value="acceptance">Acceptance</option>
                    <option value="accessibility">Accessibility</option>
                    <option value="automated">Automated</option>
                    <option value="compatibility">Compatibility</option>
                    <option value="destructive">Destructive</option>
                    <option value="others">Others</option>
                  </Field>
                  <ErrorMessage
                    name="type"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Priority
                  </label>
                  <Field
                    as="select"
                    id="priority"
                    name="priority"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
                      errors.priority && touched.priority
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Field>
                  <ErrorMessage
                    name="priority"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>

                {/* <div>
                  <label
                    htmlFor="automationStatus"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Automation Status
                  </label>
                  <Field
                    as="select"
                    id="automationStatus"
                    name="automationStatus"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
                      errors.automationStatus && touched.automationStatus
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </Field>
                  <ErrorMessage
                    name="automationStatus"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div> */}
                <div>
                  <label
                    htmlFor="projectId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Select Project
                  </label>
                  <Field
                    as="select"
                    id="projectId"
                    name="projectId"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
                      errors["projectId" as keyof TestCase] &&
                      touched["projectId" as keyof TestCase]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select</option>
                    {projects
                      .filter(
                        (project) =>
                          Array.isArray(project.assignedTo) &&
                          project.assignedTo.some(
                            (assignee) => assignee._id === userId
                          )
                      )
                      .map((project) => (
                        <option value={project._id}>{project.name}</option>
                      ))}
                  </Field>
                  <ErrorMessage
                    name="projectId"
                    component="div"
                    className="text-red-500 text-xs mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Save Test Case
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
