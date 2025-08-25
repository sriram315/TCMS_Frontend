import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
// import toast from "your-toast-library"; // Uncomment and adjust as per your project

type WeekTestcaseData = {
  name: string; // Worksheet name, e.g., "week 22"
  data: any[]; // Array of testcase objects
};

const downloadExcelByWeeks = async (
  weekTestcaseArray: WeekTestcaseData[],
  title?: string
): Promise<void> => {
  if (
    !Array.isArray(weekTestcaseArray) ||
    weekTestcaseArray.some(
      (w) => typeof w !== "object" || !w.name || !Array.isArray(w.data)
    )
  ) {
    // toast.error("Download Not Performed: Invalid data format.");
    return;
  }

  try {
    const workbook = new ExcelJS.Workbook();

    const headers = [
      "Test Id",
      "Module",
      "Priority",
      "Description/Summary",
      "Test Cases",
      "Test Case Type",
      "Preconditions",
      "Test Steps",
      "Expected Results",
      "Status",
      "Actual Results",
      "Test Executed By",
    ];

    for (const week of weekTestcaseArray) {
      const worksheet = workbook.addWorksheet(week.name);

      worksheet.columns = headers.map((header) => ({
        header,
        key: header,
        width: 25,
      }));

      let currentRow = 1;

      if (title) {
        const titleRow = worksheet.getRow(currentRow);
        titleRow.getCell(1).value = title;
        titleRow.getCell(1).font = { size: 16, bold: true };
        titleRow.getCell(1).alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        worksheet.mergeCells(currentRow, 1, currentRow, headers.length);
        currentRow++;
      }

      // Header row
      const headerRow = worksheet.getRow(currentRow);
      headers.forEach((header, index) => {
        headerRow.getCell(index + 1).value = header;
      });
      headerRow.font = { bold: true };
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "AAB7C5" },
        };
        cell.alignment = {
          wrapText: true,
          vertical: "top",
          horizontal: "left",
        };
      });

      currentRow++;

      // Data rows
      week.data.forEach((test) => {
        const row = worksheet.getRow(currentRow++);
        row.values = [
          test.testCaseId || "",
          test.module || "",
          test.priority || "",
          test.description || "",
          test.title || "",
          test.type || "",
          test.preRequisite || "",
          test.steps || "",
          test.expectedResult || "",
          test.status || "",
          test.actualResult || "",
          test.executedBy || "",
        ];
        row.eachCell((cell) => {
          cell.alignment = {
            wrapText: true,
            vertical: "top",
            horizontal: "left",
          };
        });
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Testcases.xlsx");
    toast.success("Excel downloaded successfully!");
  } catch (error) {
    console.error("Excel download error:", error);
    // toast.error("Failed to download Excel file.");
  }
};

export default downloadExcelByWeeks;
