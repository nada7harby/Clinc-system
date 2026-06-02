import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/mockApi";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ROLES, ROUTES } from "@/constants/appConstants";
import { useTranslation } from "react-i18next";
export function useLogin() {
  const {
    t
  } = useTranslation();
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({
      token,
      user
      }) => {
      login(user, token);
      toast.success(t("hooks.useauth.welcomeBack", {
        name: user.name
      }));
      // Role-based redirect
      const redirectMap = {
        [ROLES.ADMIN]: ROUTES.adminDashboard,
        [ROLES.DOCTOR]: ROUTES.doctorDashboard,
        [ROLES.RECEPTIONIST]: ROUTES.receptionistDashboard,
        [ROLES.PATIENT]: ROUTES.patientDashboard
      };
      navigate(redirectMap[user.role] || ROUTES.dashboard);
    },
    onError: err => toast.error(err.message || t("hooks.useauth.loginFailed"))
  });
}
export function useRegister() {
  const {
    t
  } = useTranslation();
  const login = useAuthStore(s => s.login);
  const navigate = useNavigate();
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: ({
      token,
      user
    }) => {
      login(user, token);
      toast.success(t("hooks.useauth.accountCreatedSuccessfully"));
      navigate(ROUTES.patientDashboard);
    },
    onError: err => toast.error(err.message || t("hooks.useauth.registrationFailed"))
  });
}
export function useLogout() {
  const {
    t
  } = useTranslation();
  const logout = useAuthStore(s => s.logout);
  const navigate = useNavigate();
  return () => {
    logout();
    toast.success(t("hooks.useauth.loggedOutSuccessfully"));
    navigate(ROUTES.login);
  };
}
