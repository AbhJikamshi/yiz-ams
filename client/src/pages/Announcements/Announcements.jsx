import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState(null);

  // Toast
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // Error message
  const [error, setError] = useState("");

  // Delete confirmation modal
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ========================================
  // TOAST
  // ========================================

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      type,
      message,
    });
  };

  useEffect(() => {
    if (!toast.show) return;

    const timer = setTimeout(() => {
      setToast({
        show: false,
        type: "success",
        message: "",
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.show]);

  // ========================================
  // LOAD ANNOUNCEMENTS
  // ========================================

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/announcements");

      setAnnouncements(response?.data?.data || []);
    } catch (err) {
      console.error("Announcements load error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load announcements."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  // ========================================
  // RESET FORM
  // ========================================

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setEditingId(null);
  };

  // ========================================
  // CREATE / UPDATE
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast(
        "Announcement title is required.",
        "error"
      );
      return;
    }

    if (!message.trim()) {
      showToast(
        "Announcement message is required.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingId) {
        await api.patch(
          `/announcements/${editingId}`,
          {
            title: title.trim(),
            message: message.trim(),
          }
        );

        showToast(
          "Announcement updated successfully.",
          "success"
        );
      } else {
        await api.post("/announcements", {
          title: title.trim(),
          message: message.trim(),
        });

        showToast(
          "Announcement published successfully.",
          "success"
        );
      }

      resetForm();

      await loadAnnouncements();
    } catch (err) {
      console.error(
        "Announcement save error:",
        err
      );

      showToast(
        err.response?.data?.message ||
          "Failed to save announcement.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // EDIT
  // ========================================

  const handleEdit = (announcement) => {
    setEditingId(announcement.id);
    setTitle(announcement.title || "");
    setMessage(announcement.message || "");

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ========================================
  // OPEN DELETE MODAL
  // ========================================

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  // ========================================
  // DELETE / DEACTIVATE
  // ========================================

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      setError("");

      await api.delete(
        `/announcements/${deleteId}`
      );

      setDeleteId(null);

      showToast(
        "Announcement removed successfully.",
        "success"
      );

      await loadAnnouncements();
    } catch (err) {
      console.error(
        "Announcement delete error:",
        err
      );

      setDeleteId(null);

      showToast(
        err.response?.data?.message ||
          "Failed to remove announcement.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  // ========================================
  // DATE FORMAT
  // ========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
      "en-NG",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  return (
    <DashboardLayout>

      {/* ======================================
          TOAST NOTIFICATION
      ====================================== */}

      {toast.show && (
        <div className="fixed right-5 top-5 z-[100] w-[calc(100%-40px)] max-w-md">
          <div
            className={`flex items-start gap-3 rounded-xl border px-5 py-4 shadow-xl ${
              toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >

            <div className="mt-0.5 text-lg">
              {toast.type === "error"
                ? "⚠️"
                : "✓"}
            </div>

            <div className="flex-1">
              <p className="font-semibold">
                {toast.type === "error"
                  ? "Error"
                  : "Success"}
              </p>

              <p className="mt-1 text-sm">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setToast({
                  show: false,
                  type: "success",
                  message: "",
                })
              }
              className="text-lg opacity-60 transition hover:opacity-100"
            >
              ×
            </button>

          </div>
        </div>
      )}

      {/* ======================================
          DELETE CONFIRMATION MODAL
      ====================================== */}

      {deleteId && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl">
              ⚠️
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Remove Announcement?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to remove this
              announcement? It will no longer appear
              on the active announcements list.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {deleting
                  ? "Removing..."
                  : "Remove"}
              </button>

            </div>

          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-slate-900">
            Announcements
          </h1>

          <p className="mt-2 text-slate-500">
            Publish important messages and updates
            for association members.
          </p>

        </div>

        {/* ======================================
            ERROR
        ====================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            {error}
          </div>
        )}

        {/* ======================================
            CREATE / EDIT FORM
        ====================================== */}

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">

            <h2 className="text-xl font-bold text-slate-900">
              {editingId
                ? "Edit Announcement"
                : "Create Announcement"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingId
                ? "Update the announcement information."
                : "Create a new announcement that members can see."}
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Title */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Announcement Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                maxLength={150}
                placeholder="e.g. Monthly Meeting Reminder"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-xs text-slate-400">
                {title.length}/150 characters
              </p>

            </div>

            {/* Message */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Message
              </label>

              <textarea
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                maxLength={5000}
                rows={6}
                placeholder="Write your announcement here..."
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-1 text-xs text-slate-400">
                {message.length}/5000 characters
              </p>

            </div>

            {/* Buttons */}

            <div className="flex flex-wrap gap-3">

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Announcement"
                  : "Publish Announcement"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel Edit
                </button>
              )}

            </div>

          </form>

        </div>

        {/* ======================================
            ANNOUNCEMENT LIST
        ====================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <h2 className="text-xl font-bold text-slate-900">
              Published Announcements
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Messages currently visible to members.
            </p>

          </div>

          <div className="p-6">

            {loading ? (
              <div className="py-12 text-center text-slate-500">
                Loading announcements...
              </div>
            ) : announcements.length === 0 ? (
              <div className="py-12 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                  📢
                </div>

                <p className="mt-4 font-semibold text-slate-700">
                  No announcements yet
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Create your first announcement
                  using the form above.
                </p>

              </div>
            ) : (
              <div className="space-y-4">

                {announcements.map(
                  (announcement) => (
                    <div
                      key={announcement.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >

                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-lg font-bold text-slate-900">
                              {announcement.title}
                            </h3>

                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Active
                            </span>

                          </div>

                          <p className="mt-3 whitespace-pre-wrap leading-6 text-slate-600">
                            {announcement.message}
                          </p>

                          <div className="mt-4 text-xs text-slate-400">

                            Published:{" "}
                            {formatDate(
                              announcement.createdAt
                            )}

                            {announcement.createdBy
                              ?.fullName && (
                              <>
                                {" "}
                                by{" "}
                                {
                                  announcement
                                    .createdBy
                                    .fullName
                                }
                              </>
                            )}

                          </div>

                        </div>

                        {/* Actions */}

                        <div className="flex shrink-0 gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                announcement
                              )
                            }
                            className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteClick(
                                announcement.id
                              )
                            }
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            Remove
                          </button>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default Announcements;