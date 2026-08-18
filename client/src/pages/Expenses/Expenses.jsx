import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

// =====================================================
// HELPERS
// =====================================================

const formatCurrency = (amount) => {
  return `₦${Number(amount || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date) => {
  if (!date) return "-";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "-";

  return value.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const emptyForm = {
  title: "",
  description: "",
  category: "",
  amount: "",
  expenseDate: "",
};

// =====================================================
// COMPONENT
// =====================================================

const Expenses = () => {
  // =====================================================
  // EXPENSE DATA
  // =====================================================

  const [expenses, setExpenses] = useState([]);

  // =====================================================
  // LOADING / SAVING STATES
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // =====================================================
  // FORM / MODAL STATES
  // =====================================================

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [deleteExpenseTarget, setDeleteExpenseTarget] =
    useState(null);

  const [form, setForm] = useState(emptyForm);

  // =====================================================
  // FORM ERROR
  // =====================================================

  const [error, setError] = useState("");

  // =====================================================
  // TOAST
  // =====================================================

  const [toast, setToast] = useState(null);

  // =====================================================
  // FILTERS
  // =====================================================

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // =====================================================
  // TOAST HELPER
  // =====================================================

  const showToast = (type, title, message) => {
    setToast({
      id: Date.now(),
      type,
      title,
      message,
    });
  };

  // =====================================================
  // AUTO DISMISS TOAST
  // =====================================================

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast]);

  // =====================================================
  // LOAD EXPENSES
  // =====================================================

  const loadExpenses = async () => {
    try {
      setLoading(true);

      const response = await api.get("/expenses");

      setExpenses(response?.data?.data || []);
    } catch (err) {
      console.error("Expense loading error:", err);

      showToast(
        "error",
        "Unable to load expenses",
        err?.response?.data?.message ||
          "Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // =====================================================
  // FORM HANDLING
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear validation error while typing
    if (error) {
      setError("");
    }
  };

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingExpense(null);

    setForm({
      ...emptyForm,
      expenseDate: new Date()
        .toISOString()
        .split("T")[0],
    });

    setError("");

    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (expense) => {
    setEditingExpense(expense);

    setForm({
      title: expense.title || "",
      description: expense.description || "",
      category: expense.category || "",
      amount: String(expense.amount ?? ""),
      expenseDate: expense.expenseDate
        ? new Date(expense.expenseDate)
            .toISOString()
            .split("T")[0]
        : "",
    });

    setError("");

    setShowModal(true);
  };

  // =====================================================
  // CLOSE ADD / EDIT MODAL
  // =====================================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingExpense(null);
    setForm(emptyForm);
    setError("");
  };

  // =====================================================
  // SAVE EXPENSE
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (
      !form.title.trim() ||
      !form.category.trim() ||
      !form.amount ||
      !form.expenseDate
    ) {
      setError(
        "Title, category, amount and expense date are required."
      );

      return;
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be a positive number.");

      return;
    }

    // -----------------------------------------------------
    // PAYLOAD
    // -----------------------------------------------------

    const payload = {
      title: form.title.trim(),
      description:
        form.description.trim() || null,
      category: form.category.trim(),
      amount,
      expenseDate: form.expenseDate,
    };

    try {
      setSaving(true);

      // ===================================================
      // UPDATE
      // ===================================================

      if (editingExpense) {
        await api.put(
          `/expenses/${editingExpense.id}`,
          payload
        );

        showToast(
          "success",
          "Expense updated",
          `"${payload.title}" was successfully updated.`
        );
      }

      // ===================================================
      // CREATE
      // ===================================================

      else {
        await api.post(
          "/expenses",
          payload
        );

        showToast(
          "success",
          "Expense recorded",
          `"${payload.title}" was successfully added.`
        );
      }

      // ---------------------------------------------------
      // REFRESH LIST
      // ---------------------------------------------------

      await loadExpenses();

      // ---------------------------------------------------
      // CLOSE MODAL
      // ---------------------------------------------------

      setShowModal(false);
      setEditingExpense(null);
      setForm(emptyForm);
      setError("");
    } catch (err) {
      console.error(
        "Expense save error:",
        err
      );

      showToast(
        "error",
        editingExpense
          ? "Update failed"
          : "Save failed",
        err?.response?.data?.message ||
          "Unable to save the expense. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // OPEN DELETE CONFIRMATION
  // =====================================================

  const handleDelete = (expense) => {
    setError("");

    setDeleteExpenseTarget(expense);
  };

  // =====================================================
  // CONFIRM DELETE
  // =====================================================

  const confirmDelete = async () => {
    if (!deleteExpenseTarget) return;

    const deletedTitle =
      deleteExpenseTarget.title;

    try {
      setDeleting(true);
      setError("");

      await api.delete(
        `/expenses/${deleteExpenseTarget.id}`
      );

      // Close confirmation modal
      setDeleteExpenseTarget(null);

      // Refresh list
      await loadExpenses();

      // Show success toast
      showToast(
        "success",
        "Expense deleted",
        `"${deletedTitle}" was successfully deleted.`
      );
    } catch (err) {
      console.error(
        "Expense delete error:",
        err
      );

      showToast(
        "error",
        "Delete failed",
        err?.response?.data?.message ||
          "Unable to delete the expense. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // CANCEL DELETE
  // =====================================================

  const cancelDelete = () => {
    if (deleting) return;

    setDeleteExpenseTarget(null);
  };

  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = useMemo(() => {
    return [
      ...new Set(
        expenses
          .map((expense) => expense.category)
          .filter(Boolean)
      ),
    ].sort();
  }, [expenses]);

  // =====================================================
  // FILTER EXPENSES
  // =====================================================

  const filteredExpenses = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return expenses.filter((expense) => {
      const matchesSearch =
        !searchValue ||
        expense.title
          ?.toLowerCase()
          .includes(searchValue) ||
        expense.description
          ?.toLowerCase()
          .includes(searchValue) ||
        expense.category
          ?.toLowerCase()
          .includes(searchValue);

      const matchesCategory =
        !categoryFilter ||
        expense.category === categoryFilter;

      const matchesDate =
        !dateFilter ||
        new Date(expense.expenseDate)
          .toISOString()
          .split("T")[0] === dateFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesDate
      );
    });
  }, [
    expenses,
    search,
    categoryFilter,
    dateFilter,
  ]);

  // =====================================================
  // TOTAL EXPENSES
  // =====================================================

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );
  }, [filteredExpenses]);

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <DashboardLayout>

      {/* =================================================
          TOAST ANIMATIONS
      ================================================= */}

      <style>
        {`
          @keyframes yizToastSlideIn {
            from {
              opacity: 0;
              transform: translateX(35px);
            }

            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes yizToastProgress {
            from {
              transform: scaleX(1);
            }

            to {
              transform: scaleX(0);
            }
          }

          .yiz-toast-slide-in {
            animation: yizToastSlideIn 0.3s ease-out;
          }

          .yiz-toast-progress {
            animation: yizToastProgress 4s linear forwards;
            transform-origin: left;
          }
        `}
      </style>

      <div className="space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Expenses
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Record, manage and monitor association expenses.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-blue-700 active:scale-[0.98]"
          >
            + Add Expense
          </button>

        </div>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* TOTAL */}

          <div className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">

            <p className="text-sm font-medium text-gray-500">
              Total Expenses
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </p>

          </div>

          {/* RECORDS */}

          <div className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">

            <p className="text-sm font-medium text-gray-500">
              Records
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-800">
              {filteredExpenses.length}
            </p>

          </div>

          {/* CATEGORIES */}

          <div className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">

            <p className="text-sm font-medium text-gray-500">
              Categories
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {categories.length}
            </p>

          </div>

        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="rounded-xl border bg-white p-5 shadow-sm">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

            {/* SEARCH */}

            <div>

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search expenses..."
                className="w-full rounded-lg border px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* CATEGORY */}

            <div>

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Category
              </label>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >

                <option value="">
                  All Categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}

              </select>

            </div>

            {/* DATE */}

            <div>

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Date
              </label>

              <input
                type="date"
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(event.target.value)
                }
                className="w-full rounded-lg border px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* RESET */}

            <div className="flex items-end">

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("");
                  setDateFilter("");
                }}
                className="w-full rounded-lg border px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Reset Filters
              </button>

            </div>

          </div>

        </div>

        {/* =================================================
            EXPENSE TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

          {/* TABLE HEADER */}

          <div className="flex items-center justify-between border-b px-5 py-4">

            <div>

              <h2 className="font-bold text-gray-800">
                Expense History
              </h2>

              <p className="text-sm text-gray-500">
                {filteredExpenses.length} record(s)
              </p>

            </div>

            <button
              type="button"
              onClick={loadExpenses}
              disabled={loading}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>

          {/* LOADING */}

          {loading ? (

            <div className="p-10 text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

              <p className="mt-3 text-sm text-gray-500">
                Loading expenses...
              </p>

            </div>

          ) : filteredExpenses.length === 0 ? (

            /* EMPTY */

            <div className="p-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 14.25l6-6m-6 0h6v6"
                  />
                </svg>

              </div>

              <h3 className="mt-4 font-semibold text-gray-700">
                No expenses found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your filters or add a new expense.
              </p>

            </div>

          ) : (

            /* TABLE */

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-gray-50">

                  <tr>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Title
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Category
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y">

                  {filteredExpenses.map(
                    (expense) => (

                      <tr
                        key={expense.id}
                        className="transition hover:bg-gray-50"
                      >

                        {/* DATE */}

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                          {formatDate(
                            expense.expenseDate
                          )}
                        </td>

                        {/* TITLE */}

                        <td className="px-5 py-4">

                          <div className="font-medium text-gray-800">
                            {expense.title}
                          </div>

                          {expense.description && (

                            <div className="mt-1 max-w-xs truncate text-xs text-gray-500">
                              {expense.description}
                            </div>

                          )}

                        </td>

                        {/* CATEGORY */}

                        <td className="px-5 py-4">

                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            {expense.category}
                          </span>

                        </td>

                        {/* AMOUNT */}

                        <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-red-600">
                          {formatCurrency(
                            expense.amount
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td className="whitespace-nowrap px-5 py-4 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(expense)
                            }
                            className="mr-2 rounded-lg border px-3 py-1.5 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(expense)
                            }
                            className="rounded-lg border px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                          >
                            Delete
                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          SUCCESS / ERROR TOAST
      ===================================================== */}

      {toast && (

        <div
          className={`yiz-toast-slide-in fixed right-6 top-6 z-[100] w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border bg-white shadow-2xl ${
            toast.type === "success"
              ? "border-green-200"
              : "border-red-200"
          }`}
        >

          <div className="flex items-start gap-3 px-5 py-4">

            {/* ICON */}

            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                toast.type === "success"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >

              {toast.type === "success" ? (

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>

              ) : (

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>

              )}

            </div>

            {/* MESSAGE */}

            <div className="min-w-0 flex-1">

              <p className="font-semibold text-gray-900">
                {toast.title}
              </p>

              <p className="mt-1 text-sm leading-5 text-gray-600">
                {toast.message}
              </p>

            </div>

            {/* CLOSE */}

            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-xl leading-none text-gray-400 transition hover:text-gray-700"
              aria-label="Close notification"
            >
              ×
            </button>

          </div>

          {/* PROGRESS */}

          <div
            className={`h-1 ${
              toast.type === "success"
                ? "bg-green-100"
                : "bg-red-100"
            }`}
          >

            <div
              className={`yiz-toast-progress h-full ${
                toast.type === "success"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />

          </div>

        </div>

      )}

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  {editingExpense
                    ? "Edit Expense"
                    : "Add Expense"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingExpense
                    ? "Update the expense information."
                    : "Record a new association expense."}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                aria-label="Close"
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-6"
            >

              {/* FORM ERROR */}

              {error && (

                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                    !
                  </div>

                  <p className="leading-5">
                    {error}
                  </p>

                </div>

              )}

              {/* TITLE */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Title *
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Meeting refreshments"
                  required
                  className="w-full rounded-lg border px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* CATEGORY */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Category *
                </label>

                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="e.g. Transport"
                  required
                  className="w-full rounded-lg border px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* AMOUNT */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Amount (₦) *
                </label>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  required
                  className="w-full rounded-lg border px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* DATE */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Expense Date *
                </label>

                <input
                  type="date"
                  name="expenseDate"
                  value={form.expenseDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Optional description..."
                  className="w-full resize-none rounded-lg border px-3 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? editingExpense
                      ? "Updating..."
                      : "Saving..."
                    : editingExpense
                    ? "Update Expense"
                    : "Save Expense"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {deleteExpenseTarget && (

        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">

          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-start gap-4 px-6 pt-6">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-9 0h14"
                  />
                </svg>

              </div>

              <div>

                <h2 className="text-xl font-bold text-gray-800">
                  Delete Expense?
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  This action cannot be undone.
                </p>

              </div>

            </div>

            {/* BODY */}

            <div className="px-6 py-5">

              <p className="text-sm leading-6 text-gray-600">

                Are you sure you want to delete{" "}

                <span className="font-semibold text-gray-800">
                  "{deleteExpenseTarget.title}"
                </span>

                ?

              </p>

              {/* EXPENSE DETAILS */}

              <div className="mt-4 rounded-xl border bg-gray-50 px-4 py-3">

                <div className="flex justify-between gap-4 text-sm">

                  <span className="text-gray-500">
                    Amount
                  </span>

                  <span className="font-semibold text-red-600">
                    {formatCurrency(
                      deleteExpenseTarget.amount
                    )}
                  </span>

                </div>

                <div className="mt-2 flex justify-between gap-4 text-sm">

                  <span className="text-gray-500">
                    Category
                  </span>

                  <span className="font-medium text-gray-800">
                    {deleteExpenseTarget.category}
                  </span>

                </div>

                <div className="mt-2 flex justify-between gap-4 text-sm">

                  <span className="text-gray-500">
                    Date
                  </span>

                  <span className="font-medium text-gray-800">
                    {formatDate(
                      deleteExpenseTarget.expenseDate
                    )}
                  </span>

                </div>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">

              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleting}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Expense"}
              </button>

            </div>

          </div>

        </div>

      )}

    </DashboardLayout>
  );
};

export default Expenses;