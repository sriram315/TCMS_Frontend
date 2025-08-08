import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  MinusCircle,
  DownloadIcon,
  ChevronLeft,
} from "lucide-react";
import StatusBadge, { TestStatus } from "../../common/StatusBadge";
import PageHeader from "../../common/PageHeader";
import { format } from "date-fns";
import { API_URL } from "../../../config";
import downloadExcel from "../../../utils/downloadExcel";
const TestPlanRunsDetail: React.FC = () => {
  const location = useLocation();
  const testPlanId = location.state?.testRun?.testPlanId || "";
  const testRunId = location.state?.testRun?._id || "";
  const dueDateFrom = location.state?.testRun?.dueDateFrom || "";
  const dueDateTo = location.state?.testRun?.dueDateTo || "";
  const projectName = location.state?.projectName;
  const title = `${location.state?.testRun.osType} - ${location.state?.testRun.browser} - ${location.state?.testRun.assigneeName}`;
  const [users, setUsers] = useState<any>([]); // Use location state or fallback to testRunData
  const [data, setData] = useState<any>([]); // Use location state or fallback to testRunData

  const [status, setStatus] = useState<any>(Date.now());
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchTestRuns = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/test-plan/testPlanRun/${testPlanId}`
        );
        const testRunsData = response.data.data;
        // setData(testRunsData.filter((module) => module._id === testRunId)[0]);
        const testRun = testRunsData.filter(
          (module) => module._id === testRunId
        )[0];
        const assignee = users.find(
          (user) => String(user._id) == testRun.assignedTo
        );

        setData({
          ...testRun,
          assigneeName: assignee ? assignee.name : "Unassigned",
        });
      } catch (error) {
        console.error("Error fetching test runs:", error);
      }
    };

    fetchTestRuns();
  }, [status, users]);

  const statusCounts = data?.module?.reduce(
    (acc, testCase) => {
      const status = String(testCase.status).toLowerCase() || "untested";
      if (acc[status] !== undefined) {
        acc[status]++;
      }
      acc.total++;
      return acc;
    },
    {
      passed: 0,
      failed: 0,
      blocked: 0,
      untested: 0,
      total: 0,
    }
  );

  // Calculate percentage of completion (e.g. passed + failed + blocked)
  const completed =
    statusCounts?.passed + statusCounts?.failed + statusCounts?.blocked;
  const percentageCompleted =
    statusCounts?.total > 0
      ? Math.trunc((completed / statusCounts?.total) * 100)
      : "0";

  // Derive runStatus
  let runStatus = "Not Started";
  if (statusCounts?.untested === 0 && statusCounts?.total > 0) {
    runStatus = "Completed";
  } else if (
    completed === 0 &&
    statusCounts?.untested === statusCounts?.total
  ) {
    runStatus = "Not Started";
  } else if (completed > 0 && statusCounts?.untested > 0) {
    runStatus = "In Progress";
  }

  const handleStatusChange = (newStatus: TestStatus) => {
    setData((prevData: any) => ({
      ...prevData,
      testCases: newStatus[1].module,
    }));
    setStatus(Date.now());
  };

  return (
    <div>
      <div
        className="inline-flex justify-center items-center text-lg font-medium text-gray-900 cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-8 w-8 text-black" /> Back
      </div>
      <PageHeader
        title={data.name}
        description={data.description}
        actions={<div className="flex"></div>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900 mr-3">
                      {title}
                    </h3>

                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200`}
                    >
                      {runStatus}
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline mx-3  "
                      onClick={() =>
                        downloadExcel(
                          {
                            [`${projectName}`]: data?.module,
                          },
                          `${projectName} - ${title}`
                        )
                      }
                    >
                      <DownloadIcon className="h-3 w-3 " />
                    </button>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mr-3">
                    {projectName}
                  </h4>
                  <div className="mt-1 text-sm text-gray-500">
                    {completed} of {statusCounts?.total} test cases completed
                  </div>
                </div>
                <div className="mt-4 sm:mt-0">
                  <span className="text-xl font-semibold text-gray-900">
                    {percentageCompleted}%
                  </span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div
                  className="bg-primary-600 h-2.5 rounded-full"
                  style={{ width: `${percentageCompleted}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="flex flex-col items-center p-3 bg-success-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-success-500 mb-1" />
                  <span className="text-lg font-semibold text-gray-900">
                    {statusCounts?.passed}
                  </span>
                  <span className="text-sm text-gray-500">Passed</span>
                </div>

                <div className="flex flex-col items-center p-3 bg-danger-50 rounded-lg">
                  <XCircle className="h-6 w-6 text-danger-500 mb-1" />
                  <span className="text-lg font-semibold text-gray-900">
                    {statusCounts?.failed}
                  </span>
                  <span className="text-sm text-gray-500">Failed</span>
                </div>

                <div className="flex flex-col items-center p-3 bg-warning-50 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-warning-500 mb-1" />
                  <span className="text-lg font-semibold text-gray-900">
                    {statusCounts?.blocked}
                  </span>
                  <span className="text-sm text-gray-500">Blocked</span>
                </div>

                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <MinusCircle className="h-6 w-6 text-gray-500 mb-1" />
                  <span className="text-lg font-semibold text-gray-900">
                    {statusCounts?.untested}
                  </span>
                  <span className="text-sm text-gray-500">Untested</span>
                </div>

                <div className="flex flex-col items-center justify-center p-3 bg-gray-100 rounded-lg">
                  <span className="text-lg font-semibold text-gray-900">
                    {statusCounts?.total}
                  </span>
                  <span className="text-sm text-gray-500">Total</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Details
              </h3>

              <dl className="grid grid-cols-[100px_1fr] gap-3 text-sm mb-5">
                <dt className="font-medium text-gray-500">Assigned to:</dt>
                <dd className="text-gray-900">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full mr-2 border flex items-center justify-center font-semibold">
                      {data?.assigneeName?.charAt(0).toUpperCase() || "?"}
                    </div>
                    {data?.assigneeName}
                  </div>
                </dd>

                <dt className="font-medium text-gray-500">Due date from:</dt>
                <dd className="text-gray-900">
                  {format(new Date(dueDateFrom), "MMMM dd, yyyy")}
                </dd>

                <dt className="font-medium text-gray-500">Due date to:</dt>
                <dd className="text-gray-900">
                  {" "}
                  {format(new Date(dueDateTo), "MMMM dd, yyyy")}
                </dd>
              </dl>

              <div className="border-t border-gray-200 pt-4"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th scope="col" className="w-12">
                  ID
                </th>
                <th scope="col">Title</th>
                <th scope="col">Status</th>
                <th scope="col">Module</th>
              </tr>
            </thead>
            <tbody>
              {data?.module?.map((testCase) => (
                <tr key={testCase._id} className="hover:bg-gray-50">
                  <td className="font-medium whitespace-nowrap">
                    {testCase.testCaseId}
                  </td>
                  <td>
                    <Link
                      state={{
                        ...testCase,
                        isTestPlan: true,
                        url: `${API_URL}/test-plan/${testPlanId}/${testRunId}/${testCase._id}`,
                      }}
                      to={`/test-plans/test-runs/test-detail/${testCase.testCaseId}`}
                      className="text-primary-600 hover:text-primary-900 font-medium"
                    >
                      {testCase.title}
                    </Link>
                  </td>
                  <td>
                    <StatusBadge
                      status={testCase.status}
                      testCaseId={testCase._id}
                      size="sm"
                      edit={true}
                      onClick={handleStatusChange}
                      url={`${API_URL}/test-plan/${testPlanId}/${testRunId}/${testCase._id}`}
                    />
                  </td>
                  <td className="text-gray-600">{testCase.module}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data?.testCases?.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              No test cases found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPlanRunsDetail;
