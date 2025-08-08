import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { useAuth } from "../../../context/AuthContext";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  CalendarClock,
} from "lucide-react";
import Breadcrumbs from "../../common/Breadcrumbs";
import PageHeader from "../../common/PageHeader";
import { API_URL } from "../../../config";

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
    stats.total > 0 ? Math.round((completedTests / stats.total) * 100) : 0;

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

const TestPlanRuns: React.FC = () => {
  const [testRuns, setTestRuns] = useState([]);
  const [users, setUsers] = useState<{ _id: string; name: string }[]>([]);
  const location = useLocation();
  const data = location.state;

  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchTestRuns = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/test-plan/testPlanRun/${data._id}`
        );
        const testRunsData = response.data.data;
        // Process the test runs data to include stats, progress, and assignee name
        const processedTestRuns = testRunsData.map((testRun) => {
          const { stats, progress, testRunStatus } = calculateTestRunStats(
            testRun.module || []
          );
          // Find the user name for the assignedTo ID
          const assignee = users.find(
            (user) => user._id === testRun.assignedTo
          );
          return {
            ...testRun,
            stats,
            progress,
            description: data.description,
            dueDateFrom: data.dueDateFrom,
            dueDateTo: data.dueDateTo,
            testPlanId: data._id,
            testCases: testRun.module || [],
            status: testRunStatus, // Override backend status with calculated status
            assigneeName: assignee ? assignee.name : "Unassigned",
          };
        });
        const filteredRuns = processedTestRuns.filter(
          (testRun) => testRun.assignedTo === currentUser?._id
        );
        currentUser?.role?.toLowerCase() !== "admin" &&
        currentUser?.role?.toLowerCase() !== "superadmin"
          ? setTestRuns(filteredRuns)
          : setTestRuns(processedTestRuns);
      } catch (error) {
        console.error("Error fetching test runs:", error);
      }
    };

    // Only fetch test runs if users are loaded to ensure assignee names are mapped
    if (users.length > 0) {
      fetchTestRuns();
    }
  }, [users, data._id]);

  useEffect(() => {
    axios
      .get(`${API_URL}/users`)
      .then((response) => {
        const usersData = response.data.data.users;
        const filteredUsers = usersData
          .filter((user: { role: string }) => user.role !== "admin")
          .map((user: { _id: string; name: string }) => ({
            _id: user._id,
            name: user.name,
          }));
        setUsers(filteredUsers);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Test Plans", path: "/test-plans" },
          { label: data.name },
        ]}
      />

      <PageHeader
        title={`${data.name} Test Runs`}
        description={`Execute and track test cases in your ${data.name} plan`}
        actions={<div></div>}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <ul className="divide-y divide-gray-200">
          {testRuns.map((testRun) => (
            <li key={testRun._id} className="p-4 sm:p-6 hover:bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      <Link
                        state={JSON.parse(
                          JSON.stringify({ testRun, projectName: data.name })
                        )}
                        to={`/test-plans/test-runs/${testRun._id}`}
                        className="hover:text-primary-600 font-semibold"
                      >
                        {testRun.osType} - {testRun.browser} -{" "}
                        {testRun.assigneeName}
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
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <div className="flex items-center mr-4">
                      <CalendarClock className="h-4 w-4 mr-1" />
                      Due from:{" "}
                      {testRun.dueDateFrom
                        ? format(new Date(testRun.dueDateFrom), "MMM d, yyyy")
                        : "N/A"}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Due to:{" "}
                      {testRun.dueDateTo
                        ? format(new Date(testRun.dueDateTo), "MMM d, yyyy")
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
                    {testRun?.assigneeName?.charAt(0).toUpperCase() || "?"}
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

        {testRuns.length === 0 && (
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

export default TestPlanRuns;
