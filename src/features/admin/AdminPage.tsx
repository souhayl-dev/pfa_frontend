import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Building2, Search, ShieldCheck, Users } from "lucide-react";
import { errorMessage, http } from "../../shared/api/http";
import type { Provider, ProviderStatus, User } from "../../shared/api/types";
import { cn } from "../../shared/lib/cn";
import { formatDate, initials } from "../../shared/lib/format";
import { PROVIDER_STATUS } from "../../shared/lib/labels";
import { useAuthStore } from "../../shared/stores/authStore";
import { toast } from "../../shared/stores/toastStore";
import { Button } from "../../shared/ui/Button";
import { Alert, Badge, EmptyState, Skeleton } from "../../shared/ui/Feedback";
import { Tabs } from "../../shared/ui/Tabs";

const STATUSES: ProviderStatus[] = ["PENDING", "APPROVED", "SUSPENDED", "REJECTED"];

/** What an admin can do to a provider in each status. */
const ACTIONS: Record<ProviderStatus, { action: "approve" | "reject" | "suspend"; label: string; variant: "primary" | "danger" | "outline" }[]> = {
  PENDING: [
    { action: "reject", label: "Refuser", variant: "danger" },
    { action: "approve", label: "Valider", variant: "primary" },
  ],
  APPROVED: [{ action: "suspend", label: "Suspendre", variant: "danger" }],
  SUSPENDED: [{ action: "approve", label: "Réactiver", variant: "primary" }],
  REJECTED: [{ action: "approve", label: "Valider finalement", variant: "outline" }],
};

function ProvidersTab() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ProviderStatus>("PENDING");
  const providers = useQuery({
    queryKey: ["admin", "providers", status],
    queryFn: async () => (await http.get<Provider[]>("/admin/providers", { params: { status } })).data,
  });
  const act = useMutation({
    mutationFn: ({ provider, action }: { provider: Provider; action: string }) => http.post(`/admin/providers/${provider.id}/${action}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "providers"] });
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
      toast.success("Statut du prestataire mis à jour.");
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <div>
      <div className="scrollbar-none mb-5 flex gap-2 overflow-x-auto">
        {STATUSES.map((value) => (
          <button
            key={value}
            onClick={() => setStatus(value)}
            aria-pressed={status === value}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition",
              status === value ? "border-ink-900 bg-ink-900 text-white" : "border-sand-300 bg-white text-ink-600 hover:border-ink-400",
            )}
          >
            {PROVIDER_STATUS[value].label}
          </button>
        ))}
      </div>

      {providers.isLoading ? (
        <Skeleton className="h-40 rounded-3xl" />
      ) : providers.isError ? (
        <Alert>{errorMessage(providers.error)}</Alert>
      ) : providers.data!.length === 0 ? (
        <EmptyState icon={Building2} title="Aucun prestataire dans cet état" />
      ) : (
        <ul className="space-y-3">
          {providers.data!.map((provider) => (
            <li key={provider.id} className="rounded-3xl border border-sand-200 bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-display text-xl font-semibold">{provider.companyName}</h3>
                  <p className="text-sm text-ink-500">
                    {[provider.legalName, provider.taxId && `IF ${provider.taxId}`, `inscrit le ${formatDate(provider.createdAt)}`].filter(Boolean).join(" · ")}
                  </p>
                  {provider.description && <p className="mt-2 max-w-2xl text-sm text-ink-700">{provider.description}</p>}
                  {provider.verificationDocumentUrl && (
                    <a href={provider.verificationDocumentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline">
                      Voir le justificatif
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  {ACTIONS[provider.status].map(({ action, label, variant }) => (
                    <Button key={action} variant={variant} size="sm" disabled={act.isPending} onClick={() => act.mutate({ provider, action })}>
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function UsersTab() {
  const queryClient = useQueryClient();
  const me = useAuthStore((state) => state.user)!;
  const [search, setSearch] = useState("");
  const users = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => (await http.get<User[]>("/admin/users")).data,
  });
  const act = useMutation({
    mutationFn: ({ user, action }: { user: User; action: "activate" | "deactivate" }) => http.post(`/admin/users/${user.id}/${action}`),
    onSuccess: (_, { user, action }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(`${user.firstName} ${user.lastName} : compte ${action === "activate" ? "réactivé" : "désactivé"}.`);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const needle = search.trim().toLowerCase();
  const visible = (users.data ?? []).filter((user) => `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(needle));

  return (
    <div>
      <label className="mb-5 flex h-11 max-w-sm items-center gap-2 rounded-xl border border-sand-300 bg-white px-3">
        <Search className="h-4 w-4 text-ink-400" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nom ou e-mail"
          aria-label="Rechercher un utilisateur"
          className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
        />
      </label>

      {users.isLoading ? (
        <Skeleton className="h-64 rounded-3xl" />
      ) : users.isError ? (
        <Alert>{errorMessage(users.error)}</Alert>
      ) : (
        <ul className="divide-y divide-sand-200 overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-card">
          {visible.map((user) => (
            <li key={user.id} className={cn("flex flex-wrap items-center gap-3 p-4", !user.active && "bg-sand-50")}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pine-100 text-sm font-bold text-pine-800">
                {initials(user.firstName, user.lastName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                  {user.firstName} {user.lastName}
                  {user.verified && <BadgeCheck className="h-4 w-4 text-pine-600" aria-label="E-mail vérifié" />}
                </p>
                <p className="truncate text-xs text-ink-500">{user.email}</p>
              </div>
              {user.roles.includes("ADMIN") && <Badge tone="bg-brand-50 text-brand-700 ring-brand-200">Admin</Badge>}
              {user.clientId && <Badge tone="bg-sand-100 text-ink-700 ring-sand-300">Client</Badge>}
              {!user.active && <Badge tone="bg-rose-50 text-rose-700 ring-rose-200">Désactivé</Badge>}
              {user.id !== me.id &&
                (user.active ? (
                  <Button variant="danger" size="sm" disabled={act.isPending} onClick={() => act.mutate({ user, action: "deactivate" })}>
                    Désactiver
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled={act.isPending} onClick={() => act.mutate({ user, action: "activate" })}>
                    Réactiver
                  </Button>
                ))}
            </li>
          ))}
          {visible.length === 0 && <li className="p-6 text-center text-sm text-ink-500">Aucun utilisateur ne correspond.</li>}
        </ul>
      )}
    </div>
  );
}

export function AdminPage() {
  const [tab, setTab] = useState<"providers" | "users">("providers");
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="flex items-center gap-2 text-xs font-bold tracking-widest text-brand-600 uppercase">
        <ShieldCheck className="h-4 w-4" aria-hidden />
        Administration
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Pilotage de la plateforme</h1>
      <div className="mt-6">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { key: "providers", label: "Prestataires", icon: Building2 },
            { key: "users", label: "Utilisateurs", icon: Users },
          ]}
        />
      </div>
      <div className="mt-6">{tab === "providers" ? <ProvidersTab /> : <UsersTab />}</div>
    </div>
  );
}
