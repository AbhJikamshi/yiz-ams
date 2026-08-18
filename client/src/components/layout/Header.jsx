import {
  BellIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

const Header = ({ onMenuClick }) => {
  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b bg-white px-4 py-3 shadow-sm sm:px-5 md:px-6">

      {/* Left side */}
      <div className="flex min-w-0 items-center gap-3">

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onMenuClick}
          className="
            rounded-lg p-2
            text-slate-600
            hover:bg-slate-100
            hover:text-slate-900
            md:hidden
          "
          aria-label="Open menu"
        >
          <Bars3Icon className="h-7 w-7" />
        </button>

        {/* Search */}
        <div className="relative hidden sm:block">

          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Search..."
            className="
              w-56 rounded-lg border
              py-2.5 pl-10 pr-4
              text-sm
              outline-none
              transition
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-500/20
              md:w-72
              lg:w-80
            "
          />

        </div>

      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4 md:gap-6">

        {/* Date - hidden on small screens */}
        <span className="hidden text-sm text-slate-500 lg:block">
          {today}
        </span>

        {/* Notifications */}
        <button
          type="button"
          className="
            relative rounded-lg p-2
            text-slate-600
            hover:bg-slate-100
          "
          aria-label="Notifications"
        >
          <BellIcon className="h-6 w-6" />

          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500" />
        </button>

        {/* Dark mode */}
        <button
          type="button"
          className="
            hidden rounded-lg p-2
            text-slate-600
            hover:bg-slate-100
            sm:block
          "
          aria-label="Toggle dark mode"
        >
          <MoonIcon className="h-6 w-6" />
        </button>

        {/* Administrator */}
        <div className="flex items-center gap-2 sm:gap-3">

          <div className="
            flex h-10 w-10
            shrink-0 items-center justify-center
            rounded-full bg-blue-600
            text-sm font-bold text-white
            sm:h-11 sm:w-11
          ">
            A
          </div>

          <div className="hidden sm:block">

            <h4 className="text-sm font-semibold text-slate-900">
              Administrator
            </h4>

            <p className="text-xs text-slate-500">
              System Admin
            </p>

          </div>

        </div>

      </div>

    </header>
  );
};

export default Header;