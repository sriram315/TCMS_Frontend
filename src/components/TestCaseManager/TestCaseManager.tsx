import { useState, useEffect } from "react";
import {
  createTestCase,
  getTestCases,
  updateTestCase,
} from "./api/testCaseAPI";
import TestCaseForm from "./components/TestCaseForm";
import TestCaseList from "./components/TestCaseList";

// Define the TestCase interface (adjust based on your actual data structure)
interface TestCase {
  _id?: string;
  module?: string;
  [key: string]: any; // For flexibility; replace with specific fields if known
}

// Define possible values for activeTab
type ActiveTab = "create" | "view";

function App() {
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(
    null
  );
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [moduleFilter, setModuleFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("create");

  const fetchData = async () => {
    try {
      const res = await getTestCases(moduleFilter);
      setTestCases(res.data as TestCase[]);
    } catch (error) {
      console.error("Error fetching test cases:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [moduleFilter]);

  const handleSave = async (data: TestCase) => {
    try {
      let updatedTestCase: TestCase;
      if (data._id) {
        const response = await updateTestCase(data._id, data);
        updatedTestCase = response.data;
        setSelectedTestCase(updatedTestCase);
      } else {
        const response = await createTestCase(data);
        updatedTestCase = response.data;
      }
      await fetchData();
    } catch (error) {
      console.error("Error saving test case:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Tab Navigation */}
      <div className="flex mb-6">
        <button
          className={`px-4 py-2 mr-2 rounded-t-lg ${
            activeTab === "create"
              ? "bg-white text-indigo-600 border-b-2 border-indigo-600"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveTab("create")}
        >
          Create Test Case
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="bg-white rounded-lg shadow p-2 flex items-center justify-center">
        {activeTab === "create" ? (
          <TestCaseForm onSave={handleSave} selected={selectedTestCase} />
        ) : (
          <TestCaseList
            onEdit={(testCase: TestCase) => {
              setSelectedTestCase(testCase);
              setActiveTab("create");
            }}
            testCases={testCases}
            moduleFilter={moduleFilter}
            setModuleFilter={setModuleFilter}
            onRefresh={fetchData}
          />
        )}
      </div>
    </div>
  );
}

export default App;
