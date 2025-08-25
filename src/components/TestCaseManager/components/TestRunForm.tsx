import React, { useState, useEffect } from "react";
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  FormikHelpers,
  FieldArray,
} from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../../config";
import { useGlobalContext } from "../../../context/GlobalContext";
import { ChevronLeft, Info } from "lucide-react";

interface TestCase {
  _id?: string;
  name: string;
  description: string;
  projectId?: string;
  module?: string;
  testCases?: any[];
  testCaseOption?: string;
  assignedTo?: string;
  dueDateFrom?: Date | null;
  dueDateTo?: Date | null;
}

interface TestRunFormProps {
  selected: TestCase | null;
}

const initialState: TestCase = {
  name: "",
  description: "",
  projectId: "",
  module: "",
  testCaseOption: "",
  testCases: [],
  assignedTo: "",
  dueDateFrom: null,
  dueDateTo: null,
};

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  description: Yup.string().required("Description is required"),
  projectId: Yup.string().required("Project is required"),
  module: Yup.string().required("Module is required"),
  testCaseOption: Yup.string().required("TestCase Option is required"),
  testCases: Yup.array().when("testCaseOption", {
    is: (value: string) => value !== "all", // condition
    then: (schema) =>
      schema
        .min(1, "At least one Testcase must be selected")
        .of(Yup.string().required()),
    otherwise: (schema) => schema.notRequired(),
  }),
  assignedTo: Yup.string().required("Assigned To is required"),
  dueDateFrom: Yup.date().nullable().required("Due Date From is required"),
  dueDateTo: Yup.date()
    .nullable()
    .required("Due Date To is required")
    .min(Yup.ref("dueDateFrom"), "Due Date To must be after Due Date From"),
});

