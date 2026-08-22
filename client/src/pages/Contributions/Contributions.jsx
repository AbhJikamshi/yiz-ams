import { useEffect, useState } from "react";
import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";

const NGN = "\u20A6";

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

const PaymentIcon = ({ size = "sm" }) => {
  const sizeClasses =
    size === "lg"
      ? "h-10 w-10 text-xl"
      : "h-8 w-8 text-base";

  return (
    <span
      className={`${sizeClasses} inline-flex items-center justify-center rounded-lg bg-red-600 font-extrabold text-white shadow-sm`}
      aria-hidden="true"
      style={{
        fontFamily:
          '"Segoe UI Symbol", "Noto Sans Symbols", "Arial Unicode MS", Arial, sans-serif',
      }}
    >
      ₦
    </span>
  );
};

const statusStyles = {
  PAID: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  APPROVED:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  WAIVED:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  PARTIAL:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  PENDING:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  OVERDUE:
    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const StatusBadge = ({ status }) => {
  const normalized = String(status || "OVERDUE").toUpperCase();

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        statusStyles[normalized] ||
        "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
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
  valueClass = "text-gray-900 dark:text-white",
}) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors dark:border-gray-700 dark:bg-gray-800">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {title}
      </p>

      <p className={`mt-2 text-2xl font-bold ${valueClass}`}>
        {value}
      </p>

      {subtitle && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  );
};

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

