import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Briefcase, ChevronDown, Heart, LogOut, ShieldCheck, Ticket, UserRound } from "lucide-react";
import { cn } from "../lib/cn";
import { isAdmin, useAuthStore } from "../stores/authStore";
import { useFavoritesStore } from "../stores/favoritesStore";
import { buttonClass } from "../ui/buttonClass";
import { Toaster } from "../ui/Feedback";
import { Avatar } from "./Avatar";

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Bookly, accueil">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 font-display text-xl font-bold text-white shadow-glow">
        b
      </span>
      <span className={cn("font-display text-2xl font-semibold tracking-tight", light ? "text-white" : "text-ink-900")}>bookly</span>
    </Link>
  );
}

function UserMenu() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (event: MouseEvent) => !ref.current?.contains(event.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  const items = [
    { to: "/bookings", label: "Mes réservations", icon: Ticket },
    { to: "/profile", label: "Mon profil", icon: UserRound },
    { to: "/pro", label: "Espace prestataire", icon: Briefcase },
    ...(isAdmin(user) ? [{ to: "/admin", label: "Administration", icon: ShieldCheck }] : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-sand-300 bg-white py-1 pr-2.5 pl-1 transition hover:shadow-card"
      >
        <Avatar firstName={user.firstName} lastName={user.lastName} image={user.profileImage} className="h-8 w-8 rounded-full text-xs" />
        <span className="hidden text-sm font-semibold sm:block">{user.firstName}</span>
        <ChevronDown className={cn("h-4 w-4 text-ink-500 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-40 mt-2 w-60 animate-fade rounded-2xl border border-sand-200 bg-white p-1.5 shadow-lift">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-xs text-ink-500">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-sand-200" />
          {items.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium hover:bg-sand-100">
              <Icon className="h-4 w-4 text-ink-500" />
              {label}
            </Link>
          ))}
          <div className="my-1 h-px bg-sand-200" />
          <button
            role="menuitem"
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}

export function Layout() {
  const user = useAuthStore((state) => state.user);
  const favoriteCount = useFavoritesStore((state) => state.items.length);
  const location = useLocation();

  // A new page starts at its top; filters only change the query string, so they keep the scroll.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-sand-200/80 bg-sand-50/85 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn("hidden rounded-full px-3.5 py-2 text-sm font-semibold transition sm:block", isActive ? "text-brand-700" : "text-ink-600 hover:text-ink-900")
              }
            >
              Explorer
            </NavLink>
            <NavLink
              to="/favorites"
              aria-label={`Mes favoris (${favoriteCount})`}
              className={({ isActive }) =>
                cn("relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-sand-100", isActive ? "text-brand-600" : "text-ink-600")
              }
            >
              <Heart className="h-5 w-5" aria-hidden />
              {favoriteCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand-500 px-1 text-[0.65rem] font-bold text-white">
                  {favoriteCount}
                </span>
              )}
            </NavLink>
            {user ? (
              <UserMenu />
            ) : (
              <>
                <Link to="/login" state={{ from: location.pathname }} className={buttonClass("ghost", "sm")}>
                  Connexion
                </Link>
                {/* A phone has room for one account button; the login page links to sign-up. */}
                <span className="hidden sm:block">
                  <Link to="/register" className={buttonClass("dark", "sm")}>
                  Créer un compte
                </Link>
                </span>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-20 bg-pine-950 text-pine-100">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <Logo light />
            <p className="mt-2 max-w-sm text-sm text-pine-200/80">Hôtels, tables, guides, circuits et voitures : tout le voyage, réservé au même endroit.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
            <Link to="/" className="hover:text-white">
              Explorer
            </Link>
            <Link to="/pro" className="hover:text-white">
              Devenir prestataire
            </Link>
            <Link to="/bookings" className="hover:text-white">
              Mes réservations
            </Link>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
