import type { ReactNode } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarCheck, ChevronDown, LayoutList, LogOut, ShieldCheck, Sparkles, User } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import type { Role } from "../api/types";

const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: "client",
  PROVIDER: "prestataire",
  ADMIN: "administrateur",
};

export function Layout({ children }: { children: ReactNode }) {
  const { token, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-brand-500">
            <Sparkles className="size-6" strokeWidth={2} />
            <span className="text-lg font-extrabold tracking-tight text-neutral-900">bookly</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-600 sm:flex">
            <Link to="/" className="hover:text-neutral-900">Explorer</Link>
            {role === "PROVIDER" && (
              <Link to="/provider/listings" className="flex items-center gap-1.5 hover:text-neutral-900">
                <LayoutList className="size-4" />
                Mes annonces
              </Link>
            )}
            {role === "CUSTOMER" && (
              <Link to="/bookings" className="flex items-center gap-1.5 hover:text-neutral-900">
                <CalendarCheck className="size-4" />
                Mes réservations
              </Link>
            )}
            {role === "ADMIN" && (
              <Link to="/admin" className="flex items-center gap-1.5 hover:text-neutral-900">
                <ShieldCheck className="size-4" />
                Administration
              </Link>
            )}
          </nav>

          {token ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full border border-neutral-300 py-1.5 pl-3 pr-2 text-sm font-medium text-neutral-700 hover:shadow-sm"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
                  {role?.charAt(0)}
                </span>
                <ChevronDown className="size-4 text-neutral-500" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
                  <div className="border-b border-neutral-100 px-3.5 py-2 text-xs text-neutral-500">
                    Connecté en tant que <span className="font-medium text-neutral-700">{role && ROLE_LABELS[role]}</span>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    <User className="size-4" />
                    Mon profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  >
                    <LogOut className="size-4" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-sm font-medium">
              <Link to="/login" className="text-neutral-700 hover:text-neutral-900">Connexion</Link>
              <Link
                to="/register"
                className="rounded-xl bg-neutral-900 px-4 py-2 text-white transition-colors hover:bg-neutral-700"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
