import { useEffect, useMemo, useState } from "react";

import PaymentRequestHistory from "../components/PaymentRequestHistory";

import {
  getMyPaymentRequests,
  submitPaymentRequest,
} from "../../services/paymentRequestService";

import settingsService from "../../services/settingsService";

const NGN = "\u20A6";

const formatCurrency = (amount) =>
  `${NGN}${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function MemberPaymentPage() {
  const [requests, setRequests] = useState([]);
  const [settings, setSettings] = useState(null);
  const [summary, setSummary] = useState(null);

  const [amount, setAmount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  // ==========================================================
  // LOAD PAGE
  // ==========================================================

  useEffect(() => {
  console.log("🟢 MemberPaymentPage mounted");
  loadPage();
}, []);

  const loadPage = async () => {
  console.log("🔄 MemberPaymentPage loadPage called");

  try {
      setLoading(true);

      const [paymentResponse, settingsResponse] =
        await Promise.all([
          getMyPaymentRequests(),
          settingsService.getMemberSettings(),
        ]);

      const paymentData =
        paymentResponse?.data ??
        paymentResponse ??
        [];

      setRequests(
        Array.isArray(paymentData)
          ? paymentData
          : []
      );

      setSummary(
        paymentResponse?.summary ??
          paymentResponse?.data?.summary ??
          null
      );

      const settingsData =
        settingsResponse?.data ??
        settingsResponse ??
        null;

      setSettings(settingsData);
    } catch (error) {
      console.error(
        "Member Payment Page Error:",
        error
      );

      setMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          "Failed to load payment information.",
      });
    } finally {
      setLoading(false);
    }
  };
  
    

  // ==========================================================
  // PAYMENT VALUES
  // ==========================================================

  const monthlyAmount = Number(
    settings?.monthlyContributionAmount ||
      summary?.monthlyContributionAmount ||
      0
  );

  const outstandingAmount = Number(
    summary?.outstanding || 0
  );

  const pendingRequest = requests.find(
    (request) =>
      String(request.status).toUpperCase() ===
      "PENDING"
  );

  // ==========================================================
  // INITIAL PAYMENT AMOUNT
  // ==========================================================

  useEffect(() => {
    if (
      monthlyAmount > 0 &&
      outstandingAmount > 0
    ) {
      setAmount((current) => {
        if (
          current <= 0 ||
          current > outstandingAmount
        ) {
          return Math.min(
            monthlyAmount,
            outstandingAmount
          );
        }

        return current;
      });
    } else {
      setAmount(0);
    }
  }, [
    monthlyAmount,
    outstandingAmount,
  ]);

  // ==========================================================
  // NUMBER OF MONTHS
  // ==========================================================

  const monthCount = useMemo(() => {
    if (monthlyAmount <= 0) return 0;

    return Math.floor(
      Number(amount || 0) /
        monthlyAmount
    );
  }, [
    amount,
    monthlyAmount,
  ]);

  // ==========================================================
  // AMOUNT VALIDATION
  // ==========================================================

  const amountNumber = Number(amount || 0);

  const isValidAmount =
    monthlyAmount > 0 &&
    outstandingAmount > 0 &&
    amountNumber >= monthlyAmount &&
    amountNumber <=
      outstandingAmount + 0.01 &&
    Math.abs(
      amountNumber / monthlyAmount -
        Math.round(
          amountNumber / monthlyAmount
        )
    ) < 0.000001;

  // ==========================================================
  // CHANGE AMOUNT
  // ==========================================================

  const increaseAmount = () => {
    if (pendingRequest) return;

    const next =
      amountNumber + monthlyAmount;

    if (
      next <= outstandingAmount + 0.01
    ) {
      setAmount(next);
    }
  };

  const decreaseAmount = () => {
    if (pendingRequest) return;

    const next =
      amountNumber - monthlyAmount;

    if (next >= monthlyAmount) {
      setAmount(next);
    }
  };

  const handleAmountInput = (event) => {
    if (pendingRequest) return;

    const value = event.target.value;

    if (value === "") {
      setAmount("");
      return;
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return;
    }

    setAmount(parsed);
  };

  // ==========================================================
  // SUBMIT PAYMENT
  // ==========================================================

  const handlePaymentMade = async () => {
    if (submitting) return;

    if (monthlyAmount <= 0) {
      setMessage({
        type: "error",
        text:
          "The monthly contribution amount has not been configured.",
      });
      return;
    }

    if (outstandingAmount <= 0) {
      setMessage({
        type: "success",
        text:
          "You have no outstanding contribution balance.",
      });
      return;
    }

    if (pendingRequest) {
      setMessage({
        type: "warning",
        text:
          "You already have a payment waiting for admin verification.",
      });
      return;
    }

    if (!isValidAmount) {
      setMessage({
        type: "error",
        text:
          `Please enter an amount that is a multiple of ${formatCurrency(
            monthlyAmount
          )} and does not exceed your outstanding balance.`,
      });
      return;
    }

    try {
      setSubmitting(true);

      setMessage({
        type: "",
        text: "",
      });

      const now = new Date();

      await submitPaymentRequest({
        amount: amountNumber,
        paymentDate:
          now.toISOString().substring(0, 10),
      });

      setMessage({
        type: "success",
        text:
          "Payment submitted successfully. Your payment is now waiting for admin verification.",
      });

      await loadPage();
    } catch (error) {
      console.error(
        "Payment submission error:",
        error
      );

      setMessage({
        type: "error",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to submit your payment.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-gray-500 dark:text-gray-400">
          Loading payment page...
        </p>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-28 pt-20 dark:bg-slate-950 sm:p-6 sm:pb-28 sm:pt-20 lg:p-8 lg:pb-28 lg:pt-8">
      <div className="mx-auto max-w-4xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Monthly Contribution
          </h1>

          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Make your bank transfer, select the amount you
            paid, then notify the association.
          </p>
        </div>

        {/* ==================================================
            MESSAGE
        ================================================== */}

        {message.text && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
                : message.type === "warning"
                ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400"
                : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* ==================================================
            PAYMENT CARD
        ================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

          {/* Monthly amount */}

          <div className="text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Monthly Contribution
            </p>

            <p className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(monthlyAmount)}
            </p>
          </div>

          {/* Outstanding */}

          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5 text-center dark:border-blue-900 dark:bg-blue-950/30">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Your Outstanding Balance
            </p>

            <p className="mt-1 text-3xl font-bold text-blue-900 dark:text-blue-300">
              {formatCurrency(
                outstandingAmount
              )}
            </p>

            {summary?.totalOutstandingMonths !==
              undefined && (
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                {summary.totalOutstandingMonths}{" "}
                unpaid{" "}
                {summary.totalOutstandingMonths ===
                1
                  ? "month"
                  : "months"}
              </p>
            )}
          </div>

          {pendingRequest ? (
            /* ==================================================
               PENDING
            ================================================== */

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-center dark:border-amber-900 dark:bg-amber-950/30">
              <p className="font-semibold text-amber-800 dark:text-amber-400">
                Payment Verification Pending
              </p>

              <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">
                Your payment of{" "}
                <strong>
                  {formatCurrency(
                    pendingRequest.amount
                  )}
                </strong>{" "}
                has been submitted and is waiting
                for admin verification.
              </p>

              <p className="mt-3 text-xs text-amber-600 dark:text-amber-500">
                Your contribution balance will be
                updated after the admin approves the
                payment.
              </p>
            </div>
          ) : outstandingAmount > 0 ? (
            <>
              {/* ==================================================
                  INSTRUCTIONS
              ================================================== */}

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Transfer your chosen amount to the
                  association's bank account before
                  submitting the payment notification.
                </p>
              </div>

              {/* ==================================================
                  AMOUNT SELECTOR
              ================================================== */}

              <div className="mx-auto mt-6 max-w-md">

                <p className="mb-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Amount Paid
                </p>

                <div className="flex items-center gap-3">

                  {/* Minus */}

                  <button
                    type="button"
                    onClick={decreaseAmount}
                    disabled={
                      amountNumber <=
                        monthlyAmount ||
                      submitting
                    }
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-slate-100 text-2xl font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                    aria-label="Decrease payment amount"
                  >
                    −
                  </button>

                  {/* Input */}

                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-slate-500 dark:text-slate-400">
                      ₦
                    </span>

                    <input
                      type="number"
                      min={monthlyAmount}
                      max={outstandingAmount}
                      step={monthlyAmount}
                      value={amount}
                      onChange={
                        handleAmountInput
                      }
                      disabled={submitting}
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-center text-xl font-bold text-slate-900 outline-none ring-blue-500 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      aria-label="Payment amount"
                    />
                  </div>

                  {/* Plus */}

                  <button
                    type="button"
                    onClick={increaseAmount}
                    disabled={
                      amountNumber +
                        monthlyAmount >
                        outstandingAmount +
                          0.01 ||
                      submitting
                    }
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-slate-100 text-2xl font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                    aria-label="Increase payment amount"
                  >
                    +
                  </button>
                </div>

                {/* Months preview */}

                {isValidAmount && (
                  <div className="mt-3 rounded-lg bg-slate-100 px-4 py-2 text-center text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    This payment covers{" "}
                    <strong>
                      {monthCount}
                    </strong>{" "}
                    {monthCount === 1
                      ? "contribution month"
                      : "contribution months"}.
                  </div>
                )}

                {/* Validation */}

                {amountNumber > 0 &&
                  !isValidAmount && (
                    <p className="mt-3 text-center text-xs text-red-600 dark:text-red-400">
                      Payment must be at least{" "}
                      {formatCurrency(
                        monthlyAmount
                      )}{" "}
                      and an exact multiple of the
                      monthly contribution.
                    </p>
                  )}
              </div>

              {/* ==================================================
                  SUBMIT
              ================================================== */}

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={
                    handlePaymentMade
                  }
                  disabled={
                    submitting ||
                    !isValidAmount
                  }
                  className="inline-flex min-w-[250px] items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Submitting..."
                    : "I Have Made Payment"}
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
                No payment receipt or proof upload is
                required. The admin will verify the bank
                transaction before approving your payment.
              </p>
            </>
          ) : (
            /* ==================================================
               FULLY PAID
            ================================================== */

            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
              <p className="font-semibold text-emerald-800 dark:text-emerald-400">
                Contributions Up to Date
              </p>

              <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-500">
                You have no outstanding contribution
                balance at this time.
              </p>
            </div>
          )}
        </div>

        {/* ==================================================
            PAYMENT HISTORY
        ================================================== */}

        <div className="mt-8">
          <PaymentRequestHistory
            requests={requests}
          />
        </div>
      </div>
    </div>
  );
}