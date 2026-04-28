import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { servicesApi } from "@/api/mockApi";
import toast from "react-hot-toast";

const QUERY_KEY = "services";

export function useServices(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => servicesApi.list(params),
    keepPreviousData: true,
  });
}

export function useService(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => servicesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Service created!");
    },
    onError: (err) => toast.error(err.message || "Failed to create service."),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => servicesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Service updated!");
    },
    onError: (err) => toast.error(err.message || "Failed to update service."),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Service deleted.");
    },
    onError: (err) => toast.error(err.message || "Failed to delete service."),
  });
}
