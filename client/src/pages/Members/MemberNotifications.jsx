import { useEffect, useState } from "react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
} from "../../services/memberNotificationApi";

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getNotificationStyle = (type) => {
  switch (type) {
    case "PAYMENT":
      return {
        icon: "₦",
        iconClass: "bg-emerald-100 text-emerald-700",
        badgeClass:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        label: "Payment",
      };

    case "ANNOUNCEMENT":
      return {
        icon: "!",
        iconClass: "bg-blue-100 text-blue-700",
        badgeClass:
          "border-blue-200 bg-blue-50 text-blue-700",
        label: "Announcement",
      };

    default:
      return {
        icon: "•",
        iconClass: "bg-slate-100 text-slate-700",
        badgeClass:
          "border-slate-200 bg-slate-50 text-slate-700",
        label: "Notification",
      };
  }
};

export default function MemberNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [markingId, setMarkingId] = useState(null);

  const loadNotifications = async () => {
    try {
      setError("");

      const [notificationResponse, unreadResponse] =
        await Promise.all([
          getNotifications(),
          getUnreadNotificationCount(),
        ]);

      setNotifications(
        notificationResponse?.data || []
      );

      setUnreadCount(
        Number(unreadResponse?.data?.unread || 0)
      );
    } catch (err) {
      console.error(
        "Notification loading error:",
        err
      );

      setError(
        "Unable to load your notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      setMarkingId(notificationId);

      await markNotificationAsRead(notificationId);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );

      setUnreadCount((current) =>
        Math.max(0, current - 1)
      );
    } catch (err) {
      console.error(
        "Mark notification as read error:",
        err
      );

      alert(
        "Unable to mark notification as read."
      );
    } finally {
      setMarkingId(null);
    }
  };

  const handleNotificationClick = async (
    notification
  ) => {
    if (
      notification.isRead ||
      markingId === notification.id
    ) {
      return;
    }

    await handleMarkAsRead(notification.id);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse">
            <div className="h-10 w-64 rounded-lg bg-slate-200" />

            <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />

            <div className="mt-8 space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-32 rounded-2xl bg-white shadow-sm"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-28 pt-20 sm:p-6 sm:pb-28 sm:pt-20 lg:p-8 lg:pb-28 lg:pt-8">
      <div className="mx-auto max-w-5xl">

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-2xl backdrop-blur">
                  🔔
                </div>

                <div>
                  <h1 className="text-2xl font-bold sm:text-3xl">
                    Notifications
                  </h1>

                  <p className="mt-1 text-sm text-blue-100">
                    Stay updated with your association
                    activities.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white/10 px-5 py-3 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
                Unread
              </p>

              <p className="mt-1 text-2xl font-bold">
                {unreadCount}
              </p>
            </div>

          </div>
        </div>

        {/* ========================= */}
        {/* ERROR */}
        {/* ========================= */}

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">
              {error}
            </p>

            <button
              onClick={loadNotifications}
              className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ========================= */}
        {/* SUMMARY */}
        {/* ========================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              All Notifications
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {notifications.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Total messages
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
              Unread
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-700">
              {unreadCount}
            </p>

            <p className="mt-1 text-xs text-amber-600">
              Need your attention
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Read
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-700">
              {Math.max(
                0,
                notifications.length - unreadCount
              )}
            </p>

            <p className="mt-1 text-xs text-emerald-600">
              Already reviewed
            </p>
          </div>

        </div>

        {/* ========================= */}
        {/* NOTIFICATION LIST */}
        {/* ========================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="font-bold text-slate-900">
              Recent Notifications
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your latest association updates and
              payment notifications.
            </p>
          </div>

          {notifications.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
                🔔
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-800">
                No notifications yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                When there is an important update,
                payment verification, or association
                announcement, it will appear here.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {notifications.map((notification) => {
                const style = getNotificationStyle(
                  notification.type
                );

                const isUnread =
                  !notification.isRead;

                return (
                  <div
                    key={notification.id}
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    className={`relative p-5 transition sm:p-6 ${
                      isUnread
                        ? "cursor-pointer bg-blue-50/40 hover:bg-blue-50"
                        : "bg-white hover:bg-slate-50"
                    }`}
                  >

                    {/* Unread indicator */}

                    {isUnread && (
                      <div className="absolute left-0 top-0 h-full w-1 bg-blue-600" />
                    )}

                    <div className="flex items-start gap-4">

                      {/* ICON */}

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${style.iconClass}`}
                      >
                        {style.icon}
                      </div>

                      {/* CONTENT */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3
                                className={`text-base ${
                                  isUnread
                                    ? "font-bold text-slate-900"
                                    : "font-semibold text-slate-800"
                                }`}
                              >
                                {notification.title}
                              </h3>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${style.badgeClass}`}
                              >
                                {style.label}
                              </span>

                              {isUnread && (
                                <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                                  New
                                </span>
                              )}

                            </div>

                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                              {notification.message}
                            </p>

                          </div>

                          <div className="shrink-0 text-xs text-slate-400">
                            {formatDate(
                              notification.createdAt
                            )}
                          </div>

                        </div>

                        {/* ACTION */}

                        <div className="mt-4 flex items-center justify-between">

                          <span className="text-xs text-slate-400">
                            {isUnread
                              ? "Click to mark as read"
                              : "Read"}
                          </span>

                          {isUnread && (
                            <button
                              type="button"
                              disabled={
                                markingId ===
                                notification.id
                              }
                              onClick={(event) => {
                                event.stopPropagation();

                                handleMarkAsRead(
                                  notification.id
                                );
                              }}
                              className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {markingId ===
                              notification.id
                                ? "Marking..."
                                : "Mark as read"}
                            </button>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}