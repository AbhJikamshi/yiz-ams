import { NavLink, useNavigate } from "react-router-dom";
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
    path: "/",
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
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });

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
          bg-slate-900 text-white
          shadow-2xl
          transition-transform duration-300 ease-in-out

          md:static
          md:z-auto
          md:w-64
          md:translate-x-0
          md:shadow-none

          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* Logo */}
        <div className="flex items-center justify-between border-b border-slate-700 p-5 sm:p-6">

          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              YIZ-AMS
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Association Management
            </p>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg p-2
              text-slate-300
              hover:bg-slate-800
              hover:text-white
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
                  `flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
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
        <div className="border-t border-slate-700 p-3 sm:p-4">

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex w-full items-center gap-3
              rounded-xl px-4 py-3.5
              text-base font-medium
              text-slate-300
              transition
              hover:bg-red-600
              hover:text-white
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