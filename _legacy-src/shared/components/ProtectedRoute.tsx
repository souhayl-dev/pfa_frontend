import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import type { Role } from "../api/types";

interface Props {
  children: ReactElement;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: Props) {
  const { token, role } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/" replace />;
  }
  return children;
}
