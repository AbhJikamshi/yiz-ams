import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
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

      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold">
          YIZ-AMS
        </h1>

        <p className="text-sm text-slate-400">
          Association Management
        </p>
      </div>

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
                    ? "bg-blue-600"
                    : "hover:bg-slate-800"
                }`
              }
            >
              <Icon className="h-6 w-6" />

              {item.name}
            </NavLink>
          );

        })}

      </nav>

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
            hover:bg-red-600
            transition
          "
        >
          <ArrowLeftOnRectangleIcon className="h-6 w-6" />

          Logout
        </button>

      </div>

    </aside>
  );
};

export default Sidebar;