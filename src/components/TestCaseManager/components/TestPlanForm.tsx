import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { API_URL } from "../../../config";
import { ChevronLeft } from "lucide-react";
import { useGlobalContext } from "../../../context/GlobalContext";

// Define the TestCase interface (consistent with TestCaseGrid.tsx)
interface TestCase {
  _id?: string;
  name: string;
  subHeading: string;
  dueDateFrom: string;
  dueDateTo: string;
  description: string;
  browserType: string[];
  osType: string[];
  modules: string[];
  projectId: string;
}

// Define component props
interface TestPlanFormProps {
  onSave: (data: TestCase) => Promise<void>;
  selected: TestCase | null;
}

// Define initial state
const initialState: TestCase = {
  name: "",
  dueDateFrom: "",
  dueDateTo: "",
  subHeading: "",
  description: "",
  browserType: [],
  osType: [],
  modules: [],
  projectId: "",
};

export default function TestPlanForm({ onSave, selected }: TestPlanFormProps) {
  const { state } = useGlobalContext();
  const { testCases, projects } = state;
  const [initialValues, setInitialValues] = useState<TestCase>(initialState);
  const [users, setUsers] = useState<
    { _id: string; name: string; email: string }[]
  >([]);
  const browserTypes = ["Chrome", "Firefox", "Safari", "Edge"];
  const osTypes = ["Windows", "iOS"];
  const [assignments, setAssignments] = useState<
    { combo: string; browser: string; os: string; assignee: string }[]
  >([]);
  const [modules, setModules] = useState([]);
  const [allTestCases, setAllTestCases] = useState<any[]>([]);
  const [moduleErrors, setModuleErrors] = useState<string[]>([]);
  const [filteredUserTestCases, setFilteredUserTestCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [projectId, setProjectId] = useState("");
  const userId: string =
    JSON.parse(sessionStorage.getItem("user") || "{}")?._id || "";
  useEffect(() => {
    if (testCases.length > 0) {
      const updatedData = testCases.map((prevData) => ({
        ...prevData,
        status: "Untested",
      }));
      setAllTestCases(updatedData);
    }
  }, [testCases]);

  useEffect(() => {
    axios
      .get(`${API_URL}/users`)
      .then((response) => {
        const data = response.data.data.users;
        const filteredUsers =
          currentUser?.role.toLowerCase() === "admin"
            ? data.filter(
                (user: any) =>
                  user.isApproved &&
                  user.role !== currentUser.role &&
                  user.role.toLowerCase() !== "superadmin" &&
                  user?.accountCreatedBy?._id === currentUser?._id
              )
            : [];
        setUsers(filteredUsers);

        // Create filtered user test cases by comparing createdBy with user email
        if (allTestCases.length > 0 && filteredUsers.length > 0) {
          const userEmails = filteredUsers.map((user: any) => user.email);

          const filtered = allTestCases.filter((testCase) =>
            userEmails.includes(testCase.createdBy)
          );

          const filteredModules = filtered
            .filter((project) => project.projectId == projectId)
            .map((testCase) => testCase.module);

          setModules([...new Set(filteredModules)]);
          setFilteredUserTestCases(filtered);
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, [allTestCases, projectId]);

  useEffect(() => {
    if (selected) {
      setInitialValues(selected);
    } else {
      setInitialValues(initialState);
    }
  }, [selected]);

  const user = JSON.parse(sessionStorage.getItem("user"));
  const name = user.name;
  const token = sessionStorage.getItem("token") || "";

  // Custom validation function for modules
  const validateModules = (values: TestCase) => {
    const errors: string[] = [];
    const combos = values.browserType.flatMap((browser) =>
      values.osType.map((os) => `${browser}-${os}`)
    );

    combos.forEach((combo, index) => {
      const moduleArray = values.modules[index];
      if (!moduleArray || moduleArray.length === 0) {
        errors[index] = "At least one module must be selected";
      } else {
        errors[index] = "";
      }
    });

    setModuleErrors(errors);
    return errors.every((error) => error === "");
  };

  const handleSubmit = async (
    values: TestCase,
    { resetForm, setSubmitting }: FormikHelpers<TestCase>
  ) => {
    // Validate modules
    if (!validateModules(values)) {
      toast.error("Please select at least one module for each combination.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setSubmitting(false);
      return;
    }

    // Check if all assignments have an assignee
    const missingAssignee = assignments.some((item) => !item.assignee);
    if (missingAssignee) {
      toast.error("Please select an assignee for every combination.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setSubmitting(false);
      return;
    }

    const testRun = assignments.map((item, index) => {
      const assigneeUser = users.find((user) => user.name === item.assignee);

      return {
        browser: item.browser,
        osType: item.os,
        assignedTo: assigneeUser ? assigneeUser._id : "",
        module: allTestCases.filter(
          (testCase) =>
            values.modules[index].includes(testCase.module) &&
            testCase.projectId === values.projectId
        ),
      };
    });

    const payload = {
      name: values.name,
      subHeading: values.subHeading,
      description: values.description,
      dueDateFrom: values.dueDateFrom,
      dueDateTo: values.dueDateTo,
      testRun: testRun,
      createdBy: name,
    };

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/test-plan`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Test Plan created successfully!", {
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
        navigate("/test-plans");
      }, 1000);
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

  // Define validation schema (removed the problematic modules validation)
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    subHeading: Yup.string().required("Sub Heading is required"),
    dueDateFrom: Yup.date().required("Due Date From is required"),
    dueDateTo: Yup.date()
      .required("Due Date To is required")
      .min(Yup.ref("dueDateFrom"), "Due Date To must be after Due Date From"),
    browserType: Yup.array()
      .of(Yup.string().oneOf(["Chrome", "Firefox", "Safari", "Edge"]))
      .min(1, "Select at least one browser type")
      .required("Browser Type is required"),
    osType: Yup.array()
      .of(Yup.string().oneOf(["Windows", "iOS"]))
      .min(1, "Select at least one OS type")
      .required("OS Type is required"),
    projectId: Yup.string().required("Project is required"),
  });

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
            Add Test Plan
          </h2>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, errors, touched, isValid, dirty }) => {
              useEffect(() => {
                const combos = values.browserType.flatMap((browser) =>
                  values.osType.map((os) => ({
                    combo: `${browser}-${os}`,
                    browser,
                    os,
                    assignee: "",
                  }))
                );
                setAssignments(combos);
                // Reset module errors when combinations change
                setModuleErrors([]);
              }, [values.browserType, values.osType]);

              // Update module errors when modules change
              useEffect(() => {
                validateModules(values);
              }, [values.modules]);

              useEffect(() => {
                setProjectId(values.projectId);
              }, [values.projectId]);
              return (
                <Form className="space-y-4 sm:space-y-5">
                  {[
                    { label: "Name", name: "name", length: 50 },
                    { label: "Sub Heading", name: "subHeading", length: 50 },
                    { label: "Description", name: "description" },
                    {
                      label: "Due Date From",
                      name: "dueDateFrom",
                      type: "date",
                      min: new Date().toISOString().split("T")[0],
                      calendarOnly: true,
                    },
                    {
                      label: "Due Date To",
                      name: "dueDateTo",
                      type: "date",
                      min: new Date().toISOString().split("T")[0],
                      calendarOnly: true,
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
                        as="input"
                        type={field.type || "text"}
                        name={field.name}
                        min={field.min}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
                          errors[field.name as keyof TestCase] &&
                          touched[field.name as keyof TestCase]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        rows={field.type === "textarea" ? 2 : undefined}
                        inputMode={field.calendarOnly ? "none" : undefined}
                        onKeyDown={
                          field.calendarOnly
                            ? (e) => e.preventDefault()
                            : undefined
                        }
                      />
                      <ErrorMessage
                        name={field.name}
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>
                  ))}
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
                            project.createdBy._id === userId
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Browser Type
                      </label>
                      <div
                        role="group"
                        aria-labelledby="checkbox-group"
                        className="space-y-1"
                      >
                        {browserTypes.map((type, index) => (
                          <div key={index}>
                            <label
                              key={type}
                              className="inline-flex items-center space-x-2"
                            >
                              <Field
                                type="checkbox"
                                name="browserType"
                                value={type}
                                className="form-checkbox text-indigo-600"
                              />
                              <span className="text-gray-700">{type}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                      <ErrorMessage
                        name="browserType"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        OS Type
                      </label>
                      <div
                        role="group"
                        aria-labelledby="checkbox-group"
                        className="space-y-1"
                      >
                        {osTypes.map((type, index) => (
                          <div key={index}>
                            <label
                              key={type}
                              className="inline-flex items-center space-x-2"
                            >
                              <Field
                                type="checkbox"
                                name="osType"
                                value={type}
                                className="form-checkbox text-indigo-600"
                              />
                              <span className="text-gray-700">{type}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                      <ErrorMessage
                        name="osType"
                        component="div"
                        className="text-red-500 text-xs mt-1"
                      />
                    </div>
                  </div>

                  {assignments.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">
                        Browser & OS Combinations
                      </h3>
                      <table className="min-w-full divide-y divide-gray-200 border">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                              Browser
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                              OS
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                              Modules
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                              Assign To
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {assignments.map((item, index) => (
                            <tr key={item.combo}>
                              <td className="px-4 py-2">{item.browser}</td>
                              <td className="px-4 py-2">{item.os}</td>
                              <td>
                                <div>
                                  <div
                                    role="group"
                                    aria-labelledby="checkbox-group"
                                    className="space-y-1 py-1"
                                  >
                                    {modules.map((module) => (
                                      <div key={module}>
                                        <label className="inline-flex items-center space-x-2">
                                          <Field
                                            type="checkbox"
                                            name={`modules[${index}]`}
                                            value={module}
                                            className="form-checkbox text-indigo-600"
                                          />
                                          <span className="text-gray-700">
                                            {module}
                                          </span>
                                        </label>
                                      </div>
                                    ))}
                                    {moduleErrors[index] && (
                                      <div className="text-red-500 text-xs mt-1">
                                        {moduleErrors[index]}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-2">
                                <select
                                  value={assignments[index].assignee || ""}
                                  onChange={(e) => {
                                    const newAssignments = [...assignments];
                                    newAssignments[index].assignee =
                                      e.target.value;
                                    setAssignments(newAssignments);
                                  }}
                                  className="border px-2 py-1 rounded w-full"
                                >
                                  <option value="">Select Assignee</option>
                                  {users.map((user) => (
                                    <option key={user._id} value={user.name}>
                                      {user.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={
                        !dirty ||
                        !isValid ||
                        Object.keys(errors).length > 0 ||
                        moduleErrors.some((error) => error !== "") ||
                        assignments.some((item) => !item.assignee) ||
                        isLoading
                      }
                      className={`w-full sm:w-auto px-4 py-2 ${
                        !dirty ||
                        !isValid ||
                        Object.keys(errors).length > 0 ||
                        moduleErrors.some((error) => error !== "") ||
                        assignments.some((item) => !item.assignee)
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      } text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
                    >
                      Save Test Plan
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
}
