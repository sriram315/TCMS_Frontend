import React, { useEffect, useState } from "react";
import { Plus, Calendar, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import PageHeader from "../components/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import { API_URL } from "../config";
import { useGlobalContext } from "../context/GlobalContext";

const TestPlanRuns: React.FC = () => {
  const { state, dispatch } = useGlobalContext();
  const { search } = state;
  const [testPlan, setTestPlan] = useState([]);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch({ type: "SET_SEARCH", payload: { text: "", isSearch: true } });
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/test-plan`);
        const data = response.data.data;

        // Filter test plans based on user role
        let filteredTestPlans = data;

        if (currentUser) {
          if (currentUser.role === "SuperAdmin") {
            // Show all test plans for SuperAdmin
            filteredTestPlans = data;
          } else if (currentUser.role === "Admin") {
            // Show only test plans created by this admin
            filteredTestPlans = data.filter(
              (plan) => plan.createdBy && plan.createdBy._id === currentUser._id
            );
          } else {
            // For other roles, show test plans where user is assigned
            filteredTestPlans = data.filter((plan) => {
              if (!plan.testRun) return false;

              // Check if user is assigned to any test run
              return plan.testRun.some(
                (run) => run.assignedTo === currentUser._id
              );
            });
          }
        }

        setTestPlan(filteredTestPlans);
      } catch (error) {
        console.error("API failed to fetch data", error);
      }
    };

    fetchData();
  }, [currentUser]);

  // Extract all test cases with their modules for each test plan
  const allTestCasesWithModule = testPlan.map(
    (plan) =>
      plan?.testRun
        ?.filter((testCase) => testCase.module)
        ?.map((testmodule) => testmodule?.module)
        ?.flat() || []
  );

  // Calculate progress data - count passed, failed, and blocked test cases
  const progressData = allTestCasesWithModule.map((allTestCase) =>
    allTestCase.filter((testCase) => {
      const status = testCase.status?.toLowerCase();
      return status === "passed" || status === "failed" || status === "blocked";
    })
  );

  // Calculate total progress data with percentage
  const totalProgressData = testPlan.map((_, index) => {
    const totalCases = allTestCasesWithModule[index]?.length || 0;
    const completedCases = progressData[index]?.length || 0;

    return {
      totalCases,
      completedCases,
      progress:
        totalCases > 0 ? Math.trunc((completedCases / totalCases) * 100) : 0,
    };
  });

  const user = JSON.parse(sessionStorage.getItem("user"));
  const role = user.role;
  console.log(testPlan);

  const filteredTestPlan = testPlan.filter((tp) =>
    (tp.name || "").toLowerCase().includes(search.text.toLowerCase().trim())
  );

  return (
    <div>
      <PageHeader
        title="Test Plans"
        description="Create and manage test plans for your project"
        actions={
          <div>
            {role.toLowerCase() === "admin" && (
              <button
                type="button"
                className="btn btn-primary bg-indigo-900"
                onClick={() => navigate("testPlanForm")}
              >
                <Plus className="h-5 w-5 mr-2" />
                New Test Plan
              </button>
            )}
          </div>
        }
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredTestPlan.map((plan, index) => (
            <div
              key={plan._id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    <Link
                      state={plan}
                      to={`/test-plans/${plan._id}`}
                      className="hover:text-primary-600 font-semibold"
                    >
                      {plan.name}
                    </Link>
                  </h3>
                </div>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {plan.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      Due: {plan?.dueDateTo?.slice(0, 10)}
                    </div>
                    <div className="flex items-center text-gray-500">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      {totalProgressData[index].totalCases}
                      {totalProgressData[index].totalCases <= 1
                        ? " test case"
                        : " test cases"}
                    </div>
                  </div>

                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 mr-2">Progress:</span>
                    <span className="font-medium text-gray-700">
                      {totalProgressData[index].progress}% (
                      {totalProgressData[index].completedCases}/
                      {totalProgressData[index].totalCases})
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${totalProgressData[index].progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Created:{" "}
                    {plan?.createdAt &&
                      format(new Date(plan?.createdAt), "MMMM dd, yyyy")}
                  </span>
                  <Link
                    state={plan}
                    to={`/test-plans/${plan._id}`}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTestPlan.length === 0 && (
          <div className="flex mb-8 justify-center">
            <p className="text-gray-500">
              No test plans found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPlanRuns;
