import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuth = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (mobileNumber) =>
        set({
          isAuthenticated: true,
          user: { name: `Farmer ${mobileNumber.slice(-4)}`, mobileNumber },
        }),
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: "gramsankalpa-auth",
    },
  ),
);
