import { create } from "zustand";
import type { User } from "../api/types";

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

const STORAGE_KEY = "bookly-auth";

function loadPersisted(): Pick<AuthState, "token" | "user"> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const { token, user } = JSON.parse(raw);
      if (token && user) return { token, user };
    }
  } catch {
    // Unreadable storage is the same as being signed out.
  }
  return { token: null, user: null };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ...loadPersisted(),
  login: (token, user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    set({ token, user });
  },
  setUser: (user) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: get().token, user }));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, user: null });
  },
}));

export const isAdmin = (user: User | null) => !!user?.roles.includes("ADMIN");
