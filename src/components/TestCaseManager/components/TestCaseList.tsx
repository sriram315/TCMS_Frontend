import React, { useEffect, useState } from "react";
import {
  deleteTestCase,
  uploadTestCasesFromExcel,
  downloadTestCasesExcel,
} from "../api/testCaseAPI";
import { ExcelOperations } from "./ExcelOperations";
import { TabNavigation } from "./TabNavigation";
import { TestCaseGrid } from "./TestCaseGrid";
import { Pagination } from "./Pagination";
import { StatsTable } from "./StatsTable";
import { Modal } from "./Model";

// Define the TestCase interface (consistent with App.tsx and testCaseAPI.ts)
interface TestCase {
  _id?: string;
  module?: string;
  [key: string]: any; // For flexibility; replace with specific fields if known
}

// Define ModuleStats interface for module statistics
interface ModuleStats {
  module: string;
  count: number;
}

// Define possible values for activeTab
type ActiveTab = "testcases" | "stats";

// Define component props
interface TestCaseListProps {
  onEdit: (testCase: TestCase) => void;
  testCases: TestCase[];
  moduleFilter: string;
  setModuleFilter: (value: string) => void;
  onRefresh: () => void;
}

export default function TestCaseList({
  onEdit,
  testCases,
  moduleFilter,
  setModuleFilter,
  onRefresh,
}: TestCaseListProps) {
  const [uniqueModules, setUniqueModules] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(6);
  const [activeTab, setActiveTab] = useState<ActiveTab>("testcases");
  const [moduleStats, setModuleStats] = useState<ModuleStats[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const modules = [
      ...new Set(
        testCases.map((tc) => tc.module).filter((m): m is string => !!m)
      ),
    ];
    setUniqueModules(modules);
    setCurrentPage(1);

    const stats = modules
      .map((module) => ({
        module,
        count: testCases.filter((tc) => tc.module === module).length,
      }))
      .sort((a, b) => b.count - a.count);
    setModuleStats(stats);
  }, [testCases, moduleFilter]);

  const handleDelete = async (id: string) => {
    await deleteTestCase(id);
    onRefresh();
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsModalOpen(true);
  };

  const handleModalSubmit = (moduleName: string) => {
    const fileInput = document.querySelector(
      "input[type='file']"
    ) as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file || !moduleName) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("module", moduleName);

    setUploading(true);
    setUploadError(null);

    uploadTestCasesFromExcel(formData)
      .then(() => {
        onRefresh();
      })
      .catch((err: any) => {
        setUploadError(err.response?.data?.error || "Upload failed.");
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const handleExcelDownload = () => {
    downloadTestCasesExcel(moduleFilter);
  };

  const filteredTestCases = moduleFilter
    ? testCases.filter((tc) => tc.module === moduleFilter)
    : testCases;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTestCases = filteredTestCases.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredTestCases.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const totalTestCases = testCases.length;

  return (
    <div className="mt-6 w-full px-2 sm:px-4 md:px-6">
      <ExcelOperations
        uniqueModules={uniqueModules}
        moduleFilter={moduleFilter}
        setModuleFilter={setModuleFilter}
        handleExcelUpload={handleExcelUpload}
        handleExcelDownload={handleExcelDownload}
        uploading={uploading}
        uploadError={uploadError}
      />
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "testcases" ? (
        <>
          <TestCaseGrid
            currentTestCases={currentTestCases}
            onEdit={onEdit}
            handleDelete={handleDelete}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            filteredTestCases={filteredTestCases}
            paginate={paginate}
            prevPage={prevPage}
            nextPage={nextPage}
          />
        </>
      ) : (
        <StatsTable moduleStats={moduleStats} totalTestCases={totalTestCases} />
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
