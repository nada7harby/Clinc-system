import { create } from "zustand";

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  globalLoading: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleCollapse: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));
