import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard/Dashboard";
import Members from "../pages/Members/Members";
import Contributions from "../pages/Contributions/Contributions";
import Expenses from "../pages/Expenses/Expenses";
import Reports from "../pages/Reports/Reports";
import Settings from "../pages/Settings/Settings";
import Login from "../pages/Login/Login";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/contributions" element={<Contributions />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;