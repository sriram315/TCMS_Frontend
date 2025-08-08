import React, { useEffect, useCallback, useMemo, useState } from "react";
import {
  PlayCircle,
  CheckCircle,
  XCircle,
  ClipboardList,
  BarChart,
  MinusCircle,
  HelpCircle,
  DownloadIcon,
} from "lucide-react";

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
import { useGlobalContext } from "../context/GlobalContext";
import {
  generateDailyStats,
  generateMonthlyStats,
  generateWeeklyStats,
} from "../utils/statsConversion";
import Dropdown from "../components/common/Dropdown";
import downloadExcel from "../utils/downloadExcel";
import downloadExcelByWeeks from "../utils/downloadExcelPeriod";

const Dashboard: React.FC = () => {
  const { state, refetchDashboardData, dispatch } = useGlobalContext();
  const [chartType, setChartType] = useState("Weekly");
  const {
    testStatus,
    testProgressData,
    testStatusData,
    testRuns,
    activities,
    testCases,
  } = state;

  useEffect(() => {
    refetchDashboardData();
  }, []);
  const chartData = ["Daily", "Weekly", "Monthly"] as const;

  type ChartType = (typeof chartData)[number];

  const chartFilter: Record<ChartType, any[]> = {
    Daily: generateDailyStats(testCases),
    Weekly: generateWeeklyStats(testCases),
    Monthly: generateMonthlyStats(testCases),
  };

  const handleChartType = (data: ChartType) => {
    setChartType(data);
    dispatch({
      type: "SET_TEST_PROGRESS_DATA",
      payload: chartFilter[data],
    });
  };

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

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const role = user.role;
  const userId = user._id;

  function calculatePercentage(value: any, total: any) {
    if (total === 0) return 0; // To avoid division by zero
    return Math.trunc((value / total) * 100);
  }

  const filteredByRole = useMemo(
    () =>
      String(role).toLowerCase() === "superadmin"
        ? testRuns
        : String(role).toLowerCase() === "admin"
        ? testRuns.filter((testRun) => testRun?.createdBy?._id === userId)
        : testRuns.filter(
            (testRun: any) => testRun?.assignedTo?._id === userId
          ),
    [role, testRuns, userId]
  );

  const upcomingTestRuns = useMemo(
    () =>
      filteredByRole.filter(
        (testRun: { dueDateFrom: string }) =>
          new Date(testRun.dueDateFrom).getTime() > Date.now()
      ),
    [filteredByRole]
  );

  const getTestRunProgressStatus = useCallback((testRuns: any[]) => {
    return testRuns.map((run: { testCases: never[] }) => {
      const testCases = run.testCases || [];

      if (testCases.length === 0) {
        return "not started";
      }

      const statuses = testCases.map((tc: { status: any }) => tc.status);
      const allUntested = statuses.every(
        (status: any) => String(status).toLowerCase() === "untested"
      );
      const noneUntested = statuses.every(
        (status: any) => String(status).toLowerCase() !== "untested"
      );

      if (allUntested) return "not started";
      if (noneUntested) return "completed";
      return "inprogress";
    });
  }, []);

  const testRunProgressStatus = useMemo(
    () =>
      getTestRunProgressStatus(testRuns).filter(
        (status: string) => status === "inprogress"
      ),
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
                <span className="font-semibold">Test progress {chartType}</span>
                <button
                  type="button"
                  className="btn btn-outline mx-3  "
                  onClick={() => downloadExcelByWeeks(testProgressData)}
                >
                  <DownloadIcon className="h-3 w-3 " />
                </button>
              </h3>
              <Dropdown
                dataList={chartData}
                data={chartType}
                handleUpdate={handleChartType}
              />
            </div>
            <div className="card-body">
              {testProgressData.length === 0 ? (
                <span className=" text-gray-500">No data available</span>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={testProgressData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="passed"
                      stroke="#22C55E"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="failed"
                      stroke="#EF4444"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="card h-full">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                Test status
              </h3>
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
                    <Tooltip
                      formatter={(value: number) =>
                        `${Math.trunc(
                          (value / (testStatus.Total || 1)) * 100
                        )}%`
                      }
                    />
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
                            : testStatusData.find((data) => data.name === title)
                                ?.color || "#6B7280",
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
            <h3 className="text-lg font-semibold text-gray-900">
              Recent activity
            </h3>
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
            <h3 className="text-lg font-semibold text-gray-900">
              Upcoming Test Runs
            </h3>
          </div>
          <div className="card-body overflow-y-auto flex-1 divide-y divide-gray-200 px-6">
            <ul>
              {upcomingTestRuns.length > 0 ? (
                upcomingTestRuns.map((testRun) => (
                  <li key={testRun._id} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {testRun.name}
                        </p>
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
                <li className="py-3 text-sm text-gray-500">
                  No upcoming test runs.
                </li>
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
