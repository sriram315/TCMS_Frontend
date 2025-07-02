import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios"; // Import axios for making HTTP requests
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { API_URL } from "../../../config";

// Define the TestCase interface (consistent with TestCaseGrid.tsx)
interface TestCase {
  _id?: string;
  // testCaseId: string;
  name: string;
  description: string;
  assignedTo: string;
}

// Define component props
interface ProjectFormProps {
  onSave: (data: TestCase) => Promise<void>;
  selected: TestCase | null;
}

// Define initial state
const initialState: TestCase = {
  // testCaseId: "",
  name: "",
  description: "",
  assignedTo: "",
};

// Define validation schema
const validationSchema = Yup.object({
  // testCaseId: Yup.string()
  //   .required("Test Case ID is required")
  //   .min(3, "Test Case ID must be at least 3 characters"),
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required").min(10, "Description must be at least 10 characters"),
  assignedTo: Yup.string().required("Assigned to is required").notOneOf([""], "Please select a user"),
});

export default function ProjectForm({ selected }: Omit<ProjectFormProps, "onSave">) {
  const [initialValues, setInitialValues] = useState<TestCase>(initialState);
  const [users, setUsers] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  useEffect(() => {
    if (selected) {
      setInitialValues(selected);
    } else {
      setInitialValues(initialState);
    }
  }, [selected]);
  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      const users = response.data.data.users;
      const filteredUsers =
        currentUser?.role.toLowerCase() === "admin"
          ? users.filter(
              (user: any) =>
                user.isApproved &&
                user.role !== currentUser.role &&
                user.role.toLowerCase() !== "superadmin" &&
                user?.accountCreatedBy?._id === currentUser?._id
            )
          : [];

      setUsers(filteredUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  useEffect(() => {}, [users]);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchUser();
  }, []);
  const token = sessionStorage.getItem("token");
  const handleSubmit = async (values: TestCase, { resetForm, setSubmitting }: FormikHelpers<TestCase>) => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_URL}/projects`,
        { ...values, createdBy: user._id },
        {
          headers: {
            Authorization: `Bearer ${token}`, // replace `token` with your actual token variable
          },
        }
      );
      console.log("Project created:", response.data);

      toast.success("Project saved successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      resetForm();

      setTimeout(() => {
        navigate("/projects");
      }, 1000);
    } catch (error) {
      toast.error("Failed to save project. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.error("Failed to save project:", error);
    } finally {
      setIsLoading(false);
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
      <div className="w-full bg-white p-10 rounded-lg">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Add Project</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched }) => (
            <Form className="space-y-4 sm:space-y-5">
              {[
                { label: "Name", name: "name", length: 50 },
                { label: "Description", name: "description", type: "textarea" },
              ].map((field) => (
                <div key={field.name} className="flex flex-col">
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <Field
                    as={field.type === "textarea" ? "textarea" : "input"}
                    id={field.name}
                    name={field.name}
                    maxLength={field.length}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
                      errors[field.name as keyof TestCase] && touched[field.name as keyof TestCase]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    rows={field.type === "textarea" ? 2 : undefined}
                  />
                  <ErrorMessage name={field.name} component="div" className="text-red-500 text-xs mt-1" />
                </div>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <Field
                    as="select"
                    id="type"
                    name="type"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
                      errors["type" as keyof TestCase] && touched["type" as keyof TestCase]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automation">Automation</option>
                    <option value="Both">Both</option>
                  </Field>
                  <ErrorMessage name="type" component="div" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned to
                  </label>
                  <Field
                    as="select"
                    id="assignedTo"
                    name="assignedTo"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
                      errors["assignedTo" as keyof TestCase] && touched["assignedTo" as keyof TestCase]
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select</option>
                    {users.map((user: any) => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="assignedTo" component="div" className="text-red-500 text-xs mt-1" />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  disabled={isLoading}
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Save Project
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
