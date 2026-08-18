import { Routes, Route } from "react-router-dom";
import Welcome from "../pages/Welcome/Welcome";
import CreateAccount from "../pages/CreateAccount/CreateAccount";

// =========================
// Admin Pages
// =========================
import Dashboard from "../pages/Dashboard/Dashboard";
import Members from "../pages/Members/Members";
import Contributions from "../pages/Contributions/Contributions";
import Expenses from "../pages/Expenses/Expenses";
import Reports from "../pages/Reports/Reports";
import Settings from "../pages/Settings/Settings";
import Announcements from "../pages/Announcements/Announcements";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import PaymentVerification from "../pages/Treasurer/PaymentVerification";


// =========================
// Member Pages
// =========================
import MemberLogin from "../pages/Members/MemberLogin";
import MemberDashboard from "../pages/Members/MemberDashboard";
import MemberPaymentPage from "../pages/Members/MemberPaymentPage";
import MemberPaymentHistory from "../pages/Members/MemberPaymentHistory";
import MemberStatement from "../pages/Members/MemberStatement";
import MemberProfile from "../pages/Members/MemberProfile";
import MemberNotifications from "../pages/Members/MemberNotifications";

// =========================
// Route Guards
// =========================
import ProtectedRoute from "./ProtectedRoute";
import MemberProtectedRoute from "./MemberProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ========================= */}
      {/* Public Routes */}
      {/* ========================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
         path="/create-account"
         element={<CreateAccount />}
      />
<Route
  path="/register"
  element={<Register />}
/>
      <Route
        path="/member/login"
        element={<MemberLogin />}
      />

      {/* ========================= */}
      {/* Admin Routes */}
      {/* ========================= */}

     <Route
  path="/"
  element={<Welcome />}
/>
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
      <Route
        path="/members"
        element={
          <ProtectedRoute>
            <Members />
          </ProtectedRoute>
        }
      />

      <Route
        path="/contributions"
        element={
          <ProtectedRoute>
            <Contributions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

        <Route
         path="/announcements"
         element={
          <ProtectedRoute>
           <Announcements />
         </ProtectedRoute>
        }
      />

      <Route
        path="/payment-verification"
        element={
          <ProtectedRoute>
            <PaymentVerification />
          </ProtectedRoute>
        }
      />

      {/* ========================= */}
      {/* Member Routes */}
      {/* ========================= */}

      <Route
        path="/member/dashboard"
        element={
          <MemberProtectedRoute>
            <MemberDashboard />
          </MemberProtectedRoute>
        }
      />

      <Route
        path="/member/payments"
        element={
          <MemberProtectedRoute>
            <MemberPaymentPage />
          </MemberProtectedRoute>
        }
      />

      <Route
        path="/member/payment-history"
        element={
          <MemberProtectedRoute>
            <MemberPaymentHistory />
          </MemberProtectedRoute>
        }
      />

      <Route
        path="/member/statement"
        element={
          <MemberProtectedRoute>
            <MemberStatement />
          </MemberProtectedRoute>
        }
      />

      <Route
        path="/member/profile"
        element={
          <MemberProtectedRoute>
            <MemberProfile />
          </MemberProtectedRoute>
        }
      />

      <Route
        path="/member/notifications"
        element={
          <MemberProtectedRoute>
            <MemberNotifications />
          </MemberProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
