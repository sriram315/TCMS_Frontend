import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const TestCases = lazy(() => import("./pages/TestCases"));
const TestPlans = lazy(() => import("./pages/TestPlans"));
const TestRuns = lazy(() => import("./pages/TestRuns"));
const Reports = lazy(() => import("./pages/Reports"));
const Projects = lazy(() => import("./pages/Projects"));
const Settings = lazy(() => import("./pages/Settings"));
const TestCaseDetail = lazy(() => import("./pages/TestCaseDetail"));
const TestRunDetail = lazy(() => import("./pages/TestRunDetail"));
const TestCaseManager = lazy(() => import("./components/TestCaseManager/TestCaseManager"));
const ProjectForm = lazy(() => import("./components/TestCaseManager/components/ProjectForm"));
const TestPlanForm = lazy(() => import("./components/TestCaseManager/components/TestPlanForm"));
const TestRunForm = lazy(() => import("./components/TestCaseManager/components/TestRunForm"));
const TestPlanRuns = lazy(() => import("./components/TestCaseManager/components/TestPlanRuns"));
const TestPlanRunsDetail = lazy(() => import("./components/TestCaseManager/components/TestPlanRunsDetail"));
const TestCaseEditForm = lazy(() => import("./components/TestCaseManager/components/TestCaseEditform"));
const UserProfile = lazy(() => import("./components/TestCaseManager/components/UserProfile"));

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading ...</div>;
  }

  return (
    <Router>
      {isAuthenticated ? (
        <Layout>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" index={true} element={<Dashboard />} />
              <Route path="/test-cases" element={<TestCases />} />
              <Route path="/test-cases/edit/:id" element={<TestCaseEditForm />} />
              <Route path="/test-cases/:id" element={<TestCaseDetail />} />
              <Route path="/test-plans" element={<TestPlans />} />
              <Route path="/test-plans/:id" element={<TestPlanRuns />} />
              <Route path="/test-plans/test-runs/:id" element={<TestPlanRunsDetail />} />
              <Route path="/test-plans/test-runs/test-detail/:id" element={<TestCaseDetail />} />

              <Route path="/test-plans/testPlanForm" element={<TestPlanForm />} />
              <Route path="/test-runs" element={<TestRuns />} />
              <Route path="/test-runs/testRunForm" element={<TestRunForm />} />
              <Route path="/test-runs/:id" element={<TestRunDetail />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/test-cases/create" element={<TestCaseManager />} />
              <Route path="/projects/projectForm" element={<ProjectForm />} />
              <Route path="/userProfile" element={<UserProfile />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      ) : (
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      )}
    </Router>
  );
}

export default App;
