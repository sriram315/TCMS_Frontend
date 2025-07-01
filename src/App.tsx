import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import TestCases from "./pages/TestCases";
import TestPlans from "./pages/TestPlans";
import TestRuns from "./pages/TestRuns";
import Reports from "./pages/Reports";
import Projects from "./pages/Projects";
import Settings from "./pages/Settings";
import TestCaseDetail from "./pages/TestCaseDetail";
import TestRunDetail from "./pages/TestRunDetail";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import TestCaseManager from "./components/TestCaseManager/TestCaseManager.js";
import ProjectForm from "./components/TestCaseManager/components/ProjectForm.js";
import TestPlanForm from "./components/TestCaseManager/components/TestPlanForm.js";
import TestRunForm from "./components/TestCaseManager/components/TestRunForm.js";
import TestPlanRuns from "./components/TestCaseManager/components/TestPlanRuns.js";
import TestPlanRunsDetail from "./components/TestCaseManager/components/TestPlanRunsDetail.js";
import TestCaseEditForm from "./components/TestCaseManager/components/TestCaseEditform.js";
import UserProfile from "./components/TestCaseManager/components/UserProfile.js";

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div>Loading ...</div>;
  }

  return (
    <Router>
      {isAuthenticated ? (
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" index={true} element={<Dashboard />} />
            <Route path="/test-cases" element={<TestCases />} />
            <Route path="/test-cases/edit/:id" element={<TestCaseEditForm />} />
            <Route path="/test-cases/:id" element={<TestCaseDetail />} />
            <Route path="/test-plans" element={<TestPlans />} />
            <Route path="/test-plans/:id" element={<TestPlanRuns />} />
            <Route
              path="/test-plans/test-runs/:id"
              element={<TestPlanRunsDetail />}  
            />
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
        </Layout>
      ) : (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
