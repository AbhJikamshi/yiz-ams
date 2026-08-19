import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/api$/, "") ||
  "http://localhost:5000";
const NGN = "₦";

const MONTH_NAMES = [
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
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/*
========================================
FORMAT PAYMENT MONTHS
========================================
*/

const formatPaymentMonths = (months) => {
  if (!Array.isArray(months) || months.length === 0) {
    return "No months selected";
  }

  return months
    .map((month) => {
      const monthNumber = Number(month.monthNumber);
      const year = Number(month.year);

      const monthName =
        MONTH_NAMES[monthNumber - 1] || "Unknown Month";

      if (!year) {
        return monthName;
      }

      return `${monthName} ${year}`;
    })
    .join(", ");
};

/*
========================================
PROOF URL
========================================
*/

const getProofUrl = (proofImage) => {
  if (!proofImage) return null;

  let value = String(proofImage).trim();

  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  value = value.replace(/\\/g, "/");

  const uploadsIndex = value.indexOf("/uploads/");

  if (uploadsIndex !== -1) {
    return `${API_BASE}${value.substring(uploadsIndex)}`;
  }

  value = value.replace(/^\/+/, "");

  if (value.startsWith("uploads/")) {
    return `${API_BASE}/${value}`;
  }

  if (value.startsWith("src/uploads/")) {
    return `${API_BASE}/${value.replace(/^src\//, "")}`;
  }

  if (value.startsWith("payment-proofs/")) {
    return `${API_BASE}/uploads/${value}`;
  }

  return `${API_BASE}/uploads/payment-proofs/${value}`;
};

/*
========================================
STATUS BADGE
========================================
*/

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING:
      "bg-amber-50 text-amber-700 border-amber-200",

    APPROVED:
      "bg-emerald-50 text-emerald-700 border-emerald-200",

    REJECTED:
      "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[status] ||
        "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {status || "UNKNOWN"}
    </span>
  );
};

/*
========================================
TOAST
========================================
*/

