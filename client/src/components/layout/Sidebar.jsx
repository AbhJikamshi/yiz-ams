import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  MegaphoneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "../../contexts/AuthContext";

const menu = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: HomeIcon,
  },
  {
    name: "Members",
    path: "/members",
    icon: UsersIcon,
  },
  {
    name: "Contributions",
    path: "/contributions",
    icon: CurrencyDollarIcon,
  },
  {
    name: "Payment Verification",
    path: "/payment-verification",
    icon: CheckBadgeIcon,
  },
  {
    name: "Announcements",
    path: "/announcements",
    icon: MegaphoneIcon,
  },
  {
    name: "Expenses",
    path: "/expenses",
    icon: BanknotesIcon,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: DocumentChartBarIcon,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Cog6ToothIcon,
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.replace("/");
    onClose?.();
  };

  const handleNavigation = () => {
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-40 bg-slate-950/60
          transition-opacity duration-300
          md:hidden
          ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}
        `}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-72 flex-col
          
          bg-white text-[var(--text-primary)]
          border-r border-[var(--border)]
          shadow-xl
          
          transition-all duration-300 ease-in-out

          dark:bg-slate-900
          dark:text-slate-100
          dark:border-slate-700

          md:static
          md:z-auto
          md:w-64
          md:translate-x-0
          md:shadow-none

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* Logo */}
        <div
          className="
            flex items-center justify-between
            border-b border-[var(--border)]
            p-5 sm:p-6
            dark:border-slate-700
          "
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] dark:text-white">
              YIZ-AMS
            </h1>

            <p className="mt-1 text-sm text-[var(--text-muted)] dark:text-slate-400">
              Association Management
            </p>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg p-2
              text-[var(--text-secondary)]
              hover:bg-[var(--accent-bg)]
              hover:text-[var(--accent)]
              dark:text-slate-300
              dark:hover:bg-slate-800
              dark:hover:text-white
              md:hidden
            "
            aria-label="Close menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto p-3 sm:p-4">

          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--accent-bg)] text-[var(--accent)] shadow-sm dark:bg-blue-900/40 dark:text-blue-400"
                      : "text-[var(--text-secondary)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent)] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`
                }
              >
                <Icon className="h-6 w-6 shrink-0" />

                <span>{item.name}</span>
              </NavLink>
            );
          })}

        </nav>

        {/* Logout */}
        <div
          className="
            border-t border-[var(--border)]
            p-3 sm:p-4
            dark:border-slate-700
          "
        >
          <button
            type="button"
            onClick={handleLogout}
            className="
              flex w-full items-center gap-3
              rounded-xl px-4 py-3.5
              text-base font-medium
              text-[var(--text-secondary)]
              transition-all duration-200
              hover:bg-red-50
              hover:text-red-600
              dark:text-slate-300
              dark:hover:bg-red-600
              dark:hover:text-white
            "
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6 shrink-0" />

            <span>Logout</span>
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;