import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi } from "@/api/mockApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
const QUERY_KEY = "appointments";
export function useAppointments(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => appointmentsApi.list(params),
    keepPreviousData: true,
    refetchInterval: 30000 // Poll every 30s (real-time simulation)
  });
}
export function useAppointment(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => appointmentsApi.getById(id),
    enabled: !!id
  });
}
export function useTodayAppointments(doctorId) {
  return useQuery({
    queryKey: [QUERY_KEY, "today", doctorId],
    queryFn: () => appointmentsApi.getTodayForDoctor(doctorId),
    enabled: !!doctorId,
    refetchInterval: 30000
  });
}
export function useCreateAppointment() {
  const {
    t
  } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEY]
      });
      toast.success(t("hooks.useappointments.appointmentBookedSuccessfully"));
    },
    onError: err => toast.error(err.message || t("hooks.useappointments.failedToBookAppointment"))
  });
}
export function useUpdateAppointment({
  silent = false
} = {}) {
  const {
    t
  } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data
    }) => appointmentsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEY]
      });
      if (!silent) toast.success(t("hooks.useappointments.appointmentUpdated"));
    },
    onError: err => toast.error(err.message || t("hooks.useappointments.failedToUpdateAppointment"))
  });
}
export function useCancelAppointment() {
  const {
    t
  } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: id => appointmentsApi.update(id, {
      status: "cancelled"
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEY]
      });
      toast.success(t("hooks.useappointments.appointmentCancelled"));
    },
    onError: err => toast.error(err.message || t("hooks.useappointments.failedToCancelAppointment"))
  });
}
export function useDeleteAppointment() {
  const {
    t
  } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: appointmentsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEY]
      });
      toast.success(t("hooks.useappointments.appointmentDeleted"));
    },
    onError: err => toast.error(err.message || t("hooks.useappointments.failedToDeleteAppointment"))
  });
}
export function useUpdateAppointmentStatus({
  silent = false
} = {}) {
  const {
    t
  } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status
    }) => appointmentsApi.update(id, {
      status
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEY]
      });
      if (!silent) toast.success(t("hooks.useappointments.statusUpdatedSuccessfully"));
    },
    onError: err => toast.error(err.message || t("hooks.useappointments.failedToUpdateStatus"))
  });
}
export function useUpdatePayment() {
  const {
    t
  } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      paymentStatus,
      paymentMethod,
      paidAmount
    }) => appointmentsApi.update(id, {
      paymentStatus,
      paymentMethod,
      paidAmount
    }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEY]
      });
      toast.success(t("hooks.useappointments.paymentRecordedSuccessfully"));
    },
    onError: err => toast.error(err.message || t("hooks.useappointments.failedToUpdatePayment"))
  });
}
