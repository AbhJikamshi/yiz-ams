import { Navigate } from "react-router-dom";
import { useMemberAuth } from "../contexts/MemberAuthContext";
import MemberNavigation from "../components/members/MemberNavigation";

const MemberProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useMemberAuth();

  // ========================================
  // CHECKING MEMBER SESSION
  // ========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

          <p className="text-sm font-medium text-slate-600">
            Loading member session...
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // NOT AUTHENTICATED
  // ========================================

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/member/login"
        replace
      />
    );
  }

  // ========================================
  // AUTHENTICATED MEMBER
  // ========================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* PAGE CONTENT */}

      <main>
        {children}
      </main>

      {/* ========================================
          MEMBER NAVIGATION
      ======================================== */}

      <MemberNavigation />

    </div>
  );
};

export default MemberProtectedRoute;