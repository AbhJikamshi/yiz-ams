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
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

const statusLabels = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

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

  /*
   * Safely handle an empty/undefined API response.
   */
  const data = dashboardData || {};

  /*
   * Financial chart data
   */
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

  /*
   * Loading state
   */
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /*
   * Error state
   */
  if (isError) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl text-red-600">
            !
          </div>

          <h2 className="mt-4 text-lg font-bold text-red-700">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-red-600">
            We couldn't retrieve your dashboard information.
            Please try again.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">

        {/* =====================================
            HEADER
        ===================================== */}

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-500">
            Overview of your association's activities,
            finances and members.
          </p>
        </div>

        {/* =====================================
            STATISTICS
        ===================================== */}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* Total Members */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Members
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {Number(data.totalMembers || 0).toLocaleString()}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-600">
                👥
              </div>

            </div>

            <p className="mt-3 text-sm text-blue-600">
              All registered members
            </p>
          </div>

          {/* Active Members */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Members
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {Number(data.activeMembers || 0).toLocaleString()}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-xl text-emerald-600">
                ✓
              </div>

            </div>

            <p className="mt-3 text-sm text-emerald-600">
              Currently active
            </p>
          </div>

          {/* Pending Payments */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending Payments
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {Number(
                    data.pendingPaymentRequests || 0
                  ).toLocaleString()}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-xl text-amber-600">
                ₦
              </div>

            </div>

            <p className="mt-3 text-sm text-amber-600">
              Awaiting verification
            </p>
          </div>

          {/* Monthly Contributions */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Monthly Contributions
                </p>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {formatCurrency(data.monthlyContributions)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl text-purple-600">
                ₦
              </div>

            </div>

            <p className="mt-3 text-sm text-blue-600">
              Current month
            </p>
          </div>

        </div>

        {/* =====================================
            FINANCIAL SUMMARY
        ===================================== */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

          {/* Total Income */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Association Income
            </p>

            <p className="mt-3 text-3xl font-bold text-emerald-600">
              {formatCurrency(data.totalIncome)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Total approved income
            </p>
          </div>

          {/* Expenses */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Expenses
            </p>

            <p className="mt-3 text-3xl font-bold text-red-600">
              {formatCurrency(data.totalExpenses)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Recorded association expenses
            </p>
          </div>

          {/* Balance */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Current Balance
            </p>

            <p className="mt-3 text-3xl font-bold text-blue-600">
              {formatCurrency(data.availableBalance)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Income minus expenses
            </p>
          </div>

        </div>

        {/* =====================================
            FINANCIAL VISUAL SUMMARY
        ===================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Financial Chart */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Financial Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current income, expenses and available balance
              </p>
            </div>

            <div className="h-[300px] w-full">

              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={financialChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 20,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      `₦${Number(value).toLocaleString("en-NG")}`
                    }
                  />

                  <Tooltip
                    formatter={(value) => [
                      formatCurrency(value),
                      "Amount",
                    ]}
                    cursor={{ opacity: 0.08 }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow:
                        "0 10px 25px rgba(15, 23, 42, 0.08)",
                    }}
                  />

                  <Bar
                    dataKey="amount"
                    name="Amount"
                    radius={[8, 8, 0, 0]}
                    barSize={55}
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>
          </div>

          {/* Financial Snapshot */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-bold text-slate-900">
              Financial Snapshot
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Quick view of the association's finances
            </p>

            <div className="mt-6 space-y-4">

              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-700">
                  Total Income
                </p>

                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  {formatCurrency(data.totalIncome)}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">
                  Total Expenses
                </p>

                <p className="mt-1 text-2xl font-bold text-red-700">
                  {formatCurrency(data.totalExpenses)}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-700">
                  Available Balance
                </p>

                <p className="mt-1 text-2xl font-bold text-blue-700">
                  {formatCurrency(data.availableBalance)}
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* =====================================
            RECENT PAYMENT REQUESTS + EXPENSES
        ===================================== */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Recent Payment Requests */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Payment Requests
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest member payment submissions
                </p>
              </div>

              <Link
                to="/payment-verification"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>

            </div>

            <div className="divide-y divide-slate-100">

              {data.recentPaymentRequests?.length ? (
                data.recentPaymentRequests.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-3 px-4 py-4 transition hover:bg-slate-50 sm:gap-4 sm:px-6"
                  >

                    <div className="min-w-0">

                      <p className="truncate font-semibold text-slate-800">
                        {payment.member?.fullName ||
                          "Unknown Member"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(payment.createdAt)}
                      </p>

                    </div>

                    <div className="shrink-0 text-right">

                      <p className="font-bold text-slate-900">
                        {formatCurrency(payment.amount)}
                      </p>

                      <span
                        className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                          statusClasses[payment.status] ||
                          "bg-slate-100 text-slate-600"
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
                <div className="px-6 py-10 text-center text-sm text-slate-400">
                  No payment requests yet.
                </div>
              )}

            </div>
          </div>

          {/* Recent Expenses */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Expenses
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest association expenses
                </p>
              </div>

              <Link
                to="/expenses"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>

            </div>

            <div className="divide-y divide-slate-100">

              {data.recentExpenses?.length ? (
                data.recentExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-slate-50"
                  >

                    <div className="min-w-0">

                      <p className="truncate font-semibold text-slate-800">
                        {expense.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {expense.category} •{" "}
                        {formatDate(expense.expenseDate)}
                      </p>

                    </div>

                    <p className="shrink-0 font-bold text-red-600">
                      {formatCurrency(expense.amount)}
                    </p>

                  </div>
                ))
              ) : (
                <div className="px-6 py-10 text-center text-sm text-slate-400">
                  No expenses recorded yet.
                </div>
              )}

            </div>
          </div>

        </div>

        {/* =====================================
            ANNOUNCEMENTS
        ===================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Announcements
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest messages published to members
                </p>
              </div>

              <Link
                to="/announcements"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>

            </div>

          </div>

          <div className="p-6">

            {data.announcements?.length ? (
              <div className="space-y-4">

                {data.announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="rounded-xl bg-slate-50 p-5 transition hover:bg-slate-100"
                  >

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                      <h3 className="font-bold text-slate-900">
                        {announcement.title}
                      </h3>

                      <span className="shrink-0 text-xs text-slate-400">
                        {formatDate(announcement.createdAt)}
                      </span>

                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {announcement.message}
                    </p>

                  </div>
                ))}

              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">
                No announcements yet.
              </p>
            )}

          </div>
        </div>
      </div>

{/* =====================================
    FLOATING QUICK ACTIONS
===================================== */}

<div className="fixed bottom-5 right-5 z-40 flex flex-col gap-3">

  {/* MANAGE MEMBERS */}

  <Link
    to="/members"
    title="Manage Members"
    aria-label="Manage Members"
    className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ring-4 ring-white transition hover:scale-105 hover:bg-blue-700"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-6 w-6"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  </Link>


  {/* VERIFY PAYMENTS */}

  <Link
    to="/payment-verification"
    title="Verify Payments"
    aria-label="Verify Payments"
    className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg ring-4 ring-white transition hover:scale-105 hover:bg-emerald-700"
  >
    <div className="relative flex items-center justify-center">

      {/* ATM / CARD */}

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-6 w-6"
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

      {/* MAGNIFYING GLASS */}

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="absolute -bottom-1 -right-2 h-4 w-4 rounded-full bg-emerald-600"
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