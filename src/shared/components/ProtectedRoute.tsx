import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAdmin, useAuthStore } from "../stores/authStore";

export function ProtectedRoute({ children, admin }: { children: ReactNode; admin?: boolean }) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (admin && !isAdmin(user)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