/* ============================================================
   ADMIN MANUAL CONTRIBUTION MODAL
============================================================ */

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
      ? String(selectedMember.monthlyStatus[0].monthNumber)
      : String(now.getMonth() + 1)
  );

  const [year, setYear] = useState(
    selectedMember?.monthlyStatus?.[0]?.year
      ? String(selectedMember.monthlyStatus[0].year)
      : String(now.getFullYear())
  );

  const [amount, setAmount] = useState(
    selectedMember?.monthlyContributionAmount
      ? String(selectedMember.monthlyContributionAmount)
      : ""
  );

  const [status, setStatus] = useState("PAID");

  const [paymentDate, setPaymentDate] = useState(
    now.toISOString().split("T")[0]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const currentMember = members.find(
    (item) =>
      String(item?.member?.id) === String(memberId)
  );

  useEffect(() => {
    if (currentMember?.monthlyContributionAmount) {
      setAmount(
        String(currentMember.monthlyContributionAmount)
      );
    }
  }, [memberId, currentMember]);

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

      const response = await api.post("/contributions", {
        memberId: parsedMemberId,
        monthNumber: parsedMonth,
        year: parsedYear,
        amount: parsedAmount,
        status,
        paymentDate,
      });

      if (response?.data?.success === false) {
        throw new Error(
          response?.data?.message ||
            "Failed to record contribution."
        );
      }

      await onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Manual contribution error:", err);

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
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Record Contribution
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manually record a member's contribution.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-9 w-9 rounded-lg bg-gray-100 text-xl text-gray-600 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Member
            </label>

            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              disabled={saving || Boolean(selectedMember)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-700"
            >
              <option value="">Select member</option>

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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Contribution Month
              </label>

              <select
                value={monthNumber}
                onChange={(e) =>
                  setMonthNumber(e.target.value)
                }
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Year
              </label>

              <input
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={saving}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Amount
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-gray-500 dark:text-gray-400">
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
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-8 pr-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {currentMember?.monthlyContributionAmount && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Standard monthly amount:{" "}
                {formatCurrency(
                  currentMember.monthlyContributionAmount
                )}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="PAID">PAID</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="WAIVED">WAIVED</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Payment Date
            </label>

            <input
              type="date"
              value={paymentDate}
              onChange={(e) =>
                setPaymentDate(e.target.value)
              }
              disabled={saving}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
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

/* ============================================================
   MEMBER DETAILS MODAL
============================================================ */

const MemberDetailsModal = ({
  item,
  onClose,
  onRecordContribution,
}) => {
  const member = item?.member || {};
  const monthlyStatus = item?.monthlyStatus || [];
  const outstandingMonths =
    item?.outstandingMonths || [];
  const pendingMonths = item?.pendingMonths || [];
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
      <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {member.fullName}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Contribution financial statement
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRecordContribution}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              <PaymentIcon />
              <span className="hidden sm:inline">
                Record Contribution
              </span>
            </button>

            <button
              onClick={onClose}
              className="h-9 w-9 rounded-lg bg-gray-100 text-xl text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
          {/* MEMBER SUMMARY */}

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/60">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Monthly Contribution
              </p>

              <p className="mt-1 font-bold text-gray-900 dark:text-white">
                {formatCurrency(
                  item?.monthlyContributionAmount
                )}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-700/60">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Contribution Start
              </p>

              <p className="mt-1 font-bold text-gray-900 dark:text-white">
                {item?.memberContributionStart?.month ||
                  "-"}
              </p>
            </div>

            <div className="rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
              <p className="text-xs text-green-600 dark:text-green-400">
                Total Paid
              </p>

              <p className="mt-1 font-bold text-green-700 dark:text-green-300">
                {formatCurrency(item?.totalPaid)}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-xs text-red-600 dark:text-red-400">
                Outstanding
              </p>

              <p className="mt-1 font-bold text-red-700 dark:text-red-300">
                {formatCurrency(
                  item?.outstandingAmount
                )}
              </p>
            </div>
          </div>

          {/* MONTHLY STATUS */}

          <section className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Monthly Contribution Status
            </h3>

            <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
              Every month the member was expected to
              contribute.
            </p>

            {monthlyStatus.length === 0 ? (
              <div className="rounded-xl border border-gray-200 p-5 text-gray-500 dark:border-gray-700 dark:text-gray-400">
                No contribution months found.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="divide-y divide-gray-100 dark:divide-gray-700 lg:hidden">
                  {monthlyStatus.map((month) => (
                    <div
                      key={`${month.year}-${month.monthNumber}`}
                      className="p-4"
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {month.month}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            Contribution period
                          </p>
                        </div>

                        <StatusBadge
                          status={month.status}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <DetailBox
                          title="Expected"
                          value={formatCurrency(
                            month.expectedAmount
                          )}
                        />

                        <DetailBox
                          title="Paid"
                          value={formatCurrency(
                            month.paidAmount
                          )}
                          className="bg-green-50 dark:bg-green-900/20"
                          titleClass="text-green-600 dark:text-green-400"
                          valueClass="text-green-700 dark:text-green-300"
                        />

                        <DetailBox
                          title="Pending"
                          value={formatCurrency(
                            month.pendingAmount
                          )}
                          className="bg-orange-50 dark:bg-orange-900/20"
                          titleClass="text-orange-600 dark:text-orange-400"
                          valueClass="text-orange-700 dark:text-orange-300"
                        />

                        <DetailBox
                          title="Outstanding"
                          value={formatCurrency(
                            month.outstandingAmount
                          )}
                          className="bg-red-50 dark:bg-red-900/20"
                          titleClass="text-red-600 dark:text-red-400"
                          valueClass="text-red-700 dark:text-red-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden overflow-x-auto lg:block">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {[
                          "Month",
                          "Expected",
                          "Paid",
                          "Pending",
                          "Outstanding",
                          "Status",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-4 py-3 text-left text-xs uppercase text-gray-500 dark:text-gray-300"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {monthlyStatus.map((month) => (
                        <tr
                          key={`${month.year}-${month.monthNumber}`}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {month.month}
                          </td>

                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {formatCurrency(
                              month.expectedAmount
                            )}
                          </td>

                          <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(
                              month.paidAmount
                            )}
                          </td>

                          <td className="px-4 py-3 text-sm font-medium text-orange-500">
                            {formatCurrency(
                              month.pendingAmount
                            )}
                          </td>

                          <td className="px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
                            {formatCurrency(
                              month.outstandingAmount
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <StatusBadge
                              status={month.status}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* OUTSTANDING */}

          <section className="mb-8">
            <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
              Outstanding Payments
            </h3>

            {outstandingMonths.length === 0 ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-5 dark:border-green-800 dark:bg-green-900/20">
                <p className="font-semibold text-green-700 dark:text-green-300">
                  No outstanding contribution balance.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-red-200 dark:border-red-800">
                <div className="divide-y divide-red-100 dark:divide-red-900/30 lg:hidden">
                  {outstandingMonths.map((month) => (
                    <div
                      key={`${month.year}-${month.monthNumber}`}
                      className="p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {month.month}
                          </p>

                          <p className="mt-1 text-xs text-red-500">
                            Outstanding contribution
                          </p>
                        </div>

                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                          OUTSTANDING
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <DetailBox
                          title="Expected"
                          value={formatCurrency(
                            item?.monthlyContributionAmount
                          )}
                        />

                        <DetailBox
                          title="Paid"
                          value={formatCurrency(
                            month.paidAmount
                          )}
                          className="bg-green-50 dark:bg-green-900/20"
                          titleClass="text-green-600 dark:text-green-400"
                          valueClass="text-green-700 dark:text-green-300"
                        />

                        <DetailBox
                          title="Pending"
                          value={formatCurrency(
                            month.pendingAmount
                          )}
                          className="bg-orange-50 dark:bg-orange-900/20"
                          titleClass="text-orange-600 dark:text-orange-400"
                          valueClass="text-orange-700 dark:text-orange-300"
                        />

                        <DetailBox
                          title="Balance"
                          value={formatCurrency(
                            month.amount
                          )}
                          className="bg-red-50 dark:bg-red-900/20"
                          titleClass="text-red-600 dark:text-red-400"
                          valueClass="text-red-700 dark:text-red-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden overflow-x-auto lg:block">
                  <table className="min-w-full">
                    <thead className="bg-red-50 dark:bg-red-900/20">
                      <tr>
                        {[
                          "Month",
                          "Expected",
                          "Paid",
                          "Pending",
                          "Balance",
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="px-4 py-3 text-left text-xs uppercase text-gray-500 dark:text-gray-300"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {outstandingMonths.map((month) => (
                        <tr
                          key={`${month.year}-${month.monthNumber}`}
                          className="hover:bg-red-50/40 dark:hover:bg-red-900/10"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {month.month}
                          </td>

                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {formatCurrency(
                              item?.monthlyContributionAmount
                            )}
                          </td>

                          <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">
                            {formatCurrency(
                              month.paidAmount
                            )}
                          </td>

                          <td className="px-4 py-3 text-sm text-orange-500">
                            {formatCurrency(
                              month.pendingAmount
                            )}
                          </td>

                          <td className="px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400">
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

          {/* PENDING MONTHS */}

          <section className="mb-8">
            <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
              Pending Verification
            </h3>

            {pendingMonths.length === 0 ? (
              <div className="rounded-xl bg-gray-50 p-5 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                No pending contribution months.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {pendingMonths.map((month) => (
                  <div
                    key={`${month.year}-${month.monthNumber}`}
                    className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20"
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {month.month}
                    </p>

                    <p className="mt-1 font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(month.amount)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Awaiting verification
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* CONTRIBUTION HISTORY */}

          <section className="mb-8">
            <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
              Contribution History
            </h3>

            {contributionHistory.length === 0 ? (
              <div className="rounded-xl bg-gray-50 p-5 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                No contribution history.
              </div>
            ) : (
              <>
                <div className="space-y-3 lg:hidden">
                  {contributionHistory.map(
                    (contribution, index) => (
                      <div
                        key={
                          contribution?.id ||
                          `${contribution?.year}-${contribution?.monthNumber}-${index}`
                        }
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {contribution?.month ||
                                `${contribution?.monthNumber || ""}/${contribution?.year || ""}`}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              Contribution payment
                            </p>
                          </div>

                          <StatusBadge
                            status={contribution?.status}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <DetailBox
                            title="Amount"
                            value={formatCurrency(
                              contribution?.amount
                            )}
                            className="bg-green-50 dark:bg-green-900/20"
                            titleClass="text-green-600 dark:text-green-400"
                            valueClass="text-green-700 dark:text-green-300"
                          />

                          <DetailBox
                            title="Payment Date"
                            value={
                              contribution?.paymentDate
                                ? new Date(
                                    contribution.paymentDate
                                  ).toLocaleDateString()
                                : "-"
                            }
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="hidden overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 lg:block">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          {[
                            "Month",
                            "Amount",
                            "Status",
                            "Payment Date",
                          ].map((heading) => (
                            <th
                              key={heading}
                              className="px-4 py-3 text-left text-xs uppercase text-gray-500 dark:text-gray-300"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {contributionHistory.map(
                          (contribution, index) => (
                            <tr
                              key={
                                contribution?.id ||
                                `${contribution?.year}-${contribution?.monthNumber}-${index}`
                              }
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                {contribution?.month ||
                                  `${contribution?.monthNumber || ""}/${contribution?.year || ""}`}
                              </td>

                              <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                                {formatCurrency(
                                  contribution?.amount
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <StatusBadge
                                  status={
                                    contribution?.status
                                  }
                                />
                              </td>

                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
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

          {/* PAYMENT VERIFICATION */}

          <section className="mb-8">
            <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
              Payment Verification Requests
            </h3>

            {pendingVerification.length === 0 ? (
              <div className="rounded-xl bg-gray-50 p-5 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400">
                No pending verification requests.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingVerification.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-xl border border-orange-200 bg-orange-50 p-4 shadow-sm dark:border-orange-800 dark:bg-orange-900/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                          {formatCurrency(
                            request.amount
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Submitted{" "}
                          {formatDate(request.createdAt)}
                        </p>
                      </div>

                      <StatusBadge status="PENDING" />
                    </div>

                    {request.transactionReference && (
                      <div className="mt-3 rounded-lg border border-orange-100 bg-white p-3 dark:border-orange-800 dark:bg-gray-800">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Transaction Reference
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold text-gray-900 dark:text-white">
                          {request.transactionReference}
                        </p>
                      </div>
                    )}

                    {request.months?.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-400">
                          Contribution Months
                        </p>

                        <div className="space-y-2">
                          {request.months.map((month) => (
                            <div
                              key={month.id}
                              className="flex items-center justify-between gap-3 rounded-lg border border-orange-100 bg-white px-3 py-2.5 dark:border-orange-800 dark:bg-gray-800"
                            >
                              <p className="min-w-0 text-sm font-medium text-gray-800 dark:text-gray-200">
                                {month.month}
                              </p>

                              <p className="shrink-0 text-sm font-bold text-orange-600 dark:text-orange-400">
                                {formatCurrency(
                                  month.amount
                                )}
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

/* ============================================================
   SMALL DETAIL BOX
============================================================ */

const DetailBox = ({
  title,
  value,
  className = "bg-gray-50 dark:bg-gray-700/60",
  titleClass = "text-gray-500 dark:text-gray-400",
  valueClass = "text-gray-900 dark:text-white",
}) => {
  return (
    <div className={`rounded-lg p-3 ${className}`}>
      <p className={`text-xs ${titleClass}`}>
        {title}
      </p>

      <p className={`mt-1 text-sm font-bold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
};

/* ============================================================
   CONTRIBUTIONS PAGE
============================================================ */

const Contributions = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedMember, setSelectedMember] =
    useState(null);
  const [
    manualContributionOpen,
    setManualContributionOpen,
  ] = useState(false);
  const [manualMember, setManualMember] =
    useState(null);

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
        response?.data?.data || response?.data;

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

  const openManualContribution = (
    member = null
  ) => {
    setManualMember(member);
    setManualContributionOpen(true);
  };

  const handleManualContributionSuccess =
    async () => {
      await loadContributions(true);
      setSelectedMember(null);
    };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500" />

            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Loading contribution records...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !data) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
            <h2 className="text-lg font-bold text-red-700 dark:text-red-300">
              Unable to load contributions
            </h2>

            <p className="mt-2 text-red-600 dark:text-red-400">
              {error}
            </p>

            <button
              onClick={() => loadContributions(true)}
              className="mt-4 rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const summary = data?.summary || {};
  const members = data?.members || [];
  const contributionPeriod =
    data?.contributionPeriod || {};
  const financialYear = data?.financialYear || {};

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Monthly Contributions
            </h1>

            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Monitor member contributions,
              outstanding payments and pending
              verification.
            </p>
          </div>

          <button
            onClick={() => loadContributions(true)}
            disabled={refreshing}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 sm:w-auto"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* CONTRIBUTION PERIOD */}

        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                Contribution Collection Period
              </p>

              <h2 className="mt-1 text-xl font-bold text-blue-900 dark:text-blue-200">
                {contributionPeriod.startMonthLabel ||
                  "December 2024"}{" "}
                →{" "}
                {contributionPeriod.currentMonthLabel ||
                  "-"}
              </h2>

              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                {contributionPeriod.totalMonths || 0}{" "}
                contribution months counted
              </p>
            </div>

            <div className="text-left lg:text-right">
              <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Monthly Contribution
              </p>

              <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                {formatCurrency(data?.monthlyAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* FINANCIAL YEAR */}

        <div className="mb-5 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-2">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Financial Year
              </span>

              <p className="font-semibold text-gray-900 dark:text-white">
                {financialYear.startYear || "-"} →{" "}
                {financialYear.endYear || "-"}
              </p>
            </div>

            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Current Period
              </span>

              <p className="font-semibold text-gray-900 dark:text-white">
                {data?.currentPeriod?.month || "-"}
              </p>
            </div>

            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Collection Completion
              </span>

              <p className="font-semibold text-green-600 dark:text-green-400">
                {summary.collectionCompletionPercentage ||
                  0}
                %
              </p>
            </div>
          </div>
        </div>

        {/* SUMMARY */}

        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
          <SummaryCard
            title="Active Members"
            value={summary.totalMembers || 0}
            subtitle="Currently active"
          />

          <SummaryCard
            title="Expected"
            value={formatCurrency(summary.expected)}
            subtitle="Total contribution due"
          />

          <SummaryCard
            title="Paid"
            value={formatCurrency(summary.paid)}
            subtitle={`${summary.paidMonths || 0} paid months`}
            valueClass="text-green-600 dark:text-green-400"
          />

          <SummaryCard
            title="Outstanding"
            value={formatCurrency(
              summary.outstanding
            )}
            subtitle={`${summary.membersWithOutstanding || 0} members affected`}
            valueClass="text-red-600 dark:text-red-400"
          />

          <SummaryCard
            title="Pending"
            value={formatCurrency(summary.pending)}
            subtitle={`${summary.membersWithPending || 0} members awaiting verification`}
            valueClass="text-orange-500 dark:text-orange-400"
          />
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {/* MEMBER OVERVIEW */}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 px-5 py-5 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Member Contribution Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Each member's financial position from
              their effective contribution start date.
            </p>
          </div>

          {members.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No active members found.
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE */}

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
                      item?.paymentCompletionPercentage ||
                        0
                    ),
                    100
                  );

                  return (
                    <div
                      key={member.id}
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold text-gray-900 dark:text-white">
                            {member.fullName ||
                              "Unknown Member"}
                          </h3>

                          {member.phone && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {member.phone}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-gray-400">
                            From{" "}
                            {item?.memberContributionStart
                              ?.month || "December 2024"}
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

                      <div className="mt-4 rounded-xl bg-blue-50 p-3 dark:bg-blue-900/20">
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          Monthly Contribution
                        </p>

                        <p className="mt-1 text-lg font-bold text-blue-900 dark:text-blue-200">
                          {formatCurrency(monthlyAmount)}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <DetailBox
                          title="Expected"
                          value={formatCurrency(expected)}
                        />

                        <DetailBox
                          title="Paid"
                          value={formatCurrency(paid)}
                          className="bg-green-50 dark:bg-green-900/20"
                          titleClass="text-green-600 dark:text-green-400"
                          valueClass="text-green-700 dark:text-green-300"
                        />

                        <DetailBox
                          title="Outstanding"
                          value={formatCurrency(
                            outstanding
                          )}
                          className="bg-red-50 dark:bg-red-900/20"
                          titleClass="text-red-600 dark:text-red-400"
                          valueClass={
                            outstanding > 0
                              ? "text-red-700 dark:text-red-300"
                              : "text-green-700 dark:text-green-300"
                          }
                        />

                        <DetailBox
                          title="Pending"
                          value={formatCurrency(pending)}
                          className="bg-orange-50 dark:bg-orange-900/20"
                          titleClass="text-orange-600 dark:text-orange-400"
                          valueClass="text-orange-700 dark:text-orange-300"
                        />
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Payment Progress
                          </span>

                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                            {progress}%
                          </span>
                        </div>

                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-green-500 transition-all"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedMember(item)
                        }
                        className="mt-5 min-h-[44px] w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openManualContribution(item)
                        }
                        className="mt-2 min-h-[44px] w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        ₦ Record Payment
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {[
                        "Member",
                        "Monthly",
                        "Expected",
                        "Paid",
                        "Outstanding",
                        "Pending",
                        "Progress",
                        "Action",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-300"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {members.map((item) => {
                      const member =
                        item?.member || {};

                      return (
                        <tr
                          key={member.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          {/* MEMBER */}

                          <td className="px-5 py-4">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
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
                                {item
                                  ?.memberContributionStart
                                  ?.month ||
                                  "December 2024"}
                              </p>
                            </div>
                          </td>

                          {/* MONTHLY */}

                          <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-gray-200">
                            {formatCurrency(
                              item?.monthlyContributionAmount
                            )}
                          </td>

                          {/* EXPECTED */}

                          <td className="px-5 py-4">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(
                                item?.totalExpected
                              )}
                            </p>

                            <p className="text-xs text-gray-400">
                              {item?.totalDueMonths ||
                                0}{" "}
                              months
                            </p>
                          </td>

                          {/* PAID */}

                          <td className="px-5 py-4">
                            <p className="font-semibold text-green-600 dark:text-green-400">
                              {formatCurrency(
                                item?.totalPaid
                              )}
                            </p>

                            <p className="text-xs text-gray-400">
                              {item?.paidMonths || 0}{" "}
                              paid months
                            </p>
                          </td>

                          {/* OUTSTANDING */}

                          <td className="px-5 py-4">
                            <p
                              className={`font-semibold ${
                                Number(
                                  item?.outstandingAmount
                                ) > 0
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-green-600 dark:text-green-400"
                              }`}
                            >
                              {formatCurrency(
                                item?.outstandingAmount
                              )}
                            </p>

                            <p className="text-xs text-gray-400">
                              {item?.outstandingMonths
                                ?.length || 0}{" "}
                              outstanding months
                            </p>
                          </td>

                          {/* PENDING */}

                          <td className="px-5 py-4">
                            <p
                              className={`font-semibold ${
                                Number(
                                  item?.pendingAmount
                                ) > 0
                                  ? "text-orange-500 dark:text-orange-400"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {formatCurrency(
                                item?.pendingAmount
                              )}
                            </p>

                            <p className="text-xs text-gray-400">
                              {item?.pendingRequests || 0}{" "}
                              request
                              {item?.pendingRequests ===
                              1
                                ? ""
                                : "s"}
                            </p>
                          </td>

                          {/* PROGRESS */}

                          <td className="min-w-[140px] px-5 py-4">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Progress
                              </span>

                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                {item
                                  ?.paymentCompletionPercentage ||
                                  0}
                                %
                              </span>
                            </div>

                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
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
                                  openManualContribution(
                                    item
                                  )
                                }
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
                              >
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/20 text-sm font-bold">
                                  ₦
                                </span>

                                Record Payment
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

        {/* MEMBER DETAILS MODAL */}

        {selectedMember && (
          <MemberDetailsModal
            item={selectedMember}
            onClose={() => setSelectedMember(null)}
            onRecordContribution={() =>
              openManualContribution(selectedMember)
            }
          />
        )}

        {/* MANUAL CONTRIBUTION MODAL */}

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

      {/* FLOATING RECORD BUTTON */}

      <button
        type="button"
        onClick={() => openManualContribution()}
        aria-label="Record contribution"
        title="Record contribution"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl ring-1 ring-gray-200 transition-all duration-200 hover:scale-105 hover:shadow-2xl active:scale-95 dark:bg-gray-800 dark:ring-gray-700 sm:bottom-6 sm:right-6"
      >
        <PaymentIcon size="lg" />
      </button>
    </DashboardLayout>
  );
};

export default Contributions;