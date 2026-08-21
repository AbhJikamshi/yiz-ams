import {
  BellIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

import { useTheme } from "../../contexts/ThemeContext";

const Header = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();

  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isDark = theme === "dark";

  return (
    <header
      className="
        sticky top-0 z-30
        flex min-h-16 items-center justify-between
        border-b border-slate-200
        bg-white
        px-4 py-3
        shadow-sm
        transition-colors
        dark:border-slate-700
        dark:bg-slate-900
        sm:px-5
        md:px-6
      "
    >

      {/* =====================================================
          LEFT SIDE
      ===================================================== */}

      <div className="flex min-w-0 items-center gap-3">

        {/* Mobile hamburger */}

        <button
          type="button"
          onClick={onMenuClick}
          className="
            rounded-lg p-2
            text-slate-600
            transition
            hover:bg-slate-100
            hover:text-slate-900
            dark:text-slate-300
            dark:hover:bg-slate-800
            dark:hover:text-white
            md:hidden
          "
          aria-label="Open menu"
        >
          <Bars3Icon className="h-7 w-7" />
        </button>

        {/* Search */}

        <div className="relative hidden sm:block">

          <MagnifyingGlassIcon
            className="
              absolute left-3 top-1/2
              h-5 w-5
              -translate-y-1/2
              text-slate-400
              dark:text-slate-500
            "
          />

          <input
            type="text"
            placeholder="Search..."
            className="
              w-56
              rounded-lg
              border border-slate-200
              bg-white
              py-2.5 pl-10 pr-4
              text-sm
              text-slate-800
              outline-none
              transition
              placeholder:text-slate-400
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-500/20
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-slate-100
              dark:placeholder:text-slate-500
              md:w-72
              lg:w-80
            "
          />

        </div>

      </div>

      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="flex shrink-0 items-center gap-2 sm:gap-4 md:gap-6">

        {/* Date */}

        <span
          className="
            hidden
            text-sm
            text-slate-500
            dark:text-slate-400
            lg:block
          "
        >
          {today}
        </span>

        {/* ===================================================
            NOTIFICATIONS
        =================================================== */}

        <button
          type="button"
          className="
            relative
            rounded-lg p-2
            text-slate-600
            transition
            hover:bg-slate-100
            dark:text-slate-300
            dark:hover:bg-slate-800
          "
          aria-label="Notifications"
        >
          <BellIcon className="h-6 w-6" />

          <span
            className="
              absolute
              right-1.5 top-1.5
              h-2.5 w-2.5
              rounded-full
              bg-red-500
            "
          />
        </button>

        {/* ===================================================
            THEME TOGGLE
        =================================================== */}

        <button
          type="button"
          onClick={toggleTheme}
          className="
            flex
            items-center
            justify-center
            rounded-lg
            p-2
            text-slate-600
            transition
            hover:bg-slate-100
            hover:text-slate-900
            dark:text-slate-300
            dark:hover:bg-slate-800
            dark:hover:text-white
          "
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
        >
          {isDark ? (
            <SunIcon className="h-6 w-6" />
          ) : (
            <MoonIcon className="h-6 w-6" />
          )}
        </button>

        {/* ===================================================
            ADMINISTRATOR
        =================================================== */}

        <div className="flex items-center gap-2 sm:gap-3">

          <div
            className="
              flex
              h-10 w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-blue-600
              text-sm
              font-bold
              text-white
              sm:h-11 sm:w-11
            "
          >
            A
          </div>

          <div className="hidden sm:block">

            <h4
              className="
                text-sm
                font-semibold
                text-slate-900
                dark:text-slate-100
              "
            >
              Administrator
            </h4>

            <p
              className="
                text-xs
                text-slate-500
                dark:text-slate-400
              "
            >
              System Admin
            </p>

          </div>

        </div>

      </div>

    </header>
  );
};

export default Header;