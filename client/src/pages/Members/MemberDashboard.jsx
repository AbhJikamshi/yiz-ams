import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import memberApi from "../../services/memberApi";
import MemberLayout from "../../components/layout/MemberLayout";

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

      const response = await memberApi.get("/member/dashboard");

      console.log("Dashboard Response:", response.data);

      setDashboard(response.data?.data || null);
    } catch (err) {
      console.error("Dashboard Error:", err);
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
      <MemberLayout memberName="Member">
        <div className="mx-auto w-full max-w-7xl">
          <div className="animate-pulse space-y-6">
            {/* Welcome Header */}
            <div className="h-48 rounded-3xl bg-slate-200 dark:bg-slate-800" />

            {/* Personal Summary */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-40 rounded-2xl bg-white shadow-sm dark:bg-slate-800"
                />
              ))}
            </div>

            {/* Section Heading */}
            <div className="h-8 w-72 rounded bg-slate-200 dark:bg-slate-800" />

            {/* Association Overview */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-40 rounded-2xl bg-white shadow-sm dark:bg-slate-800"
                />
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="h-96 rounded-2xl bg-white shadow-sm dark:bg-slate-800" />

              <div className="h-96 rounded-2xl bg-white shadow-sm dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </MemberLayout>
    );
  }

  // ======================================================
  // DASHBOARD DATA
  // ======================================================

  const financials = dashboard?.associationFinancials || {};

  const memberName = dashboard?.member?.fullName || "Member";

  const summary = dashboard?.summary || {};

  const recentPayments = dashboard?.recentPayments || [];

  const announcements = dashboard?.announcements || [];

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <MemberLayout memberName={memberName}>
      <div className="mx-auto w-full max-w-7xl space-y-7">
        {/* ======================================================
            WELCOME HEADER
        ====================================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0077B6] via-[#0096C7] to-[#023E8A] shadow-lg">
          {/* Decorative circles */}

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#00B4D8]/20 blur-3xl" />

          <div className="relative p-6 text-white sm:p-8 lg:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-cyan-100">
                  Member Dashboard
                </p>

                <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Welcome back, {memberName}
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50 sm:text-base">
                  View your contributions, payment activity, financial
                  information and association updates.
                </p>
              </div>

              <div className="hidden h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-4xl backdrop-blur sm:flex">
                👤
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            MY FINANCIAL SUMMARY
        ====================================================== */}

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              My Financial Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Overview of your contribution account.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* MEMBER */}

            <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Member
                  </p>

                  <p className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
                    {memberName}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-xl dark:bg-sky-950/40">
                  <span className="text-sky-600 dark:text-cyan-300">👤</span>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                Your registered association profile
              </p>
            </div>

            {/* TOTAL CONTRIBUTIONS */}

            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-900/50 dark:bg-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                    My Total Contributions
                  </p>

                  <p className="mt-3 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(summary.totalPaid)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl dark:bg-emerald-950/40">
                  💰
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                Total amount you have paid
              </p>
            </div>

            {/* OUTSTANDING */}

            <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-rose-900/50 dark:bg-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
                    Outstanding Balance
                  </p>

                  <p className="mt-3 text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                    {formatCurrency(summary.outstanding)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-xl dark:bg-rose-950/40">
                  ⚠
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                Remaining contribution balance
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================
            ASSOCIATION FINANCIAL OVERVIEW
        ====================================================== */}

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Association Financial Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Overall financial summary of Ya Isa Zama Association.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* CONTRIBUTIONS */}

            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-900/50 dark:bg-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                    Total Contributions
                  </p>

                  <p className="mt-3 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(financials.totalContributions)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl dark:bg-emerald-950/40">
                  📈
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                Total contributions received
              </p>
            </div>

            {/* EXPENSES */}

            <div className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-rose-900/50 dark:bg-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">
                    Total Expenses
                  </p>

                  <p className="mt-3 text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                    {formatCurrency(financials.totalExpenses)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-xl dark:bg-rose-950/40">
                  💸
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                Total recorded association expenses
              </p>
            </div>

            {/* BALANCE */}

            <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-sky-900/50 dark:bg-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#0077B6] dark:text-[#00B4D8]">
                    Association Balance
                  </p>

                  <p
                    className={`mt-3 text-2xl font-extrabold ${
                      Number(financials.balance || 0) >= 0
                        ? "text-[#0077B6] dark:text-[#00B4D8]"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {formatCurrency(financials.balance)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-xl dark:bg-sky-950/40">
                  💼
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                Contributions minus expenses
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================
            RECENT PAYMENTS + ANNOUNCEMENTS
        ====================================================== */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* ====================================================
              RECENT PAYMENTS
          ==================================================== */}

          <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    ₦
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Recent Payments
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Your latest contribution activity.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/member/payment-history"
                className="font-semibold text-[#0077B6] transition hover:text-[#023E8A] dark:text-[#00B4D8] dark:hover:text-[#90E0EF]"
              >
                View all →
              </Link>
            </div>

            <div className="p-5 sm:p-6">
              {recentPayments.length > 0 ? (
                <div className="space-y-3">
                  {recentPayments.slice(0, 5).map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:bg-sky-50/60 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-700/60"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          ₦
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900 dark:text-white">
                            Month {payment.monthNumber} {payment.year}
                          </p>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {payment.status}
                          </p>
                        </div>
                      </div>

                      <p className="shrink-0 font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl dark:bg-slate-700">
                    💳
                  </div>

                  <p className="mt-3 font-semibold text-slate-700 dark:text-slate-200">
                    No payments yet
                  </p>

                  <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                    Your contribution activity will appear here.
                  </p>

                  <Link
                    to="/member/payments"
                    className="mt-4 inline-flex rounded-xl bg-[#0077B6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#023E8A]"
                  >
                    Make Payment
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* ====================================================
              ANNOUNCEMENTS
          ==================================================== */}

          <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-cyan-300">
                    📢
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Announcements
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Latest association updates.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/member/notifications"
                className="font-semibold text-[#0077B6] transition hover:text-[#023E8A] dark:text-[#00B4D8] dark:hover:text-[#90E0EF]"
              >
                Notifications
              </Link>
            </div>

            <div className="p-5 sm:p-6">
              {announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-sky-100 bg-sky-50/60 p-4 transition hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-700/60"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-cyan-300">
                          📢
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {item.title}
                          </p>

                          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {item.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl dark:bg-slate-700">
                    📢
                  </div>

                  <p className="mt-3 font-semibold text-slate-700 dark:text-slate-200">
                    No announcements
                  </p>

                  <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
                    New association announcements will appear here.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* ======================================================
          FLOATING MAKE PAYMENT
      ====================================================== */}

      <Link
        to="/member/payments"
        title="Make Payment"
        aria-label="Make Payment"
        className="
    fixed
    bottom-24
    right-5
    z-[90]
    flex
    h-14
    w-14
    items-center
    justify-center
    rounded-2xl
    bg-[#14532D]
    text-xl
    font-extrabold
    text-white
    dark:text-slate-100
    shadow-xl
    ring-4
    ring-white
    transition-all
    duration-200
    hover:scale-105
    hover:bg-[#023E8A]
    hover:shadow-2xl
    active:scale-95
    dark:ring-slate-950
    sm:bottom-6
    sm:right-6
  "
      >
        ₦
      </Link>
    </MemberLayout>
  );
}
