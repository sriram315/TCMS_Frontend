import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Breadcrumbs from "../components/common/Breadcrumbs";
import axios from "axios";
import { format } from "date-fns";

import {
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  CalendarClock,
  ChevronDownIcon,
} from "lucide-react";

const statusColors = {
  Completed: "bg-success-100 text-success-800 border-success-200",
  "In Progress": "bg-primary-100 text-primary-800 border-primary-200",
  "Not Started": "bg-gray-100 text-gray-800 border-gray-200",
};

// Function to calculate test case status counts, progress, and test run status
const calculateTestRunStats = (testCases) => {
  const stats = {
    passed: 0,
    failed: 0,
    blocked: 0,
    untested: 0,
    total: testCases?.length || 0,
  };

  (testCases || []).forEach((testCase, index) => {
    const status = testCase?.status?.toLowerCase() || "";
    switch (status) {
      case "passed":
        stats.passed += 1;
        break;
      case "failed":
        stats.failed += 1;
        break;
      case "blocked":
        stats.blocked += 1;
        break;
      case "untested":
        stats.untested += 1;
        break;
      default:
        stats.untested += 1; // Treat unrecognized statuses as untested
        break;
    }
  });

  // Calculate progress as the percentage of test cases that are not untested
  const completedTests = stats.passed + stats.failed + stats.blocked;
  const progress =
    stats.total > 0 ? Math.trunc((completedTests / stats.total) * 100) : 0;

  // Determine test run status based on test case counts
  let testRunStatus = "Not Started";
  if (stats.total === stats.untested) {
    testRunStatus = "Not Started";
  } else if (
    stats.untested === 0 &&
    stats.passed + stats.failed + stats.blocked === stats.total
  ) {
    testRunStatus = "Completed";
  } else if (
    stats.untested < stats.total &&
    (stats.passed > 0 || stats.failed > 0 || stats.blocked > 0)
  ) {
    testRunStatus = "In Progress";
  }

  return { stats, progress, testRunStatus };
};

