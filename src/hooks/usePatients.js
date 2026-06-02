import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { patientsApi } from "@/api/mockApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
const QUERY_KEY = "patients";
export function usePatients(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => patientsApi.list(params),
    keepPreviousData: true
  });
}
export function usePatient(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => patientsApi.getById(id),
    enabled: !!id
  });
}
export function useCreatePatient() {
  const {
    t
  } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: patientsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEY]
      });
      toast.success(t("hooks.usepatients.patientCreatedSuccessfully"));
    },
    onError: err => toast.error(err.message || t("hooks.usepatients.failedToCreatePatient"))
  });
}
export function useUpdatePatient() {
  const {
    t
  } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data
    }) => patientsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEY]
      });
      toast.success(t("hooks.usepatients.patientUpdatedSuccessfully"));
    },
    onError: err => toast.error(err.message || t("hooks.usepatients.failedToUpdatePatient"))
  });
}
export function useDeletePatient() {
  const {
    t
  } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: patientsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEY]
      });
      toast.success(t("hooks.usepatients.patientRemoved"));
    },
    onError: err => toast.error(err.message || t("hooks.usepatients.failedToDeletePatient"))
  });
}
