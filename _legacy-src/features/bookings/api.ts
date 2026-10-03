import { httpClient } from "../../shared/api/httpClient";
import type { Booking, ListingType } from "../../shared/api/types";

export interface CreateBookingPayload {
  listingType: ListingType;
  listingId: string;
  startDate: string;
  endDate: string;
  quantity: number;
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const { data } = await httpClient.post<Booking>("/bookings", payload);
  return data;
}

export async function listMyBookings(): Promise<Booking[]> {
  const { data } = await httpClient.get<Booking[]>("/bookings/me");
  return data;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const { data } = await httpClient.post<Booking>(`/bookings/${id}/cancel`);
  return data;
}
