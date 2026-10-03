import { httpClient } from "../../shared/api/httpClient";
import type { Address, AttractionListing, AttractionType } from "../../shared/api/types";

export interface SearchAttractionsParams {
  city?: string;
  attractionType?: AttractionType;
}

export async function searchAttractions(params: SearchAttractionsParams): Promise<AttractionListing[]> {
  const { data } = await httpClient.get<AttractionListing[]>("/attractions", { params });
  return data;
}

export async function getAttraction(id: string): Promise<AttractionListing> {
  const { data } = await httpClient.get<AttractionListing>(`/attractions/${id}`);
  return data;
}

export async function listMyAttractions(): Promise<AttractionListing[]> {
  const { data } = await httpClient.get<AttractionListing[]>("/attractions/mine");
  return data;
}

export interface AttractionListingPayload {
  title: string;
  description: string;
  address: Address;
  basePrice: number;
  currency: string;
  capacity: number;
  attractionType: AttractionType;
  durationMinutes: number | null;
}

export async function createAttraction(payload: AttractionListingPayload): Promise<AttractionListing> {
  const { data } = await httpClient.post<AttractionListing>("/attractions", payload);
  return data;
}

export async function updateAttraction(id: string, payload: AttractionListingPayload): Promise<AttractionListing> {
  const { data } = await httpClient.put<AttractionListing>(`/attractions/${id}`, payload);
  return data;
}

export async function publishAttraction(id: string): Promise<AttractionListing> {
  const { data } = await httpClient.post<AttractionListing>(`/attractions/${id}/publish`);
  return data;
}

export async function archiveAttraction(id: string): Promise<AttractionListing> {
  const { data } = await httpClient.post<AttractionListing>(`/attractions/${id}/archive`);
  return data;
}
