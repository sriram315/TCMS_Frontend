import axios from "axios";
import {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { API_URL } from "../config";
import { useAuth } from "./AuthContext";
import {
  calculateTestRunStats,
  generateWeeklyStats,
} from "../utils/statsConversion";

type TestStaus = {
  Passed: number;
  Failed: number;
  Untested: number;
  Blocked: Number;
  Total: number;
};

type GlobalType = {
  projects: any | [];
  testStatus: TestStaus;
  testProgressData: any | [];
  testRuns: any | [];
  activities: any | [];
  testStatusData: any | [];
  testCases: any | [];
  search: object;
};

const initialState: GlobalType = {
  projects: [],
  testStatus: {
    Passed: 0,
    Failed: 0,
    Untested: 0,
    Blocked: 0,
    Total: 0,
  },
  testProgressData: [],
  testRuns: [],
  testStatusData: [],
  activities: [],
  testCases: [],
  search: { text: "", isSearch: false },
};

type GlobalAction =
  | { type: "SET_PROJECTS"; payload: any[] }
  | { type: "SET_UPDATE_TEST_STATUS"; payload: TestStaus }
  | { type: "SET_TEST_PROGRESS_DATA"; payload: any[] }
  | { type: "SET_TEST_RUNS"; payload: any[] }
  | { type: "SET_TEST_STATUS_DATA"; payload: any[] }
  | { type: "SET_ACTIVITIES"; payload: any[] }
  | { type: "SET_TESTCASES"; payload: any[] }
  | { type: "SET_SEARCH"; payload: object }
  | { type: "CLEAR_CONTEXT" };

const globalReducer = (state: GlobalType, action: GlobalAction): GlobalType => {
  switch (action.type) {
    case "SET_PROJECTS":
      return { ...state, projects: action.payload };
    case "SET_UPDATE_TEST_STATUS":
      return { ...state, testStatus: action.payload };
    case "SET_TEST_PROGRESS_DATA":
      return { ...state, testProgressData: action.payload };
    case "SET_TEST_RUNS":
      return { ...state, testRuns: action.payload };
    case "SET_TEST_STATUS_DATA":
      return { ...state, testStatusData: action.payload };
    case "SET_ACTIVITIES":
      return { ...state, activities: action.payload };
    case "SET_TESTCASES":
      return { ...state, testCases: action.payload };
    case "SET_SEARCH":
      return { ...state, search: action.payload };
    case "CLEAR_CONTEXT":
      return initialState;
    default:
      return state;
  }
};

const GlobalContext = createContext<{
  state: GlobalType;
  dispatch: React.Dispatch<GlobalAction>;
  refetchDashboardData: () => void;
  fetchTestCases: () => void;
  fetchTestRuns: () => void;
  fetchProjects: () => void;
}>({
  state: initialState,
  dispatch: () => null,
  refetchDashboardData: () => {},
  fetchTestCases: () => {},
  fetchTestRuns: () => {},
  fetchProjects: () => {},
});

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const name = user.email;
  const role = user.role;
  const userId = user._id;
  const { user: currentUser } = useAuth();

  const filteredProjects = (data: any[]) => {
    if (String(role).toLowerCase() === "superadmin") {
      return data;
    } else if (String(role).toLowerCase() === "admin") {
      return data.filter(
        (project: { createdBy: { _id: any } }) =>
          project.createdBy?._id === userId
      );
    } else {
      return data.filter(
        (project: { assignedTo: any[] }) =>
          Array.isArray(project.assignedTo) &&
          project.assignedTo.some((assignee) => assignee._id === userId)
      );
    }
  };

  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/projects`);

      dispatch({ type: "SET_PROJECTS", payload: filteredProjects(data) });
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, [filteredProjects]);

  const filteredTestRuns = (data: any[]) => {
    if (String(role).toLowerCase() === "superadmin") {
      // If superadmin, show all test runs
      return data;
    } else if (String(role).toLowerCase() === "admin") {
      // If admin, show test runs created by admin
      return data.filter(
        (testRun: { createdBy: { _id: any } }) =>
          testRun?.createdBy?._id === userId
      );
    } else {
      // For other users, show test runs assigned to them
      return data.filter(
        (testRun: { assignedTo: { _id: any } }) =>
          testRun?.assignedTo?._id === userId
      );
    }
  };

  const fetchTestRuns = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/test-runs`);

      dispatch({ type: "SET_TEST_RUNS", payload: filteredTestRuns(data) });
    } catch (error) {
      console.error("Error fetching test runs:", error);
    }
  }, [filteredTestRuns]);

  const fetchTestCases = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/testcases`);

      // const filteredData =
      //   String(role).toLowerCase() === "superadmin"
      //     ? data
      //     : String(role).toLowerCase() === "admin"
      //     ? state.projects
      //         .filter(
      //           (project: { createdBy: { _id: any } }) =>
      //             currentUser && project?.createdBy?._id === currentUser._id
      //         )
      //         .flatMap((project: { testCases: any }) => project.testCases)
      //     : state.projects.flatMap((project: { assignedTo: any; _id: any }) => {
      //         const isAssigned = project.assignedTo.some(
      //           (user: { _id: any }) => user._id === currentUser?._id
      //         );

      //         if (isAssigned) {
      //           return data.filter(
      //             (item: { projectId: string }) =>
      //               item.projectId === project._id
      //           );
      //         }
      //         return [];
      //       });
      const filteredData =
        String(role).toLowerCase() === "superadmin"
          ? data
          : String(role).toLowerCase() === "admin"
          ? state.projects
              .filter(
                (project: { createdBy: { _id: any } }) =>
                  currentUser && project?.createdBy?._id === currentUser._id
              )
              .flatMap((project: { testCases: any[] }) =>
                project.testCases.map((tc) => {
                  // Find full test case in latest API data
                  const fresh = data.find((d: any) => d._id === tc._id);
                  return fresh || tc; // use fresh if found, else fallback to old
                })
              )
          : state.projects.flatMap((project: { assignedTo: any; _id: any }) => {
              const isAssigned = project.assignedTo.some(
                (user: { _id: any }) => user._id === currentUser?._id
              );

              if (isAssigned) {
                return data.filter(
                  (item: { projectId: string }) =>
                    item.projectId === project._id
                );
              }
              return [];
            });

      dispatch({ type: "SET_TESTCASES", payload: filteredData });
      dispatch({
        type: "SET_TEST_PROGRESS_DATA",
        payload: generateWeeklyStats(filteredData),
      });
      // Use the helper function
      const { stats } = calculateTestRunStats(filteredData);

      dispatch({
        type: "SET_UPDATE_TEST_STATUS",
        payload: {
          Passed: stats.passed,
          Failed: stats.failed,
          Untested: stats.untested,
          Blocked: stats.blocked,
          Total: stats.total,
        },
      });

      dispatch({
        type: "SET_TEST_STATUS_DATA",
        payload: [
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
        ],
      });
    } catch (error) {
      console.error("Error fetching test cases:", error);
    }
  }, [
    role,
    state.projects,
    generateWeeklyStats,
    calculateTestRunStats,
    currentUser ? currentUser._id : null,
    name,
  ]);

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
            activity?.createdBy?._id === userId ||
            activity?.createdBy?.accountCreatedBy === userId
        );
      } else {
        // For other users, show only their own activities
        filteredData = data?.filter(
          (activity: { createdBy: { _id: any } }) =>
            activity?.createdBy?._id === userId
        );
      }
      dispatch({ type: "SET_ACTIVITIES", payload: filteredData });
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  }, [API_URL, role, userId]);

  useEffect(() => {
    fetchProjects();
    fetchTestRuns();
    fetchActivity();
    fetchTestCases();
  }, []);
  useEffect(() => {
    if (state.projects.length > 0) {
      fetchTestCases();
    }
  }, [state.projects]);

  const refetchDashboardData = () => {
    fetchProjects();
    fetchTestRuns();
    fetchTestCases();
    fetchActivity();
  };

  return (
    <GlobalContext.Provider
      value={{
        state,
        dispatch,
        refetchDashboardData,
        fetchTestCases,
        fetchTestRuns,
        fetchProjects,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
