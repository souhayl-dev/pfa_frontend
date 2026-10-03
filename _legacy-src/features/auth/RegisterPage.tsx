import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Building2, Sparkles, User } from "lucide-react";
import { registerUser } from "./api";
import { extractErrorMessage } from "../../shared/api/httpClient";
import { Button } from "../../shared/components/ui/Button";
import { Field, Input } from "../../shared/components/ui/Field";
import { Alert } from "../../shared/components/ui/Alert";
import { cn } from "../../shared/lib/cn";
import type { Role } from "../../shared/api/types";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("CUSTOMER");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => navigate("/login"),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate({ email, password, fullName, role });
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center py-8">
      <Sparkles className="size-8 text-brand-500" />
      <h1 className="mt-3 text-2xl font-bold text-neutral-900">Créez votre compte</h1>
      <p className="mt-1 text-sm text-neutral-500">Inscrivez-vous en tant que client ou proposez votre logement.</p>

      <div className="mt-6 grid w-full grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setRole("CUSTOMER")}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
            role === "CUSTOMER" ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-600 hover:border-neutral-900",
          )}
        >
          <User className="size-5" />
          Je réserve
        </button>
        <button
          type="button"
          onClick={() => setRole("PROVIDER")}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
            role === "PROVIDER" ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-600 hover:border-neutral-900",
          )}
        >
          <Building2 className="size-5" />
          J'héberge
        </button>
      </div>

      <form className="mt-5 w-full space-y-4" onSubmit={handleSubmit}>
        <Field label="Nom complet">
          <Input placeholder="Jeanne Dupont" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </Field>
        <Field label="E-mail">
          <Input type="email" placeholder="vous@exemple.com" value={email}
                 onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="Mot de passe">
          <Input type="password" placeholder="8 caractères minimum" value={password} minLength={8}
                 onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        <Button type="submit" fullWidth size="lg" loading={mutation.isPending}>
          {mutation.isPending ? "Création du compte..." : "S'inscrire"}
        </Button>
        {mutation.isError && <Alert variant="error">{extractErrorMessage(mutation.error)}</Alert>}
      </form>

      <p className="mt-6 text-sm text-neutral-500">
        Vous avez déjà un compte ? <Link to="/login" className="font-medium text-brand-600 hover:underline">Se connecter</Link>
      </p>
    </div>
  );
}
