import { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";

const NGN = "₦";

const formatCurrency = (amount) => {
  const value = Number(amount || 0);

  return `${NGN}${value.toLocaleString("en-NG")}`;
};

const formatDate = (date) => {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const statusStyles = {
  PAID: "bg-green-100 text-green-700",
  APPROVED: "bg-green-100 text-green-700",
  WAIVED: "bg-blue-100 text-blue-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
  PENDING: "bg-orange-100 text-orange-700",
  OVERDUE: "bg-red-100 text-red-700",
};

const StatusBadge = ({ status }) => {
  const normalized = String(status || "OVERDUE").toUpperCase();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
        statusStyles[normalized] ||
        "bg-gray-100 text-gray-700"
      }`}
    >
      {normalized}
    </span>
  );
};

const SummaryCard = ({
  title,
  value,
  subtitle,
  valueClass = "text-gray-900",
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{title}</p>

      <p
        className={`text-2xl font-bold mt-2 ${valueClass}`}
      >
        {value}
      </p>

      {subtitle && (
        <p className="text-xs text-gray-400 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};

// ============================================================
// MONTH OPTIONS
// ============================================================

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

// ============================================================
// ADMIN MANUAL CONTRIBUTION MODAL
// ============================================================

const ManualContributionModal = ({
  members,
  selectedMember,
  onClose,
  onSuccess,
}) => {
  const now = new Date();

  const [memberId, setMemberId] = useState(
    selectedMember?.member?.id
      ? String(selectedMember.member.id)
      : ""
  );

  const [monthNumber, setMonthNumber] = useState(
    selectedMember?.monthlyStatus?.[0]?.monthNumber
      ? String(
          selectedMember.monthlyStatus[0].monthNumber
        )
      : String(now.getMonth() + 1)
  );

  const [year, setYear] = useState(
    selectedMember?.monthlyStatus?.[0]?.year
      ? String(selectedMember.monthlyStatus[0].year)
      : String(now.getFullYear())
  );

  const [amount, setAmount] = useState(
    selectedMember?.monthlyContributionAmount
      ? String(
          selectedMember.monthlyContributionAmount
        )
      : ""
  );

  const [status, setStatus] = useState("PAID");

  const [paymentDate, setPaymentDate] = useState(
    now.toISOString().split("T")[0]
  );

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // FIND SELECTED MEMBER
  // ----------------------------------------------------------

  const currentMember = members.find(
    (item) =>
      String(item?.member?.id) === String(memberId)
  );

  // ----------------------------------------------------------
  // UPDATE DEFAULT AMOUNT WHEN MEMBER CHANGES
  // ----------------------------------------------------------

  useEffect(() => {
    if (currentMember?.monthlyContributionAmount) {
      setAmount(
        String(
          currentMember.monthlyContributionAmount
        )
      );
    }
  }, [memberId]);

  // ----------------------------------------------------------
  // SUBMIT
  // ----------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const parsedMemberId = Number(memberId);
    const parsedMonth = Number(monthNumber);
    const parsedYear = Number(year);
    const parsedAmount = Number(amount);

    if (!parsedMemberId) {
      setError("Please select a member.");
      return;
    }

    if (
      !Number.isInteger(parsedMonth) ||
      parsedMonth < 1 ||
      parsedMonth > 12
    ) {
      setError("Please select a valid month.");
      return;
    }

    if (
      !Number.isInteger(parsedYear) ||
      parsedYear < 2000
    ) {
      setError("Please enter a valid year.");
      return;
    }

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      setError(
        "Contribution amount must be greater than zero."
      );
      return;
    }

    if (!paymentDate) {
      setError("Please select the payment date.");
      return;
    }

    try {
      setSaving(true);

      const response = await api.post(
        "/contributions",
        {
          memberId: parsedMemberId,
          monthNumber: parsedMonth,
          year: parsedYear,
          amount: parsedAmount,
          status,
          paymentDate,
        }
      );

      if (
        response?.data?.success === false
      ) {
        throw new Error(
          response?.data?.message ||
            "Failed to record contribution."
        );
      }

      onSuccess?.();

      onClose();
    } catch (err) {
      console.error(
        "Manual contribution error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to record contribution."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        {/* HEADER */}

        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Record Contribution
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Manually record a member's contribution.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xl disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5"
        >
          {/* ERROR */}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* MEMBER */}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Member
            </label>

            <select
              value={memberId}
              onChange={(e) =>
                setMemberId(e.target.value)
              }
              disabled={
                saving ||
                Boolean(selectedMember)
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">
                Select member
              </option>

              {members.map((item) => (
                <option
                  key={item?.member?.id}
                  value={item?.member?.id}
                >
                  {item?.member?.fullName ||
                    "Unknown Member"}
                </option>
              ))}
            </select>
          </div>

          {/* MONTH + YEAR */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contribution Month
              </label>

              <select
                value={monthNumber}
                onChange={(e) =>
                  setMonthNumber(e.target.value)
                }
                disabled={saving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((month) => (
                  <option
                    key={month.value}
                    value={month.value}
                  >
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Year
              </label>

              <input
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(e) =>
                  setYear(e.target.value)
                }
                disabled={saving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* AMOUNT */}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                ₦
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                disabled={saving}
                placeholder="500"
                className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {currentMember?.monthlyContributionAmount && (
              <p className="text-xs text-gray-400 mt-1">
                Standard monthly amount:{" "}
                {formatCurrency(
                  currentMember.monthlyContributionAmount
                )}
              </p>
            )}
          </div>

          {/* STATUS */}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              disabled={saving}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PAID">
                PAID
              </option>

              <option value="PARTIAL">
                PARTIAL
              </option>

              <option value="WAIVED">
                WAIVED
              </option>
            </select>
          </div>

          {/* PAYMENT DATE */}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Date
            </label>

            <input
              type="date"
              value={paymentDate}
              onChange={(e) =>
                setPaymentDate(e.target.value)
              }
              disabled={saving}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ACTIONS */}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Record Contribution"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// CONTRIBUTIONS PAGE
// ============================================================

const Contributions = () => {
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [selectedMember, setSelectedMember] =
    useState(null);

  const [manualContributionOpen, setManualContributionOpen] =
    useState(false);

  const [manualMember, setManualMember] =
    useState(null);

  // ==========================================================
  // LOAD CONTRIBUTIONS
  // ==========================================================

  const loadContributions = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get(
        "/contributions/admin-overview"
      );

      const result =
        response?.data?.data ||
        response?.data;

      if (!result) {
        throw new Error(
          "Invalid contribution response."
        );
      }

      setData(result);
    } catch (err) {
      console.error(
        "Contribution overview error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load contributions."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadContributions();
  }, []);

  // ==========================================================
  // OPEN MANUAL CONTRIBUTION
  // ==========================================================

  const openManualContribution = (
    member = null
  ) => {
    setManualMember(member);
    setManualContributionOpen(true);
  };

  // ==========================================================
  // AFTER SUCCESSFUL CONTRIBUTION
  // ==========================================================

  const handleManualContributionSuccess =
    async () => {
      await loadContributions(true);

      setSelectedMember(null);
    };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

            <p className="text-gray-500 mt-4">
              Loading contribution records...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && !data) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-lg font-bold text-red-700">
              Unable to load contributions
            </h2>

            <p className="text-red-600 mt-2">
              {error}
            </p>

            <button
              onClick={() =>
                loadContributions(true)
              }
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================================
  // DATA
  // ==========================================================

  const summary = data?.summary || {};

  const members = data?.members || [];

  const contributionPeriod =
    data?.contributionPeriod || {};

  const financialYear =
    data?.financialYear || {};

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Monthly Contributions
            </h1>

            <p className="text-gray-500 mt-1">
              Monitor member contributions,
              outstanding payments and pending
              verification.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">

            <button
              onClick={() =>
                loadContributions(true)
              }
              disabled={refreshing}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 sm:w-auto"
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>

        {/* ====================================================
            CONTRIBUTION PERIOD
        ==================================================== */}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700">
                Contribution Collection Period
              </p>

              <h2 className="text-xl font-bold text-blue-900 mt-1">
                {contributionPeriod.startMonthLabel ||
                  "December 2024"}{" "}
                →{" "}
                {contributionPeriod.currentMonthLabel ||
                  "-"}
              </h2>

              <p className="text-sm text-blue-700 mt-1">
                {contributionPeriod.totalMonths ||
                  0}{" "}
                contribution months counted
              </p>
            </div>

            <div className="text-left lg:text-right">
              <p className="text-xs text-blue-600 uppercase tracking-wide">
                Monthly Contribution
              </p>

              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(
                  data?.monthlyAmount
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================
            FINANCIAL YEAR
        ==================================================== */}

        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-5">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-2">
            <div>
              <span className="text-xs text-gray-500">
                Financial Year
              </span>

              <p className="font-semibold text-gray-900">
                {financialYear.startYear || "-"}{" "}
                →{" "}
                {financialYear.endYear || "-"}
              </p>
            </div>

            <div>
              <span className="text-xs text-gray-500">
                Current Period
              </span>

              <p className="font-semibold text-gray-900">
                {data?.currentPeriod?.month || "-"}
              </p>
            </div>

            <div>
              <span className="text-xs text-gray-500">
                Collection Completion
              </span>

              <p className="font-semibold text-green-600">
                {summary.collectionCompletionPercentage ||
                  0}
                %
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================
            SUMMARY CARDS
        ==================================================== */}

        <div className="grid grid-cols-2 gap-3 mb-6 lg:grid-cols-5 lg:gap-4">
          <SummaryCard
            title="Active Members"
            value={
              summary.totalMembers || 0
            }
            subtitle="Currently active"
          />

          <SummaryCard
            title="Expected"
            value={formatCurrency(
              summary.expected
            )}
            subtitle="Total contribution due"
          />

          <SummaryCard
            title="Paid"
            value={formatCurrency(
              summary.paid
            )}
            subtitle={`${summary.paidMonths || 0} paid months`}
            valueClass="text-green-600"
          />

          <SummaryCard
            title="Outstanding"
            value={formatCurrency(
              summary.outstanding
            )}
            subtitle={`${summary.membersWithOutstanding || 0} members affected`}
            valueClass="text-red-600"
          />

          <SummaryCard
            title="Pending"
            value={formatCurrency(
              summary.pending
            )}
            subtitle={`${summary.membersWithPending || 0} members awaiting verification`}
            valueClass="text-orange-500"
          />
        </div>

        {/* ====================================================
            ERROR AFTER DATA
        ==================================================== */}

        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* ====================================================
            MEMBER TABLE
        ==================================================== */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-5 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Member Contribution Overview
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Each member's financial position
                  from their effective contribution
                  start date.
                </p>
              </div>


            </div>
          </div>

         {members.length === 0 ? (
  <div className="p-10 text-center">
    <p className="text-gray-500">
      No active members found.
    </p>
  </div>
) : (
  <>
    {/* ====================================================
        MOBILE MEMBER CARDS
        ==================================================== */}

    <div className="space-y-4 p-4 lg:hidden">
      {members.map((item) => {
        const member = item?.member || {};

        const monthlyAmount = Number(
          item?.monthlyContributionAmount || 0
        );

        const expected = Number(
          item?.totalExpected || 0
        );

        const paid = Number(
          item?.totalPaid || 0
        );

        const outstanding = Number(
          item?.outstandingAmount || 0
        );

        const pending = Number(
          item?.pendingAmount || 0
        );

        const progress = Math.min(
          Number(
            item?.paymentCompletionPercentage || 0
          ),
          100
        );

        return (
          <div
            key={member.id}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            {/* MEMBER HEADER */}

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-gray-900">
                  {member.fullName || "Unknown Member"}
                </h3>

                {member.phone && (
                  <p className="mt-1 text-xs text-gray-500">
                    {member.phone}
                  </p>
                )}

                <p className="mt-1 text-xs text-gray-400">
                  From{" "}
                  {item?.memberContributionStart?.month ||
                    "December 2024"}
                </p>
              </div>

              <StatusBadge
                status={
                  outstanding > 0
                    ? "OVERDUE"
                    : pending > 0
                    ? "PENDING"
                    : "PAID"
                }
              />
            </div>

            {/* MONTHLY CONTRIBUTION */}

            <div className="mt-4 rounded-xl bg-blue-50 p-3">
              <p className="text-xs font-medium text-blue-600">
                Monthly Contribution
              </p>

              <p className="mt-1 text-lg font-bold text-blue-900">
                {formatCurrency(monthlyAmount)}
              </p>
            </div>

            {/* FINANCIAL SUMMARY */}

            <div className="mt-4 grid grid-cols-2 gap-3">

              {/* EXPECTED */}

              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  Expected
                </p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  {formatCurrency(expected)}
                </p>

                <p className="mt-1 text-[11px] text-gray-400">
                  {item?.totalDueMonths || 0} months
                </p>
              </div>

              {/* PAID */}

              <div className="rounded-xl bg-green-50 p-3">
                <p className="text-xs text-green-600">
                  Paid
                </p>

                <p className="mt-1 text-sm font-bold text-green-700">
                  {formatCurrency(paid)}
                </p>

                <p className="mt-1 text-[11px] text-green-600">
                  {item?.paidMonths || 0} paid months
                </p>
              </div>

              {/* OUTSTANDING */}

              <div className="rounded-xl bg-red-50 p-3">
                <p className="text-xs text-red-600">
                  Outstanding
                </p>

                <p
                  className={`mt-1 text-sm font-bold ${
                    outstanding > 0
                      ? "text-red-700"
                      : "text-green-700"
                  }`}
                >
                  {formatCurrency(outstanding)}
                </p>

                <p className="mt-1 text-[11px] text-gray-500">
                  {item?.outstandingMonths?.length || 0}{" "}
                  outstanding months
                </p>
              </div>

              {/* PENDING */}

              <div className="rounded-xl bg-orange-50 p-3">
                <p className="text-xs text-orange-600">
                  Pending
                </p>

                <p
                  className={`mt-1 text-sm font-bold ${
                    pending > 0
                      ? "text-orange-600"
                      : "text-gray-700"
                  }`}
                >
                  {formatCurrency(pending)}
                </p>

                <p className="mt-1 text-[11px] text-gray-500">
                  {item?.pendingRequests || 0} request
                  {item?.pendingRequests === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            {/* PAYMENT PROGRESS */}

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">
                  Payment Progress
                </span>

                <span className="text-xs font-bold text-gray-700">
                  {progress}%
                </span>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}

            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">

              <button
                type="button"
                onClick={() =>
                  setSelectedMember(item)
                }
                className="min-h-[44px] w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:bg-slate-700"
              >
                View Details
              </button>

            </div>
          </div>
        );
      })}
    </div>

    {/* ====================================================
        DESKTOP MEMBER TABLE
        ==================================================== */}

    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
              Member
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
              Monthly
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
              Expected
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
              Paid
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
              Outstanding
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
              Pending
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
              Progress
            </th>

            <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {members.map((item) => {
            const member = item?.member || {};

            return (
              <tr
                key={member.id}
                className="hover:bg-gray-50"
              >
                {/* MEMBER */}

                <td className="px-5 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {member.fullName ||
                        "Unknown Member"}
                    </p>

                    {member.phone && (
                      <p className="mt-1 text-xs text-gray-400">
                        {member.phone}
                      </p>
                    )}

                    <p className="text-xs text-gray-400">
                      From{" "}
                      {item?.memberContributionStart?.month ||
                        "December 2024"}
                    </p>
                  </div>
                </td>

                {/* MONTHLY */}

                <td className="px-5 py-4 text-sm font-medium">
                  {formatCurrency(
                    item?.monthlyContributionAmount
                  )}
                </td>

                {/* EXPECTED */}

                <td className="px-5 py-4">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(
                      item?.totalExpected
                    )}
                  </p>

                  <p className="text-xs text-gray-400">
                    {item?.totalDueMonths || 0} months
                  </p>
                </td>

                {/* PAID */}

                <td className="px-5 py-4">
                  <p className="font-semibold text-green-600">
                    {formatCurrency(
                      item?.totalPaid
                    )}
                  </p>

                  <p className="text-xs text-gray-400">
                    {item?.paidMonths || 0} paid months
                  </p>
                </td>

                {/* OUTSTANDING */}

                <td className="px-5 py-4">
                  <p
                    className={`font-semibold ${
                      Number(
                        item?.outstandingAmount
                      ) > 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatCurrency(
                      item?.outstandingAmount
                    )}
                  </p>

                  <p className="text-xs text-gray-400">
                    {item?.outstandingMonths?.length ||
                      0}{" "}
                    outstanding months
                  </p>
                </td>

                {/* PENDING */}

                <td className="px-5 py-4">
                  <p
                    className={`font-semibold ${
                      Number(item?.pendingAmount) > 0
                        ? "text-orange-500"
                        : "text-gray-700"
                    }`}
                  >
                    {formatCurrency(
                      item?.pendingAmount
                    )}
                  </p>

                  <p className="text-xs text-gray-400">
                    {item?.pendingRequests || 0} request
                    {item?.pendingRequests === 1
                      ? ""
                      : "s"}
                  </p>
                </td>

                {/* PROGRESS */}

                <td className="min-w-[140px] px-5 py-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Progress
                    </span>

                    <span className="text-xs font-semibold text-gray-700">
                      {item?.paymentCompletionPercentage ||
                        0}
                      %
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{
                        width: `${Math.min(
                          Number(
                            item?.paymentCompletionPercentage ||
                              0
                          ),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </td>

                {/* ACTION */}

                <td className="px-5 py-4">
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openManualContribution(item)
                      }
                      className="whitespace-nowrap rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      + Record Payment
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedMember(item)
                      }
                      className="whitespace-nowrap rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </>
)}
        </div>

        {/* ====================================================
            MEMBER DETAIL MODAL
        ==================================================== */}

        {selectedMember && (
          <MemberDetailsModal
            item={selectedMember}
            onClose={() =>
              setSelectedMember(null)
            }
            onRecordContribution={() => {
              openManualContribution(
                selectedMember
              );
            }}
          />
        )}

        {/* ====================================================
            MANUAL CONTRIBUTION MODAL
        ==================================================== */}

        {manualContributionOpen && (
          <ManualContributionModal
            members={members}
            selectedMember={manualMember}
            onClose={() => {
              setManualContributionOpen(false);
              setManualMember(null);
            }}
            onSuccess={
              handleManualContributionSuccess
            }
          />
        )}
      </div>

      {/* ====================================================
    FLOATING RECORD CONTRIBUTION BUTTON
    ==================================================== */}

<button
  type="button"
  onClick={() => openManualContribution()}
  aria-label="Record contribution"
  title="Record contribution"
  className="
    fixed
    bottom-5
    right-5
    z-40
    flex
    h-14
    w-14
    items-center
    justify-center
    rounded-full
    bg-green-600
    text-3xl
    font-light
    text-white
    shadow-xl
    ring-4
    ring-white
    transition-all
    duration-200
    hover:scale-105
    hover:bg-green-700
    active:scale-95
    sm:bottom-6
    sm:right-6
  "
>
  +
</button>
    </DashboardLayout>
  );
};

// ============================================================
// MEMBER DETAILS MODAL
// ============================================================

const MemberDetailsModal = ({
  item,
  onClose,
  onRecordContribution,
}) => {
  const member = item?.member || {};

  const monthlyStatus =
    item?.monthlyStatus || [];

  const outstandingMonths =
    item?.outstandingMonths || [];

  const pendingMonths =
    item?.pendingMonths || [];

  const contributionHistory =
    item?.contributionHistory || [];

  const pendingVerification =
    item?.pendingVerification || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* ==================================================
            MODAL HEADER
        ================================================== */}

        <div className="px-6 py-5 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {member.fullName}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Contribution financial statement
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRecordContribution}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              + Record Contribution
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* ==================================================
            MODAL CONTENT
        ================================================== */}

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {/* MEMBER INFORMATION */}

          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">
                Monthly Contribution
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {formatCurrency(
                  item.monthlyContributionAmount
                )}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">
                Contribution Start
              </p>

              <p className="font-bold text-gray-900 mt-1">
                {item
                  .memberContributionStart
                  ?.month || "-"}
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-600">
                Total Paid
              </p>

              <p className="font-bold text-green-700 mt-1">
                {formatCurrency(
                  item.totalPaid
                )}
              </p>
            </div>

            <div className="bg-red-50 rounded-xl p-4">
              <p className="text-xs text-red-600">
                Outstanding
              </p>

              <p className="font-bold text-red-700 mt-1">
                {formatCurrency(
                  item.outstandingAmount
                )}
              </p>
            </div>
          </div>

          {/* =================================================
              MONTHLY STATUS
          ================================================= */}

          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Monthly Contribution Status
                </h3>

                <p className="text-sm text-gray-500">
                  Every month the member was
                  expected to contribute.
                </p>
              </div>
            </div>

            {monthlyStatus.length === 0 ? (
              <div className="border rounded-xl p-5 text-gray-500">
                No contribution months found.
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden">

  {/* ==================================================
      MOBILE MONTHLY STATUS
      ================================================== */}

  <div className="lg:hidden divide-y divide-gray-100">

    {monthlyStatus.map((month) => (
      <div
        key={`${month.year}-${month.monthNumber}`}
        className="p-4"
      >

        {/* MONTH + STATUS */}

        <div className="flex items-start justify-between gap-3 mb-4">

          <div>
            <p className="font-bold text-gray-900">
              {month.month}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Contribution period
            </p>
          </div>

          <StatusBadge status={month.status} />

        </div>

        {/* FINANCIAL DETAILS */}

        <div className="grid grid-cols-2 gap-3">

          {/* EXPECTED */}

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              Expected
            </p>

            <p className="mt-1 text-sm font-bold text-gray-900">
              {formatCurrency(
                month.expectedAmount
              )}
            </p>
          </div>

          {/* PAID */}

          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-xs text-green-600">
              Paid
            </p>

            <p className="mt-1 text-sm font-bold text-green-700">
              {formatCurrency(
                month.paidAmount
              )}
            </p>
          </div>

          {/* PENDING */}

          <div className="rounded-lg bg-orange-50 p-3">
            <p className="text-xs text-orange-600">
              Pending
            </p>

            <p className="mt-1 text-sm font-bold text-orange-600">
              {formatCurrency(
                month.pendingAmount
              )}
            </p>
          </div>

          {/* OUTSTANDING */}

          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-xs text-red-600">
              Outstanding
            </p>

            <p className="mt-1 text-sm font-bold text-red-700">
              {formatCurrency(
                month.outstandingAmount
              )}
            </p>
          </div>

        </div>

      </div>
    ))}

  </div>

  {/* ==================================================
      DESKTOP MONTHLY STATUS
      ================================================== */}

  <div className="hidden lg:block overflow-x-auto">

    <table className="min-w-full">

      <thead className="bg-gray-50">

        <tr>

          <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
            Month
          </th>

          <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
            Expected
          </th>

          <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
            Paid
          </th>

          <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
            Pending
          </th>

          <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
            Outstanding
          </th>

          <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
            Status
          </th>

        </tr>

      </thead>

      <tbody className="divide-y">

        {monthlyStatus.map((month) => (

          <tr
            key={`${month.year}-${month.monthNumber}`}
            className="hover:bg-gray-50"
          >

            <td className="px-4 py-3 text-sm font-medium">
              {month.month}
            </td>

            <td className="px-4 py-3 text-sm">
              {formatCurrency(
                month.expectedAmount
              )}
            </td>

            <td className="px-4 py-3 text-sm font-medium text-green-600">
              {formatCurrency(
                month.paidAmount
              )}
            </td>

            <td className="px-4 py-3 text-sm font-medium text-orange-500">
              {formatCurrency(
                month.pendingAmount
              )}
            </td>

            <td className="px-4 py-3 text-sm font-medium text-red-600">
              {formatCurrency(
                month.outstandingAmount
              )}
            </td>

            <td className="px-4 py-3">
              <StatusBadge status={month.status} />
            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>

</div>
)}
          </section>

          {/* =================================================
    OUTSTANDING MONTHS
================================================= */}

<section className="mb-8">

  <h3 className="text-lg font-bold text-gray-900 mb-3">
    Outstanding Payments
  </h3>

  {outstandingMonths.length === 0 ? (

    <div className="bg-green-50 border border-green-200 rounded-xl p-5">
      <p className="font-semibold text-green-700">
        No outstanding contribution balance.
      </p>
    </div>

  ) :
  (
    <div className="border border-red-200 rounded-xl overflow-hidden">

      {/* ==================================================
          MOBILE OUTSTANDING CARDS
      ================================================== */}

      <div className="lg:hidden divide-y divide-red-100">

        {outstandingMonths.map((month) => (

          <div
            key={`${month.year}-${month.monthNumber}`}
            className="p-4"
          >

            {/* MONTH */}

            <div className="flex items-center justify-between gap-3 mb-4">

              <div>
                <p className="font-bold text-gray-900">
                  {month.month}
                </p>

                <p className="text-xs text-red-500 mt-1">
                  Outstanding contribution
                </p>
              </div>

              <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                OUTSTANDING
              </span>

            </div>

            {/* FINANCIAL DETAILS */}

            <div className="grid grid-cols-2 gap-3">

              {/* EXPECTED */}

              <div className="rounded-lg bg-gray-50 p-3">

                <p className="text-xs text-gray-500">
                  Expected
                </p>

                <p className="mt-1 text-sm font-bold text-gray-900">
                  {formatCurrency(
                    item.monthlyContributionAmount
                  )}
                </p>

              </div>

              {/* PAID */}

              <div className="rounded-lg bg-green-50 p-3">

                <p className="text-xs text-green-600">
                  Paid
                </p>

                <p className="mt-1 text-sm font-bold text-green-700">
                  {formatCurrency(
                    month.paidAmount
                  )}
                </p>

              </div>

              {/* PENDING */}

              <div className="rounded-lg bg-orange-50 p-3">

                <p className="text-xs text-orange-600">
                  Pending
                </p>

                <p className="mt-1 text-sm font-bold text-orange-600">
                  {formatCurrency(
                    month.pendingAmount
                  )}
                </p>

              </div>

              {/* BALANCE */}

              <div className="rounded-lg bg-red-50 p-3">

                <p className="text-xs text-red-600">
                  Balance
                </p>

                <p className="mt-1 text-sm font-bold text-red-700">
                  {formatCurrency(
                    month.amount
                  )}
                </p>

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* ==================================================
          DESKTOP OUTSTANDING TABLE
      ================================================== */}

      <div className="hidden lg:block overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-red-50">

            <tr>

              <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
                Month
              </th>

              <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
                Expected
              </th>

              <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
                Paid
              </th>

              <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
                Pending
              </th>

              <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
                Balance
              </th>

            </tr>

          </thead>

          <tbody className="divide-y">

            {outstandingMonths.map((month) => (

              <tr
                key={`${month.year}-${month.monthNumber}`}
                className="hover:bg-red-50/40"
              >

                <td className="px-4 py-3 text-sm font-medium">
                  {month.month}
                </td>

                <td className="px-4 py-3 text-sm">
                  {formatCurrency(
                    item.monthlyContributionAmount
                  )}
                </td>

                <td className="px-4 py-3 text-sm text-green-600">
                  {formatCurrency(
                    month.paidAmount
                  )}
                </td>

                <td className="px-4 py-3 text-sm text-orange-500">
                  {formatCurrency(
                    month.pendingAmount
                  )}
                </td>

                <td className="px-4 py-3 text-sm font-bold text-red-600">
                  {formatCurrency(
                    month.amount
                  )}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )}

</section>

          {/* =================================================
              PENDING MONTHS
          ================================================= */}

          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Pending Verification
            </h3>

            {pendingMonths.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-5 text-gray-500">
                No pending contribution
                months.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pendingMonths.map(
                  (month) => (
                    <div
                      key={`${month.year}-${month.monthNumber}`}
                      className="border border-orange-200 bg-orange-50 rounded-xl p-4"
                    >
                      <p className="font-semibold text-gray-900">
                        {month.month}
                      </p>

                      <p className="text-orange-600 font-bold mt-1">
                        {formatCurrency(
                          month.amount
                        )}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        Awaiting verification
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </section>

          {/* =================================================
    CONTRIBUTION HISTORY
================================================= */}

<section className="mb-8">
  <h3 className="text-lg font-bold text-gray-900 mb-3">
    Contribution History
  </h3>

  {contributionHistory.length === 0 ? (
    <div className="bg-gray-50 rounded-xl p-5 text-gray-500">
      No contribution history.
    </div>
  ) : (
    <>
      {/* =================================================
          MOBILE CONTRIBUTION HISTORY
      ================================================= */}

      <div className="space-y-3 lg:hidden">
        {contributionHistory.map((contribution, index) => (
          <div
            key={
              contribution?.id ||
              `${contribution?.year}-${contribution?.monthNumber}-${index}`
            }
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            {/* HEADER */}

            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="font-bold text-gray-900">
                  {contribution?.month ||
                    `${contribution?.monthNumber || ""}/${contribution?.year || ""}`}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Contribution payment
                </p>
              </div>

              <StatusBadge
                status={contribution?.status}
              />
            </div>

            {/* DETAILS */}

            <div className="grid grid-cols-2 gap-3">

              {/* AMOUNT */}

              <div className="rounded-lg bg-green-50 p-3">
                <p className="text-xs text-green-600">
                  Amount
                </p>

                <p className="mt-1 text-sm font-bold text-green-700">
                  {formatCurrency(
                    contribution?.amount
                  )}
                </p>
              </div>

              {/* PAYMENT DATE */}

              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  Payment Date
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {contribution?.paymentDate
                    ? new Date(
                        contribution.paymentDate
                      ).toLocaleDateString()
                    : "-"}
                </p>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* =================================================
          DESKTOP CONTRIBUTION HISTORY
      ================================================= */}

      <div className="hidden lg:block border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
                  Month
                </th>

                <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
                  Amount
                </th>

                <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
                  Status
                </th>

                <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
                  Payment Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {contributionHistory.map(
                (contribution, index) => (
                  <tr
                    key={
                      contribution?.id ||
                      `${contribution?.year}-${contribution?.monthNumber}-${index}`
                    }
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {contribution?.month ||
                        `${contribution?.monthNumber || ""}/${contribution?.year || ""}`}
                    </td>

                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                      {formatCurrency(
                        contribution?.amount
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        status={contribution?.status}
                      />
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {contribution?.paymentDate
                        ? new Date(
                            contribution.paymentDate
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )}
</section>

{/* =================================================
    PENDING VERIFICATION REQUESTS
================================================= */}

<section className="mb-8">

  <h3 className="text-lg font-bold text-gray-900 mb-3">
    Payment Verification Requests
  </h3>

  {pendingVerification.length === 0 ? (

    <div className="bg-gray-50 rounded-xl p-5 text-gray-500">
      No pending verification requests.
    </div>

  ) : (

    <div className="space-y-3">

      {pendingVerification.map((request) => (

        <div
          key={request.id}
          className="rounded-xl border border-orange-200 bg-orange-50 p-4 shadow-sm"
        >

          {/* =================================================
              REQUEST HEADER
          ================================================= */}

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <p className="text-base font-bold text-gray-900">
                {formatCurrency(request.amount)}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Submitted{" "}
                {formatDate(request.createdAt)}
              </p>

            </div>

            <div className="shrink-0">
              <StatusBadge status="PENDING" />
            </div>

          </div>

          {/* =================================================
              TRANSACTION REFERENCE
          ================================================= */}

          {request.transactionReference && (
            <div className="mt-3 rounded-lg bg-white border border-orange-100 p-3">

              <p className="text-xs font-medium text-gray-500">
                Transaction Reference
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900 break-all">
                {request.transactionReference}
              </p>

            </div>
          )}

          {/* =================================================
              CONTRIBUTION MONTHS
          ================================================= */}

          {request.months?.length > 0 && (

            <div className="mt-4">

              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange-700">
                Contribution Months
              </p>

              <div className="space-y-2">

                {request.months.map((month) => (

                  <div
                    key={month.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-white border border-orange-100 px-3 py-2.5"
                  >

                    <p className="min-w-0 text-sm font-medium text-gray-800">
                      {month.month}
                    </p>

                    <p className="shrink-0 text-sm font-bold text-orange-600">
                      {formatCurrency(month.amount)}
                    </p>

                  </div>

                ))}

              </div>

            </div>

          )}

        </div>

      ))}

    </div>

  )}

</section>
        </div>
      </div>
    </div>
  );
};

export default Contributions;