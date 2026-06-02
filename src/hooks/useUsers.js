import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/api/mockApi";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
const QUERY_KEY = "users";
export function useUsers(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => usersApi.list(params),
    keepPreviousData: true
  });
}
export function useUser(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id
  });
}
export function useCreateUser() {
  const {
    t
  } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEY]
      });
      toast.success(t("hooks.useusers.userCreatedSuccessfully"));
    },
    onError: err => toast.error(err.message || t("hooks.useusers.failedToCreateUser"))
  });
}
export function useUpdateUser() {
  const {
    t
  } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data
    }) => usersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEY]
      });
      toast.success(t("hooks.useusers.userUpdatedSuccessfully"));
    },
    onError: err => toast.error(err.message || t("hooks.useusers.failedToUpdateUser"))
  });
}
export function useDeleteUser() {
  const {
    t
  } = useTranslation();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [QUERY_KEY]
      });
      toast.success(t("hooks.useusers.userRemoved"));
    },
    onError: err => toast.error(err.message || t("hooks.useusers.failedToDeleteUser"))
  });
}
