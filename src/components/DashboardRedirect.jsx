import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ROLES, ROUTES } from "@/constants/appConstants";

export function DashboardRedirect() {
  const { user } = useAuthStore();

  if (!user) return <Navigate to={ROUTES.login} replace />;

  const redirectMap = {
    [ROLES.ADMIN]: ROUTES.adminDashboard,
    [ROLES.DOCTOR]: ROUTES.doctorDashboard,
    [ROLES.RECEPTIONIST]: ROUTES.receptionistDashboard,
    [ROLES.PATIENT]: ROUTES.patientDashboard,
  };

  return <Navigate to={redirectMap[user.role] || ROUTES.login} replace />;
}
