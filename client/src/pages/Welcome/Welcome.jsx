import { Link } from "react-router-dom";

import {
  CurrencyDollarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function Welcome() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">

      {/* =========================================================
          HEADER
      ========================================================= */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/90">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">

          {/* LOGO */}

          <Link
            to="/"
            className="group flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition group-hover:scale-105 dark:bg-slate-800 dark:ring-slate-700">

              <img
                src="/yiz-logo.png"
                alt="YIZ-AMS Logo"
                className="h-full w-full object-contain p-1"
              />

            </div>

            <div>

              <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                YIZ-AMS
              </h1>

              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Ya Isa Zama Association
              </p>

            </div>

          </Link>


         

        </div>

      </header>


      {/* =========================================================
          HERO
      ========================================================= */}

      <main>

        <section className="relative isolate overflow-hidden">

          {/* BACKGROUND */}

          <div className="absolute inset-0 bg-gradient-to-br from-[#023E8A] via-[#0077B6] to-[#00B4D8] dark:from-[#020617] dark:via-[#082F49] dark:to-[#075985]" />

          {/* DECORATIVE SHAPES */}

          <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="absolute right-1/4 top-1/3 h-32 w-32 rounded-full bg-blue-300/10 blur-2xl" />


          {/* HERO CONTENT */}

          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">

            <div className="mx-auto max-w-4xl text-center text-white">

              {/* LOGO */}

              <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-white p-2 shadow-2xl ring-4 ring-white/20 transition-transform duration-300 hover:scale-105 sm:h-28 sm:w-28">

                <img
                  src="/yiz-logo.png"
                  alt="Ya Isa Zama Association"
                  className="h-full w-full object-contain"
                />

              </div>


              {/* BADGE */}

              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-50 shadow-sm backdrop-blur-md">

                <SparklesIcon className="h-4 w-4" />

                Ya Isa Zama Association

              </div>


              {/* TITLE */}

              <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">

                Manage Your Association

                <span className="block text-cyan-100">
                  Smarter &amp; Simpler
                </span>

              </h2>


              {/* DESCRIPTION */}

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-blue-50 sm:text-lg sm:leading-8">

                YIZ-AMS brings members, contributions, payments,
                financial records and association activities together
                in one secure and convenient platform.

              </p>


              {/* ACTION BUTTONS */}

              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">

                {/* ADMIN LOGIN */}

                <Link
                  to="/login"
                  className="
                    inline-flex items-center justify-center gap-2
                    rounded-xl
                    bg-white
                    px-7 py-3.5
                    text-sm font-extrabold
                    text-[#0077B6]
                    shadow-xl
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:bg-blue-50
                    hover:shadow-2xl
                    active:scale-95
                  "
                >
                  <ShieldCheckIcon className="h-5 w-5" />
                  Admin Login
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>


                {/* MEMBER LOGIN */}

                <Link
                  to="/member/login"
                  className="
                    inline-flex items-center justify-center gap-2
                    rounded-xl
                    border border-white/30
                    bg-white/10
                    px-7 py-3.5
                    text-sm font-extrabold
                    text-white
                    shadow-lg
                    backdrop-blur-md
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:bg-white/20
                    hover:shadow-xl
                    active:scale-95
                  "
                >
                  <UserGroupIcon className="h-5 w-5" />
                  Member Login
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>


                {/* REGISTER */}

                <Link
                  to="/register"
                  className="
                    inline-flex items-center justify-center gap-2
                    rounded-xl
                    border border-white/30
                    bg-white/10
                    px-7 py-3.5
                    text-sm font-extrabold
                    text-white
                    backdrop-blur-md
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:bg-white/20
                    active:scale-95
                  "
                >
                  Create Account
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>

              </div>


              {/* TRUST LINE */}

              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-blue-100">

                <span className="flex items-center gap-1.5">
                  <ShieldCheckIcon className="h-4 w-4" />
                  Secure
                </span>

                <span className="hidden h-1 w-1 rounded-full bg-blue-200/60 sm:block" />

                <span className="flex items-center gap-1.5">
                  <UserGroupIcon className="h-4 w-4" />
                  Member Focused
                </span>

                <span className="hidden h-1 w-1 rounded-full bg-blue-200/60 sm:block" />

                <span className="flex items-center gap-1.5">
                  <ChartBarIcon className="h-4 w-4" />
                  Transparent
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =========================================================
            FEATURES
        ========================================================= */}

        <section className="relative bg-slate-50 py-16 transition-colors duration-300 dark:bg-slate-950 sm:py-20">

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            {/* SECTION HEADER */}

            <div className="mx-auto max-w-2xl text-center">

              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-[#0077B6] dark:bg-sky-950/60 dark:text-[#00B4D8]">

                <SparklesIcon className="h-6 w-6" />

              </div>

              <p className="mt-5 text-sm font-bold uppercase tracking-[0.16em] text-[#0077B6] dark:text-[#00B4D8]">
                Everything in one place
              </p>

              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Built for better association management
              </h3>

              <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                YIZ-AMS makes it easier to manage members,
                contributions, payments and association finances
                with clarity and transparency.
              </p>

            </div>


            {/* FEATURE CARDS */}

            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

              {/* CONTRIBUTIONS */}

              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-900">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110 dark:bg-emerald-950/50 dark:text-emerald-400">

                  <CurrencyDollarIcon className="h-6 w-6" />

                </div>

                <h4 className="mt-5 font-bold text-slate-900 dark:text-white">
                  Contributions
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Track monthly contributions, payment history
                  and outstanding balances with ease.
                </p>

              </div>


              {/* PAYMENTS */}

              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#0077B6] transition-transform duration-300 group-hover:scale-110 dark:bg-blue-950/50 dark:text-[#00B4D8]">

                  <CreditCardIcon className="h-6 w-6" />

                </div>

                <h4 className="mt-5 font-bold text-slate-900 dark:text-white">
                  Easy Payments
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Submit contribution payments and upload payment
                  proof directly from your account.
                </p>

              </div>


              {/* STATEMENTS */}

              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-900">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-transform duration-300 group-hover:scale-110 dark:bg-purple-950/50 dark:text-purple-400">

                  <DocumentTextIcon className="h-6 w-6" />

                </div>

                <h4 className="mt-5 font-bold text-slate-900 dark:text-white">
                  Statements
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  View contribution history and financial
                  statements whenever you need them.
                </p>

              </div>


              {/* ADMINISTRATION */}

              <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-orange-900">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-transform duration-300 group-hover:scale-110 dark:bg-orange-950/50 dark:text-orange-400">

                  <ChartBarIcon className="h-6 w-6" />

                </div>

                <h4 className="mt-5 font-bold text-slate-900 dark:text-white">
                  Administration
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Powerful tools for managing members, payments,
                  expenses and association finances.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =========================================================
            HOW IT WORKS
        ========================================================= */}

        <section className="border-y border-slate-200 bg-white py-16 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 sm:py-20">

          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-2xl text-center">

              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0077B6] dark:text-[#00B4D8]">
                Simple workflow
              </p>

              <h3 className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                From payment to verification
              </h3>

              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
                A simple process designed to keep association
                contributions organized and transparent.
              </p>

            </div>


            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">

              {/* STEP 1 */}

              <div className="relative text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-lg font-black text-[#0077B6] dark:bg-blue-950/60 dark:text-[#00B4D8]">
                  1
                </div>

                <h4 className="mt-5 font-bold text-slate-900 dark:text-white">
                  Submit Payment
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Members submit their monthly contribution
                  and payment proof.
                </p>

              </div>


              {/* STEP 2 */}

              <div className="relative text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-lg font-black text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                  2
                </div>

                <h4 className="mt-5 font-bold text-slate-900 dark:text-white">
                  Admin Verification
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Administrators review and verify submitted
                  payment requests.
                </p>

              </div>


              {/* STEP 3 */}

              <div className="relative text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-black text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  3
                </div>

                <h4 className="mt-5 font-bold text-slate-900 dark:text-white">
                  Record Updated
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Approved payments are reflected in the member's
                  contribution history.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =========================================================
            CALL TO ACTION
        ========================================================= */}

        <section className="bg-slate-50 py-16 transition-colors duration-300 dark:bg-slate-950 sm:py-20">

          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#023E8A] via-[#0077B6] to-[#00B4D8] p-8 text-center shadow-2xl sm:p-12">

              {/* DECORATION */}

              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

              <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-cyan-200/10 blur-3xl" />


              <div className="relative">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">

                  <ShieldCheckIcon className="h-7 w-7" />

                </div>

                <h3 className="mt-6 text-2xl font-black text-white sm:text-3xl">
                  Ready to get started?
                </h3>

                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
                  Sign in to your existing account or create a
                  member account and start managing your association
                  activities today.
                </p>


                

              </div>

            </div>

          </div>

        </section>

      </main>


      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="border-t border-slate-200 bg-white transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-7 text-center sm:flex-row sm:px-6 lg:px-8">

          <div className="flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">

              <img
                src="/yiz-logo.png"
                alt=""
                className="h-full w-full object-contain p-0.5"
              />

            </div>

            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              © {new Date().getFullYear()} YIZ-AMS
            </p>

          </div>


          <p className="text-xs text-slate-400 dark:text-slate-500">
            Ya Isa Zama Association Management System
          </p>

        </div>

      </footer>

    </div>
  );
}