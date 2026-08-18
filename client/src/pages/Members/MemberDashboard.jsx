import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import memberApi from "../../services/memberApi";

// ======================================================
// CONSTANTS
// ======================================================

const NGN = "₦";

// ======================================================
// HELPERS
// ======================================================

const formatCurrency = (amount) =>
  `${NGN}${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ======================================================
// MEMBER DASHBOARD
// ======================================================

export default function MemberDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // ======================================================
  // LOAD DASHBOARD
  // ======================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const response = await memberApi.get(
        "/member/dashboard"
      );

      console.log(
        "Dashboard Response:",
        response.data
      );

      setDashboard(
        response.data?.data || null
      );
    } catch (err) {
      console.error(
        "Dashboard Error:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // ======================================================
  // LOADING SCREEN
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 pb-28 pt-20 sm:p-6 sm:pb-28 sm:pt-20 lg:p-8 lg:pb-28 lg:pt-8">
        <div className="mx-auto max-w-7xl">

          <div className="animate-pulse">

            {/* Dashboard Header */}

            <div className="mb-6 h-44 rounded-2xl bg-slate-200" />

            {/* Personal Summary */}

            <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-36 rounded-2xl bg-white shadow-sm"
                />
              ))}
            </div>

            {/* Association Overview */}

            <div className="mb-8">

              <div className="mb-4 h-6 w-72 rounded bg-slate-200" />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-36 rounded-2xl bg-white shadow-sm"
                  />
                ))}
              </div>

            </div>

            {/* Recent Activity */}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              <div className="h-80 rounded-2xl bg-white shadow-sm" />

              <div className="h-80 rounded-2xl bg-white shadow-sm" />

            </div>

          </div>

        </div>
      </div>
    );
  }

  // ======================================================
  // DASHBOARD DATA
  // ======================================================

  const financials =
    dashboard?.associationFinancials || {};

  const memberName =
    dashboard?.member?.fullName || "Member";

  const summary =
    dashboard?.summary || {};

  const recentPayments =
    dashboard?.recentPayments || [];

  const announcements =
    dashboard?.announcements || [];

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-28 pt-20 sm:p-6 sm:pb-28 sm:pt-20 lg:p-8 lg:pb-28 lg:pt-8">

      <div className="mx-auto max-w-7xl">

        {/* ================================================= */}
        {/* DASHBOARD HEADER */}
        {/* ================================================= */}

        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 shadow-lg">

          <div className="p-6 text-white sm:p-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              {/* WELCOME */}

              <div>

                <p className="text-sm font-medium text-blue-100">
                  Welcome back
                </p>

                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                  {memberName}
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                  View your contributions, payment activity,
                  statements and association updates.
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* PERSONAL FINANCIAL SUMMARY */}
        {/* ================================================= */}

        <div className="mb-8">

          <div className="mb-4">

            <h2 className="text-xl font-bold text-slate-900">
              My Financial Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Overview of your contribution account.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* MEMBER */}

            <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Member
                  </p>

                  <p className="mt-2 text-xl font-bold text-slate-900">
                    {memberName}
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-700">
                  👤
                </div>

              </div>

              <p className="mt-4 text-xs text-slate-400">
                Your registered association profile
              </p>

            </div>

            {/* TOTAL CONTRIBUTIONS */}

            <div className="group rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    My Total Contributions
                  </p>

                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    {formatCurrency(
                      summary.totalPaid
                    )}
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  💰
                </div>

              </div>

              <p className="mt-4 text-xs text-slate-400">
                Total amount you have paid
              </p>

            </div>

            {/* OUTSTANDING */}

            <div className="group rounded-2xl border border-red-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                    Outstanding Balance
                  </p>

                  <p className="mt-2 text-2xl font-bold text-red-600">
                    {formatCurrency(
                      summary.outstanding
                    )}
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl">
                  ⚠️
                </div>

              </div>

              <p className="mt-4 text-xs text-slate-400">
                Remaining contribution balance
              </p>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* ASSOCIATION FINANCIAL OVERVIEW */}
        {/* ================================================= */}

        <div className="mb-8">

          <div className="mb-4">

            <h2 className="text-xl font-bold text-slate-900">
              Association Financial Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Overall financial summary of Ya Isa Zama Association.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* TOTAL CONTRIBUTIONS */}

            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm transition hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    Total Contributions
                  </p>

                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    {formatCurrency(
                      financials.totalContributions
                    )}
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  📈
                </div>

              </div>

              <p className="mt-4 text-xs text-slate-400">
                Total contributions received
              </p>

            </div>

            {/* EXPENSES */}

            <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm transition hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                    Total Expenses
                  </p>

                  <p className="mt-2 text-2xl font-bold text-red-600">
                    {formatCurrency(
                      financials.totalExpenses
                    )}
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-xl">
                  💸
                </div>

              </div>

              <p className="mt-4 text-xs text-slate-400">
                Total recorded association expenses
              </p>

            </div>

            {/* BALANCE */}

            <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm transition hover:shadow-md">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    Association Balance
                  </p>

                  <p
                    className={`mt-2 text-2xl font-bold ${
                      Number(
                        financials.balance || 0
                      ) >= 0
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(
                      financials.balance
                    )}
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                  💼
                </div>

              </div>

              <p className="mt-4 text-xs text-slate-400">
                Contributions minus expenses
              </p>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* RECENT PAYMENTS + ANNOUNCEMENTS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ================================================= */}
          {/* RECENT PAYMENTS */}
          {/* ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Recent Payments
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your latest contribution activity.
                </p>

              </div>

              <Link
                to="/member/payment-history"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>

            </div>

            <div className="p-6">

              {recentPayments.length > 0 ? (

                <div className="space-y-4">

                  {recentPayments
                    .slice(0, 5)
                    .map((payment) => (

                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
                      >

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                            ₦
                          </div>

                          <div>

                            <p className="font-semibold text-slate-900">
                              Month{" "}
                              {payment.monthNumber}{" "}
                              {payment.year}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {payment.status}
                            </p>

                          </div>

                        </div>

                        <p className="font-bold text-emerald-600">
                          {formatCurrency(
                            payment.amount
                          )}
                        </p>

                      </div>

                    ))}

                </div>

              ) : (

                <div className="py-10 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                    💳
                  </div>

                  <p className="mt-3 font-semibold text-slate-700">
                    No payments yet
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Your contribution activity will appear here.
                  </p>

                  <Link
                    to="/member/payments"
                    className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Make Payment
                  </Link>

                </div>

              )}

            </div>

          </div>

          {/* ================================================= */}
          {/* ANNOUNCEMENTS */}
          {/* ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Announcements
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest association updates.
                </p>

              </div>

              <Link
                to="/member/notifications"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Notifications
              </Link>

            </div>

            <div className="p-6">

              {announcements.length > 0 ? (

                <div className="space-y-4">

                  {announcements
                    .slice(0, 5)
                    .map((item) => (

                      <div
                        key={item.id}
                        className="rounded-xl border border-blue-100 bg-blue-50/50 p-4"
                      >

                        <div className="flex items-start gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                            📢
                          </div>

                          <div className="min-w-0">

                            <p className="font-semibold text-slate-900">
                              {item.title}
                            </p>

                            <p className="mt-1 text-sm leading-5 text-slate-600">
                              {item.message}
                            </p>

                          </div>

                        </div>

                      </div>

                    ))}

                </div>

              ) : (

                <div className="py-10 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                    📢
                  </div>

                  <p className="mt-3 font-semibold text-slate-700">
                    No announcements
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    New association announcements will appear here.
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

      {/* =========================================
          QUICK MAKE PAYMENT BUTTON
      ========================================= */}

      <Link
        to="/member/payments"
        className="
          fixed
          bottom-24
          right-5
          z-[90]
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-blue-600
          text-xl
          font-bold
          text-white
          shadow-lg
          transition
          hover:bg-blue-700
          hover:scale-105
          active:scale-95
          sm:bottom-6
          sm:right-6
        "
        title="Make Payment"
        aria-label="Make Payment"
      >
        ₦
      </Link>

    </div>
  );
}