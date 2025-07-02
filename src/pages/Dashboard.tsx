import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { PlayCircle, CheckCircle, XCircle, ClipboardList, BarChart, MinusCircle, HelpCircle } from "lucide-react";

import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/dashboard/StatCard";
import ActivityItem from "../components/dashboard/ActivityItem";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

const Dashboard: React.FC = () => {
  // State to hold status counts as an object
  const [testStatus, setTestStatus] = useState({
    Passed: 0,
    Failed: 0,
    Untested: 0,
    Blocked: 0,
    Total: 0,
  });
  type WeeklyStat = { name: string; passed: number; failed: number; [key: string]: any };
  const [testProgressData, setTestProgressData] = useState<WeeklyStat[]>([]);

  // State for testStatusData to update PieChart
  const [testStatusData, setTestStatusData] = useState([
    { name: "Passed", value: 0, color: "#22C55E" },
    { name: "Failed", value: 0, color: "#EF4444" },
    { name: "Blocked", value: 0, color: "#F59E0B" },
    { name: "Untested", value: 0, color: "#E5E7EB" },
  ]);

  type TestRun = {
    _id: string;
    name: string;
    createdBy?: { _id: string; name?: string };
    assignedTo?: { _id: string; name?: string };
    dueDateFrom?: string;
    testCases?: any[];
    // Add other properties as needed
  };
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  type Project = {
    _id: string;
    name: string;
    createdBy?: { _id: string };
    testCases?: any[];
    // Add other properties as needed
  };
  const [projects, setProjects] = useState<Project[]>([]);
  const { user: currentUser } = useAuth();
  type Activity = {
    _id: string;
    [key: string]: any; // Add more specific properties as needed
  };
  const [activities, setActivities] = useState<Activity[]>([]);

  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/projects`);
      setProjects(data);
      // Store projects in sessionStorage to persist between refreshes
      sessionStorage.setItem("projectData", JSON.stringify(data));
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, []);

  useEffect(() => {
    // Try to load projects from sessionStorage first
    const storedProjects = sessionStorage.getItem("projectData");
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
    fetchProjects();
  }, []);

  // Make fetchTestCases dependent on projects being available
  useEffect(() => {
    if (projects.length > 0) {
      fetchTestCases();
    }
  }, [projects]);

  // Remove the fetchTestCases call from the original useEffect
  useEffect(() => {
    fetchTestRuns();
    // fetchTestCases(); // Remove this line
  }, []);

  // Format date for display
  const formatDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Helper to get ISO week number
  const getWeekNumber = (date: number | Date) => {
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDay) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
  };
  const generateWeeklyStats = (testCases: any[]) => {
    const weeks = {};

    testCases.forEach((test: { updatedAt: string | number | Date; status: any }) => {
      const updatedAt = new Date(test.updatedAt);
      const week = `Week ${getWeekNumber(updatedAt)}`;

      if (!weeks[week]) {
        weeks[week] = { passed: 0, failed: 0 };
      }

      if (String(test.status).toLowerCase() === "passed") {
        weeks[week].passed += 1;
      } else if (String(test.status).toLowerCase() === "failed") {
        weeks[week].failed += 1;
      }
    });

    return Object.entries(weeks).map(([week, counts]) => ({
      name: week,
      ...(typeof counts === "object" && counts !== null ? counts : {}),
    }));
  };

  const fetchTestRuns = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/test-runs`);

      // Updated filtering logic for testRuns based on user roles
      let filteredData;
      if (String(role).toLowerCase() === "superadmin") {
        // If superadmin, show all test runs
        filteredData = data;
      } else if (String(role).toLowerCase() === "admin") {
        // If admin, show test runs created by admin
        filteredData = data.filter((testRun: { createdBy: { _id: any } }) => testRun?.createdBy?._id === userId);
      } else {
        // For other users, show test runs assigned to them
        filteredData = data.filter((testRun: { assignedTo: { _id: any } }) => testRun?.assignedTo?._id === userId);
      }

      setTestRuns(filteredData);
    } catch (error) {
      console.error("Error fetching test runs:", error);
    }
  }, []);
  const calculateTestRunStats = useCallback((testCases: string | any[]) => {
    const stats = {
      passed: 0,
      failed: 0,
      blocked: 0,
      untested: 0,
      total: testCases?.length || 0,
    };

    (testCases || []).forEach((testCase: { status: string }, index: any) => {
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
    const progress = stats.total > 0 ? Math.round((completedTests / stats.total) * 100) : 0;

    // Determine test run status based on test case counts
    let testRunStatus = "Not Started";
    if (stats.total === stats.untested) {
      testRunStatus = "Not Started";
    } else if (stats.untested === 0 && stats.passed + stats.failed + stats.blocked === stats.total) {
      testRunStatus = "Completed";
    } else if (stats.untested < stats.total && (stats.passed > 0 || stats.failed > 0 || stats.blocked > 0)) {
      testRunStatus = "In Progress";
    }

    return { stats, progress, testRunStatus };
  }, []);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const name = user.email;
  const role = user.role;
  const userId = user._id;

  const fetchTestCases = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/testcases`);

      const filteredData =
        String(role).toLowerCase() === "superadmin"
          ? data
          : String(role).toLowerCase() === "admin"
          ? projects
              .filter((project) => currentUser && project?.createdBy?._id === currentUser._id)
              .flatMap((project) => project.testCases)
          : data.filter((testCase: { createdBy: any }) => testCase.createdBy === name);

      setTestProgressData(generateWeeklyStats(filteredData));
      // Use the helper function
      const { stats } = calculateTestRunStats(filteredData);

      // Update state
      setTestStatus({
        Passed: stats.passed,
        Failed: stats.failed,
        Untested: stats.untested,
        Blocked: stats.blocked,
        Total: stats.total,
      });

      setTestStatusData([
        {
          name: "Passed",
          value: stats.passed,
          color: "#22C55E",
        },
        {
          name: "Failed",
          value: stats.failed,
          color: "#EF4444",
        },
        {
          name: "Blocked",
          value: stats.blocked,
          color: "#F59E0B",
        },
        {
          name: "Untested",
          value: stats.untested,
          color: "#E5E7EB",
        },
      ]);
    } catch (error) {
      console.error("Error fetching test cases:", error);
    }
  }, [role, projects, generateWeeklyStats, calculateTestRunStats, currentUser ? currentUser._id : null, name]);

  useEffect(() => {
    fetchTestRuns();
    fetchTestCases();
  }, []);

  function calculatePercentage(value: any, total: any) {
    if (total === 0) return 0; // To avoid division by zero
    return Math.trunc((value / total) * 100);
  }

  const fetchActivity = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/recent-activity`);
      const data = response.data;

      // Updated filtering logic based on user roles
      let filteredData;
      if (String(role).toLowerCase() === "superadmin") {
        // If superadmin, show all activities
        filteredData = data;
      } else if (String(role).toLowerCase() === "admin") {
        // If admin, show activities created by admin and users created by this admin
        filteredData = data.filter(
          (activity: { createdBy: { _id: any; accountCreatedBy: any } }) =>
            activity?.createdBy?._id === userId || activity?.createdBy?.accountCreatedBy === userId
        );
      } else {
        // For other users, show only their own activities
        filteredData = data?.filter((activity: { createdBy: { _id: any } }) => activity?.createdBy?._id === userId);
      }

      setActivities(filteredData);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  }, [API_URL, role, userId]);

  useEffect(() => {
    fetchActivity();
  }, []);

  const filteredByRole = useMemo(
    () =>
      String(role).toLowerCase() === "superadmin"
        ? testRuns
        : String(role).toLowerCase() === "admin"
        ? testRuns.filter((testRun) => testRun?.createdBy?._id === userId)
        : testRuns.filter((testRun: any) => testRun?.assignedTo?._id === userId),
    [role, testRuns, userId]
  );

  const upcomingTestRuns = useMemo(
    () =>
      filteredByRole.filter((testRun: { dueDateFrom: string }) => new Date(testRun.dueDateFrom).getTime() > Date.now()),
    [filteredByRole]
  );

  const getTestRunProgressStatus = useCallback((testRuns: any[]) => {
    return testRuns.map((run: { testCases: never[] }) => {
      const testCases = run.testCases || [];

      if (testCases.length === 0) {
        return "not started";
      }

      const statuses = testCases.map((tc: { status: any }) => tc.status);
      const allUntested = statuses.every((status: any) => String(status).toLowerCase() === "untested");
      const noneUntested = statuses.every((status: any) => String(status).toLowerCase() !== "untested");

      if (allUntested) return "not started";
      if (noneUntested) return "completed";
      return "inprogress";
    });
  }, []);

  const testRunProgressStatus = useMemo(
    () => getTestRunProgressStatus(testRuns).filter((status: string) => status === "inprogress"),
    [testRuns, getTestRunProgressStatus]
  );

  return (
    <div>
      <PageHeader title="Dashboard" description="Test overview" />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatCard
          title="Active Test Runs"
          value={testRunProgressStatus.length}
          icon={<PlayCircle className="h-6 w-6" />}
          color="primary"
        />
        <StatCard
          title="Total Test Cases"
          value={testStatus.Total}
          icon={<ClipboardList className="h-6 w-6" />}
          color="secondary"
        />
        <StatCard
          title="Untested Test Cases"
          value={testStatus.Untested}
          icon={<HelpCircle className="h-6 w-6" />}
          color="secondary"
        />

        <StatCard
          title="Passed Test Cases "
          value={testStatus.Passed}
          icon={<CheckCircle className="h-6 w-6" />}
          trend={{
            value: calculatePercentage(testStatus.Passed, testStatus.Total),
            positive: true,
          }}
          color="success"
        />
        <StatCard
          title="Failed Test Cases "
          value={testStatus.Failed}
          icon={<XCircle className="h-6 w-6" />}
          trend={{
            value: calculatePercentage(testStatus.Failed, testStatus.Total),
            positive: false,
          }}
          color="danger"
        />
        <StatCard
          title="Blocked Test Cases "
          value={testStatus.Blocked}
          icon={<MinusCircle className="h-6 w-6" />}
          trend={{
            value: calculatePercentage(testStatus.Blocked, testStatus.Total),
            positive: false,
          }}
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="card h-full">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <BarChart className="h-5 w-5 text-gray-500 mr-2" />
                <span className="font-semibold">Test progress Weekly</span>
              </h3>
            </div>
            <div className="card-body">
              {testProgressData.length === 0 ? (
                <span className=" text-gray-500">No data available</span>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={testProgressData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="passed" stroke="#22C55E" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="failed" stroke="#EF4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="card h-full">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Test status</h3>
            </div>
            <div className="card-body flex flex-col items-center justify-center">
              {testStatusData.every((item) => item.value === 0) ? (
                <div className="h-[200px]">
                  <span className=" text-gray-500">No data available</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={testStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {testStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${Math.trunc((value / (testStatus.Total || 1)) * 100)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              )}

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4">
                {Object.entries(testStatus).map(([title, count], index) => (
                  <div key={index} className="flex items-center">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor:
                          title === "Total"
                            ? "#6B7280"
                            : testStatusData.find((data) => data.name === title)?.color || "#6B7280",
                      }}
                    ></span>
                    <span className="text-sm text-gray-700">
                      {title}: {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Recent Activity */}
  <div className="card h-96 flex flex-col">
    <div className="card-header px-6 py-4 flex-shrink-0">
      <h3 className="text-lg font-semibold text-gray-900">Recent activity</h3>
    </div>
    <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
      {activities.length > 0 ? (
        activities.map((activity) => (
          <div key={activity._id} className="px-6 py-3">
            <ActivityItem activity={activity} />
          </div>
        ))
      ) : (
        <div className="flex items-center justify-center h-full text-sm text-gray-500">
          No Activities.
        </div>
      )}
    </div>
  </div>

  {/* Upcoming Test Runs */}
  <div className="card h-96 flex flex-col">
    <div className="card-header px-6 py-4 flex-shrink-0">
      <h3 className="text-lg font-semibold text-gray-900">Upcoming Test Runs</h3>
    </div>
    <div className="card-body overflow-y-auto flex-1 divide-y divide-gray-200 px-6">
      <ul>
        {upcomingTestRuns.length > 0 ? (
          upcomingTestRuns.map((testRun) => (
            <li key={testRun._id} className="py-3">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{testRun.name}</p>
                  <p className="text-sm text-gray-500">
                    Assigned to: {testRun?.assignedTo?.name}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(testRun?.dueDateFrom || "")}
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="py-3 text-sm text-gray-500">No upcoming test runs.</li>
        )}
      </ul>
    </div>
    <div className="card-footer px-6 py-2 flex-shrink-0">
      <Link
        to="/test-runs"
        className="text-sm font-medium text-primary-600 hover:text-primary-500"
      >
        View all test runs →
      </Link>
    </div>
  </div>
</div>
    </div>
  );
};

export default Dashboard;
