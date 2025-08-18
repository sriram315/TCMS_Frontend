import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
  DownloadIcon,
  ChevronDown,
  Edit,
} from "lucide-react";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import { API_URL } from "../config";
import downloadExcel from "../utils/downloadExcel";
import { useGlobalContext } from "../context/GlobalContext";
import Checkbox from "../components/common/Checkbox";

export type TestStatus = "passed" | "failed" | "blocked" | "untested";

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

type TestCase = {
  _id: string;
  testCaseId: string;
  title: string;
  status?: string;
  module?: string;
  projectId?: string;
};

type AssignedTo = {
  name: string;
  [key: string]: any;
};

type TestRun = {
  _id: string;
  name: string;
  description?: string;
  assignedTo: AssignedTo;
  dueDateFrom: string;
  dueDateTo: string;
  testCases: TestCase[];
};

const ProjectDetail: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state } = useGlobalContext();
  const { projects: globalProjects } = state;
  const containerRef = useRef(null);
  const [project, setProject] = useState({});
  const { id } = useParams();
  const [editingTestCaseId, setEditingTestCaseId] = useState<string | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState({
    status: false,
    priority: false,
  });
  const [statusFilter, setStatusFilter] = useState([]);
  useEffect(() => {
    const currentProject = globalProjects?.filter(
      (projectItem) => projectItem?._id === id
    );
    setProject(currentProject.length > 0 ? currentProject[0] : {});
  }, [globalProjects]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setFilterStatus({ status: false, priority: false });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const token = sessionStorage.getItem("token") || "";

  const userRole =
    JSON.parse(sessionStorage.getItem("user") || "{}")?.role || "";

  const statusCounts = project.testCases?.reduce(
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
    return validStatuses.includes(normalized ?? "")
      ? (normalized as TestStatus)
      : "untested";
  };
  const status = [
    { id: 1, name: "Passed", value: "passed", selected: false },
    { id: 2, name: "Failed", value: "failed", selected: false },
    { id: 3, name: "Blocked", value: "blocked", selected: false },
    { id: 4, name: "Untested", value: "Untested", selected: false },
  ];

  const handleEdit = () => {
    navigate(`/project/edit/${project._id}`);
  };
  return (
    <div className="">
      <ToastContainer />
      <Breadcrumbs
        items={[
          { label: "Projects", path: "/projects" },
          { label: project.name },
        ]}
      />
      <div className="flex justify-between items-center">
        <PageHeader
          title={project.name}
          description={project.description}
          actions={
            <div className="flex">
              {String(userRole).toLowerCase() === "admin" && (
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="btn btn-outline mr-2"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                </div>
              )}
            </div>
          }
        />
      </div>
      <div className="flex justify-end py-4 w-full ">
        <button
          type="button"
          className="btn btn-outline  h-8  whitespace-nowrap"
          onClick={() =>
            downloadExcel({
              [project.name]: project.testCases,
            })
          }
        >
          <DownloadIcon className="h-3 w-3 mr-2" />
          Download Excel
        </button>
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
            <dl className="grid grid-cols-[120px_1fr] gap-3 text-sm">
              <dt className="font-medium text-gray-500">Created by:</dt>
              <dd className="text-gray-900 truncate max-w-72">
                {project && project?.createdBy?.name}
              </dd>
              <dt className="font-medium text-gray-500 ">Assigned to:</dt>

              <dd className="text-gray-900 flex flex-wrap gap-1 ">
                {project &&
                  project.assignedTo?.map((assinedMember) => (
                    <span className="px-2 py-1 border rounded-lg ">
                      {assinedMember.name}
                    </span>
                  ))}
              </dd>

              <dt className="font-medium text-gray-500">Created on:</dt>
              <dd className="text-gray-900">
                {project?.createdAt &&
                  format(new Date(project?.createdAt), "MMMM dd, yyyy")}
              </dd>
            </dl>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Modules
              </h4>
              <p className="text-sm text-gray-700">
                {[
                  ...new Set(
                    project?.testCases?.map((tc: { module: any }) => tc.module)
                  ),
                ].join(", ")}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-x-auto ">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 ">
          <div className="overflow-x-auto ">
            <table className="table ">
              <thead ref={containerRef}>
                <tr>
                  <th scope="col" className="w-12">
                    ID
                  </th>
                  <th scope="col">Title</th>
                  <th scope="col">
                    <div
                      className="inline-flex cursor-pointer"
                      onClick={() => {
                        setFilterStatus((prevData) => ({
                          status: !prevData.status,
                          priority: false,
                        }));
                      }}
                    >
                      Status
                      {statusFilter.length !== 0 && `(${statusFilter.length})`}
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-300 ease-out ${
                          filterStatus.status ? "-rotate-180" : "rotate-0"
                        }`}
                      />
                    </div>
                    {filterStatus.status && (
                      <div className=" bg-white relative">
                        <Checkbox
                          people={status}
                          statusFilter={statusFilter}
                          setStatusFilter={setStatusFilter}
                        />
                      </div>
                    )}
                  </th>
                  <th scope="col">Module</th>
                </tr>
              </thead>
              <tbody>
                {project.testCases
                  ?.filter(
                    (tc) =>
                      statusFilter.length === 0 ||
                      statusFilter.includes(tc.status)
                  )
                  .map((testCase) => {
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
                          {editingTestCaseId === testCase._id &&
                          userRole === "Tester" ? (
                            <select
                              className="border text-sm rounded px-2 py-1"
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
                              className={`inline-flex items-center gap-1 rounded ${
                                userRole === "Tester" && "cursor-pointer"
                              } ${className} text-xs px-1.5 py-0.5`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span>{text}</span>
                            </span>
                          )}
                        </td>
                        <td className="text-gray-600">{testCase.module}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {project.testCases?.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-gray-500">No test cases found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ProjectDetail;
