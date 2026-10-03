import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { errorMessage, http } from "../../shared/api/http";
import type { AuthResponse } from "../../shared/api/types";
import { useAuthStore } from "../../shared/stores/authStore";
import { toast } from "../../shared/stores/toastStore";
import { Button } from "../../shared/ui/Button";
import { Alert } from "../../shared/ui/Feedback";
import { Input } from "../../shared/ui/Field";
import { AuthShell } from "./AuthShell";

async function signIn(email: string, password: string) {
  return (await http.post<AuthResponse>("/auth/login", { email, password })).data;
}

function useRedirectAfterAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  return { from, go: () => navigate(from, { replace: true }) };
}

export function LoginPage() {
  const { user, login } = useAuthStore();
  const { from, go } = useRedirectAfterAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => signIn(email, password),
    onSuccess: (auth) => {
      login(auth.token, auth.user);
      toast.success(`Ravi de vous revoir, ${auth.user.firstName} !`);
      go();
    },
  });

  if (user && !mutation.isSuccess) return <Navigate to={from} replace />;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <AuthShell
      title="Connexion"
      subtitle={
        <>
          Pas encore de compte ?{" "}
          <Link to="/register" state={{ from }} className="font-semibold text-brand-700 hover:underline">
            Créer un compte
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {mutation.isError && <Alert>{errorMessage(mutation.error)}</Alert>}
        <Input label="E-mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <div>
          <Input label="Mot de passe" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          <Link to="/forgot-password" className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
          Se connecter
        </Button>
      </form>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { user, login } = useAuthStore();
  const { from, go } = useRedirectAfterAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: event.target.value });

  const mutation = useMutation({
    // Signing up returns the account only, so it is followed by a login to get the token.
    mutationFn: async () => {
      await http.post("/auth/register", form);
      return signIn(form.email, form.password);
    },
    onSuccess: (auth) => {
      login(auth.token, auth.user);
      toast.success(`Bienvenue, ${auth.user.firstName} ! Un e-mail vous attend pour confirmer votre adresse.`);
      go();
    },
  });

  if (user && !mutation.isSuccess) return <Navigate to={from} replace />;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <AuthShell
      title="Créer un compte"
      subtitle={
        <>
          Déjà inscrit ?{" "}
          <Link to="/login" state={{ from }} className="font-semibold text-brand-700 hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {mutation.isError && <Alert>{errorMessage(mutation.error)}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Prénom" autoComplete="given-name" required maxLength={100} value={form.firstName} onChange={update("firstName")} />
          <Input label="Nom" autoComplete="family-name" required maxLength={100} value={form.lastName} onChange={update("lastName")} />
        </div>
        <Input label="E-mail" type="email" autoComplete="email" required value={form.email} onChange={update("email")} />
        <Input
          label="Mot de passe"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="8 caractères minimum."
          value={form.password}
          onChange={update("password")}
        />
        <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>
          Créer mon compte
        </Button>
        <p className="text-center text-xs text-ink-500">Vous proposez un hébergement ou une activité ? Créez votre compte, puis ouvrez l'espace prestataire.</p>
      </form>
    </AuthShell>
  );
}
