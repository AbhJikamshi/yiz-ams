import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100">

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">

        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-5 md:p-6">
          {children}
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;