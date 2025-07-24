import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import { Plus, ChevronDownIcon, Dot, Upload } from "lucide-react";
import StatusBadge from "../components/common/StatusBadge";
import axios from "axios";
import { format } from "date-fns";
import { API_URL } from "../config";

const TestCases: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [testCases, setTestCases] = useState<any[]>([]);
  const [categorizedTestCases, setCategorizedTestCases] = useState<any>({});
  const [projects, setProjects] = useState<any[]>([]);
  const [projectMap, setProjectMap] = useState<Record<string, string>>({});
  const [selectedProjectId, setSelectedProjectId] = useState("All Projects");
  const [allTestCases, setAllTestCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProjectId, setUploadProjectId] = useState<string>("");
  const [moduleName, setModuleName] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [allProjects, setAllProjects] = useState([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { state } = useLocation();
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const email = user.email;
  const role = user.role;
  const userId = user._id;

  const categorizeTestCases = (testCases: any[]) => {
    return testCases.reduce((acc: any, testCase: any) => {
      const module = testCase.module || "Uncategorized";
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(testCase);
      return acc;
    }, {});
  };

  useEffect(() => {
    axios
      .get(`${API_URL}/projects`)
      .then((response) => {
        setAllProjects(response.data);

        let userProjects = [];

        if (String(role).toLowerCase() === "superadmin") {
          userProjects = response.data;
        } else if (String(role).toLowerCase() === "admin") {
          userProjects = response.data.filter(
            (project) => project.createdBy?._id === userId
          );
        } else {
          userProjects = response.data.filter(
            (project) =>
              Array.isArray(project.assignedTo) &&
              project.assignedTo.some((assignee) => assignee._id === userId)
          );
        }

        setProjects(
          userProjects.map((project) => ({
            _id: project._id,
            name: project.name,
            assignedTo: project.assignedTo,
          }))
        );

        const projectMapUpdate = {};
        userProjects.forEach((project) => {
          projectMapUpdate[project._id] = project.name;
        });
        setProjectMap((prev) => ({ ...prev, ...projectMapUpdate }));
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  }, [userId, role]);

  const fetchProjectById = async (projectId: string) => {
    if (projectMap[projectId]) return;
    try {
      const response = await axios.get(`${API_URL}/projects/${projectId}`);
      const project = response.data;
      setProjectMap((prev) => ({ ...prev, [project._id]: project.name }));
      setProjects((prev) =>
        prev.some((p) => p._id === project._id)
          ? prev
          : [
              ...prev,
              {
                _id: project._id,
                name: project.name,
                assignedTo: project.assignedTo,
              },
            ]
      );
    } catch (error) {
      console.error(`Error fetching project ${projectId}:`, error);
      setProjectMap((prev) => ({ ...prev, [projectId]: "Unknown" }));
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/testcases`);
      const data = response.data;

      let filteredData = [];

      if (String(role).toLowerCase() === "superadmin") {
        filteredData = data;
      } else if (String(role).toLowerCase() === "admin") {
        filteredData = data.filter((testCase) =>
          projects.some((project) => project._id === testCase.projectId)
        );
      } else {
        filteredData = data.filter((testCase) =>
          projects.some((project) => project._id === testCase.projectId)
        );
      }

      const projectIds = Array.from(
        new Set(filteredData.map((testCase) => testCase.projectId))
      );

      await Promise.all(projectIds.map(fetchProjectById));

      const categorized = categorizeTestCases(filteredData);

      setTestCases(filteredData);
      setAllTestCases(filteredData);
      setCategorizedTestCases(categorized);
    } catch (error) {
      console.error("Error fetching test cases:", error);
      setError("Failed to fetch test cases. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadProjectId || !moduleName || !email) {
      setUploadError(
        "Please select a file, project, enter a module name, and ensure you are logged in"
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("module", moduleName);
    formData.append("projectId", uploadProjectId);
    formData.append("createdBy", email);

    try {
      setIsUploading(true);
      setUploadError(null);

      const token = sessionStorage.getItem("token");
      await axios.post(`${API_URL}/testcases/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadProjectId("");
      setModuleName("");
      fetchData();
    } catch (error) {
      setUploadError(
        error.response?.data?.error || "Failed to upload test cases"
      );
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [email, role, projects]);

  useEffect(() => {
    if (state?.refetch) {
      fetchData();
    }
  }, [state]);

  useEffect(() => {
    if (isLoading) return;

    let updatedTestCases;
    if (selectedProjectId === "All Projects") {
      updatedTestCases = allTestCases;
    } else {
      updatedTestCases = allTestCases.filter(
        (testCase) => testCase.projectId === selectedProjectId
      );
      if (selectedProjectId && !projectMap[selectedProjectId]) {
        fetchProjectById(selectedProjectId);
      }
    }
    setTestCases(updatedTestCases);
    setCategorizedTestCases(categorizeTestCases(updatedTestCases));
  }, [selectedProjectId, allTestCases, isLoading]);

  const filteredTestCases = testCases?.filter((testCase) =>
    testCase?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Test Cases"
        description="Create and manage test cases for your project"
        actions={
          <>
            {projects?.length > 0 && (
              <div className="">
                <div className="mt-2 grid grid-cols-1">
                  <select
                    id="projectId"
                    name="projectId"
                    className="col-start-1 cursor-pointer row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                  >
                    <option value="All Projects">All Projects</option>
                    {projects.map((filteredProject) => (
                      <option
                        key={filteredProject._id}
                        value={filteredProject._id}
                      >
                        {filteredProject.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                  />
                </div>
              </div>
            )}
            {!String(role).toLowerCase().includes("admin") && (
              <button
                type="button"
                className="btn btn-outline mr-3 h-8 mt-2"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload className="h-3 w-3 mr-2" />
                Upload Excel
              </button>
            )}
            {!String(role).toLowerCase().includes("admin") && (
              <button
                type="button"
                className="btn btn-primary bg-indigo-900"
                onClick={() => navigate("/test-cases/create")}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Test Case
              </button>
            )}
          </>
        }
      />
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Upload Test Cases</h3>
            {uploadError && (
              <div className="p-2 text-red-600 bg-red-100 rounded-md mb-4">
                {uploadError}
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Excel File
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setUploadFile(e.target.files[0]);
                  }
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              />
              {uploadFile && (
                <p className="mt-1 text-sm text-gray-600">
                  Selected: {uploadFile.name}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Project
              </label>
              <select
                value={uploadProjectId}
                onChange={(e) => setUploadProjectId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Module Name
              </label>
              <input
                type="text"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-indigo-700"
                placeholder="Enter module name"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                disabled={isUploading}
                className="btn btn-outline"
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadError(null);
                  setUploadFile(null);
                  setUploadProjectId("");
                  setModuleName("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary bg-indigo-900"
                onClick={handleUpload}
                disabled={isUploading}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="p-4 text-red-600 bg-red-100 rounded-md">{error}</div>
      )}
      {isLoading && (
        <div className="p-8 text-center">
          <p className="text-gray-500">Loading test cases...</p>
        </div>
      )}
      {!isLoading && (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 py-5 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 ">
                  Modules
                </h3>
              </div>
              <div className="p-2">
                {Object.keys(categorizedTestCases).length === 0 ? (
                  <div className="w-full flex justify-center">
                    <span className="text-sm text-gray-500">No modules.</span>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200 pointer-events-none cursor-not-allowed">
                    {Object.keys(categorizedTestCases).map((section) => (
                      <li key={section} className="">
                        <button
                          className={`flex items-center justify-between w-full p-2 text-sm rounded-md cursor-default ${
                            selectedSection === section
                              ? "bg-primary-50 text-primary-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedSection(section)}
                        >
                          <div className="flex items-center max-w-48">
                            <Dot className="text-2xl" />
                            <span className="truncate">{section}</span>
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                            {categorizedTestCases[section].length}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="table ">
                  <thead>
                    <tr>
                      <th scope="col">Test Id</th>
                      <th scope="col">Test Cases</th>
                      <th scope="col">Status</th>
                      <th scope="col">Priority</th>
                      <th scope="col">Modules</th>
                      <th scope="col">Project</th>
                      <th scope="col">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSection
                      ? categorizedTestCases[selectedSection]
                          ?.filter((testCase: any) =>
                            testCase.title
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                          )
                          .map((testCase: any) => (
                            <tr key={testCase._id} className="hover:bg-gray-50">
                              <td className="font-medium">
                                {testCase.testCaseId}
                              </td>
                              <td className="max-w-48 truncate">
                                <Link
                                  state={testCase}
                                  to={`/test-cases/${testCase.testCaseId}`}
                                  className="text-primary-600 hover:text-primary-900 font-medium"
                                >
                                  {testCase.title}
                                </Link>
                              </td>
                              <td>
                                <StatusBadge
                                  status={testCase.status}
                                  size="sm"
                                />
                              </td>
                              <td>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    testCase.priority === "High"
                                      ? "bg-danger-100 text-danger-800"
                                      : testCase.priority === "Medium"
                                      ? "bg-warning-100 text-warning-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {testCase.priority}
                                </span>
                              </td>
                              <td className="text-gray-600 truncate max-w-48">
                                {testCase.module}
                              </td>
                              <td className="text-gray-600 truncate max-w-48">
                                {projectMap[testCase.projectId] || "Loading..."}
                              </td>
                              <td className="text-gray-600">
                                {testCase.updatedAt.slice(0, 10)}
                              </td>
                            </tr>
                          )) || (
                          <tr>
                            <td
                              colSpan={7}
                              className="text-center text-gray-500"
                            >
                              No test cases found for this module.
                            </td>
                          </tr>
                        )
                      : filteredTestCases.map((testCase: any) => (
                          <tr key={testCase._id} className="hover:bg-gray-50">
                            <td className="font-medium">
                              {testCase.testCaseId}
                            </td>
                            <td className="max-w-48 truncate">
                              <Link
                                state={testCase}
                                to={`/test-cases/${testCase.testCaseId}`}
                                className="text-primary-600 hover:text-primary-900 font-medium"
                              >
                                {testCase.title}
                              </Link>
                            </td>
                            <td>
                              <StatusBadge status={testCase.status} size="sm" />
                            </td>
                            <td>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  testCase.priority === "High"
                                    ? "bg-danger-100 text-danger-800"
                                    : testCase.priority === "Medium"
                                    ? "bg-warning-100 text-warning-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {testCase.priority}
                              </span>
                            </td>
                            <td className="text-gray-600 truncate max-w-48">
                              {testCase.module}
                            </td>
                            <td className="text-gray-600 truncate max-w-48">
                              {projectMap[testCase.projectId] || "Loading..."}
                            </td>
                            <td className="text-gray-600 min-w-32">
                              {format(
                                new Date(testCase?.updatedAt),
                                "MMMM dd, yyyy"
                              )}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
              {filteredTestCases.length === 0 && !selectedSection && (
                <div className="p-8 text-center">
                  <p className="text-gray-500">
                    No test cases found matching your criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCases;
