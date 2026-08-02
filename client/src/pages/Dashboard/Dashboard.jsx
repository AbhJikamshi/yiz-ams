import DashboardLayout from "../../components/layout/DashboardLayout";
import DashboardCard from "../../components/dashboard/DashboardCard";

import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "../../services/dashboardService";

const Dashboard = () => {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">
          Dashboard
        </h1>

        <p>Loading dashboard...</p>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">
          Dashboard
        </h1>

        <p className="text-red-600">
          Unable to load dashboard.
        </p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        <DashboardCard
          title="Members"
          value={data.totalMembers}
        />

        <DashboardCard
          title="Expected Contributions"
          value={`₦${data.expectedContributions}`}
        />

        <DashboardCard
          title="Received Contributions"
          value={`₦${data.totalContributions}`}
        />

        <DashboardCard
          title="Total Expenses"
          value={`₦${data.totalExpenses}`}
        />

        <DashboardCard
          title="Available Balance"
          value={`₦${data.availableBalance}`}
        />

      </div>

    </DashboardLayout>
  );
};

export default Dashboard;