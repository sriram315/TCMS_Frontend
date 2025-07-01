import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Breadcrumbs from "../components/common/Breadcrumbs";
import IssuePopup, { IssueData } from "../components/IssuePopup";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  MinusCircle,
  // RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";

export type TestStatus = "passed" | "failed" | "blocked" | "untested";
// | "retest";

const STATUS_OPTIONS: Record<
  TestStatus,
  { icon: React.ElementType; className: string; text: string }
> = {
  passed: { icon: CheckCircle, className: "text-green-600", text: "Passed" },
  failed: { icon: XCircle, className: "text-red-600", text: "Failed" },
  blocked: {
    icon: AlertTriangle,
    className: "text-yellow-600",
    text: "Blocked",
  },
  untested: { icon: MinusCircle, className: "text-gray-400", text: "Untested" },
  // retest: { icon: RotateCcw, className: "text-blue-600", text: "Retest" },
};

const TestRunDetail: React.FC = () => {
  const [testRun, setTestRun] = useState(null);
  const { id } = useParams();
  const [editingTestCaseId, setEditingTestCaseId] = useState<string | null>(
    null
  );
  const token = sessionStorage.getItem("token") || "";
  const [isIssuePopupOpen, setIsIssuePopupOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTestRun = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/test-runs/${id}`
        );
        setTestRun(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTestRun();
  }, [id]);

  if (!testRun) return null;

  const statusCounts = testRun.testCases?.reduce(
    (acc, testCase) => {
      const status = testCase.status?.toLowerCase() || "untested";
      if (status === "passed") acc.passed++;
      else if (status === "failed") acc.failed++;
      else if (status === "blocked") acc.blocked++;
      else if (status === "retest") acc.retest++;
      else acc.untested++;
      acc.total++;
      return acc;
    },
    { passed: 0, failed: 0, blocked: 0, untested: 0, retest: 0, total: 0 }
  ) || { passed: 0, failed: 0, blocked: 0, untested: 0, retest: 0, total: 0 };

  const completed =
    statusCounts.passed +
    statusCounts.failed +
    statusCounts.blocked +
    statusCounts.retest;
  const percentageCompleted =
    statusCounts.total > 0
      ? Math.trunc((completed / statusCounts.total) * 100)
      : "0";

  let runStatus = "Not Started";
  if (statusCounts.untested === 0 && statusCounts.total > 0) {
    runStatus = "Completed";
  } else if (completed === 0 && statusCounts.untested === statusCounts.total) {
    runStatus = "Not Started";
  } else if (completed > 0 && statusCounts.untested > 0) {
    runStatus = "In Progress";
  }

  const normalizeStatus = (status: string | undefined): TestStatus => {
    const validStatuses = ["passed", "failed", "blocked", "untested", "retest"];
    const normalized = status?.toLowerCase();
    return validStatuses.includes(normalized) ? normalized : "untested";
  };

  const { user } = useAuth();
  const handleStatusChange = async (
    testCaseId: string,
    newStatus: TestStatus
  ) => {
    try {
      await axios.put(
        `http://localhost:5000/api/testcases/${testCaseId}`,

        { status: newStatus, updatedBy: user.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      sessionStorage.removeItem("testCasesData");
      setTestRun({
        ...testRun,
        testCases: testRun.testCases.map((tc) =>
          tc._id === testCaseId ? { ...tc, status: newStatus } : tc
        ),
      });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
    setEditingTestCaseId(null);
  };

  const handleCreateIssue = (testCase) => {
    setSelectedTestCase(testCase);
    setIsIssuePopupOpen(true);
  };

  const handleIssueSubmit = async (issueData: IssueData) => {
    setIsLoading(true);
    try {
      await axios.post("http://localhost:5000/api/jira/issues", {
        ...issueData,
      });
      console.log("Issue created:", issueData);
      toast.success("Issue created successfully");
      setIsIssuePopupOpen(false);
    } catch (error) {
      console.error("Failed to create issue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log(testRun);

  return (
    <div>
      <ToastContainer />
      <Breadcrumbs
        items={[
          { label: "Test Runs", path: "/test-runs" },
          { label: testRun.name },
        ]}
      />
      <div className="flex justify-between items-center">
        <PageHeader title={testRun.name} description={testRun.description} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900 mr-3">
                    Progress
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 border border-primary-200">
                    {runStatus}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {completed} of {statusCounts.total} test cases completed
                </div>
              </div>
              <span className="text-xl font-semibold text-gray-900 mt-4 sm:mt-0">
                {percentageCompleted}%
              </span>
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
                  {statusCounts.passed}
                </span>
                <span className="text-sm text-gray-500">Passed</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-danger-50 rounded-lg">
                <XCircle className="h-6 w-6 text-danger-500 mb-1" />
                <span className="text-lg font-semibold text-gray-900">
                  {statusCounts.failed}
                </span>
                <span className="text-sm text-gray-500">Failed</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-warning-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-warning-500 mb-1" />
                <span className="text-lg font-semibold text-gray-900">
                  {statusCounts.blocked}
                </span>
                <span className="text-sm text-gray-500">Blocked</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                <MinusCircle className="h-6 w-6 text-gray-500 mb-1" />
                <span className="text-lg font-semibold text-gray-900">
                  {statusCounts.untested}
                </span>
                <span className="text-sm text-gray-500">Untested</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-gray-100 rounded-lg">
                <span className="text-lg font-semibold text-gray-900">
                  {statusCounts.total}
                </span>
                <span className="text-sm text-gray-500">Total</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
            <dl className="grid grid-cols-[100px_1fr] gap-3 text-sm mb-5">
              <dt className="font-medium text-gray-500">Assigned to:</dt>
              <dd className="text-gray-900">
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full mr-2  border border-gray-200 flex items-center justify-center font-semibold">
                    {testRun?.assignedTo?.name?.charAt(0).toUpperCase()}
                  </div>

                  {testRun?.assignedTo.name}
                </div>
              </dd>
              <dt className="font-medium text-gray-500">Due date from:</dt>
              <dd className="text-gray-900">
                {format(new Date(testRun?.dueDateFrom), "MMM d, yyyy")}
              </dd>
              <dt className="font-medium text-gray-500">Due date to:</dt>
              <dd className="text-gray-900">
                {format(new Date(testRun?.dueDateTo), "MMM d, yyyy")}
              </dd>
            </dl>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Description
              </h4>
              <p className="text-sm text-gray-700">{testRun.description}</p>
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
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {testRun.testCases?.map((testCase) => {
                const currentStatus = normalizeStatus(testCase.status);
                const {
                  icon: Icon,
                  className,
                  text,
                } = STATUS_OPTIONS[currentStatus];
                return (
                  <tr key={testCase._id} className="hover:bg-gray-50">
                    <td className="font-medium whitespace-nowrap">
                      {testCase.testCaseId}
                    </td>
                    <td>
                      <Link
                        state={testCase}
                        to={`/test-cases/${testCase.testCaseId}`}
                        className="text-primary-600 hover:text-primary-900 font-medium"
                      >
                        {testCase.title}
                      </Link>
                    </td>
                    <td>
                      {editingTestCaseId === testCase._id ? (
                        <select
                          className="border text-sm rounded px-2 py-1"
                          value={currentStatus}
                          onChange={(e) =>
                            handleStatusChange(
                              testCase._id,
                              e.target.value as TestStatus
                            )
                          }
                          onBlur={() => setEditingTestCaseId(null)}
                          autoFocus
                        >
                          {Object.entries(STATUS_OPTIONS).map(
                            ([key, option]) => (
                              <option key={key} value={key}>
                                {option.text}
                              </option>
                            )
                          )}
                        </select>
                      ) : (
                        <span
                          onClick={() => setEditingTestCaseId(testCase._id)}
                          className={`inline-flex items-center gap-1 rounded cursor-pointer ${className} text-xs px-1.5 py-0.5`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{text}</span>
                        </span>
                      )}
                    </td>
                    <td className="text-gray-600">{testCase.module}</td>
                    <td>
                      {currentStatus === "failed" && (
                        <button
                          onClick={() => handleCreateIssue(testCase)}
                          className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded"
                        >
                          Create Issue
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {testRun.testCases?.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500">No test cases found.</p>
          </div>
        )}
      </div>

      {/* Issue Popup */}
      <IssuePopup
        isLoading={isLoading}
        isOpen={isIssuePopupOpen}
        onClose={() => setIsIssuePopupOpen(false)}
        onSubmit={handleIssueSubmit}
        testCaseInfo={
          selectedTestCase
            ? {
                id: selectedTestCase._id,
                title: selectedTestCase.title,
                project: selectedTestCase.projectId, // keep as is
              }
            : undefined
        }
      />
    </div>
  );
};
export default TestRunDetail;
