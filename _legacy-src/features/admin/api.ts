import { httpClient } from "../../shared/api/httpClient";
import type {
  AttractionListing,
  CarRentalListing,
  HotelListing,
  PlatformStats,
  UserProfile,
} from "../../shared/api/types";

export async function listUsers(): Promise<UserProfile[]> {
  const { data } = await httpClient.get<UserProfile[]>("/admin/users");
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await httpClient.delete(`/admin/users/${id}`);
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const { data } = await httpClient.get<PlatformStats>("/admin/stats");
  return data;
}

export async function listAllHotelListings(): Promise<HotelListing[]> {
  const { data } = await httpClient.get<HotelListing[]>("/admin/listings/hotels");
  return data;
}

export async function listAllCarRentalListings(): Promise<CarRentalListing[]> {
  const { data } = await httpClient.get<CarRentalListing[]>("/admin/listings/car-rentals");
  return data;
}

export async function listAllAttractionListings(): Promise<AttractionListing[]> {
  const { data } = await httpClient.get<AttractionListing[]>("/admin/listings/attractions");
  return data;
}

export async function archiveHotelListing(id: string): Promise<void> {
  await httpClient.post(`/admin/listings/hotels/${id}/archive`);
}

export async function archiveCarRentalListing(id: string): Promise<void> {
  await httpClient.post(`/admin/listings/car-rentals/${id}/archive`);
}

export async function archiveAttractionListing(id: string): Promise<void> {
  await httpClient.post(`/admin/listings/attractions/${id}/archive`);
}
