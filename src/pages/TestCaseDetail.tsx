import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import Breadcrumbs from "../components/common/Breadcrumbs";
import { useLocation } from "react-router-dom";
import { Edit, History, Slice } from "lucide-react";
import StatusBadge from "../components/common/StatusBadge";
import axios from "axios";
import { format } from "date-fns";

const TestCaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // Initialize activeTab from localStorage if available, otherwise default to "detail"
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem(`testCase_${id}_activeTab`);
    return savedTab || "detail";
  });
  const location = useLocation();
  const testCaseData = location.state as any;
  const [projects, setProjects] = useState([]);
  const [projectsName, setProjectsName] = useState("");
  const userEmail: string =
    JSON.parse(sessionStorage.getItem("user") || "{}")?.email || "";
  const userRole: string =
    JSON.parse(sessionStorage.getItem("user") || "{}")?.role || "";
  const [history, setHistory] = useState<any>([]);
  const navigate = useNavigate();
  const [testCase, setTestCase] = useState({});

  // Check if the URL matches the pattern for hiding history tab
  const isTestRunDetailUrl = location.pathname.includes(
    "/test-plans/test-runs/test-detail/"
  );

  useEffect(() => {
    setTestCase(testCaseData);
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
  const fetchTestCase = () => {
    axios
      .get("http://localhost:5000/api/testcases")
      .then((response) => {
        const filteredTestCases = response.data.filter(
          (testCases: any) => testCases._id === testCaseData._id
        );

        setTestCase((prev) => ({
          ...prev,
          ...filteredTestCases[0],
        }));

        const activityHistory = response.data
          .filter((testId: any) => testId.testCaseId === id)
          .map((completedTestData: any) => completedTestData?.activityLogs)
          .map((log: any) => log);

        setHistory(activityHistory);
      })
      .catch((error) => {
        console.error("Error while fetching the test cases:", error);
      });
  };
  useEffect(() => {
    console.log(location.pathname);

    console.log(location.pathname.includes("test-cases"));

    if (location.pathname.includes("test-cases")) {
      fetchTestCase();
    } else {
      axios.get(testCaseData.url).then((response) => {
        console.log(response.data.data);

        setTestCase(response.data.data);
      });
    }
  }, [id, testCaseData]);
  console.log(testCase);

  useEffect(() => {
    // Fetch projects from the API
    axios
      .get("http://localhost:5000/api/projects")
      .then((response) => {
        setProjects(response.data);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  }, []);

  useEffect(() => {
    const projectDetails = projects.filter(
      (project) => project?._id === testCase.projectId
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
      {/* <Breadcrumbs
        items={[
          { label: "Test Cases", path: "/test-cases" },
          {
            label: testCase.module,
            path: "/test-cases?section=authentication",
          },
          { label: testCase.title },
        ]}
      /> */}

      <PageHeader
        title={`${testCase.testCaseId}: ${testCase.title}`}
        actions={
          <div className="flex">
            {!isTestRunDetailUrl &&
              String(userRole).toLowerCase() !== "admin" &&
              String(userRole).toLowerCase() !== "superadmin" && (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="btn btn-outline mr-2"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
              )}
            {/* <button type="button" className="btn btn-primary mr-2">
              <PlayCircle className="h-4 w-4 mr-1" />
              Run Test
            </button>
            <div className="relative">
              <button type="button" className="btn btn-outline">
                <span className="sr-only">More options</span>
                <span className="h-5 w-5">⋯</span>
              </button>
            </div> */}
          </div>
        }
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
            {/* <button
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'comments'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('comments')}
            >
              Comments ({MOCK_TEST_CASE.comments.length})
            </button> */}
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
                      <StatusBadge status={testCaseData?.status} />
                    </dd>

                    <dt className="font-medium text-gray-500">Module:</dt>
                    <dd className="text-gray-900 truncate max-w-48">
                      {testCase.module}
                    </dd>

                    <dt className="font-medium text-gray-500">Type:</dt>
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
                  </dl>
                </div>

                <div>
                  <dl className="grid grid-cols-[120px_1fr] gap-3 text-sm">
                    <dt className="font-medium text-gray-500">Created by:</dt>
                    <dd className="text-gray-900 truncate max-w-72">
                      {testCase && testCase.createdBy}
                      {console.log(testCase)}
                    </dd>

                    <dt className="font-medium text-gray-500">Created on:</dt>
                    <dd className="text-gray-900">
                      {testCase?.createdAt &&
                        format(new Date(testCase?.createdAt), "MMMM dd, yyyy")}
                    </dd>

                    <dt className="font-medium text-gray-500">Updated on:</dt>
                    <dd className="text-gray-900">
                      {}
                      {testCase?.updatedAt > testCase?.createdAt
                        ? format(new Date(testCase?.updatedAt), "MMMM dd, yyyy")
                        : "N/A"}
                    </dd>
                    <dt className="font-medium text-gray-500">Project Name</dt>
                    <dd className="text-gray-900">{projectsName}</dd>

                    {/* <dt className="font-medium text-gray-500">Tags:</dt> */}
                    {/* <dd>
                      <div className="flex flex-wrap gap-1">
                        {MOCK_TEST_CASE.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </dd> */}
                  </dl>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Description
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
                    {/* <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 w-12">#</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Test Step</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Expected Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {MOCK_TEST_CASE.steps.map((step) => (
                        <tr key={step.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                            {step.id}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {step.action}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            {step.expectedResult}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table> */}
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
              {/* <div className="mt-5 border">
                <h3 className="text-lg font-medium text-gray-900 mb-2 text-center border-b">
                  Actual Result
                </h3>
                <div className="p-4">
                  <div>
                    {testCase?.actualResult
                      ?.split(/(?=\d+\.)/)
                      .map((result, index) => (
                        <p key={index}>{result.trim()}</p>
                      ))}
                  </div>
                </div>
              </div> */}
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
              <ul className="space-y-4">
                {history.map((activityLogs: any) =>
                  activityLogs.map((log: any) => (
                    <li
                      key={log._id}
                      className="relative pl-5 pb-4 border-l-2 border-gray-200"
                    >
                      <div className="absolute w-3 h-3 bg-primary-500 rounded-full -left-[7px] top-1.5"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-full">
                            {log.message}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}

          {/* {activeTab === "comments" && (
            <div>
              <div className="flex items-center mb-4">
                <MessageSquare className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Comments</h3>
              </div>

              <div className="mb-6">
                <ul className="space-y-6">
                  {MOCK_TEST_CASE.comments.map((comment) => (
                    <li key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0 mr-3">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={comment.avatar}
                            alt={comment.author}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">
                              {comment.author}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {comment.date}
                            </p>
                          </div>
                          <div className="mt-1 text-sm text-gray-700">
                            <p>{comment.text}</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label htmlFor="comment" className="sr-only">
                  Add your comment
                </label>
                <div>
                  <textarea
                    rows={3}
                    name="comment"
                    id="comment"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    placeholder="Add your comment..."
                    defaultValue={""}
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <button type="submit" className="btn btn-primary btn-sm">
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default TestCaseDetail;
