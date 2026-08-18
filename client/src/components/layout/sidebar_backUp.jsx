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
} from "@heroicons/react/24/outline";

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

const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">
          YIZ-AMS
        </h1>

        <p className="text-sm text-slate-400">
          Association Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">

        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon className="h-6 w-6" />

              <span>{item.name}</span>
            </NavLink>
          );
        })}

      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">

        <button
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-lg
            px-4
            py-3
            text-slate-300
            hover:bg-red-600
            hover:text-white
            transition
          "
        >
          <ArrowLeftOnRectangleIcon className="h-6 w-6" />

          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
};

export default Sidebar;