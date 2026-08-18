import { useMemo, useState } from "react";

const API_BASE = "http://localhost:5000";
const NGN = "₦";

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

const formatCurrency = (amount) =>
  `${NGN}${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusStyles = (status) => {
  switch (status) {
    case "APPROVED":
      return {
        badge:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: "✓",
        label: "Approved",
      };

    case "REJECTED":
      return {
        badge:
          "border-red-200 bg-red-50 text-red-700",
        icon: "!",
        label: "Rejected",
      };

    default:
      return {
        badge:
          "border-amber-200 bg-amber-50 text-amber-700",
        icon: "◷",
        label: "Pending",
      };
  }
};

export default function PaymentRequestHistory({
  requests = [],
}) {
  const [activeFilter, setActiveFilter] = useState("ALL");

  // ============================
  // COUNTS
  // ============================

  const pendingCount = requests.filter(
    (request) => request.status === "PENDING"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "APPROVED"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status === "REJECTED"
  ).length;

  // ============================
  // FILTERED REQUESTS
  // ============================

  const filteredRequests = useMemo(() => {
    if (activeFilter === "ALL") {
      return requests;
    }

    return requests.filter(
      (request) => request.status === activeFilter
    );
  }, [requests, activeFilter]);

  // ============================
  // TOTAL SUBMITTED
  // ============================

  const totalSubmitted = useMemo(() => {
    return filteredRequests.reduce(
      (total, request) =>
        total + Number(request.amount || 0),
      0
    );
  }, [filteredRequests]);



  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* ============================
          HEADER
      ============================ */}

      <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Payment History
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track your contribution payment submissions
            and verification status.
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            {activeFilter === "ALL"
              ? "Submitted Amount"
              : `${getStatusStyles(activeFilter).label} Amount`}
          </p>

          <p className="mt-1 text-xl font-bold text-blue-700">
            {formatCurrency(totalSubmitted)}
          </p>
        </div>
      </div>



      {/* ============================
          SUMMARY
      ============================ */}

      <div className="grid grid-cols-2 border-b border-slate-200 sm:grid-cols-4">

        <button
          type="button"
          onClick={() => setActiveFilter("ALL")}
          className={`border-r border-slate-200 p-4 text-left transition ${
            activeFilter === "ALL"
              ? "bg-slate-50"
              : "hover:bg-slate-50"
          }`}
        >
          <p className="text-xs font-medium uppercase text-slate-500">
            All
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {requests.length}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("PENDING")}
          className={`border-r border-slate-200 p-4 text-left transition ${
            activeFilter === "PENDING"
              ? "bg-amber-50"
              : "hover:bg-amber-50"
          }`}
        >
          <p className="text-xs font-medium uppercase text-amber-600">
            Pending
          </p>

          <p className="mt-1 text-2xl font-bold text-amber-600">
            {pendingCount}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("APPROVED")}
          className={`border-r border-slate-200 p-4 text-left transition ${
            activeFilter === "APPROVED"
              ? "bg-emerald-50"
              : "hover:bg-emerald-50"
          }`}
        >
          <p className="text-xs font-medium uppercase text-emerald-600">
            Approved
          </p>

          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {approvedCount}
          </p>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("REJECTED")}
          className={`p-4 text-left transition ${
            activeFilter === "REJECTED"
              ? "bg-red-50"
              : "hover:bg-red-50"
          }`}
        >
          <p className="text-xs font-medium uppercase text-red-600">
            Rejected
          </p>

          <p className="mt-1 text-2xl font-bold text-red-600">
            {rejectedCount}
          </p>
        </button>

      </div>

      {/* ============================
          ACTIVE FILTER
      ============================ */}

      <div className="border-b border-slate-100 px-6 py-4">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {filteredRequests.length}
          </span>{" "}
          {activeFilter === "ALL"
            ? "payment requests"
            : `${getStatusStyles(activeFilter).label.toLowerCase()} payment requests`}
        </p>
      </div>

      {/* ============================
          REQUESTS
      ============================ */}

      <div className="space-y-4 p-6">

        {filteredRequests.length === 0 ? (
          <div className="py-12 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              💳
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              No{" "}
              {activeFilter === "ALL"
                ? "payment requests"
                : getStatusStyles(
                    activeFilter
                  ).label.toLowerCase()}{" "}
              payment requests
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {activeFilter === "ALL"
                ? "Your payment submissions will appear here."
                : "There are no payment requests with this status."}
            </p>

            {activeFilter !== "ALL" && (
              <button
                type="button"
                onClick={() => setActiveFilter("ALL")}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                View All Payments
              </button>
            )}

          </div>
        ) : (
          filteredRequests.map((request) => {
            const status = getStatusStyles(
              request.status
            );

            return (
              <div
                key={request.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm"
              >

                {/* TOP */}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div className="flex items-start gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
                      ₦
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900">
                        Payment #{request.id}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Submitted{" "}
                        {formatDate(
                          request.createdAt
                        )}
                      </p>
                    </div>

                  </div>

                  {/* STATUS */}

                  <span
                    className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${status.badge}`}
                  >
                    <span>{status.icon}</span>
                    {status.label}
                  </span>

                </div>

                {/* MONTHS */}

                <div className="mt-5">

                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contribution Months
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {request.months?.length > 0 ? (
                      request.months.map(
                        (month) => (
                          <span
                            key={month.id}
                            className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
                          >
                            {months[
                              Number(
                                month.monthNumber
                              )
                            ] || "Unknown"}{" "}
                            {month.year}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-sm text-slate-400">
                        No contribution months recorded.
                      </span>
                    )}

                  </div>
                </div>

                {/* PAYMENT DETAILS */}

                <div className="mt-4 grid gap-3 sm:grid-cols-3">

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Amount
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {formatCurrency(
                        request.amount
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Payment Date
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formatDate(
                        request.paymentDate
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Reference
                    </p>

                    <p className="mt-1 truncate font-semibold text-slate-900">
                      {request.transactionReference ||
                        "—"}
                    </p>
                  </div>

                </div>

                {/* PROOF */}

                <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Payment Proof
                    </p>

                    {request.proofImage ? (
                      <p className="mt-1 text-xs font-medium text-emerald-600">
                        ✓ Receipt uploaded
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-400">
                        No receipt uploaded
                      </p>
                    )}
                  </div>

                  {request.proofImage && (
                    <a
                      href={`${API_BASE}/uploads/payment-proofs/${request.proofImage}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-fit items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      View Payment Proof
                    </a>
                  )}

                </div>

                {/* REJECTED */}

                {request.status ===
                  "REJECTED" &&
                  request.remarks && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">

                      <p className="text-sm font-bold text-red-800">
                        Rejection Reason
                      </p>

                      <p className="mt-1 text-sm text-red-700">
                        {request.remarks}
                      </p>

                    </div>
                  )}

                {/* APPROVED */}

                {request.status ===
                  "APPROVED" && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                      <p className="text-sm font-semibold text-emerald-800">
                        ✓ Payment verified successfully
                      </p>

                      <p className="mt-1 text-xs text-emerald-700">
                        All selected contribution months
                        have been recorded.
                      </p>

                    </div>
                  )}

                {/* PENDING */}

                {request.status ===
                  "PENDING" && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">

                      <p className="text-sm font-semibold text-amber-800">
                        ◷ Awaiting verification
                      </p>

                      <p className="mt-1 text-xs text-amber-700">
                        The Treasurer will review your
                        payment and verify the transaction.
                      </p>

                    </div>
                  )}

              </div>
            );
          })
        )}

      </div>
    </div>
  );
}