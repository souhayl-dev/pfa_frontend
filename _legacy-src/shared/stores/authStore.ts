import { create } from "zustand";
import type { Role } from "../api/types";

interface AuthState {
  token: string | null;
  userId: string | null;
  role: Role | null;
  login: (token: string, userId: string, role: Role) => void;
  logout: () => void;
}

const STORAGE_KEY = "booking-auth";

function loadPersisted(): Pick<AuthState, "token" | "userId" | "role"> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, userId: null, role: null };
    return JSON.parse(raw);
  } catch {
    return { token: null, userId: null, role: null };
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadPersisted(),
  login: (token, userId, role) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, userId, role }));
    set({ token, userId, role });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, userId: null, role: null });
  },
}));
