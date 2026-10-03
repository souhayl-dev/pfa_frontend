import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { BadgeCheck, MailWarning } from "lucide-react";
import { errorMessage, http } from "../../shared/api/http";
import type { Gender, User } from "../../shared/api/types";
import { initials } from "../../shared/lib/format";
import { useAuthStore } from "../../shared/stores/authStore";
import { toast } from "../../shared/stores/toastStore";
import { Button } from "../../shared/ui/Button";
import { Alert } from "../../shared/ui/Feedback";
import { Checkbox, Input, Select } from "../../shared/ui/Field";

function Card({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-1 mb-5 text-sm text-ink-500">{text}</p>
      {children}
    </section>
  );
}

function AccountForm({ user }: { user: User }) {
  const setUser = useAuthStore((state) => state.setUser);
  const [form, setForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username ?? "",
    phone: user.phone ?? "",
    gender: (user.gender ?? "") as Gender | "",
    preferredCurrency: user.preferredCurrency,
    notificationsEnabled: user.notificationsEnabled,
  });
  const save = useMutation({
    mutationFn: async () =>
      (
        await http.patch<User>("/profile/me", {
          ...form,
          username: form.username.trim() || null,
          phone: form.phone.trim() || null,
          gender: form.gender || null,
          profileImage: user.profileImage,
        })
      ).data,
    onSuccess: (updated) => {
      setUser(updated);
      toast.success("Profil enregistré.");
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {save.isError && <Alert>{errorMessage(save.error)}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Prénom" required maxLength={100} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        <Input label="Nom" required maxLength={100} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        <Input label="Nom d'utilisateur" maxLength={50} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <Input label="Téléphone" type="tel" maxLength={30} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Select
          label="Genre"
          placeholder="Non précisé"
          options={[
            { value: "FEMALE", label: "Femme" },
            { value: "MALE", label: "Homme" },
          ]}
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value as Gender | "" })}
        />
        <Select
          label="Devise préférée"
          options={["EUR", "MAD", "USD", "GBP"].map((code) => ({ value: code, label: code }))}
          value={form.preferredCurrency}
          onChange={(e) => setForm({ ...form, preferredCurrency: e.target.value })}
        />
      </div>
      <Checkbox
        label="Recevoir les notifications par e-mail"
        checked={form.notificationsEnabled}
        onChange={(e) => setForm({ ...form, notificationsEnabled: e.target.checked })}
      />
      <Button type="submit" loading={save.isPending}>
        Enregistrer
      </Button>
    </form>
  );
}

function TravellerForm({ user }: { user: User }) {
  const setUser = useAuthStore((state) => state.setUser);
  const [nationality, setNationality] = useState(user.nationality ?? "");
  const [birthDate, setBirthDate] = useState(user.birthDate ?? "");
  const save = useMutation({
    mutationFn: async () =>
      (await http.put<User>("/profile/me/client", { nationality: nationality.trim().toUpperCase() || null, birthDate: birthDate || null })).data,
    onSuccess: (updated) => {
      setUser(updated);
      toast.success("Informations voyageur enregistrées.");
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {save.isError && <Alert>{errorMessage(save.error)}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nationalité"
          hint="Code pays à 2 lettres, par exemple MA ou FR."
          pattern="[A-Za-z]{2}"
          maxLength={2}
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
        />
        <Input label="Date de naissance" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
      </div>
      <Button type="submit" variant="dark" loading={save.isPending}>
        Enregistrer
      </Button>
    </form>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const change = useMutation({
    mutationFn: () => http.post("/profile/me/change-password", { currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Mot de passe modifié.");
    },
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    change.mutate();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {change.isError && <Alert>{errorMessage(change.error)}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Mot de passe actuel" type="password" autoComplete="current-password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <Input
          label="Nouveau mot de passe"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <Button type="submit" variant="dark" loading={change.isPending}>
        Changer le mot de passe
      </Button>
    </form>
  );
}

function VerifyEmailBanner() {
  const resend = useMutation({
    mutationFn: () => http.post("/auth/resend-verification"),
    onSuccess: () => toast.success("E-mail envoyé. Le lien est valable 2 jours."),
    onError: (error) => toast.error(errorMessage(error)),
  });
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
      <p className="flex items-center gap-2.5 text-sm text-amber-900">
        <MailWarning className="h-5 w-5 shrink-0" aria-hidden />
        Votre adresse e-mail n'est pas encore vérifiée. Ouvrez le lien reçu à l'inscription.
      </p>
      <Button variant="outline" size="sm" loading={resend.isPending} onClick={() => resend.mutate()}>
        Renvoyer l'e-mail
      </Button>
    </div>
  );
}

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)!;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-pine-600 to-pine-900 font-display text-2xl font-semibold text-white">
          {initials(user.firstName, user.lastName)}
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {user.firstName} {user.lastName}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-ink-500">
            {user.email}
            {user.verified && <BadgeCheck className="h-4 w-4 text-pine-600" aria-label="E-mail vérifié" />}
          </p>
        </div>
      </div>

      {!user.verified && <VerifyEmailBanner />}

      <div className="mt-8 space-y-6">
        <Card title="Mon compte" text="Ces informations sont partagées avec les prestataires chez qui vous réservez.">
          <AccountForm user={user} />
        </Card>
        <Card title="Informations voyageur" text="Utiles pour les hôtels et les locations de voiture.">
          <TravellerForm user={user} />
        </Card>
        <Card title="Sécurité" text="Choisissez un mot de passe d'au moins 8 caractères.">
          <PasswordForm />
        </Card>
      </div>
    </div>
  );
}
