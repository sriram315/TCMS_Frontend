import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import { useLocation } from "react-router-dom";
import { ChevronLeft, Edit, History, MinusCircle } from "lucide-react";
import StatusBadge from "../components/common/StatusBadge";
import axios from "axios";
import { format } from "date-fns";
import { API_URL } from "../config";
import { toast, ToastContainer } from "react-toastify";
import { useGlobalContext } from "../context/GlobalContext";

interface TestCase {
  _id: string;
  testCaseId?: string;
  title?: string;
  description?: string;
  preRequisite?: string;
  module?: string;
  type?: string;
  status?: string;
  priority?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  steps?: string;
  userStory?: string;
  expectedResult?: string;
  projectId?: string;
  automationStatus?: string;
  url?: string;
  isTestPlan?: boolean;
  executedBy?: String;
}

const TestCaseDetail: React.FC = () => {
  const {
    state,
    fetchTestCases: fetchGlobalTestCases,
    dispatch,
  } = useGlobalContext();
  const { projects, testCases: globalTestCases } = state;
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem(`testCase_${id}_activeTab`);
    return savedTab || "detail";
  });

  const location = useLocation();
  const testCaseData = location.state as any;

  interface Project {
    _id: string;
    name: string;
    // Add other properties if needed
  }
  const [projectsName, setProjectsName] = useState("");
  const userEmail: string =
    JSON.parse(sessionStorage.getItem("user") || "{}")?.email || "";
  const userRole: string =
    JSON.parse(sessionStorage.getItem("user") || "{}")?.role || "";
  const [history, setHistory] = useState<any>([]);
  const navigate = useNavigate();
  const [testCase, setTestCase] = useState<TestCase>({} as TestCase);

  // Check if the URL matches the pattern for hiding history tab
  const isTestRunDetailUrl = location.pathname.includes(
    "/test-plans/test-runs/test-detail/"
  );

  useEffect(() => {
    setTestCase(testCaseData);
    dispatch({ type: "SET_SEARCH", isSearch: false });
  }, []);

  const handleEdit = () => {
    navigate(`/test-cases/edit/${testCase._id}`, {
      state: {
        testCaseData: {
          id: testCase._id,
          title: testCase.title,
          description: testCase.description,
          preRequisite: testCase.preRequisite,
          module: testCase.module,
          type: testCase.type,
          status: testCase.status,
          priority: testCase.priority,
          createdBy: userEmail,
          createdAt: testCase.createdAt,
          updatedAt: testCase.updatedAt,
          steps: testCase.steps,
          userStory: testCase.userStory,
          expectedResult: testCase.expectedResult,
          projectId: testCase.projectId,
          automationStatus: testCase.automationStatus,
        },
        url: testCase.url,
        isTestPlan: testCase.isTestPlan || false,
      },
    });
  };
  const token = sessionStorage.getItem("token") || ""; // Replace with your actual token retrieval method

  const handleDelete = async () => {
    try {
      const res = await axios.delete(
        `${API_URL}/testcases/${testCaseData._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // replace `token` with your actual token variable
          },
        }
      );
      fetchGlobalTestCases();
      toast.success("Test case deleted successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setTimeout(() => {
        navigate("/test-cases");
      }, 2000);
    } catch (error) {
      toast.error("Failed to delete test case. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };
  const fetchTestCase = () => {
    const filteredTestCases = globalTestCases.filter(
      (testCases: any) => testCases._id === testCaseData._id
    );

    setTestCase((prev) => ({
      ...prev,
      ...filteredTestCases[0],
    }));

    const activityHistory = globalTestCases
      .filter(
        (testId: any) =>
          testId.testCaseId === id &&
          testId.projectId === testCaseData.projectId &&
          testId.module === testCaseData.module
      )
      .map((completedTestData: any) => completedTestData?.activityLogs)
      .map((log: any) => log);

    setHistory(activityHistory);
  };
  useEffect(() => {
    if (location.pathname.includes("test-cases")) {
      fetchTestCase();
    } else {
      axios.get(testCaseData.url).then((response) => {
        setTestCase(response.data.data);
      });
    }
  }, [id, testCaseData]);

  useEffect(() => {
    const projectDetails = projects.filter(
      (project: { _id: any }) => project?._id === testCase.projectId
    );
    setProjectsName(projectDetails[0]?.name);
  }, [projects, testCase]);

  useEffect(() => {
    localStorage.setItem(`testCase_${id}_activeTab`, activeTab);
    return () => {
      localStorage.removeItem(`testCase_${id}_activeTab`);
    };
  }, [activeTab, id]);

  return (
    <div>
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

      <PageHeader
        title={`${testCase.testCaseId}: ${testCase.title}`}
        actions={
          <div className="flex">
            {!isTestRunDetailUrl &&
              String(userRole).toLowerCase() !== "admin" &&
              String(userRole).toLowerCase() !== "superadmin" && (
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="btn btn-outline mr-2"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn btn-outline mr-2"
                  >
                    <MinusCircle className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              )}
          </div>
        }
        backNav={true}
      />

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-4 py-2 border-b border-gray-200">
          <div className="flex overflow-x-auto scrollbar-hide">
            <button
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === "detail"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("detail")}
            >
              Test Case
            </button>
            {!isTestRunDetailUrl && (
              <button
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === "history"
                    ? "text-primary-600 border-b-2 border-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("history")}
              >
                History
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {activeTab === "detail" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <dl className="grid grid-cols-[120px_1fr] gap-3 text-sm">
                    <dt className="font-medium text-gray-500">Status:</dt>
                    <dd>
                      <StatusBadge
                        status={testCaseData?.status}
                        testCaseId={""}
                      />
                    </dd>

                    <dt className="font-medium text-gray-500">Module:</dt>
                    <dd className="text-gray-900 truncate max-w-48">
                      {testCase.module}
                    </dd>

                    <dt className="font-medium text-gray-500">
                      Test Case Type:
                    </dt>
                    <dd className="text-gray-900 first-letter:uppercase">
                      {testCase.type}
                    </dd>

                    <dt className="font-medium text-gray-500">Priority:</dt>
                    <dd>
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
                    </dd>
                    <dt className="font-medium text-gray-500">Executed By:</dt>
                    <dd className="text-gray-900 first-letter:uppercase">
                      {testCase?.executedBy || "N/A"}
                    </dd>
                  </dl>
                </div>

                <div>
                  <dl className="grid grid-cols-[120px_1fr] gap-3 text-sm">
                    <dt className="font-medium text-gray-500">Created by:</dt>
                    <dd className="text-gray-900 truncate max-w-72">
                      {testCase && testCase.createdBy}
                    </dd>

                    <dt className="font-medium text-gray-500">Created on:</dt>
                    <dd className="text-gray-900">
                      {testCase?.createdAt &&
                        format(new Date(testCase?.createdAt), "MMMM dd, yyyy")}
                    </dd>

                    <dt className="font-medium text-gray-500">Updated on:</dt>
                    <dd className="text-gray-900">
                      {}
                      {testCase?.updatedAt &&
                      testCase?.createdAt &&
                      testCase?.updatedAt > testCase?.createdAt
                        ? format(new Date(testCase?.updatedAt), "MMMM dd, yyyy")
                        : "N/A"}
                    </dd>
                    <dt className="font-medium text-gray-500">Project Name</dt>
                    <dd className="text-gray-900">{projectsName}</dd>
                  </dl>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Description/Summary
                </h3>
                <div className="text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                  <p>{testCase.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Pre-Conditions
                </h3>
                <div className="text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
                  <p>{testCase.preRequisite}</p>
                </div>
              </div>
              <div className="flex gap-x-4 ">
                <div className="w-1/2 border">
                  <h3 className="text-lg font-medium text-gray-900 mb-2 text-center  border-b">
                    Test Steps
                  </h3>
                  <div className="">
                    <div className="p-4">
                      {testCase?.steps
                        ?.split(/(?=\d+\.)/)
                        .map((step, index) => (
                          <p key={index}>{step.trim()}</p>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="w-1/2 border">
                  <h3 className="text-lg font-medium text-gray-900 mb-2 text-center border-b">
                    Expected Results
                  </h3>
                  <div className="p-4">
                    <div>
                      {testCase?.expectedResult
                        ?.split(/(?=\d+\.)/)
                        .map((result, index) => (
                          <p key={index}>{result.trim()}</p>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div>
              <div className="flex items-center mb-4">
                <History className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Change History
                </h3>
              </div>
              <ul className="space-y-4 overflow-x-auto px-4">
                {history
                  .flat()
                  .sort((a: { updatedAt: any }, b: { updatedAt: any }) => {
                    const dateA = new Date(a.updatedAt || "");
                    const dateB = new Date(b.updatedAt || "");
                    return dateA.getTime() - dateB.getTime();
                  })
                  .map((log: any) => (
                    <li
                      key={log?._id}
                      className="relative pl-5 pb-4 border-l-2 border-gray-200"
                    >
                      <div className="absolute w-3 h-3 bg-primary-500 rounded-full -left-[7px] top-1.5"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-full">
                            {log?.message}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {new Date(log?.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestCaseDetail;
