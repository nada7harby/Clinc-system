import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/api/mockApi";
import toast from "react-hot-toast";

const QUERY_KEY = "users";

export function useUsers(params = {}) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => usersApi.list(params),
    keepPreviousData: true,
  });
}

export function useUser(id) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("User created successfully!");
    },
    onError: (err) => toast.error(err.message || "Failed to create user."),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => usersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("User updated successfully!");
    },
    onError: (err) => toast.error(err.message || "Failed to update user."),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("User removed.");
    },
    onError: (err) => toast.error(err.message || "Failed to delete user."),
  });
}
