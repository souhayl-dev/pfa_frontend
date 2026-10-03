import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, CircleAlert, Search, Trash2, Users } from "lucide-react";
import { deleteUser, listUsers } from "./api";
import { AdminShell, Initials, Panel, SegmentedControl } from "./AdminShell";
import { Alert } from "../../shared/components/ui/Alert";
import { Badge } from "../../shared/components/ui/Badge";
import { Button } from "../../shared/components/ui/Button";
import { EmptyState } from "../../shared/components/ui/EmptyState";
import { Input } from "../../shared/components/ui/Field";
import { Skeleton } from "../../shared/components/ui/Skeleton";
import { cn } from "../../shared/lib/cn";
import type { Role } from "../../shared/api/types";

const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: "Client",
  PROVIDER: "Prestataire",
  ADMIN: "Admin",
};

const ROLE_CLASSES: Record<Role, string> = {
  CUSTOMER: "bg-sky-50 text-sky-700",
  PROVIDER: "bg-amber-50 text-amber-700",
  ADMIN: "bg-neutral-900 text-white",
};

const AVATAR_CLASSES: Record<Role, string> = {
  CUSTOMER: "bg-sky-100 text-sky-700",
  PROVIDER: "bg-amber-100 text-amber-700",
  ADMIN: "bg-neutral-900 text-white",
};

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role | "ALL">("ALL");

  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: listUsers });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const allUsers = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);
  const countFor = (r: Role) => allUsers.filter((u) => u.role === r).length;

  const users = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allUsers.filter(
      (user) =>
        (role === "ALL" || user.role === role) &&
        (!term || user.fullName.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)),
    );
  }, [allUsers, search, role]);

  function handleDelete(id: string, fullName: string) {
    if (window.confirm(`Supprimer le compte de ${fullName} ? Cette action est irréversible.`)) {
      deleteMutation.mutate(id);
    }
  }

  return (
    <AdminShell title="Utilisateurs" subtitle={usersQuery.data ? `${allUsers.length} comptes sur la plateforme` : undefined}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedControl
          value={role}
          onChange={setRole}
          options={[
            { value: "ALL", label: "Tous", count: usersQuery.data ? allUsers.length : undefined },
            { value: "CUSTOMER", label: "Clients", count: usersQuery.data ? countFor("CUSTOMER") : undefined },
            { value: "PROVIDER", label: "Prestataires", count: usersQuery.data ? countFor("PROVIDER") : undefined },
            { value: "ADMIN", label: "Admins", count: usersQuery.data ? countFor("ADMIN") : undefined },
          ]}
        />
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nom ou e-mail" className="pl-10" />
        </div>
      </div>

      {usersQuery.isError && <Alert variant="error">Impossible de charger les utilisateurs.</Alert>}
      {deleteMutation.isError && <Alert variant="error">La suppression a échoué.</Alert>}

      {usersQuery.data && users.length === 0 ? (
        <EmptyState icon={Users} title="Aucun utilisateur" description="Aucun compte ne correspond à ces critères." />
      ) : (
        <Panel flush>
          <div className="hidden grid-cols-[1fr_130px_150px_48px] gap-4 border-b border-neutral-100 px-5 py-3 text-xs font-medium uppercase tracking-wide text-neutral-400 md:grid">
            <span>Utilisateur</span>
            <span>Rôle</span>
            <span>E-mail</span>
            <span />
          </div>

          {usersQuery.isLoading && (
            <div className="space-y-2 p-5">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          )}

          <ul className="divide-y divide-neutral-100">
            {users.map((user) => (
              <li
                key={user.id}
                className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-5 py-3.5 transition-colors hover:bg-neutral-50/70 md:grid-cols-[1fr_130px_150px_48px]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Initials name={user.fullName} className={AVATAR_CLASSES[user.role]} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-neutral-900">{user.fullName}</p>
                    <p className="truncate text-xs text-neutral-500">{user.email}</p>
                  </div>
                </div>

                <div className="order-3 col-span-2 flex items-center gap-2 pl-12 md:order-none md:col-span-1 md:pl-0">
                  <Badge className={cn(ROLE_CLASSES[user.role])}>{ROLE_LABELS[user.role]}</Badge>
                  <span className="md:hidden">
                    <VerifiedLabel verified={user.emailVerified} />
                  </span>
                </div>

                <div className="hidden md:block">
                  <VerifiedLabel verified={user.emailVerified} />
                </div>

                <div className="flex justify-end">
                  {user.role !== "ADMIN" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Supprimer ${user.fullName}`}
                      title="Supprimer"
                      className="px-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                      loading={deleteMutation.isPending && deleteMutation.variables === user.id}
                      icon={<Trash2 className="size-4" />}
                      onClick={() => handleDelete(user.id, user.fullName)}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </AdminShell>
  );
}

function VerifiedLabel({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
      <BadgeCheck className="size-3.5" /> Vérifié
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400">
      <CircleAlert className="size-3.5" /> Non vérifié
    </span>
  );
}
