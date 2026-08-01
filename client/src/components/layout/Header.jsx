import {
  BellIcon,
  MagnifyingGlassIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";

const Header = () => {
  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">

      <div className="flex items-center gap-4">

        <div className="relative">

          <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />

          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
          />

        </div>

      </div>

      <div className="flex items-center gap-6">

        <span className="text-gray-500 text-sm">
          {today}
        </span>

        <button className="relative">

          <BellIcon className="h-6 w-6 text-gray-600" />

          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-2 w-2"></span>

        </button>

        <button>

          <MoonIcon className="h-6 w-6 text-gray-600" />

        </button>

        <div className="flex items-center gap-3">

          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            A
          </div>

          <div>

            <h4 className="font-semibold">
              Administrator
            </h4>

            <p className="text-xs text-gray-500">
              System Admin
            </p>

          </div>

        </div>

      </div>

    </header>
  );
};

export default Header;