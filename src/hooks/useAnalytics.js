import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/mockApi";

export function useStats(filters = {}, options = {}) {
  return useQuery({
    queryKey: ["analytics", "stats", filters],
    queryFn: () => analyticsApi.getStats(filters),
    staleTime: 60000,
    ...options,
  });
}

export function useRevenueChart(
  period = "monthly",
  filters = {},
  options = {},
) {
  return useQuery({
    queryKey: ["analytics", "revenue", period, filters],
    queryFn: () => analyticsApi.getRevenueChart(period, filters),
    ...options,
  });
}

export function useStatusChart(filters = {}, options = {}) {
  return useQuery({
    queryKey: ["analytics", "status", filters],
    queryFn: () => analyticsApi.getStatusChart(filters),
    ...options,
  });
}

export function useBookingsChart(filters = {}, options = {}) {
  return useQuery({
    queryKey: ["analytics", "bookings", filters],
    queryFn: () => analyticsApi.getBookingsChart(filters),
    ...options,
  });
}

export function useTopDoctors(filters = {}, options = {}) {
  return useQuery({
    queryKey: ["analytics", "top-doctors", filters],
    queryFn: () => analyticsApi.getTopDoctors(filters),
    ...options,
  });
}

export function useLogs(filters = {}, options = {}) {
  return useQuery({
    queryKey: ["analytics", "logs", filters],
    queryFn: () => analyticsApi.getLogs(filters),
    ...options,
  });
}
