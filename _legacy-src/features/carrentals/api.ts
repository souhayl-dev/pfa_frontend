import { httpClient } from "../../shared/api/httpClient";
import type { Address, CarRentalListing, FuelType, VehicleTransmission } from "../../shared/api/types";

export interface SearchCarRentalsParams {
  city?: string;
  transmission?: VehicleTransmission;
  fuelType?: FuelType;
}

export async function searchCarRentals(params: SearchCarRentalsParams): Promise<CarRentalListing[]> {
  const { data } = await httpClient.get<CarRentalListing[]>("/car-rentals", { params });
  return data;
}

export async function getCarRental(id: string): Promise<CarRentalListing> {
  const { data } = await httpClient.get<CarRentalListing>(`/car-rentals/${id}`);
  return data;
}

export async function listMyCarRentals(): Promise<CarRentalListing[]> {
  const { data } = await httpClient.get<CarRentalListing[]>("/car-rentals/mine");
  return data;
}

export interface CarRentalListingPayload {
  title: string;
  description: string;
  address: Address;
  basePrice: number;
  currency: string;
  seats: number;
  transmission: VehicleTransmission;
  fuelType: FuelType;
}

export async function createCarRental(payload: CarRentalListingPayload): Promise<CarRentalListing> {
  const { data } = await httpClient.post<CarRentalListing>("/car-rentals", payload);
  return data;
}

export async function updateCarRental(id: string, payload: CarRentalListingPayload): Promise<CarRentalListing> {
  const { data } = await httpClient.put<CarRentalListing>(`/car-rentals/${id}`, payload);
  return data;
}

export async function publishCarRental(id: string): Promise<CarRentalListing> {
  const { data } = await httpClient.post<CarRentalListing>(`/car-rentals/${id}/publish`);
  return data;
}

export async function archiveCarRental(id: string): Promise<CarRentalListing> {
  const { data } = await httpClient.post<CarRentalListing>(`/car-rentals/${id}/archive`);
  return data;
}
