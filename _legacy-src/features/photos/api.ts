import { httpClient } from "../../shared/api/httpClient";
import type { ListingPhoto, ListingType } from "../../shared/api/types";

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await httpClient.post<{ url: string }>("/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}

export async function listPhotos(listingType: ListingType, listingId: string): Promise<ListingPhoto[]> {
  const { data } = await httpClient.get<ListingPhoto[]>("/listing-photos", { params: { listingType, listingId } });
  return data;
}

export async function addPhoto(listingType: ListingType, listingId: string, url: string): Promise<ListingPhoto> {
  const { data } = await httpClient.post<ListingPhoto>("/listing-photos", { listingType, listingId, url });
  return data;
}

export async function deletePhoto(id: string): Promise<void> {
  await httpClient.delete(`/listing-photos/${id}`);
}