const TestRuns: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [testRuns, setTestRuns] = useState([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("All Projects");
  const [allTestRuns, setAllTestRuns] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(sessionStorage.getItem("user"));
  const name = user.name;
  const role = user.role;
  const userId = user._id;

  // Fetch projects based on user role
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/projects")
      .then((response) => {
        // Filter projects based on user role
        let userProjects = [];

        if (String(role).toLowerCase() === "superadmin") {
          // Superadmin sees all projects
          userProjects = response.data;
        } else if (String(role).toLowerCase() === "admin") {
          // Admin sees only projects they created
          userProjects = response.data.filter(
            (project) => project.createdBy?._id === userId
          );
        } else {
          // Other roles see only projects they're assigned to
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
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  }, [userId, role]);

  const fetchTestRuns = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/test-runs");
      // const filteredData =
      //   String(role).toLowerCase() === "superadmin"
      //     ? data : String(role).toLowerCase() === "admin"?
      //     data.filter((testRun)=>testRun.createdBy?._id === userId) ):
      //     String(role).toLowerCase() === "qa"?
      //      data.filter((testCase: any) => testCase.assignedTo === name):
      //      String(role).toLowerCase() === "dev"?
      //       data.filter((testCase: any) => testCase.assignedTo === name):
      //       String(role).toLowerCase() === "smoke"?
      //     : data.filter((testCase: any) => testCase.assignedTo === name);
      // console.log(filteredData);
      console.log(data);
      console.log(userId);

      data.map((test) => console.log(test.assignedTo));

      const filteredData =
        String(role).toLowerCase() === "superadmin"
          ? data
          : String(role).toLowerCase() === "admin"
          ? data.filter((testRun) => testRun?.createdBy?._id === userId)
          : data.filter((testRun: any) => testRun?.assignedTo?._id === userId);

      const processedTestRuns = filteredData.map((testRun, index) => {
        const { stats, progress, testRunStatus } = calculateTestRunStats(
          testRun.testCases || []
        );
        return {
          ...testRun,
          testCases: testRun.testCases || [], // Ensure testCases is always an array
          stats,
          progress,
          status: testRunStatus, // Override backend status with calculated status
        };
      });

      setAllTestRuns(processedTestRuns);
      setTestRuns(processedTestRuns);
    } catch (error) {
      console.error("Error fetching test runs:", error);
    }
  };

  useEffect(() => {
    if (location.state == null) {
      fetchTestRuns();
    } else {
      const processedTestRuns = location.state.testRun.map((test, index) => {
        const { stats, progress, testRunStatus } = calculateTestRunStats(
          test.testCases || []
        );

        return {
          ...test,
          testCases: test.module || [], // Ensure testCases is always an array
          stats,
          progress,
          status: testRunStatus, // Override backend status with calculated status
        };
      });
      setAllTestRuns(processedTestRuns);
      setTestRuns(processedTestRuns);
    }
  }, []);

  // Filter test runs by project ID
  useEffect(() => {
    if (selectedProjectId === "All Projects") {
      setTestRuns(allTestRuns);
    } else {
      console.log(selectedProjectId);

      const filteredRuns = allTestRuns.filter(
        (testRun) => testRun.projectId === selectedProjectId
      );
      setTestRuns(filteredRuns);
    }
  }, [selectedProjectId, allTestRuns]);

  const filteredTestRuns = testRuns.filter((testRun) =>
    (testRun.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* <Breadcrumbs items={[{ label: "Test Runs", path: "/test-runs" }, { label: "E-commerce Platform" }]} /> */}

      <PageHeader
        title="Test Runs"
        description="Execute and track test cases in your project"
        actions={
          <div className="flex items-center">
            {projects?.length > 0 && (
              <div className="pr-5">
                <div className="mt-2 grid grid-cols-1">
                  <select
                    id="projectId"
                    name="projectId"
                    className="col-start-1 cursor-pointer row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                  >
                    <option value="All Projects">All Projects</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
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

            {String(role).toLowerCase() === "admin" && (
              <button
                type="button"
                className="btn btn-primary bg-indigo-900"
                onClick={() => navigate("testRunForm")}
              >
                <Plus className="h-5 w-5 mr-2" />
                New Test Run
              </button>
            )}
          </div>
        }
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <ul className="divide-y divide-gray-200">
          {filteredTestRuns.map((testRun) => (
            <li key={testRun._id} className="p-4 sm:p-6 hover:bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link
                        state={JSON.parse(JSON.stringify(testRun))}
                        to={`/test-runs/${testRun._id}`}
                        className="hover:text-primary-600 font-semibold"
                      >
                        {testRun.name || "Unnamed Test Run"}
                      </Link>
                    </h3>
                    <span
                      className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        statusColors[
                          testRun?.status as keyof typeof statusColors
                        ] || statusColors["Not Started"]
                      }`}
                    >
                      {testRun?.status || "Not Started"}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-500 gap-x-3">
                    <div className="flex items-center mr-4">
                      <CalendarClock className="h-4 w-4 mr-1" />
                      Created:{" "}
                      {testRun?.createdAt
                        ? format(new Date(testRun.createdAt), "MMM d, yyyy")
                        : "N/A"}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Due from:{" "}
                      {testRun?.dueDateFrom
                        ? format(new Date(testRun?.dueDateFrom), "MMM d, yyyy")
                        : "N/A"}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Due to:{" "}
                      {testRun?.dueDateTo
                        ? format(new Date(testRun?.dueDateTo), "MMM d, yyyy")
                        : "N/A"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex flex-col mr-6">
                    <div className="flex items-center mb-1">
                      <div className="text-sm font-medium text-gray-900 mr-1">
                        Progress
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {testRun?.progress || 0}%
                      </span>
                    </div>
                    <div className="w-36 bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-primary-600 h-2.5 rounded-full"
                        style={{ width: `${testRun?.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full mr-2 border flex items-center justify-center font-semibold">
                    {testRun?.assignedTo?.name.charAt(0).toUpperCase() || "?"}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-1" />
                  <span className="text-sm text-gray-600">
                    {testRun?.stats?.passed || 0} Passed
                  </span>
                </div>
                <div className="flex items-center">
                  <XCircle className="h-4 w-4 text-danger-500 mr-1" />
                  <span className="text-sm text-gray-600">
                    {testRun?.stats?.failed || 0} Failed
                  </span>
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-warning-500 mr-1" />
                  <span className="text-sm text-gray-600">
                    {testRun?.stats?.blocked || 0} Blocked
                  </span>
                </div>
                <div className="flex items-center col-span-2 sm:col-span-1">
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300 mr-1"></div>
                  <span className="text-sm text-gray-600">
                    {testRun?.stats?.untested || 0} Untested
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {testRun?.stats?.total || 0} Total
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {filteredTestRuns.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              No test runs found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestRuns;
