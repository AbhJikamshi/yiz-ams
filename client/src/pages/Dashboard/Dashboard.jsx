import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";

import DashboardLayout from "../../components/layout/DashboardLayout";
import { getDashboardSummary } from "../../services/dashboardService";

const NGN = "₦";

const formatCurrency = (amount = 0) => {
  return `${NGN}${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const statusClasses = {
  PENDING:
    "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",

  APPROVED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",

  REJECTED:
    "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
};

const statusLabels = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

/* ============================================================
   DASHBOARD
============================================================ */

const Dashboard = () => {
  const {
    data: dashboardData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  });

  const data = dashboardData || {};

  /* ============================================================
     FINANCIAL CHART DATA
  ============================================================ */

  const financialChartData = [
    {
      name: "Income",
      amount: Number(data.totalIncome || 0),
    },
    {
      name: "Expenses",
      amount: Number(data.totalExpenses || 0),
    },
    {
      name: "Balance",
      amount: Number(data.availableBalance || 0),
    },
  ];

  /* ============================================================
     LOADING STATE
  ============================================================ */

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-sky-100 border-t-[#0077B6] dark:border-slate-700 dark:border-t-[#00B4D8]" />

            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ============================================================
     ERROR STATE
  ============================================================ */

  if (isError) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center shadow-sm dark:border-rose-900 dark:bg-rose-950/30">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-xl font-bold text-rose-600 dark:bg-rose-900/50 dark:text-rose-300">
            !
          </div>

          <h2 className="mt-4 text-lg font-bold text-rose-700 dark:text-rose-300">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
            We couldn't retrieve your dashboard information. Please try
            again.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 rounded-xl bg-[#0077B6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#023E8A] hover:shadow-md dark:bg-[#00B4D8] dark:hover:bg-[#0077B6]"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-7 pb-24">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#023E8A] via-[#0077B6] to-[#00B4D8] p-6 text-white shadow-lg sm:p-7">

          <div className="relative z-10">
            <div className="mb-2 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur-sm">
              YIZ-AMS
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
              Overview of your association's activities, finances and
              members.
            </p>
          </div>

          {/* Decorative circles */}

          <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 right-20 h-48 w-48 rounded-full bg-white/5" />

        </div>

        {/* ======================================================
            STATISTICS
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL MEMBERS */}

          <div className="group rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Members
                </p>

                <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
                  {Number(data.totalMembers || 0).toLocaleString()}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-xl text-[#0077B6] transition group-hover:scale-105 dark:bg-sky-950/40 dark:text-[#00B4D8]">
                👥
              </div>

            </div>

            <p className="mt-4 text-xs font-medium text-[#0077B6] dark:text-[#90E0EF]">
              All registered members
            </p>

          </div>

          {/* ACTIVE MEMBERS */}

          <div className="group rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Active Members
                </p>

                <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
                  {Number(data.activeMembers || 0).toLocaleString()}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-600 transition group-hover:scale-105 dark:bg-emerald-950/40 dark:text-emerald-400">
                ✓
              </div>

            </div>

            <p className="mt-4 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Currently active
            </p>

          </div>

          {/* PENDING PAYMENTS */}

          <div className="group rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Pending Payments
                </p>

                <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
                  {Number(
                    data.pendingPaymentRequests || 0
                  ).toLocaleString()}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-xl font-bold text-amber-600 transition group-hover:scale-105 dark:bg-amber-950/40 dark:text-amber-400">
                ₦
              </div>

            </div>

            <p className="mt-4 text-xs font-medium text-amber-600 dark:text-amber-400">
              Awaiting verification
            </p>

          </div>

          {/* MONTHLY CONTRIBUTIONS */}

          <div className="group rounded-2xl border border-purple-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Monthly Contributions
                </p>

                <p className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(data.monthlyContributions)}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-xl font-bold text-purple-600 transition group-hover:scale-105 dark:bg-purple-950/40 dark:text-purple-400">
                ₦
              </div>

            </div>

            <p className="mt-4 text-xs font-medium text-[#0077B6] dark:text-[#90E0EF]">
              Current month
            </p>

          </div>

        </div>

        {/* ======================================================
            FINANCIAL SUMMARY
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* INCOME */}

          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">

            <div className="flex items-center justify-between">

              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Total Association Income
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                ↑
              </div>

            </div>

            <p className="mt-4 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(data.totalIncome)}
            </p>

            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              Total approved income
            </p>

          </div>

          {/* EXPENSES */}

          <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">

            <div className="flex items-center justify-between">

              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Total Expenses
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                ↓
              </div>

            </div>

            <p className="mt-4 text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {formatCurrency(data.totalExpenses)}
            </p>

            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              Recorded association expenses
            </p>

          </div>

          {/* BALANCE */}

          <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">

            <div className="flex items-center justify-between">

              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Current Balance
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-[#0077B6] dark:bg-sky-950/40 dark:text-[#00B4D8]">
                ₦
              </div>

            </div>

            <p className="mt-4 text-3xl font-extrabold text-[#0077B6] dark:text-[#00B4D8]">
              {formatCurrency(data.availableBalance)}
            </p>

            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              Income minus expenses
            </p>

          </div>

        </div>

        {/* ======================================================
            FINANCIAL VISUAL SUMMARY
        ====================================================== */}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* FINANCIAL CHART */}

          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6 lg:col-span-2">

            <div className="mb-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-[#0077B6] dark:bg-sky-950/40 dark:text-[#00B4D8]">
                  📊
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Financial Overview
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Current income, expenses and available balance
                  </p>
                </div>

              </div>

            </div>

            <div className="h-[300px] w-full">

              <ResponsiveContainer width="100%" height="100%">

                <BarChart
                  data={financialChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#dbeafe"
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748b",
                      fontSize: 11,
                    }}
                    tickFormatter={(value) =>
                      `₦${Number(value).toLocaleString("en-NG")}`
                    }
                  />

                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(value),
                      "Amount",
                    ]}
                    cursor={{
                      fill: "rgba(0, 180, 216, 0.06)",
                    }}
                    contentStyle={{
                      borderRadius: "14px",
                      border: "1px solid #CAF0F8",
                      background: "#ffffff",
                      boxShadow:
                        "0 10px 30px rgba(3, 62, 100, 0.12)",
                    }}
                  />

                  <Bar
                    dataKey="amount"
                    name="Amount"
                    fill="#0077B6"
                    radius={[8, 8, 0, 0]}
                    barSize={55}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* FINANCIAL SNAPSHOT */}

          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF8FF] text-[#0077B6] dark:bg-sky-950/40 dark:text-[#00B4D8]">
                💰
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Financial Snapshot
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Quick financial overview
                </p>
              </div>

            </div>

            <div className="mt-6 space-y-3">

              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">

                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Total Income
                </p>

                <p className="mt-1 text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(data.totalIncome)}
                </p>

              </div>

              <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30">

                <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
                  Total Expenses
                </p>

                <p className="mt-1 text-2xl font-extrabold text-rose-700 dark:text-rose-300">
                  {formatCurrency(data.totalExpenses)}
                </p>

              </div>

              <div className="rounded-xl border border-sky-100 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/30">

                <p className="text-xs font-semibold uppercase tracking-wide text-[#0077B6] dark:text-[#00B4D8]">
                  Available Balance
                </p>

                <p className="mt-1 text-2xl font-extrabold text-[#0077B6] dark:text-[#00B4D8]">
                  {formatCurrency(data.availableBalance)}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ======================================================
            RECENT PAYMENT REQUESTS + EXPENSES
        ====================================================== */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

          {/* RECENT PAYMENT REQUESTS */}

          <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">

            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between sm:px-6">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                    ₦
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Recent Payment Requests
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Latest member payment submissions
                    </p>
                  </div>

                </div>

              </div>

              <Link
                to="/payment-verification"
                className="font-semibold text-[#0077B6] transition hover:text-[#023E8A] dark:text-[#00B4D8] dark:hover:text-[#90E0EF]"
              >
                View all →
              </Link>

            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">

              {data.recentPaymentRequests?.length ? (

                data.recentPaymentRequests.map((payment) => (

                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-sky-50/60 dark:hover:bg-slate-700/50 sm:gap-4 sm:px-6"
                  >

                    <div className="min-w-0">

                      <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                        {payment.member?.fullName ||
                          "Unknown Member"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {formatDate(payment.createdAt)}
                      </p>

                    </div>

                    <div className="shrink-0 text-right">

                      <p className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(payment.amount)}
                      </p>

                      <span
                        className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                          statusClasses[payment.status] ||
                          "border border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {statusLabels[payment.status] ||
                          payment.status ||
                          "Unknown"}
                      </span>

                    </div>

                  </div>

                ))

              ) : (

                <div className="px-6 py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                  No payment requests yet.
                </div>

              )}

            </div>

          </div>

          {/* RECENT EXPENSES */}

          <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 dark:border-slate-700 sm:px-6">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                    ↓
                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Recent Expenses
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Latest association expenses
                    </p>

                  </div>

                </div>

              </div>

              <Link
                to="/expenses"
                className="font-semibold text-[#0077B6] transition hover:text-[#023E8A] dark:text-[#00B4D8] dark:hover:text-[#90E0EF]"
              >
                View all →
              </Link>

            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">

              {data.recentExpenses?.length ? (

                data.recentExpenses.map((expense) => (

                  <div
                    key={expense.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-sky-50/60 dark:hover:bg-slate-700/50 sm:px-6"
                  >

                    <div className="min-w-0">

                      <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                        {expense.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {expense.category} •{" "}
                        {formatDate(expense.expenseDate)}
                      </p>

                    </div>

                    <p className="shrink-0 font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(expense.amount)}
                    </p>

                  </div>

                ))

              ) : (

                <div className="px-6 py-10 text-center text-sm text-slate-400 dark:text-slate-500">
                  No expenses recorded yet.
                </div>

              )}

            </div>

          </div>

        </div>

        {/* ======================================================
            ANNOUNCEMENTS
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">

          <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-700 sm:px-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-[#0077B6] dark:bg-sky-950/40 dark:text-[#00B4D8]">
                    📢
                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Announcements
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Latest messages published to members
                    </p>

                  </div>

                </div>

              </div>

              <Link
                to="/announcements"
                className="font-semibold text-[#0077B6] transition hover:text-[#023E8A] dark:text-[#00B4D8] dark:hover:text-[#90E0EF]"
              >
                View all →
              </Link>

            </div>

          </div>

          <div className="p-5 sm:p-6">

            {data.announcements?.length ? (

              <div className="space-y-4">

                {data.announcements.map((announcement) => (

                  <div
                    key={announcement.id}
                    className="rounded-xl border border-sky-100 bg-sky-50/60 p-5 transition hover:border-sky-200 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-700/50"
                  >

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {announcement.title}
                      </h3>

                      <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                        {formatDate(announcement.createdAt)}
                      </span>

                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {announcement.message}
                    </p>

                  </div>

                ))}

              </div>

            ) : (

              <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                No announcements yet.
              </p>

            )}

          </div>

        </div>

      </div>

      {/* ============================================================
    FLOATING DASHBOARD ACTIONS
============================================================ */}

<div className="fixed bottom-5 right-5 z-40 flex flex-col items-center gap-3 sm:bottom-6 sm:right-6">

  {/* MANAGE MEMBERS */}

  <Link
    to="/members"
    title="Manage Members"
    aria-label="Manage Members"
    className="
      flex h-12 w-12 items-center justify-center
      rounded-full
      bg-blue-600
      text-white
      shadow-lg
      ring-4 ring-white
      transition-all duration-200
      hover:scale-105
      hover:bg-blue-700
      hover:shadow-xl
      active:scale-95
      dark:ring-slate-900
    "
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-6 w-6 text-white"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  </Link>


  {/* MAKE PAYMENT */}

  <Link
    to="/contributions"
    title="Make Payment"
    aria-label="Make Payment"
    className="
      flex h-14 w-14 items-center justify-center
      rounded-2xl
      bg-red-600
      text-white
      shadow-xl
      ring-4 ring-white
      transition-all duration-200
      hover:scale-105
      hover:bg-red-700
      hover:shadow-2xl
      active:scale-95
      dark:ring-slate-900
    "
  >
    <span
      className="
        text-2xl
        font-extrabold
        leading-none
        text-white
      "
      aria-hidden="true"
    >
      ₦
    </span>
  </Link>


  {/* VERIFY PAYMENTS */}

  <Link
    to="/payment-verification"
    title="Verify Payments"
    aria-label="Verify Payments"
    className="
      flex h-12 w-12 items-center justify-center
      rounded-full
      bg-emerald-600
      text-white
      shadow-lg
      ring-4 ring-white
      transition-all duration-200
      hover:scale-105
      hover:bg-emerald-700
      hover:shadow-xl
      active:scale-95
      dark:ring-slate-900
    "
  >

    <div className="relative flex items-center justify-center">

      {/* CARD */}

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
        />

        <path d="M3 10h18" />

        <path d="M7 15h4" />
      </svg>

      {/* SEARCH */}

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="3"
        className="
          absolute
          -bottom-1
          -right-2
          h-4
          w-4
          rounded-full
          bg-emerald-600
        "
        aria-hidden="true"
      >
        <circle cx="10.5" cy="10.5" r="6" />
        <path d="m16 16 4 4" />
      </svg>

    </div>

  </Link>

</div>

    </DashboardLayout>
  );
};

export default Dashboard;