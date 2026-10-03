import { useRef } from "react";
import type { ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Trash2 } from "lucide-react";
import { addPhoto, deletePhoto, listPhotos, uploadFile } from "./api";
import { resolveAssetUrl, extractErrorMessage } from "../../shared/api/httpClient";
import { Button } from "../../shared/components/ui/Button";
import { Alert } from "../../shared/components/ui/Alert";
import type { ListingType } from "../../shared/api/types";

export function PhotoManager({ listingType, listingId }: { listingType: ListingType; listingId: string }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: photos } = useQuery({
    queryKey: ["listing-photos", listingType, listingId],
    queryFn: () => listPhotos(listingType, listingId),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const url = await uploadFile(file);
      return addPhoto(listingType, listingId, url);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listing-photos", listingType, listingId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePhoto,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["listing-photos", listingType, listingId] }),
  });

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    event.target.value = "";
  }

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200 p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-neutral-900">Photos</p>
        <Button size="sm" icon={<ImagePlus className="size-4" />} loading={uploadMutation.isPending}
                onClick={() => fileInputRef.current?.click()}>
          Ajouter une photo
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {photos && photos.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg">
              <img src={resolveAssetUrl(photo.url)} alt="" className="size-full object-cover" />
              <button
                onClick={() => deleteMutation.mutate(photo.id)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {uploadMutation.isError && <Alert variant="error">{extractErrorMessage(uploadMutation.error)}</Alert>}
    </div>
  );
}
