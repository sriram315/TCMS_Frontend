import axios, { AxiosResponse } from "axios";
import { API_URL } from "../../../config";

// Define the TestCase interface (consistent with App.tsx)
interface TestCase {
  _id?: string;
  module?: string;
  [key: string]: any; // For flexibility; replace with specific fields if known
}
const token = sessionStorage.getItem("token") || ""; // Replace with your actual token retrieval method
// Create Axios instance
const API = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${token}`, // replace `token` with your actual token variable
  }, // your backend port
});

// Get test cases with optional module filter
export const getTestCases = async (
  module?: string
): Promise<AxiosResponse<{ data: TestCase[] }>> =>
  API.get("/testcases", module ? { params: { module } } : {});

// Create a new test case
export const createTestCase = async (
  data: TestCase
): Promise<AxiosResponse<{ data: TestCase }>> => API.post("/testcases", data);

// Update an existing test case
export const updateTestCase = async (
  id: string,
  data: TestCase
): Promise<AxiosResponse<{ data: TestCase }>> =>
  API.put(`/testcases/${id}`, data);

// Delete a test case
export const deleteTestCase = async (
  id: string
): Promise<AxiosResponse<void>> => API.delete(`/testcases/${id}`);

// Upload test cases from Excel
export const uploadTestCasesFromExcel = async (
  formData: FormData
): Promise<AxiosResponse<{ data: TestCase[] }>> =>
  API.post("/testcases/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Download test cases as Excel
export const downloadTestCasesExcel = (module?: string): void => {
  const url = "/testcases/download" + (module ? `?module=${module}` : "");
  window.location.href = `${API.defaults.baseURL}${url}`;
};
