import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
} from "react-router-dom";

import {
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/outline";

import { useTheme } from "../../contexts/ThemeContext";

import {
  getUnreadNotificationCount,
} from "../../services/memberNotificationApi";

export default function MemberNavigation() {
  const location = useLocation();
const currentPath = location.pathname;

const { theme, toggleTheme } = useTheme();
const isDark = theme === "dark";

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [notificationLoading, setNotificationLoading] =
    useState(true);

  // =====================================================
  // LOAD UNREAD NOTIFICATION COUNT
  // =====================================================

  const loadUnreadNotifications = async () => {
    try {
      setNotificationLoading(true);

      const response =
        await getUnreadNotificationCount();

      const count = Number(
        response?.data?.unread || 0
      );

      setUnreadCount(count);
    } catch (err) {
      console.error(
        "Unread notification error:",
        err
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  // =====================================================
  // LOAD NOTIFICATIONS + REFRESH EVERY 30 SECONDS
  // =====================================================

  useEffect(() => {
    loadUnreadNotifications();

    const interval = setInterval(() => {
      loadUnreadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // ALL MEMBER NAVIGATION ITEMS
  // =====================================================

  const allNavItems = [
    {
      path: "/member/dashboard",
      icon: "🏠",
      title: "Dashboard",
      mobileTitle: "Dashboard",
      description: "Member dashboard",
    },
    {
      path: "/member/payments",
      icon: "💳",
      title: "Make Payment",
      mobileTitle: "Make Payment",
      description: "Submit contribution",
    },
    {
      path: "/member/payment-history",
      icon: "📋",
      title: "Payment History",
      mobileTitle: "Payment History",
      description: "View submissions",
    },
    {
      path: "/member/statement",
      icon: "📄",
      title: "My Statement",
      mobileTitle: "My Statement",
      description: "Contribution statement",
    },
    {
      path: "/member/profile",
      icon: "👤",
      title: "My Profile",
      mobileTitle: "My Profile",
      description: "Account details",
    },
  ];

  // =====================================================
  // DETERMINE WHETHER WE ARE ON DASHBOARD
  // =====================================================

  const isDashboard =
    currentPath === "/member/dashboard";

  // =====================================================
  // NAVIGATION RULE
  //
  // Dashboard:
  //   Show ALL navigation items.
  //
  // Other pages:
  //   Show Dashboard + CURRENT PAGE only.
  // =====================================================

  let visibleNavItems = [];

  if (isDashboard) {
    visibleNavItems = allNavItems;
  } else {
    const dashboardItem = allNavItems.find(
      (item) =>
        item.path === "/member/dashboard"
    );

    const currentItem = allNavItems.find(
      (item) =>
        item.path === currentPath
    );

    visibleNavItems = [
      dashboardItem,
      ...(currentItem ? [currentItem] : []),
    ];
  }

  // =====================================================
  // ACTIVE PAGE
  // =====================================================

  const isActive = (path) => {
    return currentPath === path;
  };

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* =================================================
          MOBILE HEADER
          Visible only below md breakpoint
      ================================================== */}

       <header
          className="
            fixed
            left-0
            right-0
            top-0
            z-[200]
            border-b
            border-slate-200
            bg-white/95
            shadow-sm
            backdrop-blur-md
            transition-colors
            dark:border-slate-700
            dark:bg-slate-900/95
            md:hidden
          "
        >
        <div className="flex h-16 items-center justify-between px-4">

          {/* BRAND / TITLE */}

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
              YIZ-AMS
            </p>

            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              Member
            </p>
          </div>

          {/* =================================================
              HEADER ACTIONS
          ================================================== */}

          <div className="flex items-center gap-2">

            {/* =================================================
                NOTIFICATION BELL
            ================================================== */}

            <Link
              to="/member/notifications"
              aria-label={
                unreadCount > 0
                  ? `${unreadCount} unread notifications`
                  : "Notifications"
              }
              title="Notifications"
              className="
                relative
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-xl
                shadow-sm
                transition
                hover:bg-slate-50
                active:scale-95
              "
            >
              <span aria-hidden="true">
                🔔
              </span>

              {!notificationLoading &&
                unreadCount > 0 && (
                  <span
                    className="
                      absolute
                      -right-1.5
                      -top-1.5
                      flex
                      h-5
                      min-w-5
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      border-white
                      bg-red-500
                      px-1
                      text-[10px]
                      font-bold
                      leading-none
                      text-white
                      shadow-sm
                    "
                  >
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
            </Link>
             {/* =================================================
                 THEME TOGGLE
                ================================================= */}

<button
  type="button"
  onClick={toggleTheme}
  aria-label={
    isDark
      ? "Switch to light mode"
      : "Switch to dark mode"
  }
  title={
    isDark
      ? "Switch to light mode"
      : "Switch to dark mode"
  }
  className="
    flex
    h-11
    w-11
    shrink-0
    items-center
    justify-center
    rounded-xl
    border
    border-slate-200
    bg-white
    text-slate-700
    shadow-sm
    transition
    hover:bg-slate-50
    active:scale-95
    dark:border-slate-700
    dark:bg-slate-800
    dark:text-slate-200
    dark:hover:bg-slate-700
  "
>
  {isDark ? (
    <SunIcon className="h-6 w-6" />
  ) : (
    <MoonIcon className="h-6 w-6" />
  )}
</button>

            {/* =================================================
                HAMBURGER
            ================================================== */}

            <button
              type="button"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={mobileMenuOpen}
              onClick={() =>
                setMobileMenuOpen(
                  (previous) => !previous
                )
              }
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-700
                shadow-sm
                transition
                hover:bg-slate-50
                active:scale-95
              "
            >
              {mobileMenuOpen ? (
                <span className="text-2xl leading-none">
                  ×
                </span>
              ) : (
                <span className="text-2xl leading-none">
                  ☰
                </span>
              )}
            </button>

          </div>

        </div>
      </header>

      {/* =================================================
          MOBILE OVERLAY
      ================================================== */}

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeMobileMenu}
          className="
            fixed
            inset-0
            z-[210]
            bg-slate-900/40
            md:hidden
          "
        />
      )}

      {/* =================================================
          MOBILE DRAWER
      ================================================== */}

      <aside
        className={`
          fixed
          bottom-0
          left-0
          top-0
          z-[220]
          w-[min(320px,85vw)]
          overflow-y-auto
          border-r
          border-slate-200
          bg-white
          transition-colors
          dark:border-slate-700
          dark:bg-slate-900
          shadow-2xl
          transition-transform
          duration-300
          ease-out
          md:hidden
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
        aria-label="Member navigation menu"
      >

        {/* DRAWER HEADER */}

        <div
  className="
    flex
    h-16
    items-center
    justify-between
    border-b
    border-slate-200
    px-5
    dark:border-slate-700
  "
>

          <div>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              YIZ-AMS
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Member Navigation
            </p>
          </div>

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close navigation"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              text-2xl
              text-slate-500
              hover:bg-slate-100
              hover:text-slate-800
              dark:text-slate-400
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
          >
            ×
          </button>

        </div>

        {/* NAVIGATION LINKS */}

        <div className="p-4">

          <p className="mb-3 px-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Menu
          </p>

          <nav className="space-y-2">

            {allNavItems.map((item) => {
              const active =
                isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={`
                    flex
                    min-h-[64px]
                    w-full
                    items-center
                    gap-4
                    rounded-xl
                    border
                    px-4
                    py-3
                    transition

                    ${
                      active
                        ? "border-[#0077B6] bg-[#0077B6] text-white shadow-sm"
                        : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-sky-50 hover:text-[#0077B6] dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-[#00B4D8]"
                    }
                  `}
                >

                  {/* ICON */}

                  <div
                    className={`
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      text-xl

                      ${
                        active
                          ? "bg-blue-100 dark:bg-blue-900/50"
                          : "bg-slate-100 dark:bg-slate-800"
                      }
                    `}
                  >
                    <span aria-hidden="true">
                      {item.icon}
                    </span>
                  </div>

                  {/* TEXT */}

                  <div className="min-w-0 flex-1">

                    <p
                      className={`
                        text-sm
                        font-bold

                        ${
                          active
                          ? "text-white"
                          : "text-slate-600 dark:text-slate-300"
                        }
                      `}
                    >
                      {item.mobileTitle}
                    </p>

                    <p
  className={`mt-0.5 text-xs ${
    active
      ? "text-sky-100"
      : "text-slate-500 dark:text-slate-400"
  }`}
>
                      {item.description}
                    </p>

                  </div>

                  {/* ARROW */}

                  <span
                    className={`
                      shrink-0
                      text-lg

                      ${
                        active
                          ? "text-blue-600"
                          : "text-slate-300 dark:text-slate-600"
                      }
                    `}
                  >
                    →
                  </span>

                </Link>
              );
            })}

          </nav>

        </div>

      </aside>

      {/* =================================================
          DESKTOP NAVIGATION
          Existing navigation preserved
          Visible md and above
      ================================================== */}

      <nav
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-[100]
          hidden
          border-t
          border-slate-200
          bg-white/95
          shadow-[0_-6px_25px_rgba(15,23,42,0.10)]
          backdrop-blur-md
          md:block
        "
        aria-label="Member navigation"
      >

        <div className="mx-auto max-w-7xl px-2 sm:px-4">

          <div
            className={`
              flex
              items-stretch
              justify-center

              ${
                isDashboard
                  ? "gap-0.5 sm:gap-2"
                  : "gap-1 sm:gap-3"
              }
            `}
          >

            {visibleNavItems.map((item) => {
              const active =
                isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={`
                    group
                    relative
                    flex
                    min-w-0
                    flex-1
                    flex-col
                    items-center
                    justify-center
                    px-1
                    py-2.5
                    transition-all
                    duration-200
                    sm:flex-row
                    sm:gap-2
                    sm:px-4
                    sm:py-3

                    ${
                      active
                        ? "text-blue-700"
                        : "text-slate-500 hover:text-blue-600"
                    }
                  `}
                >

                  {/* ICON */}

                  <div
                    className={`
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      text-lg
                      transition-all
                      duration-200

                      ${
                        active
                          ? "bg-blue-100 shadow-sm"
                          : "bg-slate-100 group-hover:bg-blue-50"
                      }
                    `}
                  >
                    <span aria-hidden="true">
                      {item.icon}
                    </span>
                  </div>

                  {/* TEXT */}

                  <div className="min-w-0 text-center sm:text-left">

                    <p
                      className={`
                        truncate
                        text-[11px]
                        font-bold
                        sm:text-sm

                        ${
                          active
                            ? "text-blue-700"
                            : "text-slate-700"
                        }
                      `}
                    >
                      {item.title}
                    </p>

                    <p className="hidden text-[11px] text-slate-400 sm:block">
                      {item.description}
                    </p>

                  </div>

                  {/* ACTIVE INDICATOR */}

                  {active && (
                    <span
                      className="
                        absolute
                        bottom-0
                        h-1
                        w-10
                        rounded-t-full
                        bg-blue-600
                        sm:w-14
                      "
                    />
                  )}

                </Link>
              );
            })}

          </div>

        </div>
      </nav>

      {/* =================================================
          MOBILE TOP SPACING
      ================================================== */}

      <div
        className="h-16 md:hidden"
        aria-hidden="true"
      />

      {/* =================================================
          DESKTOP BOTTOM SPACING
      ================================================== */}

      <div
        className="hidden h-20 md:block"
        aria-hidden="true"
      />

    </>
  );
}