const generateMonthlyStats = (testCases: any[]) => {
  const months: Record<
    string,
    { passed: number; failed: number; data: any[]; date: Date }
  > = {};

  testCases?.forEach((test) => {
    const updatedAt = new Date(test.updatedAt);
    const monthYearKey = `${updatedAt.getFullYear()}-${String(
      updatedAt.getMonth() + 1
    ).padStart(2, "0")}`;
    const displayName = updatedAt.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    if (!months[monthYearKey]) {
      months[monthYearKey] = {
        passed: 0,
        failed: 0,
        data: [],
        date: updatedAt,
        name: displayName,
      };
    }

    const status = String(test.status).toLowerCase();
    if (status === "passed") {
      months[monthYearKey].passed += 1;
      months[monthYearKey].data.push(test);
    } else if (status === "failed") {
      months[monthYearKey].failed += 1;
      months[monthYearKey].data.push(test);
    }
  });

  return Object.values(months)
    .sort((a, b) => a.date.getTime() - b.date.getTime()) // ascending
    .map(({ date, name, ...counts }) => ({
      name,
      ...counts,
    }));
};

const generateWeeklyStats = (testCases: any[]) => {
  const weeks = {};

  testCases.forEach(
    (test: { updatedAt: string | number | Date; status: any }) => {
      const updatedAt = new Date(test.updatedAt);
      const week = `Week ${getWeekNumber(updatedAt)}`;

      if (!weeks[week]) {
        weeks[week] = { passed: 0, failed: 0, data: [] };
      }

      if (String(test.status).toLowerCase() === "passed") {
        weeks[week].data.push(test);
        weeks[week].passed += 1;
      } else if (String(test.status).toLowerCase() === "failed") {
        weeks[week].data.push(test);
        weeks[week].failed += 1;
      }
    }
  );

  return Object.entries(weeks)
    .map(([week, counts]) => ({
      name: week,
      ...(typeof counts === "object" && counts !== null ? counts : {}),
    }))
    .sort((a, b) => {
      const weekA = parseInt(a.name.replace("Week ", ""), 10);
      const weekB = parseInt(b.name.replace("Week ", ""), 10);
      return weekA - weekB; // ascending order
    });
};

const generateDailyStats = (testCases: any[]) => {
  const days: {
    [key: string]: {
      passed: number;
      failed: number;
      data: any[];
    };
  } = {};

  testCases?.forEach((test) => {
    const updatedAt = new Date(test.updatedAt);

    // Daily key: "YYYY-MM-DD"
    const day = updatedAt.toISOString().slice(0, 10);

    if (!days[day]) {
      days[day] = { passed: 0, failed: 0, data: [] };
    }

    const status = String(test.status).toLowerCase();

    if (status === "passed") {
      days[day].data.push(test);
      days[day].passed += 1;
    } else if (status === "failed") {
      days[day].data.push(test);
      days[day].failed += 1;
    }
  });

  return Object.entries(days)
    .map(([day, counts]) => ({
      name: day,
      ...counts,
    }))
    .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
};

const getWeekNumber = (date: number | Date) => {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDay) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
};

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
