import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuth = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (email) => set({ isAuthenticated: true, user: { name: email.split('@')[0], email } }),
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'gramdrishti-auth',
    }
  )
);
