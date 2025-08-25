import React, { useCallback, useEffect } from "react";
import PageHeader from "../components/common/PageHeader";
import { Plus, FolderKanban, Users, Clock, BarChart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useGlobalContext } from "../context/GlobalContext";

const Projects: React.FC = () => {
  const { state, dispatch } = useGlobalContext();
  const { projects, search, isProjectsLoading } = state;
  const userRole =
    JSON.parse(sessionStorage.getItem("user") || "{}")?.role || "";
  // Helper function to get completed test cases count
  const getCompletedTestCasesCount = useCallback((testCases: any[]) => {
    return testCases.filter(
      (testCase: any) =>
        testCase.status === "passed" ||
        testCase.status === "failed" ||
        testCase.status === "blocked"
    ).length;
  }, []);

  // Helper function to get progress percentage
  const getProgressPercentage = useCallback(
    (testCases: any[]) => {
      if (testCases.length === 0) return 0;
      return Math.trunc(
        (getCompletedTestCasesCount(testCases) / testCases.length) * 100
      );
    },
    [getCompletedTestCasesCount]
  );

  const navigate = useNavigate();
  useEffect(() => {
    dispatch({ type: "SET_SEARCH", payload: { text: "", isSearch: true } });
  }, []);
  return (
    <>
      {!isProjectsLoading ? (
        <div>
          <PageHeader
            title="Projects"
            description="Manage testing projects in your organization"
            actions={
              <div>
                {String(userRole).toLowerCase() !== "superadmin" && (
                  <button
                    type="button"
                    className="btn btn-primary bg-indigo-900"
                    onClick={() => navigate("projectForm")}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    New Project
                  </button>
                )}
              </div>
            }
          />

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            {projects?.filter((project) => {
              return String(project?.name)
                .toLowerCase()
                .includes(String(search?.text).toLowerCase().trim());
            })?.length !== 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {projects
                  ?.filter((project) => {
                    return String(project?.name)
                      .toLowerCase()
                      .includes(String(search?.text).toLowerCase().trim());
                  })
                  .map((project: any) => (
                    <div
                      key={project._id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="p-5">
                        <div className="flex items-center mb-3">
                          <div className="p-2 rounded-md bg-primary-50 text-primary-600 mr-3">
                            <FolderKanban className="h-6 w-6" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            <Link
                              to={`/projects/${project._id}`}
                              className="hover:text-primary-600 font-semibold"
                            >
                              {project.name}
                            </Link>
                          </h3>
                        </div>

                        <p className="text-sm text-gray-500 mb-4 line-clamp-2 truncate">
                          {project.description}
                        </p>

                        <div className="flex flex-col space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center text-sm text-gray-500">
                              <BarChart className="h-4 w-4 mr-1 text-primary-500" />
                              {project?.testCases?.length} {""}
                              {project.testCases.length <= 1
                                ? "Test Case"
                                : "Test Cases"}
                            </div>
                            <div
                              className="flex items-center text-sm text-gray-500"
                              title={project.assignedTo
                                .map((tester: { name: any }) => tester.name)
                                .join(",")}
                            >
                              <Users className="h-4 w-4 mr-1 text-primary-500" />
                              {project.assignedTo.length} Tester
                            </div>
                          </div>

                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1 text-primary-500" />
                            Updated{" "}
                            {format(
                              new Date(project.updatedAt),
                              "MMMM dd, yyyy"
                            )}
                          </div>

                          <div className="flex items-center text-sm">
                            <span className="text-gray-500 mr-2">
                              Progress:
                            </span>
                            <span className="font-medium text-gray-700">
                              {getProgressPercentage(project.testCases)}%
                            </span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{
                                width: `${getProgressPercentage(
                                  project.testCases
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">
                  No projects found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div className="h-48  bg-gray-300 rounded animate-pulse"></div>
          ))}
        </div>
      )}
    </>
  );
};

export default Projects;
