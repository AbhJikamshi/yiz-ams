import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "../../components/layout/DashboardLayout";
import api from "../../services/api";

const NGN = "₦";

const formatCurrency = (amount = 0) => {
  return `${NGN}${Number(amount).toLocaleString("en-NG")}`;
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getMonthName = (monthNumber) => {
  const month = Number(monthNumber);

  if (month >= 1 && month <= 12) {
    return monthNames[month - 1];
  }

  return monthNumber || "-";
};

const statusClasses = {
  PAID: "bg-emerald-100 text-emerald-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  OVERDUE: "bg-red-100 text-red-700",
  REJECTED: "bg-red-100 text-red-700",
};

const Contributions = () => {
  const {
    data: contributions = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-contributions"],
    queryFn: async () => {
      const response = await api.get("/contributions");

      return Array.isArray(response.data?.data)
        ? response.data.data
        : [];
    },
  });

  const summary = useMemo(() => {
    return contributions.reduce(
      (summary, contribution) => {
        const amount = Number(contribution.amount || 0);
        const status = String(
          contribution.status || ""
        ).toUpperCase();

        summary.total += amount;

        if (
          status === "PAID" ||
          status === "APPROVED"
        ) {
          summary.paid += amount;
        }

        if (status === "PENDING") {
          summary.pending += amount;
        }

        if (status === "OVERDUE") {
          summary.overdue += amount;
        }

        return summary;
      },
      {
        total: 0,
        paid: 0,
        pending: 0,
        overdue: 0,
      }
    );
  }, [contributions]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-3 text-sm text-slate-500">
              Loading contributions...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-700">
              Unable to load contributions
            </h2>

            <p className="mt-1 text-sm text-red-600">
              Please check your connection and try again.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Contributions
          </h1>

          <p className="mt-2 text-slate-500">
            Manage and monitor member monthly contributions.
          </p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

          {/* TOTAL */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Contributions
            </p>

            <p className="mt-3 text-3xl font-bold text-slate-900">
              {formatCurrency(summary.total)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              All recorded contributions
            </p>
          </div>

          {/* PAID */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Paid
            </p>

            <p className="mt-3 text-3xl font-bold text-emerald-600">
              {formatCurrency(summary.paid)}
            </p>

            <p className="mt-2 text-sm text-emerald-600">
              Completed contributions
            </p>
          </div>

          {/* PENDING */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Pending
            </p>

            <p className="mt-3 text-3xl font-bold text-amber-600">
              {formatCurrency(summary.pending)}
            </p>

            <p className="mt-2 text-sm text-amber-600">
              Awaiting payment
            </p>
          </div>

          {/* OVERDUE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Overdue
            </p>

            <p className="mt-3 text-3xl font-bold text-red-600">
              {formatCurrency(summary.overdue)}
            </p>

            <p className="mt-2 text-sm text-red-600">
              Outstanding contributions
            </p>
          </div>

        </div>

        {/* CONTRIBUTIONS TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TABLE HEADER */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                All Contributions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {contributions.length} contribution
                {contributions.length !== 1 ? "s" : ""} recorded
              </p>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>

          </div>

          {/* EMPTY STATE */}
          {contributions.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                <span className="text-2xl text-slate-500">
                  ₦
                </span>
              </div>

              <h3 className="mt-4 font-semibold text-slate-800">
                No contributions found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Contributions recorded for members will appear here.
              </p>

            </div>
          ) : (

            /* TABLE */
            <div className="overflow-x-auto">

              <table className="min-w-full divide-y divide-slate-200">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Member
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Period
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Payment Date
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">

                  {contributions.map((contribution) => {

                    const memberName =
                      contribution.member?.fullName ||
                      contribution.member?.name ||
                      "Unknown Member";

                    const status = String(
                      contribution.status || "PENDING"
                    ).toUpperCase();

                    return (
                      <tr
                        key={contribution.id}
                        className="transition hover:bg-slate-50"
                      >

                        {/* MEMBER */}
                        <td className="whitespace-nowrap px-6 py-4">

                          <p className="font-semibold text-slate-800">
                            {memberName}
                          </p>

                          {contribution.member
                            ?.membershipNumber && (
                            <p className="mt-1 text-xs text-slate-400">
                              {
                                contribution.member
                                  .membershipNumber
                              }
                            </p>
                          )}

                        </td>

                        {/* PERIOD */}
                        <td className="whitespace-nowrap px-6 py-4">

                          <p className="font-medium text-slate-700">
                            {getMonthName(
                              contribution.monthNumber
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {contribution.year || "-"}
                          </p>

                        </td>

                        {/* AMOUNT */}
                        <td className="whitespace-nowrap px-6 py-4">

                          <p className="font-bold text-slate-900">
                            {formatCurrency(
                              contribution.amount
                            )}
                          </p>

                        </td>

                        {/* PAYMENT DATE */}
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                          {formatDate(
                            contribution.paymentDate
                          )}
                        </td>

                        {/* STATUS */}
                        <td className="whitespace-nowrap px-6 py-4">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              statusClasses[status] ||
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {status}
                          </span>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Contributions;