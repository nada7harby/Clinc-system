import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointmentsApi } from "@/api/mockApi";
import toast from "react-hot-toast";

const QUERY_KEY = "appointments";

export function useAppointments(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => appointmentsApi.list(params),
    keepPreviousData: true,
    refetchInterval: 30000, // Poll every 30s (real-time simulation)
  });
}

export function useAppointment(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => appointmentsApi.getById(id),
    enabled: !!id,
  });
}

export function useTodayAppointments(doctorId) {
  return useQuery({
    queryKey: [QUERY_KEY, "today", doctorId],
    queryFn: () => appointmentsApi.getTodayForDoctor(doctorId),
    enabled: !!doctorId,
    refetchInterval: 30000,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: appointmentsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Appointment booked successfully!");
    },
    onError: (err) => toast.error(err.message || "Failed to book appointment."),
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => appointmentsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Appointment updated!");
    },
    onError: (err) => toast.error(err.message || "Failed to update appointment."),
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => appointmentsApi.update(id, { status: "cancelled" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Appointment cancelled.");
    },
    onError: (err) => toast.error(err.message || "Failed to cancel appointment."),
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: appointmentsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Appointment deleted.");
    },
    onError: (err) => toast.error(err.message || "Failed to delete appointment."),
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => appointmentsApi.update(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Status updated successfully!");
    },
    onError: (err) => toast.error(err.message || "Failed to update status."),
  });
}
