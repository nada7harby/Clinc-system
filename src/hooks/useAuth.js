import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/mockApi";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ROLES, ROUTES } from "@/constants/appConstants";

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ token, user }) => {
      login(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      // Role-based redirect
      const redirectMap = {
        [ROLES.ADMIN]: ROUTES.adminDashboard,
        [ROLES.DOCTOR]: ROUTES.doctorDashboard,
        [ROLES.RECEPTIONIST]: ROUTES.receptionistDashboard,
        [ROLES.PATIENT]: ROUTES.patientDashboard,
      };
      navigate(redirectMap[user.role] || ROUTES.dashboard);
    },
    onError: (err) => toast.error(err.message || "Login failed."),
  });
}

export function useRegister() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ token, user }) => {
      login(user, token);
      toast.success("Account created successfully!");
      navigate(ROUTES.patientDashboard);
    },
    onError: (err) => toast.error(err.message || "Registration failed."),
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return () => {
    logout();
    toast.success("Logged out successfully.");
    navigate(ROUTES.login);
  };
}