export default function TestRunForm({ selected }: TestRunFormProps) {
  const { state, fetchTestRuns, dispatch } = useGlobalContext();
  const { testCases: globalTestCases, projects: globalProjects } = state;
  const [initialValues, setInitialValues] = useState<TestCase>(initialState);
  const [filteredModules, setFilteredModules] = useState([]);
  const [projectUsers, setProjectUsers] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedTcOption, setSelectedTcOption] = useState("");
  const [selectedTestCases, setSelectedTestCases] = useState([]);

  const navigate = useNavigate();

  const testCaseChooseOptions = [
    { name: "Include all test cases", value: "all" },
    { name: "Select specific test cases", value: "specific" },
    { name: "Dynamic Filtering", value: "dynamic" },
  ];

  const fetchModules = async (projectId: string) => {
    if (!projectId) {
      setFilteredModules([]);
      return;
    }

    try {
      const projectTestCases = globalTestCases.filter(
        (testCase: TestCase) => testCase.projectId === projectId
      );
      const modules = projectTestCases.map(
        (testCase: TestCase) => testCase.module
      );
      const uniqueModules = [...new Set(modules)];
      setFilteredModules(uniqueModules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      setFilteredModules([]);
    }
  };

  useEffect(() => {
    dispatch({ type: "SET_SEARCH", isSearch: false });
    if (selected) {
      setInitialValues({
        ...selected,
        dueDateFrom: selected.dueDateFrom
          ? new Date(selected.dueDateFrom)
          : null,
        dueDateTo: selected.dueDateTo ? new Date(selected.dueDateTo) : null,
      });
    } else {
      setInitialValues(initialState);
    }
  }, [selected]);

  const fetchTestCaseIdsByModule = async (
    module: string,
    projectId: string
  ): Promise<string[]> => {
    try {
      const testCases = globalTestCases.filter(
        (testCase: TestCase) =>
          testCase.module === module && testCase.projectId === projectId
      );

      setSelectedTestCases(testCases);
      return testCases
        .map((testCase: TestCase) => testCase._id)
        .filter((id: string | undefined) => id);
    } catch (error) {
      console.error("Error fetching test case IDs:", error);
      return [];
    }
  };

  const token = sessionStorage.getItem("token") || ""; // Replace with your actual token retrieval method
  const handleSubmit = async (
    values: TestCase,
    { resetForm, setSubmitting }: FormikHelpers<TestCase>
  ) => {
    try {
      let testCaseIds = selectedTestCases.map((tc: { _id: any }) => tc._id);

      const res = await axios.post(
        `${API_URL}/test-runs`,
        {
          ...values,
          testCases:
            values.testCaseOption === "all" ? testCaseIds : values.testCases,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // replace `token` with your actual token variable
          },
        }
      );

      toast.success("Test Run saved successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      resetForm();
      fetchTestRuns();
      setTimeout(() => {
        navigate("/test-runs");
      }, 1000);
    } catch (error) {
      toast.error("Failed to save test run. Please try again.", {
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

  const CustomDateInput = ({ value, onClick, className, placeholder }: any) => (
    <input
      type="text"
      value={value}
      onClick={onClick}
      className={className}
      placeholder={placeholder}
      readOnly
    />
  );

  // Filter users based on selected project
  const filterUsersByProject = (projectId: string) => {
    if (!projectId) {
      setProjectUsers([]);
      return;
    }

    const selectedProject = globalProjects.find(
      (project: any) => project._id === projectId
    );
    if (!selectedProject || !selectedProject.assignedTo) {
      setProjectUsers([]);
      return;
    }

    let assignedUsers = [];

    if (selectedProject?.testCases?.length > 0) {
      assignedUsers = selectedProject.assignedTo;
    }

    setProjectUsers(assignedUsers);
  };

  return (
    <div>
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
            Add Test Run
          </h2>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, setFieldValue, values }) => (
              <Form className="space-y-4 sm:space-y-5">
                {[
                  { label: "Name", name: "name", length: 50 },
                  { label: "Description", name: "description" },
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
                      maxLength={field.length}
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
                      htmlFor="projectId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Project
                    </label>
                    <Field
                      as="select"
                      id="projectId"
                      name="projectId"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
                        errors.projectId && touched.projectId
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const selectedProjectId = e.target.value;
                        setFieldValue("projectId", selectedProjectId);
                        setFieldValue("module", ""); // Reset module when project changes
                        setFieldValue("assignedTo", ""); // Reset assignedTo when project changes
                        setSelectedProjectId(selectedProjectId);
                        fetchModules(selectedProjectId);
                        filterUsersByProject(selectedProjectId);
                      }}
                    >
                      <option value="">Select Project</option>
                      {globalProjects?.map((project: any) => (
                        <option key={project._id} value={project._id}>
                          {project.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="projectId"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="module"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Module
                    </label>
                    <Field
                      as="select"
                      id="module"
                      name="module"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
                        errors.module && touched.module
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const moduleValue = e.target.value;
                        setFieldValue("module", moduleValue);
                        fetchTestCaseIdsByModule(
                          moduleValue,
                          selectedProjectId
                        );
                      }}
                    >
                      <option value="">Select Module</option>
                      {filteredModules?.map((module, index) => (
                        <option key={index} value={module}>
                          {module}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="module"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                  <div
                    className={`${
                      selectedTcOption !== "all" &&
                      selectedTcOption !== "" &&
                      "col-span-2"
                    }`}
                  >
                    <label
                      htmlFor="testCaseOption"
                      className="block text-sm font-medium text-gray-700 mb-1 inline-flex items-center gap-2  w-full"
                    >
                      Test Case Selection
                      <div className="group relative">
                        <Info className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700 " />
                        {/* Tooltip */}
                        <div className="hidden group-hover:block absolute top-6 left-0 w-80 bg-white shadow-lg p-4 border border-gray-200 rounded-lg z-20 text-xs leading-relaxed">
                          <div className="mb-2">
                            <div className="font-semibold text-gray-800">
                              Include all test cases
                            </div>
                            <div className="text-gray-600">
                              Adds every test case in this testrun. Any new test
                              cases created later will also be included
                              automatically.
                            </div>
                          </div>
                          <div className="mb-2">
                            <div className="font-semibold text-gray-800">
                              Select specific test cases
                            </div>
                            <div className="text-gray-600">
                              Choose individual test cases to include. New test
                              cases will not be added automatically.
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              Dynamic filtering
                            </div>
                            <div className="text-gray-600">
                              Automatically include test cases that match
                              selected filters. New matching test cases will be
                              added unless the run is closed.
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>

                    <Field
                      as="select"
                      id="testCaseOption"
                      name="testCaseOption"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
                        errors.testCaseOption && touched.testCaseOption
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const tcOption = e.target.value;
                        setFieldValue("testCaseOption", tcOption);
                        setSelectedTcOption(tcOption); // <-- store in local state
                      }}
                    >
                      <option value="">Select TestCase Option</option>
                      {testCaseChooseOptions?.map((tcOption, index) => (
                        <option key={index} value={tcOption.value}>
                          {tcOption.name}
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage
                      name="testCaseOption"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                  {selectedTcOption !== "all" && selectedTcOption !== "" && (
                    <div className="col-span-2">
                      <FieldArray name="testCases">
                        {({ push, remove, form }) => (
                          <fieldset>
                            <legend className="block text-sm font-medium text-gray-700 mb-1">
                              TestCases
                            </legend>
                            <div className="mt-4  divide-y divide-gray-200 border-b border-t border-gray-200 overflow-y-auto h-52 px-2">
                              {selectedTestCases.map(
                                (tc: any, index: number) => {
                                  const isChecked =
                                    form.values.testCases.includes(tc._id);
                                  return (
                                    <div
                                      key={tc._id}
                                      className="relative flex gap-3 py-4"
                                    >
                                      <div className="min-w-0 flex-1 text-sm/6">
                                        <label
                                          htmlFor={`testCases-${tc._id}`}
                                          className="font-medium text-gray-900 select-none"
                                        >
                                          <div>
                                            <span className="font-extrabold">
                                              Title:{" "}
                                            </span>
                                            {tc.title}
                                          </div>
                                          <div>
                                            <span className="font-bold">
                                              {" "}
                                              Description:
                                            </span>{" "}
                                            {tc.description}
                                          </div>
                                        </label>
                                      </div>
                                      <div className="flex h-6 shrink-0 items-center">
                                        <input
                                          type="checkbox"
                                          id={`testCases-${tc._id}`}
                                          name="testCases"
                                          value={tc._id}
                                          checked={isChecked}
                                          onChange={() => {
                                            if (isChecked) {
                                              const idx =
                                                form.values.testCases.indexOf(
                                                  tc._id
                                                );
                                              remove(idx);
                                            } else {
                                              push(tc._id);
                                            }
                                          }}
                                          className="size-4 rounded border border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                            <ErrorMessage
                              name="testCases"
                              component="div"
                              className="text-red-500 text-xs mt-1"
                            />
                          </fieldset>
                        )}
                      </FieldArray>
                    </div>
                  )}
                  <div
                    className={`${
                      selectedTcOption !== "all" &&
                      selectedTcOption !== "" &&
                      "col-span-2"
                    }`}
                  >
                    <label
                      htmlFor="assignedTo"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Assigned To
                    </label>
                    <Field
                      as="select"
                      id="assignedTo"
                      name="assignedTo"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
                        errors.assignedTo && touched.assignedTo
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Assignee</option>
                      {projectUsers.length > 0 ? (
                        projectUsers?.map((user: any) => (
                          <option key={user._id} value={user._id}>
                            {user.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No users assigned to this project
                        </option>
                      )}
                    </Field>
                    <ErrorMessage
                      name="assignedTo"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="dueDateFrom"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      From
                    </label>
                    <DatePicker
                      selected={values.dueDateFrom}
                      onChange={(date: Date) =>
                        setFieldValue("dueDateFrom", date)
                      }
                      dateFormat="MM/dd/yyyy"
                      minDate={new Date()}
                      customInput={
                        <CustomDateInput
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
                            errors.dueDateFrom && touched.dueDateFrom
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Select Due Date From"
                        />
                      }
                    />
                    <ErrorMessage
                      name="dueDateFrom"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="dueDateTo"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      To
                    </label>
                    <DatePicker
                      selected={values.dueDateTo}
                      onChange={(date: Date) =>
                        setFieldValue("dueDateTo", date)
                      }
                      dateFormat="MM/dd/yyyy"
                      customInput={
                        <CustomDateInput
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 ${
                            errors.dueDateTo && touched.dueDateTo
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Select Due Date To"
                        />
                      }
                    />
                    <ErrorMessage
                      name="dueDateTo"
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
                    Save Test Run
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
