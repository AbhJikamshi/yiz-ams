import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  DocumentTextIcon,
  BellIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "../../contexts/AuthContext";

const menu = [
  {
    name: "Dashboard",
    path: "/member/dashboard",
    icon: HomeIcon,
  },
  {
    name: "My Contributions",
    path: "/member/contributions",
    icon: CurrencyDollarIcon,
  },
  {
    name: "Make Payment",
    path: "/member/payments",
    icon: CurrencyDollarIcon,
  },
  {
    name: "Payment History",
    path: "/member/payment-history",
    icon: ClockIcon,
  },
  {
    name: "Statements",
    path: "/member/statements",
    icon: DocumentTextIcon,
  },
  {
    name: "Notifications",
    path: "/member/notifications",
    icon: BellIcon,
  },
  {
    name: "My Profile",
    path: "/member/profile",
    icon: UserCircleIcon,
  },
];

const MemberMenu = ({
  isOpen,
  onClose,
  memberName = "Member",
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();

    onClose?.();

    navigate("/");
  };

  const handleNavigation = () => {
    onClose?.();
  };

  const initial =
    memberName?.charAt(0)?.toUpperCase() || "M";

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-40
          bg-slate-950/60
          backdrop-blur-sm
          transition-opacity duration-300
          md:hidden
          ${
            isOpen
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* =====================================================
          MEMBER MENU
      ===================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-72 flex-col
          bg-white
          shadow-2xl
          transition-transform duration-300 ease-in-out
          dark:bg-slate-900

          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          md:hidden
        `}
      >

        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            px-5
            py-5
            dark:border-slate-700
          "
        >

          <div className="flex items-center gap-3">

            {/* MEMBER AVATAR */}

            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#0077B6]
                text-sm
                font-bold
                text-white
                shadow-sm
              "
            >
              {initial}
            </div>

            {/* MEMBER INFO */}

            <div className="min-w-0">

              <p
                className="
                  truncate
                  text-sm
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                {memberName}
              </p>

              <p
                className="
                  mt-0.5
                  text-xs
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Association Member
              </p>

            </div>

          </div>

          {/* CLOSE */}

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              p-2
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-900
              dark:text-slate-400
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
            aria-label="Close member menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

        </div>

        {/* ===================================================
            NAVIGATION
        =================================================== */}

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">

          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={handleNavigation}
                className={({ isActive }) =>
                  `
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    transition

                    ${
                      isActive
                        ? "bg-[#0077B6] text-white shadow-sm"
                        : `
                          text-slate-600
                          hover:bg-sky-50
                          hover:text-[#0077B6]
                          dark:text-slate-300
                          dark:hover:bg-slate-800
                          dark:hover:text-[#00B4D8]
                        `
                    }
                  `
                }
              >
                <Icon className="h-5 w-5 shrink-0" />

                <span>{item.name}</span>
              </NavLink>
            );
          })}

        </nav>

        {/* ===================================================
            LOGOUT
        =================================================== */}

        <div
          className="
            border-t
            border-slate-200
            p-4
            dark:border-slate-700
          "
        >

          <button
            type="button"
            onClick={handleLogout}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-4
              py-3
              text-sm
              font-semibold
              text-slate-600
              transition
              hover:bg-red-50
              hover:text-red-600
              dark:text-slate-300
              dark:hover:bg-red-950/30
              dark:hover:text-red-400
            "
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 shrink-0" />

            <span>Logout</span>
          </button>

        </div>

      </aside>
    </>
  );
};

export default MemberMenu;