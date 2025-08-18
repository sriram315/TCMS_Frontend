import React, { useCallback, useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import {
  BarChart,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  BarChart as ReBarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { format } from "date-fns";
import { useGlobalContext } from "../context/GlobalContext";
import { generateMonthlyStats } from "../utils/statsConversion";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-white border border-gray-300 p-2 rounded shadow">
        <p className="text-sm font-bold">Project: {data.project}</p>
        <p className="text-sm ">Module: {label}</p>
        <p className="text-sm text-green-600">Tested: {data.Tested}</p>
        <p className="text-sm text-red-500">UnTested: {data.Untested}</p>
      </div>
    );
  }

  return null;
};

const Reports: React.FC = () => {
  const { state, dispatch } = useGlobalContext();
  const { projects, testCases } = state;
  const [pieChartData, setPieChartData] = useState<any>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const [testTrendData, setTestTrendData] = useState<any>([]);

  useEffect(() => {
    dispatch({ type: "SET_SEARCH", payload: { text: "", isSearch: false } });
    if (testCases.length > 0) {
      processAllChartData();
    }
  }, [testCases]);

  // Consolidated function to process all chart data
  const processAllChartData = useCallback(() => {
    // Process pie chart data
    const totalTestCases = testCases?.length;
    if (totalTestCases > 0) {
      const updatedPieData = [
        {
          name: "Passed",
          value: Math.trunc(
            (testCases.filter(
              (item: any) => String(item.status).toLowerCase() === "passed"
            ).length /
              totalTestCases) *
              100
          ),
          count: testCases.filter(
            (item: any) => String(item.status).toLowerCase() === "passed"
          ).length,
          color: "#22C55E",
        },
        {
          name: "Failed",
          value: Math.trunc(
            (testCases.filter(
              (item: any) => String(item.status).toLowerCase() === "failed"
            ).length /
              totalTestCases) *
              100
          ),
          count: testCases.filter(
            (item: any) => String(item.status).toLowerCase() === "failed"
          ).length,
          color: "#EF4444",
        },
        {
          name: "Blocked",
          value: Math.trunc(
            (testCases.filter(
              (item: any) => String(item.status).toLowerCase() === "blocked"
            ).length /
              totalTestCases) *
              100
          ),
          count: testCases.filter(
            (item: any) => String(item.status).toLowerCase() === "blocked"
          ).length,
          color: "#F59E0B",
        },
        {
          name: "Untested",
          value: Math.trunc(
            (testCases.filter(
              (item: any) => String(item.status).toLowerCase() === "untested"
            ).length /
              totalTestCases) *
              100
          ),
          count: testCases.filter(
            (item: any) => String(item.status).toLowerCase() === "untested"
          ).length,
          color: "#E5E7EB",
        },
      ];
      setPieChartData(updatedPieData);
    } else {
      // Set empty pie chart data when no data
      setPieChartData([
        { name: "Passed", value: 0, count: 0, color: "#22C55E" },
        { name: "Failed", value: 0, count: 0, color: "#EF4444" },
        { name: "Blocked", value: 0, count: 0, color: "#F59E0B" },
        { name: "Untested", value: 0, count: 0, color: "#E5E7EB" },
      ]);
    }

    // Process trend data
    setTestTrendData(generateMonthlyStats(testCases));

    // Process module chart data
    if (testCases?.length > 0) {
      const groupedData = testCases.reduce((acc: any, item: any) => {
        const projectName = item.projectId;
        const moduleName = item.module;

        if (!acc[projectName]) {
          acc[projectName] = {};
        }

        if (!acc[projectName][moduleName]) {
          acc[projectName][moduleName] = {
            project: projects.filter(
              (project) => project._id === projectName
            )?.[0]?.name,
            name: moduleName,
            Tested: 0,
            Untested: 0,
            count: 0,
          };
        }

        const status = String(item.status).toLowerCase();

        if (["passed", "failed", "blocked"].includes(status)) {
          acc[projectName][moduleName].Tested += 1;
        } else if (status === "untested") {
          acc[projectName][moduleName].Untested += 1;
        }

        acc[projectName][moduleName].count += 1;
        return acc;
      }, {});

      // Convert grouped data to array format and get top 4 modules per project
      const finalChartData: any[] = [];

      Object.values(groupedData).forEach((modulesByProject: any) => {
        const modulesArray = Object.values(modulesByProject)
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 4); // top 4 modules per project

        finalChartData.push(...modulesArray); // flatten to one array, or group by project if needed
      });

      setChartData(finalChartData);
    } else {
      setChartData([]);
    }
  }, [generateMonthlyStats]);

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate and analyze test reports for your project"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChartIcon className="h-5 w-5  text-gray-500 mr-2" />
              Test Results Overview
            </h3>
            <div className="flex items-center space-x-2"></div>
          </div>
          <div className="p-6">
            {pieChartData.every(
              (entry: { count: number }) => entry.count === 0
            ) ? (
              <div className="flex justify-center items-center h-64">
                <span className="text-gray-500">No data available</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    labelLine={false}
                  >
                    {pieChartData.map((entry: any, index: any) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={(entry as { color: string }).color}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => `${props.payload.count}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {pieChartData.map((entry: any, index: any) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="flex items-center mb-1">
                    <span
                      className="w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor: (entry as { color: string }).color,
                      }}
                    ></span>
                    <span className="text-sm font-medium text-gray-700">
                      {(entry as { name: string }).name}
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {isNaN((entry as { value: number }).value)
                      ? 0
                      : (entry as { value: number }).value}
                    %
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <LineChartIcon className="h-5 w-5 text-gray-500 mr-2" />
              Test Execution Trend Monthly
            </h3>
          </div>
          <div className="p-6">
            {testTrendData.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <span className="text-gray-500">No data available</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={testTrendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    name="Passed"
                    dataKey="passed"
                    stroke="#22C55E"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    name="Failed"
                    dataKey="failed"
                    stroke="#EF4444"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className=" gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart className="h-5 w-5 text-gray-500 mr-2" />
              Latest Modules
            </h3>
          </div>
          <div className="p-6">
            {chartData.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <span className="text-gray-500">No data available</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ReBarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar name="Tested" dataKey="Tested" fill="#3B82F6" />
                  <Bar name="Untested" dataKey="Untested" fill="#9CA3AF" />
                </ReBarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Reports
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Report Name</th>
                <th scope="col">Module</th>
                <th scope="col">Created By</th>
                <th scope="col">Date</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {testCases?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500">
                    No data available.
                  </td>
                </tr>
              ) : (
                testCases
                  ?.sort(
                    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
                  )
                  .map((data: any, index: any) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="font-medium text-gray-900 max-w-3 truncate">
                        {data.title}
                      </td>
                      <td className="max-w-2 truncate">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 ">
                          {data.module}
                        </span>
                      </td>
                      <td className="truncate max-w-3">{data.createdBy}</td>
                      <td>
                        {data?.updatedAt &&
                          format(new Date(data?.updatedAt), "MMMM dd, yyyy")}
                      </td>
                      <td>{data.status}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
