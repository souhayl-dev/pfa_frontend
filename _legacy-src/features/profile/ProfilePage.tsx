import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { changePassword, getMyProfile, updateProfile } from "./api";
import { extractErrorMessage } from "../../shared/api/httpClient";
import { Button } from "../../shared/components/ui/Button";
import { Field, Input } from "../../shared/components/ui/Field";
import { Alert } from "../../shared/components/ui/Alert";
import { Skeleton } from "../../shared/components/ui/Skeleton";

export function ProfilePage() {
  const { data: profile, isLoading } = useQuery({ queryKey: ["my-profile"], queryFn: getMyProfile });

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setEmail(profile.email);
    }
  }, [profile]);

  const profileMutation = useMutation({ mutationFn: updateProfile });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
    },
  });

  function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    profileMutation.mutate({ fullName, email });
  }

  function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    passwordMutation.mutate({ currentPassword, newPassword });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Mon profil</h1>
        {profile && !profile.emailVerified && (
          <p className="mt-1 text-sm text-amber-600">Votre e-mail n'est pas encore vérifié.</p>
        )}
      </div>

      <form className="space-y-4 rounded-2xl border border-neutral-200 p-6" onSubmit={handleProfileSubmit}>
        <h2 className="font-semibold text-neutral-900">Informations personnelles</h2>
        <Field label="Nom complet">
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </Field>
        <Field label="E-mail">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Button type="submit" loading={profileMutation.isPending}>Enregistrer</Button>
        {profileMutation.isError && <Alert variant="error">{extractErrorMessage(profileMutation.error)}</Alert>}
        {profileMutation.isSuccess && <Alert variant="success">Profil mis à jour.</Alert>}
      </form>

      <form className="space-y-4 rounded-2xl border border-neutral-200 p-6" onSubmit={handlePasswordSubmit}>
        <h2 className="font-semibold text-neutral-900">Changer le mot de passe</h2>
        <Field label="Mot de passe actuel">
          <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        </Field>
        <Field label="Nouveau mot de passe">
          <Input type="password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </Field>
        <Button type="submit" loading={passwordMutation.isPending}>Mettre à jour</Button>
        {passwordMutation.isError && <Alert variant="error">{extractErrorMessage(passwordMutation.error)}</Alert>}
        {passwordMutation.isSuccess && <Alert variant="success">Mot de passe mis à jour.</Alert>}
      </form>
    </div>
  );
}
