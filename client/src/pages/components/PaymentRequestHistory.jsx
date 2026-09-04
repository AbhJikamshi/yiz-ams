import { useMemo, useState } from "react";

const NGN = "₦";

const formatCurrency = (amount) =>
  `${NGN}${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) return "N/A";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }

  return parsed.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusClasses = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "APPROVED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400";

    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400";

    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
};

const getStatusLabel = (status) => {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "APPROVED") return "Approved";
  if (normalized === "PENDING") return "Pending";
  if (normalized === "REJECTED") return "Rejected";

  return normalized || "Unknown";
};

const getMonthName = (monthNumber) => {
  const months = [
    "",
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

  return months[Number(monthNumber)] || "Unknown";
};

const getCoveredMonths = (request) => {
  if (!Array.isArray(request?.months)) {
    return [];
  }

  return [...request.months].sort((a, b) => {
    if (Number(a.year) !== Number(b.year)) {
      return Number(a.year) - Number(b.year);
    }

    return Number(a.monthNumber) - Number(b.monthNumber);
  });
};

export default function PaymentRequestHistory({
  requests = [],
}) {
  const [filter, setFilter] = useState("ALL");

  const filteredRequests = useMemo(() => {
    const normalizedFilter = filter.toUpperCase();

    if (normalizedFilter === "ALL") {
      return requests;
    }

    return requests.filter(
      (request) =>
        String(request.status || "").toUpperCase() ===
        normalizedFilter
    );
  }, [requests, filter]);

  const counts = useMemo(() => {
    return {
      all: requests.length,

      pending: requests.filter(
        (request) =>
          String(request.status || "").toUpperCase() ===
          "PENDING"
      ).length,

      approved: requests.filter(
        (request) =>
          String(request.status || "").toUpperCase() ===
          "APPROVED"
      ).length,

      rejected: requests.filter(
        (request) =>
          String(request.status || "").toUpperCase() ===
          "REJECTED"
      ).length,
    };
  }, [requests]);

  if (!requests.length) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <h2 className="font-bold text-slate-900 dark:text-white">
            Payment History
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track your payment notifications and admin
            verification status.
          </p>
        </div>

        <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            ₦
          </div>

          <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
            No payment requests
          </h3>

          <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Your payment notifications will appear here
            after you notify the association that you have
            made a bank transfer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {/* HEADER */}

      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
        <h2 className="font-bold text-slate-900 dark:text-white">
          Payment History
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track your payment notifications and admin
          verification status.
        </p>
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-2 gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`rounded-xl border p-3 text-left transition ${
            filter === "ALL"
              ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750"
          }`}
        >
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            All
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {counts.all}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilter("PENDING")}
          className={`rounded-xl border p-3 text-left transition ${
            filter === "PENDING"
              ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
          }`}
        >
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Pending
          </p>

          <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {counts.pending}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilter("APPROVED")}
          className={`rounded-xl border p-3 text-left transition ${
            filter === "APPROVED"
              ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
          }`}
        >
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Approved
          </p>

          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {counts.approved}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFilter("REJECTED")}
          className={`rounded-xl border p-3 text-left transition ${
            filter === "REJECTED"
              ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
          }`}
        >
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Rejected
          </p>

          <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
            {counts.rejected}
          </p>
        </button>
      </div>

      {/* RESULT COUNT */}

      <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-800">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing{" "}
          <strong className="text-slate-700 dark:text-slate-300">
            {filteredRequests.length}
          </strong>{" "}
          payment{" "}
          {filteredRequests.length === 1
            ? "request"
            : "requests"}
        </p>
      </div>

      {/* MOBILE */}

      <div className="space-y-4 p-4 md:hidden">
        {filteredRequests.map((request) => {
          const status = String(
            request.status || ""
          ).toUpperCase();

          const months = getCoveredMonths(request);

          return (
            <div
              key={request.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"
            >
              {/* TOP */}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Payment Request
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    #{request.id}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Submitted{" "}
                    {formatDate(request.createdAt)}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    status
                  )}`}
                >
                  {getStatusLabel(status)}
                </span>
              </div>

              {/* AMOUNT */}

              <div className="mt-4 rounded-xl bg-white p-4 dark:bg-slate-900">
                <p className="text-xs font-medium text-slate-400">
                  Submitted Amount
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(request.amount)}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Payment Date:{" "}
                  {formatDate(request.paymentDate)}
                </p>
              </div>

              {/* APPROVED MONTHS */}

              {status === "APPROVED" && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    Contribution Months
                  </p>

                  {months.length > 0 ? (
                    <div className="mt-2 space-y-1">
                      {months.map((month) => (
                        <div
                          key={`${month.year}-${month.monthNumber}`}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="font-medium text-emerald-800 dark:text-emerald-300">
                            {getMonthName(
                              month.monthNumber
                            )}{" "}
                            {month.year}
                          </span>

                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            {formatCurrency(
                              month.amount
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                      Contribution months will appear
                      here after approval.
                    </p>
                  )}
                </div>
              )}

              {/* REJECTION */}

              {status === "REJECTED" &&
                request.remarks && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
                      Rejection Reason
                    </p>

                    <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                      {request.remarks}
                    </p>
                  </div>
                )}

              {/* PENDING */}

              {status === "PENDING" && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                    Waiting for admin verification.
                  </p>

                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-500">
                    Your contribution balance will be
                    updated after approval.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DESKTOP */}

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-[850px] w-full">
          <thead className="bg-slate-50 dark:bg-slate-800/60">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <th className="px-5 py-4">
                Request
              </th>

              <th className="px-5 py-4">
                Amount
              </th>

              <th className="px-5 py-4">
                Payment Date
              </th>

              <th className="px-5 py-4">
                Status
              </th>

              <th className="px-5 py-4">
                Contribution Months
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredRequests.map((request) => {
              const status = String(
                request.status || ""
              ).toUpperCase();

              const months = getCoveredMonths(request);

              return (
                <tr
                  key={request.id}
                  className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="px-5 py-5">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      #{request.id}
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(
                        request.createdAt
                      )}
                    </p>
                  </td>

                  <td className="px-5 py-5">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(
                        request.amount
                      )}
                    </p>
                  </td>

                  <td className="px-5 py-5">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {formatDate(
                        request.paymentDate
                      )}
                    </p>
                  </td>

                  <td className="px-5 py-5">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        status
                      )}`}
                    >
                      {getStatusLabel(status)}
                    </span>

                    {status === "REJECTED" &&
                      request.remarks && (
                        <p className="mt-2 max-w-[220px] text-xs text-red-600 dark:text-red-400">
                          {request.remarks}
                        </p>
                      )}
                  </td>

                  <td className="px-5 py-5">
                    {status === "APPROVED" ? (
                      months.length > 0 ? (
                        <div className="space-y-1">
                          {months.map((month) => (
                            <div
                              key={`${month.year}-${month.monthNumber}`}
                              className="text-sm"
                            >
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {getMonthName(
                                  month.monthNumber
                                )}{" "}
                                {month.year}
                              </span>

                              <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                                {formatCurrency(
                                  month.amount
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          No months recorded
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-slate-400">
                        Allocated after approval
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}