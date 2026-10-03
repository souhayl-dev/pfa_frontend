import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { errorMessage, http, resolveAssetUrl } from "../../shared/api/http";
import type { Photo } from "../../shared/api/types";
import { toast } from "../../shared/stores/toastStore";
import { uploadFile } from "./api";

interface PhotoManagerProps {
  photos: Photo[];
  /** Where new photos are attached: /manage/listings/{id}/photos or /manage/units/{id}/photos. */
  target: string;
  listingId: string;
  canManage: boolean;
}

export function PhotoManager({ photos, target, listingId, canManage }: PhotoManagerProps) {
  const queryClient = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["pro"] });
    queryClient.invalidateQueries({ queryKey: ["listing", listingId] });
    queryClient.invalidateQueries({ queryKey: ["catalog"] });
  };

  const add = useMutation({
    mutationFn: async (files: File[]) => {
      for (const file of files) {
        await http.post(target, { url: await uploadFile(file) });
      }
    },
    onSuccess: refresh,
    onError: (error) => {
      refresh();
      toast.error(errorMessage(error));
    },
  });
  const remove = useMutation({
    mutationFn: (photoId: string) => http.delete(`/manage/photos/${photoId}`),
    onSuccess: refresh,
    onError: (error) => toast.error(errorMessage(error)),
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo, index) => (
        <figure key={photo.id} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand-100">
          <img src={resolveAssetUrl(photo.url)} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
          {index === 0 && <figcaption className="absolute top-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-xs font-bold">Couverture</figcaption>}
          {canManage && (
            <button
              onClick={() => remove.mutate(photo.id)}
              aria-label={`Supprimer la photo ${index + 1}`}
              className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-rose-600 opacity-0 shadow transition group-hover:opacity-100 focus:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </figure>
      ))}
      {canManage && (
        <>
          <button
            onClick={() => input.current?.click()}
            disabled={add.isPending}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sand-300 text-sm font-semibold text-ink-500 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
          >
            {add.isPending ? <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden /> : <ImagePlus className="h-6 w-6" aria-hidden />}
            {add.isPending ? "Envoi..." : "Ajouter des photos"}
          </button>
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => {
              const files = [...(event.target.files ?? [])];
              if (files.length) add.mutate(files);
              event.target.value = "";
            }}
          />
        </>
      )}
      {!canManage && photos.length === 0 && <p className="col-span-full text-sm text-ink-500">Aucune photo.</p>}
    </div>
  );
}
