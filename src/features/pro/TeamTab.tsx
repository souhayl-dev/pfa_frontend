import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { errorMessage, http } from "../../shared/api/http";
import type { Member, MemberRole } from "../../shared/api/types";
import { formatDate, initials } from "../../shared/lib/format";
import { MEMBER_ROLE } from "../../shared/lib/labels";
import { useAuthStore } from "../../shared/stores/authStore";
import { toast } from "../../shared/stores/toastStore";
import { Button } from "../../shared/ui/Button";
import { Alert, Badge, Skeleton } from "../../shared/ui/Feedback";
import { Input, Select } from "../../shared/ui/Field";
import { useMembers } from "./api";

/** Owners manage everyone; managers add and remove staff; staff only see the list. */
export function TeamTab({ providerId, myRole }: { providerId: string; myRole: MemberRole }) {
  const queryClient = useQueryClient();
  const me = useAuthStore((state) => state.user)!;
  const members = useMembers(providerId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("STAFF");

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["pro", "provider", providerId, "members"] });
  const add = useMutation({
    mutationFn: () => http.post(`/providers/${providerId}/members`, { email: email.trim(), role }),
    onSuccess: () => {
      refresh();
      setEmail("");
      toast.success("Membre ajouté à l'équipe.");
    },
  });
  const act = useMutation({
    mutationFn: ({ member, action, newRole }: { member: Member; action: "suspend" | "reactivate" | "remove" | "role"; newRole?: MemberRole }) =>
      action === "remove"
        ? http.delete(`/members/${member.id}`)
        : action === "role"
          ? http.patch(`/members/${member.id}/role`, { role: newRole })
          : http.post(`/members/${member.id}/${action}`),
    onSuccess: refresh,
    onError: (error) => toast.error(errorMessage(error)),
  });

  const canAdd = myRole !== "STAFF";
  const assignable: MemberRole[] = myRole === "OWNER" ? ["STAFF", "MANAGER", "OWNER"] : ["STAFF"];
  const canActOn = (member: Member) => member.userId !== me.id && (myRole === "OWNER" || (myRole === "MANAGER" && member.role === "STAFF"));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    add.mutate();
  };

  return (
    <div className="space-y-6">
      {canAdd && (
        <form onSubmit={submit} className="rounded-3xl border border-sand-200 bg-white p-5 shadow-card">
          <h3 className="font-display text-lg font-semibold">Ajouter un membre</h3>
          <p className="mt-1 mb-4 text-sm text-ink-500">La personne doit déjà avoir un compte Bookly : saisissez son adresse e-mail.</p>
          {add.isError && (
            <div className="mb-4">
              <Alert>{errorMessage(add.error)}</Alert>
            </div>
          )}
          <div className="grid items-end gap-3 sm:grid-cols-[1fr_12rem_auto]">
            <Input label="E-mail" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Select label="Rôle" options={assignable.map((value) => ({ value, label: MEMBER_ROLE[value] }))} value={role} onChange={(e) => setRole(e.target.value as MemberRole)} />
            <Button type="submit" variant="dark" loading={add.isPending}>
              <UserPlus className="h-4 w-4" aria-hidden />
              Ajouter
            </Button>
          </div>
        </form>
      )}

      {members.isLoading ? (
        <Skeleton className="h-40 rounded-3xl" />
      ) : members.isError ? (
        <Alert>{errorMessage(members.error)}</Alert>
      ) : (
        <ul className="divide-y divide-sand-200 overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-card">
          {members.data!.map((member) => (
            <li key={member.id} className="flex flex-wrap items-center gap-3 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pine-100 text-sm font-bold text-pine-800">
                {initials(member.firstName, member.lastName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {member.firstName} {member.lastName}
                  {member.userId === me.id && <span className="font-medium text-ink-500"> (vous)</span>}
                </p>
                <p className="truncate text-xs text-ink-500">
                  {member.email} · depuis le {formatDate(member.joinedAt)}
                </p>
              </div>
              {member.status === "SUSPENDED" && <Badge tone="bg-rose-50 text-rose-700 ring-rose-200">Suspendu</Badge>}
              {myRole === "OWNER" && canActOn(member) ? (
                <select
                  aria-label={`Rôle de ${member.firstName}`}
                  value={member.role}
                  onChange={(event) => act.mutate({ member, action: "role", newRole: event.target.value as MemberRole })}
                  className="h-9 rounded-lg border border-sand-300 bg-white px-2 text-sm font-semibold"
                >
                  {(Object.keys(MEMBER_ROLE) as MemberRole[]).map((value) => (
                    <option key={value} value={value}>
                      {MEMBER_ROLE[value]}
                    </option>
                  ))}
                </select>
              ) : (
                <Badge tone="bg-sand-100 text-ink-700 ring-sand-300">{MEMBER_ROLE[member.role]}</Badge>
              )}
              {canActOn(member) && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => act.mutate({ member, action: member.status === "ACTIVE" ? "suspend" : "reactivate" })}>
                    {member.status === "ACTIVE" ? "Suspendre" : "Réactiver"}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => window.confirm(`Retirer ${member.firstName} ${member.lastName} de l'équipe ?`) && act.mutate({ member, action: "remove" })}
                  >
                    Retirer
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