const Toast = ({ type, message, onClose }) => {
  if (!message) return null;

  const styles = {
    success: {
      wrapper:
        "border-emerald-200 bg-emerald-50 text-emerald-800",
      icon: "✓",
      iconBg: "bg-emerald-600",
      title: "Success",
    },

    error: {
      wrapper:
        "border-red-200 bg-red-50 text-red-800",
      icon: "!",
      iconBg: "bg-red-600",
      title: "Action failed",
    },

    warning: {
      wrapper:
        "border-amber-200 bg-amber-50 text-amber-800",
      icon: "!",
      iconBg: "bg-amber-500",
      title: "Warning",
    },
  };

  const style = styles[type] || styles.success;

  return (
    <div
      className={`fixed right-5 top-5 z-[500] flex w-[min(420px,calc(100vw-40px))] items-start gap-3 rounded-2xl border p-4 shadow-xl ${style.wrapper}`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${style.iconBg}`}
      >
        {style.icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-bold">{style.title}</p>

        <p className="mt-1 text-sm">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="text-xl leading-none opacity-50 transition hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
};

/*
========================================
PAYMENT VERIFICATION
========================================
*/

const PaymentVerification = () => {
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [processingId, setProcessingId] =
    useState(null);

  const [toast, setToast] = useState({
    type: "",
    message: "",
  });

  const [receipt, setReceipt] = useState(null);

  const [rejectModal, setRejectModal] =
    useState(null);

  const [approveModal, setApproveModal] =
    useState(null);

  const [rejectReason, setRejectReason] =
    useState("");

  /*
  ========================================
  AUTO DISMISS TOAST
  ========================================
  */

  useEffect(() => {
    if (!toast.message) return;

    const timer = setTimeout(() => {
      setToast({
        type: "",
        message: "",
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast.message]);

  const showToast = (type, message) => {
    setToast({
      type,
      message,
    });
  };

  const closeToast = () => {
    setToast({
      type: "",
      message: "",
    });
  };

  /*
  ========================================
  FETCH PENDING REQUESTS
  ========================================
  */

  const fetchPendingRequests = async (
    showLoader = true
  ) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const res = await api.get(
        "/admin/payment-requests/pending"
      );

      const data = res.data?.data || [];

      setRequests(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Payment verification error:",
        err
      );

      if (err.response?.status === 401) {
        showToast(
          "error",
          "Your admin session has expired. Please log in again."
        );
      } else {
        showToast(
          "error",
          err.response?.data?.message ||
            "Failed to load pending payment requests."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  /*
  ========================================
  SUMMARY
  ========================================
  */

  const totalPending = requests.length;

  const totalAmount = useMemo(
    () =>
      requests.reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      ),
    [requests]
  );

  const withReceipts = useMemo(
    () =>
      requests.filter(
        (item) => item.proofImage
      ).length,
    [requests]
  );

  /*
  ========================================
  REFRESH
  ========================================
  */

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await fetchPendingRequests(false);

      showToast(
        "success",
        "Payment requests refreshed successfully."
      );
    } finally {
      setRefreshing(false);
    }
  };

  /*
  ========================================
  APPROVE
  ========================================
  */

  const openApproveModal = (item) => {
    setApproveModal(item);
  };

  const handleApprove = async () => {
    if (!approveModal) return;

    const item = approveModal;

    try {
      setProcessingId(item.id);

      closeToast();

      const res = await api.patch(
        `/admin/payment-requests/${item.id}/approve`
      );

      setRequests((current) =>
        current.filter(
          (request) => request.id !== item.id
        )
      );

      setApproveModal(null);

      showToast(
        "success",
        res.data?.message ||
          "Payment approved successfully."
      );
    } catch (err) {
      console.error(
        "Approve payment error:",
        err
      );

      showToast(
        "error",
        err.response?.data?.message ||
          "Unable to approve this payment request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  /*
  ========================================
  REJECT
  ========================================
  */

  const openRejectModal = (item) => {
    setRejectReason("");

    setRejectModal(item);
  };

  const handleReject = async () => {
    if (!rejectModal) return;

    if (!rejectReason.trim()) {
      showToast(
        "warning",
        "Please provide a reason for rejecting the payment."
      );

      return;
    }

    try {
      setProcessingId(rejectModal.id);

      closeToast();

      const res = await api.patch(
        `/admin/payment-requests/${rejectModal.id}/reject`,
        {
          remarks: rejectReason.trim(),
        }
      );

      setRequests((current) =>
        current.filter(
          (request) =>
            request.id !== rejectModal.id
        )
      );

      setRejectModal(null);

      setRejectReason("");

      showToast(
        "success",
        res.data?.message ||
          "Payment rejected successfully."
      );
    } catch (err) {
      console.error(
        "Reject payment error:",
        err
      );

      showToast(
        "error",
        err.response?.data?.message ||
          "Unable to reject this payment request."
      );
    } finally {
      setProcessingId(null);
    }
  };

  /*
  ========================================
  RECEIPT
  ========================================
  */

  const openReceipt = (item) => {
    const url = getProofUrl(
      item.proofImage
    );

    if (!url) {
      showToast(
        "warning",
        "No payment receipt is attached to this request."
      );

      return;
    }

    setReceipt({
      url,

      memberName:
        item.member?.fullName ||
        "Unknown member",

      amount: item.amount,

      reference:
        item.transactionReference,

      date: item.paymentDate,
    });
  };

  /*
  ========================================
  RENDER
  ========================================
  */

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      <Toast
        type={toast.type}
        message={toast.message}
        onClose={closeToast}
      />

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-blue-600">
              Treasurer / Administration
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Payment Verification
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review, verify and process member
              contribution payments.
            </p>

          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              className={
                refreshing
                  ? "mr-2 animate-spin"
                  : "mr-2"
              }
            >
              ↻
            </span>

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* SUMMARY CARDS */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Pending Requests
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalPending}
            </p>

            <p className="mt-1 text-xs text-amber-600">
              Awaiting verification
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Pending Amount
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatCurrency(totalAmount)}
            </p>

            <p className="mt-1 text-xs text-blue-600">
              Total submitted
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Receipts Attached
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {withReceipts}
            </p>

            <p className="mt-1 text-xs text-emerald-600">
              Of {totalPending} pending requests
            </p>

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">

            <h2 className="font-bold text-slate-900">
              Pending Payment Requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Verify transaction references and receipts
              before approval.
            </p>

          </div>

          {loading ? (

            <div className="flex min-h-[300px] items-center justify-center">

              <div className="text-center">

                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="mt-4 text-sm text-slate-500">
                  Loading payment requests...
                </p>

              </div>

            </div>

          ) : requests.length === 0 ? (

            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-3xl font-bold text-emerald-600">
                ✓
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                All caught up
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                There are currently no pending payment
                requests requiring verification.
              </p>

            </div>

          ) : (
  <>
    {/* ==================================================
        MOBILE PAYMENT REQUEST CARDS
        ================================================== */}

    <div className="space-y-4 p-4 lg:hidden">
      {requests.map((item) => {
        const isProcessing =
          processingId === item.id;

        return (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            {/* MEMBER */}

            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                {(item.member?.fullName || "M")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900">
                  {item.member?.fullName ||
                    "Unknown member"}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {item.member?.phone ||
                    item.member?.email ||
                    ""}
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={item.status}
                  />
                </div>
              </div>
            </div>

            {/* AMOUNT */}

            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">
                Payment Amount
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900">
                {formatCurrency(item.amount)}
              </p>
            </div>

            {/* CONTRIBUTION MONTHS */}

            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Contribution Months
              </p>

              <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">
                {formatPaymentMonths(
                  item.months
                )}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {Array.isArray(item.months)
                  ? `${item.months.length} month${
                      item.months.length !== 1
                        ? "s"
                        : ""
                    }`
                  : "0 months"}

                {" · Submitted "}

                {formatDate(item.createdAt)}
              </p>
            </div>

            {/* PAYMENT DETAILS */}

            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Payment Details
              </p>

              <div className="mt-2 space-y-2">
                <div>
                  <p className="text-xs text-slate-500">
                    Transaction Reference
                  </p>

                  <p className="break-all text-sm font-semibold text-slate-800">
                    {item.transactionReference ||
                      "No reference"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Bank
                  </p>

                  <p className="text-sm font-medium text-slate-800">
                    {item.bankName ||
                      "Bank not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Payment Date
                  </p>

                  <p className="text-sm font-medium text-slate-800">
                    {formatDate(
                      item.paymentDate
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* RECEIPT */}

            <div className="mt-4">
              {item.proofImage ? (
                <button
                  type="button"
                  onClick={() =>
                    openReceipt(item)
                  }
                  className="flex w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  View Receipt
                </button>
              ) : (
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-400">
                  No receipt attached
                </div>
              )}
            </div>

            {/* ACTIONS */}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() =>
                  openApproveModal(item)
                }
                className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing
                  ? "Processing..."
                  : "Approve"}
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() =>
                  openRejectModal(item)
                }
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>

    {/* ==================================================
        DESKTOP PAYMENT REQUEST TABLE
        ================================================== */}

    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-[1200px] w-full">

        <thead className="bg-slate-50">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">

            <th className="px-5 py-4">
              Member
            </th>

            <th className="px-5 py-4">
              Contribution Months
            </th>

            <th className="px-5 py-4">
              Amount
            </th>

            <th className="px-5 py-4">
              Payment
            </th>

            <th className="px-5 py-4">
              Receipt
            </th>

            <th className="px-5 py-4">
              Status
            </th>

            <th className="sticky right-0 z-20 bg-slate-50 px-5 py-4 text-right">
             Actions
            </th>

          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">

          {requests.map((item) => {

            const isProcessing =
              processingId === item.id;

            return (
              <tr
                key={item.id}
                className="transition hover:bg-slate-50/70"
              >

                {/* MEMBER */}

                <td className="px-5 py-5">
                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                      {(item.member?.fullName ||
                        "M")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.member?.fullName ||
                          "Unknown member"}
                      </p>

                      <p className="text-xs text-slate-500">
                        {item.member?.phone ||
                          item.member?.email ||
                          ""}
                      </p>
                    </div>

                  </div>
                </td>

                {/* MONTHS */}

                <td className="px-5 py-5">
                  <div className="max-w-[300px]">

                    <p className="font-medium leading-6 text-slate-800">
                      {formatPaymentMonths(
                        item.months
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {Array.isArray(
                        item.months
                      )
                        ? `${item.months.length} month${
                            item.months.length !==
                            1
                              ? "s"
                              : ""
                          }`
                        : "0 months"}

                      {" · Submitted "}

                      {formatDate(
                        item.createdAt
                      )}
                    </p>

                  </div>
                </td>

                {/* AMOUNT */}

                <td className="px-5 py-5">
                  <p className="font-bold text-slate-900">
                    {formatCurrency(
                      item.amount
                    )}
                  </p>

                  {Array.isArray(
                    item.months
                  ) &&
                    item.months.length >
                      1 && (
                      <p className="mt-1 text-xs text-slate-500">
                        {formatCurrency(
                          Number(item.amount) /
                            item.months.length
                        )}{" "}
                        per month
                      </p>
                    )}
                </td>

                {/* PAYMENT */}

                <td className="px-5 py-5">

                  <p className="max-w-[220px] truncate font-medium text-slate-800">
                    {item.transactionReference ||
                      "No reference"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.bankName ||
                      "Bank not specified"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Paid{" "}
                    {formatDate(
                      item.paymentDate
                    )}
                  </p>

                </td>

                {/* RECEIPT */}

                <td className="px-5 py-5">

                  {item.proofImage ? (
                    <button
                      type="button"
                      onClick={() =>
                        openReceipt(item)
                      }
                      className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      View Receipt
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">
                      No receipt
                    </span>
                  )}

                </td>

                {/* STATUS */}

                <td className="px-5 py-5">
                  <StatusBadge
                    status={item.status}
                  />
                </td>

                {/* ACTIONS */}

                <td className="px-5 py-5">
                <div className="flex justify-end gap-2">

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        openApproveModal(item)
                      }
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        openRejectModal(item)
                      }
                      className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reject
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

      </div>

      {/* ========================================
          APPROVE MODAL
      ======================================== */}

      {approveModal && (

        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/70 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="border-b border-slate-200 px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-600">
                  ✓
                </div>

                <div>

                  <h2 className="text-lg font-bold text-slate-900">
                    Approve Payment
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Confirm that this contribution has
                    been verified.
                  </p>

                </div>

              </div>

            </div>

            <div className="px-6 py-5">

              <div className="rounded-xl bg-slate-50 p-4">

                <p className="font-semibold text-slate-900">
                  {approveModal.member?.fullName ||
                    "Unknown member"}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">

                  {/* AMOUNT */}

                  <div>

                    <p className="text-xs text-slate-500">
                      Total Amount
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {formatCurrency(
                        approveModal.amount
                      )}
                    </p>

                  </div>

                  {/* MONTH COUNT */}

                  <div>

                    <p className="text-xs text-slate-500">
                      Months
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">

                      {Array.isArray(
                        approveModal.months
                      )
                        ? approveModal.months.length
                        : 0}

                      {" month"}

                      {Array.isArray(
                        approveModal.months
                      ) &&
                      approveModal.months.length !==
                        1
                        ? "s"
                        : ""}

                    </p>

                  </div>

                  {/* CONTRIBUTION MONTHS */}

                  <div className="col-span-2">

                    <p className="text-xs text-slate-500">
                      Contribution Months
                    </p>

                    <p className="mt-1 font-semibold leading-6 text-slate-900">
                      {formatPaymentMonths(
                        approveModal.months
                      )}
                    </p>

                  </div>

                  {/* REFERENCE */}

                  <div className="col-span-2">

                    <p className="text-xs text-slate-500">
                      Transaction Reference
                    </p>

                    <p className="mt-1 break-all font-semibold text-slate-900">
                      {approveModal.transactionReference ||
                        "N/A"}
                    </p>

                  </div>

                  {/* PAYMENT DATE */}

                  <div className="col-span-2">

                    <p className="text-xs text-slate-500">
                      Payment Date
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {formatDate(
                        approveModal.paymentDate
                      )}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

              <button
                type="button"
                onClick={() =>
                  setApproveModal(null)
                }
                disabled={
                  processingId ===
                  approveModal.id
                }
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={
                  processingId ===
                  approveModal.id
                }
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processingId ===
                approveModal.id
                  ? "Approving..."
                  : "Confirm Approval"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ========================================
          RECEIPT MODAL
      ======================================== */}

      {receipt && (

        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 p-4">

          <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

              <div>

                <h2 className="font-bold text-slate-900">
                  Payment Receipt
                </h2>

                <p className="text-xs text-slate-500">
                  {receipt.memberName} ·{" "}
                  {formatCurrency(
                    receipt.amount
                  )}
                </p>

              </div>

              <button
                type="button"
                onClick={() => setReceipt(null)}
                className="text-2xl leading-none text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            <div className="overflow-auto bg-slate-100 p-4">

              <img
                src={receipt.url}
                alt="Payment receipt"
                className="mx-auto max-h-[70vh] max-w-full rounded-lg bg-white object-contain shadow"
                onError={() => {
                  showToast(
                    "error",
                    "The receipt image could not be loaded. Please check the uploaded file."
                  );
                }}
              />

            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4">

              <div className="text-xs text-slate-500">

                Reference:{" "}

                <span className="font-semibold text-slate-700">
                  {receipt.reference ||
                    "N/A"}
                </span>

                <span className="mx-2">
                  ·
                </span>

                Payment Date:{" "}

                <span className="font-semibold text-slate-700">
                  {formatDate(
                    receipt.date
                  )}
                </span>

              </div>

              <a
                href={receipt.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Open Full Receipt
              </a>

            </div>

          </div>

        </div>
      )}

      {/* ========================================
          REJECT MODAL
      ======================================== */}

      {rejectModal && (

        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/70 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="border-b border-slate-200 px-6 py-5">

              <h2 className="text-lg font-bold text-slate-900">
                Reject Payment Request
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Provide a reason so the member knows
                why the payment was rejected.
              </p>

            </div>

            <div className="px-6 py-5">

              <div className="rounded-xl bg-slate-50 p-4">

                <p className="text-sm font-semibold text-slate-900">
                  {rejectModal.member?.fullName ||
                    "Unknown member"}
                </p>

                <p className="mt-1 text-sm font-bold text-slate-700">
                  {formatCurrency(
                    rejectModal.amount
                  )}
                </p>

                <p className="mt-2 text-sm font-medium leading-6 text-slate-700">
                  {formatPaymentMonths(
                    rejectModal.months
                  )}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {Array.isArray(
                    rejectModal.months
                  )
                    ? `${rejectModal.months.length} month${
                        rejectModal.months.length !==
                        1
                          ? "s"
                          : ""
                      } selected`
                    : "No months selected"}
                </p>

              </div>

              <label className="mt-5 block text-sm font-semibold text-slate-700">
                Rejection reason
              </label>

              <textarea
                value={rejectReason}
                onChange={(e) =>
                  setRejectReason(
                    e.target.value
                  )
                }
                rows={4}
                placeholder="Example: Transaction reference could not be verified."
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />

            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

              <button
                type="button"
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason("");
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={
                  processingId ===
                  rejectModal.id
                }
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processingId ===
                rejectModal.id
                  ? "Rejecting..."
                  : "Confirm Rejection"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default PaymentVerification;