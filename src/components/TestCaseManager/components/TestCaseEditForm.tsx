import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { API_URL } from "../../../config";
import { ChevronLeft } from "lucide-react";

// Define the TestCase interface (consistent with TestCaseGrid.tsx)
interface TestCase {
  id: any;
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
  id: undefined,
};

// Define validation schema
const validationSchema = Yup.object({
  // testCaseId: Yup.string()
  //   .required("Test Case ID is required")
  //   .min(3, "Test Case ID must be at least 3 characters"),
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
  priority: Yup.string().required("Priority is required"),
  type: Yup.string().required("Type is required"),
  automationStatus: Yup.string().required("Automation Status is required"),
  userStory: Yup.string(),
  projectId: Yup.string().required("Project is required"),
});

export default function TestCaseEditForm() {
  const [initialValues, setInitialValues] = useState<TestCase>(initialState);
  const userEmail: string =
    JSON.parse(sessionStorage.getItem("user") || "{}")?.email || "";

  interface Project {
    _id: string;
    name: string;
    assignedTo?: string[];
    // add other fields as needed
  }
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const { state } = location;

  useEffect(() => {
    setInitialValues(state.testCaseData || initialState);
  }, [state]);
  useEffect(() => {
    // Fetch projects from the API
    axios
      .get(`${API_URL}/projects`)
      .then((response) => {
        setProjects(response.data);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  }, []);

  const navigate = useNavigate();
  const token = sessionStorage.getItem("token") || ""; // Replace with your actual token retrieval method

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const handleSubmit = async (
    values: TestCase,
    { resetForm }: FormikHelpers<TestCase>
  ) => {
    try {
      setIsLoading(true);
      await axios.put(
        `${API_URL}/testcases/${initialValues.id}`,
        {
          ...values,
          updatedBy: user.name,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`, // replace `token` with your actual token variable
          },
        }
      );

      toast.success("Test case updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      resetForm();

      setTimeout(() => navigate(-1), 2000);
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
      setIsLoading(false);
    }
  };

  return (
    <div>
      {" "}
      <div
        className="inline-flex justify-center items-center text-lg font-medium text-gray-900 cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-8 w-8 text-black" /> Back
      </div>
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
        <div className="w-full bg-white p-10 rounded-lg">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
            Edit Test Case
          </h2>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, dirty }) => (
              <Form className="space-y-4 sm:space-y-5">
                {[
                  { label: "Title", name: "title" },
                  { label: "Module", name: "module", disabled: true },
                  {
                    label: "Pre-Conditions",
                    name: "preRequisite",
                    type: "textarea",
                  },
                  {
                    label: "Description",
                    name: "description",
                    type: "textarea",
                  },
                  // { label: "Type", name: "type" },
                  { label: "Steps", name: "steps", type: "textarea" },
                  {
                    label: "Expected Result",
                    name: "expectedResult",
                    type: "textarea",
                  },
                  {
                    label: "User story ID",
                    name: "userStory",
                    length: 20,
                  },
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
                      disabled={field.disabled}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
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
                      Type
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

                  <div>
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
                  </div>
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
                      <option value={initialState.projectId}>
                        {
                          projects.filter(
                            (project) => project._id === initialValues.projectId
                          )?.[0]?.name
                        }
                      </option>
                      {projects
                        .filter((project) =>
                          project?.assignedTo?.includes(userEmail)
                        )
                        .map((filteredProject, index) => (
                          <option key={index} value={filteredProject._id}>
                            {filteredProject.name}
                          </option>
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
                    disabled={isLoading || !dirty}
                    type="submit"
                    className={`w-full sm:w-auto px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                      !dirty
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                    } text-white`}
                  >
                    Update Test Case
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
