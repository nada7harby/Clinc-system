import { create } from "zustand";

export const useUserStore = create((set) => ({
  user: null,
  accessToken: null,
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearSession: () =>
    set({
      user: null,
      accessToken: null,
    }),
}));
