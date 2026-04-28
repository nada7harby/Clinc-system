import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants/appConstants";

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (isAuthenticated) {
    // Basic redirect map for already logged in users
    const dashboardMap = {
      admin: ROUTES.adminDashboard,
      doctor: ROUTES.doctorDashboard,
      receptionist: ROUTES.receptionistDashboard,
      patient: ROUTES.patientDashboard,
    };
    return <Navigate to={dashboardMap[user?.role] || ROUTES.dashboard} replace />;
  }

  return children;
}
