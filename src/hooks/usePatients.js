import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientsApi } from "@/api/mockApi";
import toast from "react-hot-toast";

const QUERY_KEY = "patients";

export function usePatients(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => patientsApi.list(params),
    keepPreviousData: true,
  });
}

export function usePatient(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => patientsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: patientsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Patient created successfully!");
    },
    onError: (err) => toast.error(err.message || "Failed to create patient."),
  });
}

export function useUpdatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => patientsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Patient updated successfully!");
    },
    onError: (err) => toast.error(err.message || "Failed to update patient."),
  });
}

export function useDeletePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: patientsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Patient removed.");
    },
    onError: (err) => toast.error(err.message || "Failed to delete patient."),
  });
}
