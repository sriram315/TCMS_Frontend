// const generateMonthlyStats = (testCases: any[]) => {
//   const months: Record<
//     string,
//     { passed: number; failed: number; data: any[]; date: Date }
//   > = {};

//   testCases?.forEach((test) => {
//     const updatedAt = new Date(test.updatedAt);
//     const monthYearKey = `${updatedAt.getFullYear()}-${String(
//       updatedAt.getMonth() + 1
//     ).padStart(2, "0")}`;
//     const displayName = updatedAt.toLocaleString("default", {
//       month: "short",
//       year: "numeric",
//     });

//     if (!months[monthYearKey]) {
//       months[monthYearKey] = {
//         passed: 0,
//         failed: 0,
//         data: [],
//         date: updatedAt,
//         name: displayName,
//       };
//     }

//     const status = String(test.status).toLowerCase();
//     if (status === "passed") {
//       months[monthYearKey].passed += 1;
//       months[monthYearKey].data.push(test);
//     } else if (status === "failed") {
//       months[monthYearKey].failed += 1;
//       months[monthYearKey].data.push(test);
//     }
//   });

//   return Object.values(months)
//     .sort((a, b) => a.date.getTime() - b.date.getTime()) // ascending
//     .map(({ date, name, ...counts }) => ({
//       name,
//       ...counts,
//     }));
// };

// Helper function to get week number of a date
// ---- helper to get week number ----
function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ---- Monthly stats ----
const generateMonthlyStats = (testCases: any[]) => {
  const months: Record<
    string,
    { passed: number; failed: number; data: any[]; date: Date; name: string }
  > = {};

  testCases?.forEach((test) => {
    if (!Array.isArray(test.activityLogs) || test.activityLogs.length === 0)
      return;

    // group logs by month
    const logsByMonth: { [key: string]: any[] } = {};
    test.activityLogs.forEach((log: any) => {
      if (log.status && log.status.length > 0) {
        const d = new Date(log.updatedAt);
        const monthYearKey = `${d.getFullYear()}-${String(
          d.getMonth() + 1
        ).padStart(2, "0")}`;
        if (!logsByMonth[monthYearKey]) logsByMonth[monthYearKey] = [];
        logsByMonth[monthYearKey].push(log);
      }
    });

    // take latest log for each month
    Object.entries(logsByMonth).forEach(([monthKey, logs]) => {
      const latestLog = (logs as any[]).reduce((latest, current) =>
        new Date(current.updatedAt) > new Date(latest.updatedAt)
          ? current
          : latest
      );

      const status = String(latestLog.status).toLowerCase();
      const updatedAt = new Date(latestLog.updatedAt);
      const displayName = updatedAt.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

      if (!months[monthKey]) {
        months[monthKey] = {
          passed: 0,
          failed: 0,
          data: [],
          date: updatedAt,
          name: displayName,
        };
      }

      // clone test with corrected status
      const updatedTest = {
        ...test,
        status: latestLog.status,
        executedBy: latestLog.performedBy,
      };

      if (status === "passed") {
        months[monthKey].passed += 1;
        months[monthKey].data.push(updatedTest);
      } else if (status === "failed") {
        months[monthKey].failed += 1;
        months[monthKey].data.push(updatedTest);
      }
    });
  });

  return Object.values(months)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ date, name, ...counts }) => ({
      name,
      ...counts,
    }));
};

// ---- Weekly stats ----
const generateWeeklyStats = (testCases: any[]) => {
  const weeks: {
    [key: string]: {
      passed: number;
      failed: number;
      data: any[];
      year: number;
      week: number;
    };
  } = {};

  testCases.forEach((test) => {
    if (!Array.isArray(test.activityLogs) || test.activityLogs.length === 0)
      return;

    // group logs by week
    const logsByWeek: { [key: string]: any[] } = {};
    test.activityLogs.forEach((log: any) => {
      if (log.status && log.status.length > 0) {
        const d = new Date(log.updatedAt);
        const weekNum = getWeekNumber(d);
        const year = d.getFullYear();
        const weekKey = `${year}-W${weekNum}`;
        if (!logsByWeek[weekKey]) logsByWeek[weekKey] = [];
        logsByWeek[weekKey].push(log);
      }
    });

    // take latest log for each week
    Object.entries(logsByWeek).forEach(([weekKey, logs]) => {
      const latestLog = (logs as any[]).reduce((latest, current) =>
        new Date(current.updatedAt) > new Date(latest.updatedAt)
          ? current
          : latest
      );

      const status = String(latestLog.status).toLowerCase();
      const updatedAt = new Date(latestLog.updatedAt);
      const weekNum = getWeekNumber(updatedAt);
      const year = updatedAt.getFullYear();

      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          passed: 0,
          failed: 0,
          data: [],
          year,
          week: weekNum,
        };
      }

      const updatedTest = {
        ...test,
        status: latestLog.status,
        executedBy: latestLog.performedBy,
      };

      if (status === "passed") {
        weeks[weekKey].passed += 1;
        weeks[weekKey].data.push(updatedTest);
      } else if (status === "failed") {
        weeks[weekKey].failed += 1;
        weeks[weekKey].data.push(updatedTest);
      }
    });
  });

  return Object.entries(weeks)
    .map(([key, counts]) => ({
      name: `${key}`, // e.g. "2025-W34"
      ...counts,
    }))
    .sort((a, b) => (a.year === b.year ? a.week - b.week : a.year - b.year));
};

// const generateWeeklyStats = (testCases: any[]) => {
//   const weeks = {};

