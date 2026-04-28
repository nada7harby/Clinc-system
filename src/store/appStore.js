import { create } from "zustand";

export const useAppStore = create((set) => ({
  sidebarOpen: true,
  isBootstrapped: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setBootstrapped: (isBootstrapped) => set({ isBootstrapped }),
}));
