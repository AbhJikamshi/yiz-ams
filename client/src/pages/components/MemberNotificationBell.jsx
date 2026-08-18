import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUnreadNotificationCount } from "../../services/memberNotificationApi";

export default function MemberNotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadNotificationCount();

      setUnreadCount(
        Number(response?.data?.unread || 0)
      );
    } catch (error) {
      console.error(
        "Notification count error:",
        error
      );
    }
  };

  useEffect(() => {
    loadUnreadCount();

    // Refresh notification count every 30 seconds
    const interval = setInterval(
      loadUnreadCount,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      to="/member/notifications"
      aria-label={`Notifications${
        unreadCount > 0
          ? `, ${unreadCount} unread`
          : ""
      }`}
      className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      {/* Bell */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"
        />
      </svg>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white shadow-md ring-2 ring-white">
          {unreadCount > 99
            ? "99+"
            : unreadCount}
        </span>
      )}
    </Link>
  );
}