//   testCases.forEach(
//     (test: { updatedAt: string | number | Date; status: any }) => {
//       const updatedAt = new Date(test.updatedAt);
//       const week = `Week ${getWeekNumber(updatedAt)}`;

//       if (!weeks[week]) {
//         weeks[week] = { passed: 0, failed: 0, data: [] };
//       }

//       if (String(test.status).toLowerCase() === "passed") {
//         weeks[week].data.push(test);
//         weeks[week].passed += 1;
//       } else if (String(test.status).toLowerCase() === "failed") {
//         weeks[week].data.push(test);
//         weeks[week].failed += 1;
//       }
//     }
//   );

//   return Object.entries(weeks)
//     .map(([week, counts]) => ({
//       name: week,
//       ...(typeof counts === "object" && counts !== null ? counts : {}),
//     }))
//     .sort((a, b) => {
//       const weekA = parseInt(a.name.replace("Week ", ""), 10);
//       const weekB = parseInt(b.name.replace("Week ", ""), 10);
//       return weekA - weekB; // ascending order
//     });
// };

const generateDailyStats = (testCases: any[]) => {
  const days: {
    [key: string]: {
      passed: number;
      failed: number;
      data: any[];
    };
  } = {};

  testCases.forEach((test) => {
    if (!Array.isArray(test.activityLogs) || test.activityLogs.length === 0) {
      return; // skip test cases without logs
    }

    // Group logs by date
    const logsByDay: { [key: string]: any[] } = {};
    test.activityLogs.forEach((log: any) => {
      if (log.status && log.status.length > 0) {
        const day = new Date(log.updatedAt).toISOString().slice(0, 10);
        if (!logsByDay[day]) logsByDay[day] = [];
        logsByDay[day].push(log);
      }
    });

    // For each day, pick the latest log of that day
    Object.entries(logsByDay).forEach(([day, logs]) => {
      const latestLog = (logs as any[]).reduce((latest, current) =>
        new Date(current.updatedAt) > new Date(latest.updatedAt)
          ? current
          : latest
      );

      const status = String(latestLog.status).toLowerCase();

      if (!days[day]) {
        days[day] = { passed: 0, failed: 0, data: [] };
      }

      // Override test object with latest status of that day
      const updatedTest = {
        ...test,
        status: latestLog.status,
        executedBy: latestLog.performedBy,
      };

      if (status === "passed") {
        days[day].passed += 1;
        days[day].data.push(updatedTest);
      } else if (status === "failed") {
        days[day].failed += 1;
        days[day].data.push(updatedTest);
      }
    });
  });

  // Convert object to sorted array
  return Object.entries(days)
    .map(([day, counts]) => ({
      name: day,
      ...counts,
    }))
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
};

// const generateDailyStats = (testCases: any[]) => {
//   const days: {
//     [key: string]: {
//       passed: number;
//       failed: number;
//       data: any[];
//     };
//   } = {};

//   testCases?.forEach((test) => {
//     const updatedAt = new Date(test.updatedAt);

//     // Daily key: "YYYY-MM-DD"
//     const day = updatedAt.toISOString().slice(0, 10);

//     if (!days[day]) {
//       days[day] = { passed: 0, failed: 0, data: [] };
//     }

//     const status = String(test.status).toLowerCase();

//     if (status === "passed") {
//       days[day].data.push(test);
//       days[day].passed += 1;
//     } else if (status === "failed") {
//       days[day].data.push(test);
//       days[day].failed += 1;
//     }
//   });

//   return Object.entries(days)
//     .map(([day, counts]) => ({
//       name: day,
//       ...counts,
//     }))
//     .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
// };

// const getWeekNumber = (date: number | Date) => {
//   const firstDay = new Date(date.getFullYear(), 0, 1);
//   const pastDaysOfYear = (date - firstDay) / 86400000;
//   return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
// };

const calculateTestRunStats = (testCases: string | any[]) => {
  const stats = {
    passed: 0,
    failed: 0,
    blocked: 0,
    untested: 0,
    total: testCases?.length || 0,
  };

  if (Array.isArray(testCases)) {
    testCases.forEach((testCase: { status: string }, index: any) => {
      const status = testCase?.status?.toLowerCase() || "";
      switch (status) {
        case "passed":
          stats.passed += 1;
          break;
        case "failed":
          stats.failed += 1;
          break;
        case "blocked":
          stats.blocked += 1;
          break;
        case "untested":
          stats.untested += 1;
          break;
        default:
          stats.untested += 1; // Treat unrecognized statuses as untested
          break;
      }
    });
  }

  // Calculate progress as the percentage of test cases that are not untested
  const completedTests = stats.passed + stats.failed + stats.blocked;
  const progress =
    stats.total > 0 ? Math.round((completedTests / stats.total) * 100) : 0;

  // Determine test run status based on test case counts
  let testRunStatus = "Not Started";
  if (stats.total === stats.untested) {
    testRunStatus = "Not Started";
  } else if (
    stats.untested === 0 &&
    stats.passed + stats.failed + stats.blocked === stats.total
  ) {
    testRunStatus = "Completed";
  } else if (
    stats.untested < stats.total &&
    (stats.passed > 0 || stats.failed > 0 || stats.blocked > 0)
  ) {
    testRunStatus = "In Progress";
  }

  return { stats, progress, testRunStatus };
};

export {
  getWeekNumber,
  generateMonthlyStats,
  generateWeeklyStats,
  calculateTestRunStats,
  generateDailyStats,
};
