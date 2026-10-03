import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { loginUser } from "./api";
import { useAuthStore } from "../../shared/stores/authStore";
import { extractErrorMessage } from "../../shared/api/httpClient";
import { Button } from "../../shared/components/ui/Button";
import { Field, Input } from "../../shared/components/ui/Field";
import { Alert } from "../../shared/components/ui/Alert";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (result) => {
      login(result.token, result.userId, result.role);
      navigate("/");
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate({ email, password });
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center py-8">
      <Sparkles className="size-8 text-brand-500" />
      <h1 className="mt-3 text-2xl font-bold text-neutral-900">Content de vous revoir</h1>
      <p className="mt-1 text-sm text-neutral-500">Connectez-vous pour réserver ou gérer vos annonces.</p>

      <form className="mt-6 w-full space-y-4" onSubmit={handleSubmit}>
        <Field label="E-mail">
          <Input type="email" placeholder="vous@exemple.com" value={email}
                 onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Mot de passe">
          <Input type="password" placeholder="********" value={password}
                 onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <Button type="submit" fullWidth size="lg" loading={mutation.isPending}>
          {mutation.isPending ? "Connexion en cours..." : "Se connecter"}
        </Button>
        {mutation.isError && <Alert variant="error">{extractErrorMessage(mutation.error)}</Alert>}
      </form>

      <p className="mt-6 text-sm text-neutral-500">
        Pas encore de compte ? <Link to="/register" className="font-medium text-brand-600 hover:underline">S'inscrire</Link>
      </p>
    </div>
  );
}
