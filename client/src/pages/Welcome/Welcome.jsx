import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white shadow-sm">
              Y
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                YIZ-AMS
              </h1>

              <p className="text-xs text-slate-500">
                Ya Isa Zama Association
              </p>
            </div>
          </Link>

          <Link
            to="/login"
            className="rounded-xl border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            Login
          </Link>

        </div>
      </header>

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <main>

        <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">

          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">

            <div className="mx-auto max-w-3xl text-center text-white">

              {/* LOGO */}

              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-3xl font-extrabold text-blue-700 shadow-xl">
                Y
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
                Ya Isa Zama Association
              </p>

              <h2 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Association Management System
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
                Manage your membership, contributions, payments,
                statements and association activities in one secure
                and convenient platform.
              </p>

              {/* ACTIONS */}

              <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-blue-700 shadow-lg transition hover:bg-blue-50 hover:shadow-xl"
                >
                  🔐 Login
                </Link>

                <Link
                  to="/member/login"
                  className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  👤 Member Login
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  📝 Create Account
                </Link>

              </div>

            </div>

          </div>
        </section>

        {/* ================================================= */}
        {/* FEATURES */}
        {/* ================================================= */}

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-2xl text-center">

            <h3 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Everything you need in one place
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              YIZ-AMS makes association administration and member
              contribution management simple and transparent.
            </p>

          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {/* CONTRIBUTIONS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
                💰
              </div>

              <h4 className="mt-5 font-bold text-slate-900">
                Contributions
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Track monthly contributions and outstanding balances
                with ease.
              </p>

            </div>

            {/* PAYMENTS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                💳
              </div>

              <h4 className="mt-5 font-bold text-slate-900">
                Easy Payments
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Submit contribution payments and payment proofs
                directly from your account.
              </p>

            </div>

            {/* STATEMENTS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl">
                📄
              </div>

              <h4 className="mt-5 font-bold text-slate-900">
                Statements
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                View your contribution history and financial
                statements whenever you need them.
              </p>

            </div>

            {/* MANAGEMENT */}

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-2xl">
                📊
              </div>

              <h4 className="mt-5 font-bold text-slate-900">
                Administration
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Powerful tools for managing members, payments,
                expenses and association finances.
              </p>

            </div>

          </div>

        </section>

        {/* ================================================= */}
        {/* LOGIN / ACCOUNT SECTION */}
        {/* ================================================= */}

        <section className="border-t border-slate-200 bg-white">

          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">

            <div className="rounded-3xl bg-slate-900 p-8 text-center shadow-xl sm:p-12">

              <h3 className="text-2xl font-bold text-white sm:text-3xl">
                Ready to manage your association?
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Sign in to your existing account or create a new
                member account to get started.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                <Link
                  to="/login"
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Login
                </Link>

                <Link
                  to="/member/login"
                  className="rounded-xl border border-slate-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Member Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Create Account
                </Link>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="border-t border-slate-200 bg-slate-50">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:px-6 lg:px-8">

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} YIZ-AMS. All rights reserved.
          </p>

          <p className="text-xs text-slate-400">
            Ya Isa Zama Association Management System
          </p>

        </div>

      </footer>

    </div>
  );
}