import { useEffect, useState } from "react";
import UploadProgress from "./UploadProgress";

const NGN = "₦";

const formatCurrency = (amount) =>
  `${NGN}${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function PaymentUploadForm({
  settings,
  onSubmit,
}) {
  const currentDate = new Date();

  const [form, setForm] = useState({
    months: [
      {
        monthNumber: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
      },
    ],
    amount: 0,
    transactionReference: "",
    paymentDate: currentDate.toISOString().substring(0, 10),
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [notification, setNotification] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    if (settings?.monthlyContributionAmount != null) {
      setForm((previous) => ({
        ...previous,
        amount:
          previous.months.length *
          Number(settings.monthlyContributionAmount),
      }));
    }
  }, [settings]);

  const months = [
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

  const showNotification = (type, message) => {
    setNotification({
      type,
      message,
    });

    setTimeout(() => {
      setNotification({
        type: "",
        message: "",
      });
    }, 5000);
  };

  const addMonth = () => {
    const lastMonth =
      form.months[form.months.length - 1];

    let nextMonth = Number(lastMonth.monthNumber) + 1;
    let nextYear = Number(lastMonth.year);

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }

    const exists = form.months.some(
      (month) =>
        Number(month.monthNumber) === nextMonth &&
        Number(month.year) === nextYear
    );

    if (exists) {
      showNotification(
        "warning",
        "This contribution month has already been selected."
      );
      return;
    }

    setForm((previous) => ({
      ...previous,
      months: [
        ...previous.months,
        {
          monthNumber: nextMonth,
          year: nextYear,
        },
      ],
      amount:
        (previous.months.length + 1) *
        Number(settings?.monthlyContributionAmount || 0),
    }));
  };

  const removeMonth = (index) => {
    if (form.months.length === 1) {
      showNotification(
        "warning",
        "At least one contribution month must be selected."
      );
      return;
    }

    setForm((previous) => {
      const updatedMonths = previous.months.filter(
        (_, monthIndex) => monthIndex !== index
      );

      return {
        ...previous,
        months: updatedMonths,
        amount:
          updatedMonths.length *
          Number(settings?.monthlyContributionAmount || 0),
      };
    });
  };

  const handleMonthChange = (index, field, value) => {
    setForm((previous) => {
      const updatedMonths = [...previous.months];

      updatedMonths[index] = {
        ...updatedMonths[index],
        [field]: Number(value),
      };

      return {
        ...previous,
        months: updatedMonths,
      };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFile = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      showNotification(
        "error",
        "Only JPG, JPEG, PNG and PDF files are allowed."
      );

      e.target.value = "";
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      showNotification(
        "error",
        "Payment proof must not exceed 5MB."
      );

      e.target.value = "";
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      showNotification(
        "warning",
        "Please upload your payment proof."
      );
      return;
    }

    if (!form.transactionReference.trim()) {
      showNotification(
        "warning",
        "Please enter your transaction reference."
      );
      return;
    }

    try {
      setLoading(true);
      setProgress(20);

      await onSubmit(
        form,
        file,
        setProgress
      );

      setProgress(100);

      showNotification(
        "success",
        "Payment request submitted successfully. It is now awaiting verification."
      );

      setForm({
        months: [
          {
            monthNumber: currentDate.getMonth() + 1,
            year: currentDate.getFullYear(),
          },
        ],
        amount: Number(
          settings?.monthlyContributionAmount || 0
        ),
        transactionReference: "",
        paymentDate: new Date()
          .toISOString()
          .substring(0, 10),
      });

      setFile(null);

      const fileInput =
        document.getElementById("payment-proof");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error(
        "Payment submission error:",
        err
      );

      showNotification(
        "error",
        err?.response?.data?.message ||
          err?.message ||
          "Payment submission failed. Please try again."
      );
    } finally {
      setLoading(false);

      setTimeout(() => {
        setProgress(0);
      }, 700);
    }
  };

  return (
    <>
      {/* ============================
          NOTIFICATION
      ============================ */}

      {notification.message && (
        <div
          className={`fixed right-5 top-5 z-[500] flex w-[min(420px,calc(100vw-40px))] items-start gap-3 rounded-2xl border p-4 shadow-2xl ${
            notification.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : notification.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
              notification.type === "success"
                ? "bg-emerald-600"
                : notification.type === "error"
                ? "bg-red-600"
                : "bg-amber-500"
            }`}
          >
            {notification.type === "success"
              ? "✓"
              : notification.type === "error"
              ? "!"
              : "!"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-bold">
              {notification.type === "success"
                ? "Success"
                : notification.type === "error"
                ? "Submission Failed"
                : "Attention"}
            </p>

            <p className="mt-1 text-sm">
              {notification.message}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setNotification({
                type: "",
                message: "",
              })
            }
            className="text-xl leading-none opacity-50 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >

        {/* HEADER */}

        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Submit Contribution
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select one or more contribution months and
            submit one payment proof.
          </p>
        </div>

        {/* MONTHS */}

        <div>

          <div className="mb-3 flex items-center justify-between">

            <div>
              <label className="font-semibold text-slate-800">
                Contribution Months
              </label>

              <p className="text-xs text-slate-500">
                One payment proof can cover all selected months.
              </p>
            </div>

            <button
              type="button"
              onClick={addMonth}
              disabled={loading}
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
            >
              + Add Month
            </button>

          </div>

          <div className="space-y-3">

            {form.months.map((month, index) => (
              <div
                key={index}
               className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[minmax(0,1fr)_8rem_8rem_auto] sm:items-end"
             >

                <div className="min-w-0 lg:flex-1">

                  <label className="text-xs font-semibold text-slate-500">
                    Month
                  </label>

                  <select
                    value={month.monthNumber}
                    onChange={(e) =>
                      handleMonthChange(
                        index,
                        "monthNumber",
                        e.target.value
                      )
                    }
                    disabled={loading}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {months.map((monthName, monthIndex) => (
                      <option
                        key={monthIndex}
                        value={monthIndex + 1}
                      >
                        {monthName}
                      </option>
                    ))}
                  </select>

                </div>

                <div className="w-full lg:w-32">

                  <label className="text-xs font-semibold text-slate-500">
                    Year
                  </label>

                  <input
                    type="number"
                    value={month.year}
                    onChange={(e) =>
                      handleMonthChange(
                        index,
                        "year",
                        e.target.value
                      )
                    }
                    disabled={loading}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                <div className="w-full lg:w-32">

                  <label className="text-xs font-semibold text-slate-500">
                    Amount
                  </label>

                  <div className="mt-1 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                    {formatCurrency(
                      settings?.monthlyContributionAmount
                    )}
                  </div>

                </div>

                {form.months.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMonth(index)}
                    disabled={loading}
                    className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 sm:col-span-2 lg:w-auto lg:shrink-0"
                  >
                    Remove
                  </button>
                )}

              </div>
            ))}

          </div>

        </div>

        {/* TOTAL */}

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-semibold text-blue-800">
                Total Contribution
              </p>

              <p className="text-xs text-blue-600">
                {form.months.length} contribution month
                {form.months.length !== 1 ? "s" : ""} selected
              </p>
            </div>

            <p className="text-2xl font-bold text-blue-700 sm:text-2x1">
              {formatCurrency(form.amount)}
            </p>

          </div>

        </div>

        {/* BANK DETAILS */}

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">

          <h3 className="font-bold text-slate-900">
            Association Bank Details
          </h3>

          <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">

            <p>
              <strong>Bank:</strong>{" "}
              {settings?.bankName || "Not configured"}
            </p>

            <p>
              <strong>Account Name:</strong>{" "}
              {settings?.accountName ||
                settings?.associationName ||
                "Not configured"}
            </p>

            <p>
              <strong>Account Number:</strong>{" "}
              {settings?.accountNumber ||
                "Not configured"}
            </p>

          </div>

        </div>

        {/* TRANSACTION REFERENCE + PAYMENT DATE */}

<div className="grid gap-5 sm:grid-cols-2">

  {/* TRANSACTION REFERENCE */}

  <div>

    <label className="font-semibold text-slate-800">
      Transaction Reference
    </label>

    <input
      type="text"
      name="transactionReference"
      value={form.transactionReference}
      onChange={handleChange}
      disabled={loading}
      className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      placeholder="Enter transaction reference"
      required
    />

  </div>

  {/* PAYMENT DATE */}

  <div>

    <label className="font-semibold text-slate-800">
      Payment Date
    </label>

    <input
      type="date"
      name="paymentDate"
      value={form.paymentDate}
      onChange={handleChange}
      disabled={loading}
      className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      required
    />

  </div>

</div>

        {/* PAYMENT PROOF */}

        <div>

          <label className="font-semibold text-slate-800">
            Payment Proof
          </label>

          <label
            htmlFor="payment-proof"
            className="mt-2 flex min-h-[165px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 py-8 text-center transition hover:bg-emerald-100 sm:px-6">

            <div className="text-3xl">
              📄
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-800">
              Click to upload payment proof
            </p>

            <p className="mt-1 text-xs text-slate-500">
              JPG, JPEG, PNG or PDF · Maximum 5MB
            </p>

            {file && (
  <div className="mt-3 max-w-full rounded-lg bg-white px-3 py-2 text-left shadow-sm">
    <p className="break-all text-xs font-semibold text-emerald-700">
      ✓ {file.name}
    </p>

    <p className="mt-1 text-[11px] text-slate-500">
      {(file.size / 1024 / 1024).toFixed(2)} MB
    </p>
  </div>
)}

          </label>

          <input
            id="payment-proof"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFile}
            disabled={loading}
            className="hidden"
            required
          />

        </div>

        {/* PROGRESS */}

        <UploadProgress
          loading={loading}
          progress={progress}
          message="Submitting payment..."
        />

        {/* SUBMIT */}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:text-base disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading
            ? "Submitting Payment..."
            : `Submit Payment · ${formatCurrency(form.amount)}`}
        </button>

        <p className="text-center text-xs text-slate-500">
          One payment proof can cover all selected
          contribution months.
        </p>

      </form>
    </>
  );
}