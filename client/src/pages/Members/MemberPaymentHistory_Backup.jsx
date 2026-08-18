import { useEffect, useMemo, useState } from "react";
import {
  getPaymentHistory,
  downloadReceipt,
} from "../../services/memberPaymentApi";

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

const getStatusClasses = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "PAID":
    case "APPROVED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "REJECTED":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

export default function MemberPaymentHistory() {
  const [history, setHistory] = useState({
    payments: [],
    totalPayments: 0,
    totalPaid: 0,
  });

  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);

      const response = await getPaymentHistory();

      setHistory({
        payments: response?.data?.payments || [],
        totalPayments: response?.data?.totalPayments || 0,
        totalPaid: response?.data?.totalPaid || 0,
      });
    } catch (error) {
      console.error("Payment history error:", error);

      setHistory({
        payments: [],
        totalPayments: 0,
        totalPaid: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (id) => {
    if (!id) return;

    try {
      setDownloadingId(id);

      const pdf = await downloadReceipt(id);

      const blob = new Blob([pdf], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `Receipt-${id}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Receipt download error:", error);

      alert("Unable to download receipt.");
    } finally {
      setDownloadingId(null);
    }
  };

  const latestPayment = useMemo(() => {
    if (!history.payments.length) {
      return null;
    }

    return history.payments[0];
  }, [history.payments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm text-slate-500">
                Loading payment history...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* ============================
            HEADER
        ============================ */}

        <div className="mb-8">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-blue-600">
            Member Account
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Payment History
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View your contribution payments and download
            payment receipts.
          </p>
        </div>

        {/* ============================
            SUMMARY
        ============================ */}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Total Payments */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Payments
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {history.totalPayments}
            </p>

            <p className="mt-1 text-xs text-blue-600">
              Contribution records
            </p>
          </div>

          {/* Total Paid */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Paid
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {formatCurrency(history.totalPaid)}
            </p>

            <p className="mt-1 text-xs text-emerald-600">
              Successfully recorded
            </p>
          </div>

          {/* Latest Payment */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Latest Payment
            </p>

            {latestPayment ? (
              <>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {getMonthName(
                    latestPayment.monthNumber
                  )}{" "}
                  {latestPayment.year}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {formatCurrency(latestPayment.amount)}
                </p>
              </>
            ) : (
              <p className="mt-2 text-lg font-semibold text-slate-400">
                No payments
              </p>
            )}
          </div>

        </div>

        {/* ============================
            PAYMENT TABLE
        ============================ */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="font-bold text-slate-900">
              Contribution Payment History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your approved contribution payments are
              listed below.
            </p>
          </div>

          {history.payments.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
                ₦
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                No payment history
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                You do not have any recorded contribution
                payments yet.
              </p>

            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="min-w-[900px] w-full">

                <thead className="bg-slate-50">

                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">

                    <th className="px-5 py-4">
                      Year
                    </th>

                    <th className="px-5 py-4">
                      Contribution Month
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

                    <th className="px-5 py-4 text-right">
                      Receipt
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {history.payments.map((payment) => {

                    const isDownloading =
                      downloadingId === payment.id;

                    return (
                      <tr
                        key={payment.id}
                        className="transition hover:bg-slate-50/70"
                      >

                        {/* Year */}

                        <td className="px-5 py-5">
                          <p className="font-semibold text-slate-900">
                            {payment.year || "N/A"}
                          </p>
                        </td>

                        {/* Month */}

                        <td className="px-5 py-5">

                          <p className="font-semibold text-slate-900">
                            {getMonthName(
                              payment.monthNumber
                            )}
                          </p>

                          <p className="text-xs text-slate-500">
                            Month {payment.monthNumber}
                          </p>

                        </td>

                        {/* Amount */}

                        <td className="px-5 py-5">

                          <p className="font-bold text-slate-900">
                            {formatCurrency(
                              payment.amount
                            )}
                          </p>

                        </td>

                        {/* Payment Date */}

                        <td className="px-5 py-5">

                          <p className="text-sm font-medium text-slate-800">
                            {formatDate(
                              payment.paymentDate ||
                                payment.createdAt
                            )}
                          </p>

                        </td>

                        {/* Status */}

                        <td className="px-5 py-5">

                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              payment.status
                            )}`}
                          >
                            {payment.status ||
                              "UNKNOWN"}
                          </span>

                        </td>

                        {/* Receipt */}

                        <td className="px-5 py-5 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              handleDownload(
                                payment.id
                              )
                            }
                            disabled={isDownloading}
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                          >
                            {isDownloading
                              ? "Downloading..."
                              : "Download"}
                          </button>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}