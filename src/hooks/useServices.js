import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { servicesApi } from "@/api/mockApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
const QUERY_KEY = "services";
export function useServices(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => servicesApi.list(params),
    keepPreviousData: true
  });
}
export function useService(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => servicesApi.getById(id),
    enabled: !!id
  });
}
export function useCreateService() {
  const {
    t
  } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEY]
      });
      toast.success(t("hooks.useservices.serviceCreated"));
    },
    onError: err => toast.error(err.message || t("hooks.useservices.failedToCreateService"))
  });
}
export function useUpdateService() {
  const {
    t
  } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data
    }) => servicesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEY]
      });
      toast.success(t("hooks.useservices.serviceUpdated"));
    },
    onError: err => toast.error(err.message || t("hooks.useservices.failedToUpdateService"))
  });
}
export function useDeleteService() {
  const {
    t
  } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEY]
      });
      toast.success(t("hooks.useservices.serviceDeleted"));
    },
    onError: err => toast.error(err.message || t("hooks.useservices.failedToDeleteService"))
  });
}
