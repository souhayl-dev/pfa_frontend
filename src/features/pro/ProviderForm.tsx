import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorMessage, http } from "../../shared/api/http";
import type { Provider, ProviderRequest } from "../../shared/api/types";
import { toast } from "../../shared/stores/toastStore";
import { Button } from "../../shared/ui/Button";
import { Alert } from "../../shared/ui/Feedback";
import { Input, Textarea } from "../../shared/ui/Field";

interface ProviderFormProps {
  /** Absent when registering a new business. */
  provider?: Provider;
  readOnly?: boolean;
  onSaved: (provider: Provider) => void;
}

export function ProviderForm({ provider, readOnly, onSaved }: ProviderFormProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    companyName: provider?.companyName ?? "",
    legalName: provider?.legalName ?? "",
    taxId: provider?.taxId ?? "",
    description: provider?.description ?? "",
  });
  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: event.target.value });

  const save = useMutation({
    mutationFn: async () => {
      const body: ProviderRequest = {
        companyName: form.companyName.trim(),
        legalName: form.legalName.trim() || null,
        taxId: form.taxId.trim() || null,
        verificationDocumentUrl: provider?.verificationDocumentUrl ?? null,
        description: form.description.trim() || null,
      };
      return provider ? (await http.put<Provider>(`/providers/${provider.id}`, body)).data : (await http.post<Provider>("/providers", body)).data;
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["pro"] });
      toast.success(provider ? "Entreprise mise à jour." : "Demande envoyée : votre entreprise est en attente de validation.");
      onSaved(saved);
    },
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {save.isError && <Alert>{errorMessage(save.error)}</Alert>}
      <fieldset disabled={readOnly} className="space-y-4">
        <Input label="Nom commercial" required maxLength={200} value={form.companyName} onChange={update("companyName")} placeholder="Atlas Riads" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Raison sociale" maxLength={200} value={form.legalName} onChange={update("legalName")} />
          <Input label="Identifiant fiscal" maxLength={50} value={form.taxId} onChange={update("taxId")} />
        </div>
        <Textarea label="Présentation" maxLength={4000} rows={4} value={form.description} onChange={update("description")} />
      </fieldset>
      {!readOnly && (
        <Button type="submit" loading={save.isPending}>
          {provider ? "Enregistrer" : "Créer mon entreprise"}
        </Button>
      )}
    </form>
  );
}
