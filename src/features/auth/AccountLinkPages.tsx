import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CircleCheck, LoaderCircle, MailCheck, TriangleAlert } from "lucide-react";
import { errorMessage, http } from "../../shared/api/http";
import type { User } from "../../shared/api/types";
import { useAuthStore } from "../../shared/stores/authStore";
import { toast } from "../../shared/stores/toastStore";
import { Button } from "../../shared/ui/Button";
import { buttonClass } from "../../shared/ui/buttonClass";
import { Alert } from "../../shared/ui/Feedback";
import { Input } from "../../shared/ui/Field";
import { AuthShell } from "./AuthShell";

/** Asks for the email that will receive the reset link. */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const request = useMutation({
    mutationFn: () => http.post("/auth/request-password-reset", { email: email.trim() }),
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    request.mutate();
  };

  if (request.isSuccess) {
    return (
      <AuthShell title="Vérifiez votre boîte mail" subtitle="Le lien est valable 1 heure.">
        <div className="flex flex-col items-start gap-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pine-50 text-pine-700">
            <MailCheck className="h-6 w-6" aria-hidden />
          </span>
          {/* The same answer whether or not the address has an account, so it cannot be used to find out who is registered. */}
          <p className="text-sm leading-relaxed text-ink-700">
            Si un compte existe pour <span className="font-semibold">{email.trim()}</span>, nous venons d'y envoyer un lien pour choisir un nouveau mot de
            passe. Pensez à regarder dans les courriers indésirables.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/login" className={buttonClass("dark")}>
              Retour à la connexion
            </Link>
            <Button variant="ghost" onClick={() => request.reset()}>
              Essayer une autre adresse
            </Button>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle={
        <>
          Indiquez l'e-mail de votre compte : nous vous envoyons un lien pour en choisir un nouveau.{" "}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Retour à la connexion
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {request.isError && <Alert>{errorMessage(request.error)}</Alert>}
        <Input label="E-mail" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button type="submit" size="lg" className="w-full" loading={request.isPending}>
          Envoyer le lien
        </Button>
      </form>
    </AuthShell>
  );
}

/** Opened from the link in the reset email, which carries the token. */
export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const mismatch = confirmation !== "" && password !== confirmation;

  const reset = useMutation({
    mutationFn: () => http.post("/auth/reset-password", { token, newPassword: password }),
    onSuccess: () => {
      // The new password ends the session that may be open in this browser too.
      logout();
      toast.success("Mot de passe modifié. Connectez-vous avec le nouveau.");
      navigate("/login", { replace: true });
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (password === confirmation) reset.mutate();
  };

  if (!token) {
    return (
      <AuthShell title="Lien incomplet" subtitle="Ce lien ne contient pas le code attendu.">
        <Alert>Ouvrez le lien reçu par e-mail en entier, ou demandez-en un nouveau.</Alert>
        <Link to="/forgot-password" className={buttonClass("dark", "md", "mt-5")}>
          Demander un nouveau lien
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Nouveau mot de passe" subtitle="Choisissez un mot de passe d'au moins 8 caractères.">
      <form onSubmit={submit} className="space-y-4">
        {reset.isError && (
          <Alert>
            {errorMessage(reset.error)}{" "}
            <Link to="/forgot-password" className="font-semibold underline">
              Demander un nouveau lien
            </Link>
          </Alert>
        )}
        <Input label="Nouveau mot de passe" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input
          label="Confirmez le mot de passe"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          hint={mismatch ? "Les deux mots de passe sont différents." : undefined}
          aria-invalid={mismatch}
        />
        <Button type="submit" size="lg" className="w-full" disabled={mismatch} loading={reset.isPending}>
          Enregistrer le mot de passe
        </Button>
      </form>
    </AuthShell>
  );
}

/** Opened from the link in the verification email: the token is checked as soon as the page loads. */
export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  // A query, not an effect: a link works once, and a query is not sent twice when React mounts the page twice in development.
  const verification = useQuery({
    queryKey: ["verify-email", token],
    enabled: token !== "",
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: async () => {
      await http.post("/auth/verify-email", { token });
      const { token: session, setUser } = useAuthStore.getState();
      if (session) setUser((await http.get<User>("/profile/me")).data);
      return true;
    },
  });
  const signedIn = useAuthStore((state) => state.user !== null);

  if (!token || verification.isError) {
    return (
      <AuthShell title="Lien invalide" subtitle="Cette adresse n'a pas pu être confirmée.">
        <div className="flex flex-col items-start gap-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
            <TriangleAlert className="h-6 w-6" aria-hidden />
          </span>
          <p className="text-sm leading-relaxed text-ink-700">
            {token ? errorMessage(verification.error) : "Ce lien ne contient pas le code attendu."} Vous pouvez demander un nouveau lien depuis votre profil.
          </p>
          <Link to={signedIn ? "/profile" : "/login"} state={{ from: "/profile" }} className={buttonClass("dark")}>
            {signedIn ? "Aller à mon profil" : "Se connecter"}
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (verification.isPending) {
    return (
      <AuthShell title="Confirmation en cours" subtitle="Un instant...">
        <LoaderCircle className="h-8 w-8 animate-spin text-brand-600" aria-label="Chargement" />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Adresse confirmée" subtitle="Merci, votre adresse e-mail est vérifiée.">
      <div className="flex flex-col items-start gap-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pine-50 text-pine-700">
          <CircleCheck className="h-6 w-6" aria-hidden />
        </span>
        <Link to={signedIn ? "/" : "/login"} className={buttonClass("primary")}>
          {signedIn ? "Explorer les annonces" : "Se connecter"}
        </Link>
      </div>
    </AuthShell>
  );
}
