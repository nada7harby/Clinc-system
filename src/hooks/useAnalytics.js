import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/mockApi";

export function useStats() {
  return useQuery({
    queryKey: ["analytics", "stats"],
    queryFn: analyticsApi.getStats,
    staleTime: 60000,
  });
}

export function useRevenueChart(period = "monthly") {
  return useQuery({
    queryKey: ["analytics", "revenue", period],
    queryFn: () => analyticsApi.getRevenueChart(period),
  });
}

export function useStatusChart() {
  return useQuery({
    queryKey: ["analytics", "status"],
    queryFn: analyticsApi.getStatusChart,
  });
}

export function useBookingsChart() {
  return useQuery({
    queryKey: ["analytics", "bookings"],
    queryFn: analyticsApi.getBookingsChart,
  });
}

export function useTopDoctors() {
  return useQuery({
    queryKey: ["analytics", "top-doctors"],
    queryFn: analyticsApi.getTopDoctors,
  });
}

export function useLogs() {
  return useQuery({
    queryKey: ["analytics", "logs"],
    queryFn: analyticsApi.getLogs,
  });
}
