import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  getFinancialSummary,
  getContributionReport,
  getExpenseReport,
  getAdminSummary,
  getMonthlyIncome,
  getMonthlyExpenses,
  getOutstandingMembers,
  downloadFinancialSummaryExcel,
  downloadContributionExcel,
  downloadExpenseExcel,
  downloadMemberExcel,
} from "../../services/reportService";

// =====================================================
// FORMATTERS
// =====================================================

const formatCurrency = (amount) => {
  return `₦${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("en-NG");
};

const getMonthName = (monthNumber) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return months[Number(monthNumber) - 1] || "Unknown";
};

const getMonthShortName = (monthNumber) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return months[Number(monthNumber) - 1] || "N/A";
};

// =====================================================
// DOWNLOAD HELPER
// =====================================================

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(
    new Blob([blob])
  );

  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};

// =====================================================
// REPORTS
// =====================================================

const Reports = () => {
  // ===================================================
  // MAIN DATA
  // ===================================================

  const [summary, setSummary] = useState(null);

  const [adminSummary, setAdminSummary] =
    useState(null);

  const [contributions, setContributions] =
    useState([]);

  const [expenses, setExpenses] =
    useState([]);

  const [monthlyIncome, setMonthlyIncome] =
    useState([]);

  const [monthlyExpenses, setMonthlyExpenses] =
    useState([]);

  const [outstandingMembers, setOutstandingMembers] =
    useState([]);

  // ===================================================
  // UI STATE
  // ===================================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  const [activeSection, setActiveSection] =
    useState("overview");

  // ===================================================
  // LOAD ALL REPORTS
  // ===================================================

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryResponse,
        contributionResponse,
        expenseResponse,
        adminResponse,
        incomeResponse,
        monthlyExpenseResponse,
        outstandingResponse,
      ] = await Promise.all([
        getFinancialSummary(),
        getContributionReport(),
        getExpenseReport(),
        getAdminSummary(),
        getMonthlyIncome(),
        getMonthlyExpenses(),
        getOutstandingMembers(),
      ]);

      // -----------------------------------------------
      // FINANCIAL SUMMARY
      // -----------------------------------------------

      setSummary(
        summaryResponse?.data ??
          summaryResponse ??
          null
      );

      // -----------------------------------------------
      // CONTRIBUTIONS
      // -----------------------------------------------

      setContributions(
        contributionResponse?.data?.records ??
          contributionResponse?.data ??
          []
      );

      // -----------------------------------------------
      // EXPENSES
      // -----------------------------------------------

      setExpenses(
        expenseResponse?.data?.records ??
          expenseResponse?.data ??
          []
      );

      // -----------------------------------------------
      // ADMIN SUMMARY
      // -----------------------------------------------

      setAdminSummary(
        adminResponse?.data ??
          adminResponse ??
          null
      );

      // -----------------------------------------------
      // MONTHLY INCOME
      // -----------------------------------------------

      setMonthlyIncome(
        incomeResponse?.data ??
          incomeResponse ??
          []
      );

      // -----------------------------------------------
      // MONTHLY EXPENSES
      // -----------------------------------------------

      setMonthlyExpenses(
        monthlyExpenseResponse?.data ??
          monthlyExpenseResponse ??
          []
      );

      // -----------------------------------------------
      // OUTSTANDING MEMBERS
      // -----------------------------------------------

      setOutstandingMembers(
        outstandingResponse?.data ??
          outstandingResponse ??
          []
      );
    } catch (err) {
      console.error(
        "Reports loading error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load reports."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // ===================================================
  // REFRESH
  // ===================================================

  const handleRefresh = async () => {
  setRefreshing(true);
  setError("");
  setSuccess("");

  try {
    await loadReports();

    setSuccess("Reports refreshed successfully.");

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  } catch (err) {
    console.error(err);

    setError(
      err?.response?.data?.message ||
      "Failed to refresh reports."
    );
  } finally {
    setRefreshing(false);
  }
};

  // ===================================================
  // TOTAL CONTRIBUTIONS
  // ===================================================

  const totalContributions = useMemo(() => {
    return contributions.reduce(
      (total, contribution) =>
        total +
        Number(contribution.amount || 0),
      0
    );
  }, [contributions]);

  // ===================================================
  // TOTAL EXPENSES
  // ===================================================

  const totalExpenses = useMemo(() => {
    return expenses.reduce(
      (total, expense) =>
        total +
        Number(expense.amount || 0),
      0
    );
  }, [expenses]);

  // ===================================================
  // NET BALANCE
  // ===================================================

  const calculatedNetBalance =
    totalContributions - totalExpenses;

  const netBalance =
    Number(
      adminSummary?.netBalance ??
        summary?.availableBalance ??
        calculatedNetBalance
    );

  // ===================================================
  // EXPENSE CATEGORIES
  // ===================================================

  const expenseCategories = useMemo(() => {
    const grouped = {};

    expenses.forEach((expense) => {
      const category =
        expense.category || "Uncategorized";

      if (!grouped[category]) {
        grouped[category] = 0;
      }

      grouped[category] += Number(
        expense.amount || 0
      );
    });

    return Object.entries(grouped)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort(
        (a, b) => b.amount - a.amount
      );
  }, [expenses]);

  // ===================================================
  // HIGHEST EXPENSE
  // ===================================================

  const highestExpense = useMemo(() => {
    if (!expenses.length) return null;

    return expenses.reduce(
      (highest, expense) => {
        if (
          !highest ||
          Number(expense.amount || 0) >
            Number(highest.amount || 0)
        ) {
          return expense;
        }

        return highest;
      },
      null
    );
  }, [expenses]);

  // ===================================================
  // AVERAGE EXPENSE
  // ===================================================

  const averageExpense =
    expenses.length === 0
      ? 0
      : totalExpenses / expenses.length;

  // ===================================================
  // MONTHLY FINANCIAL DATA
  // ===================================================

  const monthlyFinancialData = useMemo(() => {
    const grouped = {};

    // -----------------------------------------------
    // INCOME
    // -----------------------------------------------

    monthlyIncome.forEach((record) => {
      const year = Number(record.year);
      const month = Number(
        record.monthNumber
      );

      if (
        !year ||
        !month ||
        month < 1 ||
        month > 12
      ) {
        return;
      }

      const key = `${year}-${String(
        month
      ).padStart(2, "0")}`;

      if (!grouped[key]) {
        grouped[key] = {
          year,
          month,
          income: 0,
          expenses: 0,
        };
      }

      grouped[key].income += Number(
        record?._sum?.amount || 0
      );
    });

    // -----------------------------------------------
    // EXPENSES
    // -----------------------------------------------

    monthlyExpenses.forEach((record) => {
      const year = Number(record.year);
      const month = Number(record.month);

      if (
        !year ||
        !month ||
        month < 1 ||
        month > 12
      ) {
        return;
      }

      const key = `${year}-${String(
        month
      ).padStart(2, "0")}`;

      if (!grouped[key]) {
        grouped[key] = {
          year,
          month,
          income: 0,
          expenses: 0,
        };
      }

      grouped[key].expenses += Number(
        record.total || 0
      );
    });

    return Object.values(grouped)
      .map((record) => ({
        ...record,
        net:
          Number(record.income || 0) -
          Number(record.expenses || 0),
      }))
      .sort((a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        }

        return a.month - b.month;
      });
  }, [
    monthlyIncome,
    monthlyExpenses,
  ]);

  // ===================================================
  // MONTHLY MAX
  // ===================================================

  const monthlyMaximum = useMemo(() => {
    if (!monthlyFinancialData.length) {
      return 1;
    }

    return Math.max(
      ...monthlyFinancialData.map(
        (record) =>
          Math.max(
            Number(record.income || 0),
            Number(record.expenses || 0)
          )
      ),
      1
    );
  }, [monthlyFinancialData]);

  // ===================================================
  // EXPORT FINANCIAL SUMMARY
  // ===================================================

  const handleFinancialSummaryExcel =
    async () => {
      try {
        setError("");
        setSuccess("");

        const blob =
          await downloadFinancialSummaryExcel();

        downloadBlob(
          blob,
          "FinancialSummary.xlsx"
        );

        setSuccess(
          "Financial summary downloaded successfully."
        );
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            "Unable to download financial summary."
        );
      }
    };

  // ===================================================
  // EXPORT CONTRIBUTIONS
  // ===================================================

  const handleContributionExcel =
    async () => {
      try {
        setError("");
        setSuccess("");

        const blob =
          await downloadContributionExcel();

        downloadBlob(
          blob,
          "ContributionReport.xlsx"
        );

        setSuccess(
          "Contribution report downloaded successfully."
        );
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            "Unable to download contribution report."
        );
      }
    };

  // ===================================================
  // EXPORT EXPENSES
  // ===================================================

  const handleExpenseExcel = async () => {
    try {
      setError("");
      setSuccess("");

      const blob =
        await downloadExpenseExcel();

      downloadBlob(
        blob,
        "ExpenseReport.xlsx"
      );

      setSuccess(
        "Expense report downloaded successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to download expense report."
      );
    }
  };

  // ===================================================
  // EXPORT MEMBERS
  // ===================================================

  const handleMemberExcel = async () => {
    try {
      setError("");
      setSuccess("");

      const blob =
        await downloadMemberExcel();

      downloadBlob(
        blob,
        "MembersReport.xlsx"
      );

      setSuccess(
        "Members report downloaded successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Unable to download members report."
      );
    }
  };

  // ===================================================
  // NAVIGATION
  // ===================================================

  const sections = [
    {
      id: "overview",
      label: "Overview",
    },
    {
      id: "expenses",
      label: "Expenses",
    },
    {
      id: "contributions",
      label: "Contributions",
    },
    {
      id: "members",
      label: "Outstanding Members",
    },
  ];

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="font-medium text-gray-700">
              Loading reports...
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Fetching financial information.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ===================================================
  // PAGE
  // ===================================================

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Reports
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Monitor association finances,
              contributions and expenses.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh"}
            </button>

            <button
              type="button"
              onClick={
                handleFinancialSummaryExcel
              }
              className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
            >
              ↓ Financial Excel
            </button>

          </div>

        </div>

        {/* =================================================
            TOAST SUCCESS
        ================================================= */}

        {success && (
          <div className="fixed right-5 top-5 z-[100] w-[360px] max-w-[calc(100vw-40px)]">

            <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-white p-4 shadow-2xl">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                ✓
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800">
                  Success
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {success}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSuccess("")
                }
                className="text-xl leading-none text-gray-400 hover:text-gray-700"
              >
                ×
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            TOAST ERROR
        ================================================= */}

        {error && (
          <div className="fixed right-5 top-5 z-[100] w-[360px] max-w-[calc(100vw-40px)]">

            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-white p-4 shadow-2xl">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                !
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800">
                  Error
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="text-xl leading-none text-gray-400 hover:text-gray-700"
              >
                ×
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">

          <div className="flex min-w-max border-b">

            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() =>
                  setActiveSection(
                    section.id
                  )
                }
                className={`px-5 py-3 text-sm font-semibold transition ${
                  activeSection ===
                  section.id
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {section.label}
              </button>
            ))}

          </div>

        </div>

        {/* =================================================
            OVERVIEW
        ================================================= */}

        {activeSection === "overview" && (
          <div className="space-y-6">

            {/* SUMMARY CARDS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {/* INCOME */}

              <div className="rounded-xl border bg-white p-5 shadow-sm">

                <p className="text-sm font-medium text-gray-500">
                  Received Contributions
                </p>

                <p className="mt-2 text-2xl font-bold text-green-600">
                  {formatCurrency(
                    adminSummary?.totalIncome ??
                      summary?.receivedContributions ??
                      totalContributions
                  )}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Total money received
                </p>

              </div>

              {/* EXPENSES */}

              <div className="rounded-xl border bg-white p-5 shadow-sm">

                <p className="text-sm font-medium text-gray-500">
                  Total Expenses
                </p>

                <p className="mt-2 text-2xl font-bold text-red-600">
                  {formatCurrency(
                    adminSummary?.totalExpenses ??
                      summary?.totalExpenses ??
                      totalExpenses
                  )}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Total recorded expenses
                </p>

              </div>

              {/* BALANCE */}

              <div className="rounded-xl border bg-white p-5 shadow-sm">

                <p className="text-sm font-medium text-gray-500">
                  Available Balance
                </p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    netBalance >= 0
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(
                    netBalance
                  )}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Contributions minus expenses
                </p>

              </div>

              {/* MEMBERS */}

              <div className="rounded-xl border bg-white p-5 shadow-sm">

                <p className="text-sm font-medium text-gray-500">
                  Active Members
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-800">
                  {formatNumber(
                    adminSummary?.activeMembers ??
                      summary?.totalMembers ??
                      0
                  )}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Currently active
                </p>

              </div>

            </div>

            {/* FINANCIAL STATUS */}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              <div className="rounded-xl border bg-white p-5 shadow-sm">

                <p className="text-sm font-medium text-gray-500">
                  Expected Contributions
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-800">
                  {formatCurrency(
                    summary?.expectedContributions
                  )}
                </p>

                <div className="mt-4">

                  <div className="mb-1 flex justify-between text-xs text-gray-500">
                    <span>
                      Collection Rate
                    </span>

                    <span>
                      {Number(
                        summary?.collectionRate ||
                          0
                      ).toFixed(2)}
                      %
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">

                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{
                        width: `${Math.min(
                          Number(
                            summary?.collectionRate ||
                              0
                          ),
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">

                <p className="text-sm font-medium text-gray-500">
                  Outstanding Contributions
                </p>

                <p className="mt-2 text-2xl font-bold text-orange-600">
                  {formatCurrency(
                    summary?.outstandingContributions
                  )}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  Expected contributions not yet received.
                </p>

              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">

                <p className="text-sm font-medium text-gray-500">
                  Net Income
                </p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    netBalance >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(
                    netBalance
                  )}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  Current financial position.
                </p>

              </div>

            </div>

            {/* MONTHLY TREND */}

            <div className="rounded-xl border bg-white p-5 shadow-sm">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Monthly Financial Trend
                  </h2>

                  <p className="text-sm text-gray-500">
                    Contributions versus expenses.
                  </p>
                </div>

              </div>

              {monthlyFinancialData.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-500">
                  No monthly financial data available.
                </div>
              ) : (
                <div className="mt-6 space-y-5">

                  {monthlyFinancialData.map(
                    (record) => {
                      const income =
                        Number(
                          record.income || 0
                        );

                      const expense =
                        Number(
                          record.expenses || 0
                        );

                      const incomeWidth =
                        Math.max(
                          (income /
                            monthlyMaximum) *
                            100,
                          income > 0
                            ? 2
                            : 0
                        );

                      const expenseWidth =
                        Math.max(
                          (expense /
                            monthlyMaximum) *
                            100,
                          expense > 0
                            ? 2
                            : 0
                        );

                      return (
                        <div
                          key={`${record.year}-${record.month}`}
                        >

                          <div className="mb-2 flex items-center justify-between">

                            <span className="text-sm font-semibold text-gray-700">
                              {getMonthName(
                                record.month
                              )}{" "}
                              {record.year}
                            </span>

                            <span
                              className={`text-sm font-bold ${
                                record.net >=
                                0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              Net:{" "}
                              {formatCurrency(
                                record.net
                              )}
                            </span>

                          </div>

                          <div className="space-y-2">

                            <div className="flex items-center gap-3">

                              <span className="w-20 text-xs text-gray-500">
                                Income
                              </span>

                              <div className="flex-1">

                                <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                                  <div
                                    className="h-full rounded-full bg-green-500 transition-all"
                                    style={{
                                      width: `${incomeWidth}%`,
                                    }}
                                  />

                                </div>

                              </div>

                              <span className="w-28 text-right text-xs font-semibold text-gray-700">
                                {formatCurrency(
                                  income
                                )}
                              </span>

                            </div>

                            <div className="flex items-center gap-3">

                              <span className="w-20 text-xs text-gray-500">
                                Expenses
                              </span>

                              <div className="flex-1">

                                <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                                  <div
                                    className="h-full rounded-full bg-red-500 transition-all"
                                    style={{
                                      width: `${expenseWidth}%`,
                                    }}
                                  />

                                </div>

                              </div>

                              <span className="w-28 text-right text-xs font-semibold text-gray-700">
                                {formatCurrency(
                                  expense
                                )}
                              </span>

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

            {/* EXPENSE CATEGORY ANALYSIS */}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              <div className="rounded-xl border bg-white p-5 shadow-sm">

                <h2 className="text-lg font-bold text-gray-800">
                  Expenses by Category
                </h2>

                <p className="text-sm text-gray-500">
                  Where association funds are being spent.
                </p>

                {expenseCategories.length ===
                0 ? (
                  <div className="py-10 text-center text-sm text-gray-500">
                    No expense data available.
                  </div>
                ) : (
                  <div className="mt-5 space-y-4">

                    {expenseCategories.map(
                      (item) => {
                        const percentage =
                          totalExpenses ===
                          0
                            ? 0
                            : (item.amount /
                                totalExpenses) *
                              100;

                        return (
                          <div
                            key={
                              item.category
                            }
                          >

                            <div className="mb-1 flex items-center justify-between">

                              <span className="text-sm font-medium text-gray-700">
                                {
                                  item.category
                                }
                              </span>

                              <span className="text-sm font-semibold text-gray-800">
                                {formatCurrency(
                                  item.amount
                                )}
                              </span>

                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-gray-100">

                              <div
                                className="h-full rounded-full bg-red-500"
                                style={{
                                  width: `${Math.min(
                                    percentage,
                                    100
                                  )}%`,
                                }}
                              />

                            </div>

                            <p className="mt-1 text-xs text-gray-400">
                              {percentage.toFixed(
                                1
                              )}
                              % of total expenses
                            </p>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              </div>

              {/* EXPENSE STATISTICS */}

              <div className="rounded-xl border bg-white p-5 shadow-sm">

                <h2 className="text-lg font-bold text-gray-800">
                  Expense Statistics
                </h2>

                <p className="text-sm text-gray-500">
                  Summary of recorded expenses.
                </p>

                <div className="mt-5 space-y-4">

                  <div className="rounded-lg bg-gray-50 p-4">

                    <p className="text-xs font-medium uppercase text-gray-500">
                      Total Records
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-800">
                      {formatNumber(
                        expenses.length
                      )}
                    </p>

                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">

                    <p className="text-xs font-medium uppercase text-gray-500">
                      Average Expense
                    </p>

                    <p className="mt-1 text-xl font-bold text-gray-800">
                      {formatCurrency(
                        averageExpense
                      )}
                    </p>

                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">

                    <p className="text-xs font-medium uppercase text-gray-500">
                      Largest Expense
                    </p>

                    <p className="mt-1 text-xl font-bold text-red-600">
                      {formatCurrency(
                        highestExpense?.amount
                      )}
                    </p>

                    {highestExpense && (
                      <p className="mt-1 truncate text-xs text-gray-500">
                        {
                          highestExpense.title
                        }
                      </p>
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleExpenseExcel
                    }
                    className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    ↓ Export Expense Report
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            EXPENSES
        ================================================= */}

        {activeSection === "expenses" && (
          <div className="space-y-5">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Expense Report
                </h2>

                <p className="text-sm text-gray-500">
                  {expenses.length} record(s) ·{" "}
                  {formatCurrency(
                    totalExpenses
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleExpenseExcel
                }
                className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
              >
                ↓ Export Expenses
              </button>

            </div>

            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

              {expenses.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  No expense records found.
                </div>
              ) : (
                <div className="overflow-x-auto">

                  <table className="min-w-full">

                    <thead className="bg-gray-50">

                      <tr>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                          Date
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                          Title
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                          Category
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                          Amount
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y">

                      {expenses.map(
                        (expense) => (
                          <tr
                            key={
                              expense.id
                            }
                            className="hover:bg-gray-50"
                          >

                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                              {expense.expenseDate
                                ? new Date(
                                    expense.expenseDate
                                  ).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )
                                : "-"}
                            </td>

                            <td className="px-5 py-4">

                              <p className="font-medium text-gray-800">
                                {
                                  expense.title
                                }
                              </p>

                              {expense.description && (
                                <p className="mt-1 max-w-sm truncate text-xs text-gray-500">
                                  {
                                    expense.description
                                  }
                                </p>
                              )}

                            </td>

                            <td className="px-5 py-4">

                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                {
                                  expense.category
                                }
                              </span>

                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-red-600">
                              {formatCurrency(
                                expense.amount
                              )}
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                    <tfoot className="border-t bg-gray-50">

                      <tr>

                        <td
                          colSpan={3}
                          className="px-5 py-4 text-right font-bold text-gray-700"
                        >
                          Total
                        </td>

                        <td className="px-5 py-4 text-right font-bold text-red-600">
                          {formatCurrency(
                            totalExpenses
                          )}
                        </td>

                      </tr>

                    </tfoot>

                  </table>

                </div>
              )}

            </div>

          </div>
        )}

        {/* =================================================
            CONTRIBUTIONS
        ================================================= */}

        {activeSection ===
          "contributions" && (
          <div className="space-y-5">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Contribution Report
                </h2>

                <p className="text-sm text-gray-500">
                  {contributions.length} record(s) ·{" "}
                  {formatCurrency(
                    totalContributions
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleContributionExcel
                }
                className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
              >
                ↓ Export Contributions
              </button>

            </div>

            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

              {contributions.length ===
              0 ? (
                <div className="p-12 text-center text-gray-500">
                  No contribution records found.
                </div>
              ) : (
                <div className="overflow-x-auto">

                  <table className="min-w-full">

                    <thead className="bg-gray-50">

                      <tr>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                          Member
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                          Period
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                          Status
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                          Amount
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y">

                      {contributions.map(
                        (contribution) => (
                          <tr
                            key={
                              contribution.id
                            }
                            className="hover:bg-gray-50"
                          >

                            <td className="px-5 py-4">

                              <p className="font-medium text-gray-800">
                                {contribution
                                  .member
                                  ?.fullName ||
                                  "Unknown Member"}
                              </p>

                              {contribution
                                .member
                                ?.memberId && (
                                <p className="text-xs text-gray-500">
                                  {
                                    contribution
                                      .member
                                      .memberId
                                  }
                                </p>
                              )}

                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                              {getMonthName(
                                contribution.monthNumber
                              )}{" "}
                              {
                                contribution.year
                              }
                            </td>

                            <td className="px-5 py-4">

                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  contribution.status ===
                                  "PAID"
                                    ? "bg-green-50 text-green-700"
                                    : contribution.status ===
                                      "PENDING"
                                    ? "bg-yellow-50 text-yellow-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {
                                  contribution.status
                                }
                              </span>

                            </td>

                            <td className="px-5 py-4 text-right font-semibold text-green-600">
                              {formatCurrency(
                                contribution.amount
                              )}
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                    <tfoot className="border-t bg-gray-50">

                      <tr>

                        <td
                          colSpan={3}
                          className="px-5 py-4 text-right font-bold text-gray-700"
                        >
                          Total
                        </td>

                        <td className="px-5 py-4 text-right font-bold text-green-600">
                          {formatCurrency(
                            totalContributions
                          )}
                        </td>

                      </tr>

                    </tfoot>

                  </table>

                </div>
              )}

            </div>

          </div>
        )}

        {/* =================================================
            OUTSTANDING MEMBERS
        ================================================= */}

        {activeSection ===
          "members" && (
          <div className="space-y-5">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Outstanding Members
                </h2>

                <p className="text-sm text-gray-500">
                  Members with outstanding contribution balances.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  handleMemberExcel
                }
                className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
              >
                ↓ Export Members
              </button>

            </div>

            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

              {outstandingMembers.length ===
              0 ? (
                <div className="p-12 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                    ✓
                  </div>

                  <p className="mt-3 font-semibold text-gray-800">
                    No outstanding members
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    All member contribution balances are up to date.
                  </p>

                </div>
              ) : (
                <div className="overflow-x-auto">

                  <table className="min-w-full">

                    <thead className="bg-gray-50">

                      <tr>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                          Member
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                          Phone
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                          Outstanding
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y">

                      {outstandingMembers.map(
                        (member) => (
                          <tr
                            key={
                              member.id
                            }
                            className="hover:bg-gray-50"
                          >

                            <td className="px-5 py-4">

                              <p className="font-medium text-gray-800">
                                {
                                  member.fullName
                                }
                              </p>

                              {member.memberId && (
                                <p className="text-xs text-gray-500">
                                  {
                                    member.memberId
                                  }
                                </p>
                              )}

                            </td>

                            <td className="px-5 py-4 text-sm text-gray-600">
                              {member.phone ||
                                "-"}
                            </td>

                            <td className="px-5 py-4 text-right font-bold text-red-600">
                              {formatCurrency(
                                member.outstandingBalance
                              )}
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Reports;