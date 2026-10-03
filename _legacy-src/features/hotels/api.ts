import { httpClient } from "../../shared/api/httpClient";
import type { Address, HotelListing } from "../../shared/api/types";

export interface SearchHotelsParams {
  city?: string;
  minStarRating?: number;
}

export async function searchHotels(params: SearchHotelsParams): Promise<HotelListing[]> {
  const { data } = await httpClient.get<HotelListing[]>("/hotels", { params });
  return data;
}

export async function getHotel(id: string): Promise<HotelListing> {
  const { data } = await httpClient.get<HotelListing>(`/hotels/${id}`);
  return data;
}

export async function listMyHotels(): Promise<HotelListing[]> {
  const { data } = await httpClient.get<HotelListing[]>("/hotels/mine");
  return data;
}

export interface HotelListingPayload {
  title: string;
  description: string;
  address: Address;
  basePrice: number;
  currency: string;
  capacity: number;
  starRating: number | null;
}

export async function createHotel(payload: HotelListingPayload): Promise<HotelListing> {
  const { data } = await httpClient.post<HotelListing>("/hotels", payload);
  return data;
}

export async function updateHotel(id: string, payload: HotelListingPayload): Promise<HotelListing> {
  const { data } = await httpClient.put<HotelListing>(`/hotels/${id}`, payload);
  return data;
}

export async function publishHotel(id: string): Promise<HotelListing> {
  const { data } = await httpClient.post<HotelListing>(`/hotels/${id}/publish`);
  return data;
}

export async function archiveHotel(id: string): Promise<HotelListing> {
  const { data } = await httpClient.post<HotelListing>(`/hotels/${id}/archive`);
  return data;
}
