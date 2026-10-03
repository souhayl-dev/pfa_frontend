export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN";

export type ListingType = "HOTEL" | "CAR_RENTAL" | "ATTRACTION";

export type AttractionType = "ACTIVITY" | "RESTAURATION" | "CIRCUIT";

export type VehicleTransmission = "MANUAL" | "AUTOMATIC";

export type FuelType = "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID";

export type ListingStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type BookingStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Address {
  line1?: string;
  city: string;
  country: string;
}

export interface HotelListing {
  id: string;
  providerId: string;
  title: string;
  description: string;
  address: Address;
  basePrice: number;
  currency: string;
  capacity: number;
  starRating: number | null;
  status: ListingStatus;
  coverPhotoUrl: string | null;
}

export interface CarRentalListing {
  id: string;
  providerId: string;
  title: string;
  description: string;
  address: Address;
  basePrice: number;
  currency: string;
  seats: number;
  transmission: VehicleTransmission;
  fuelType: FuelType;
  status: ListingStatus;
  coverPhotoUrl: string | null;
}

export interface AttractionListing {
  id: string;
  providerId: string;
  title: string;
  description: string;
  address: Address;
  basePrice: number;
  currency: string;
  capacity: number;
  attractionType: AttractionType;
  durationMinutes: number | null;
  status: ListingStatus;
  coverPhotoUrl: string | null;
}

export interface ListingPhoto {
  id: string;
  listingType: ListingType;
  listingId: string;
  url: string;
  displayOrder: number;
}

export interface Booking {
  id: string;
  listingType: ListingType;
  listingId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  quantity: number;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
}

export interface Review {
  id: string;
  listingType: ListingType;
  listingId: string;
  customerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  emailVerified: boolean;
}

export interface PlatformStats {
  totalUsers: number;
  totalProviders: number;
  totalCustomers: number;
  totalHotelListings: number;
  totalCarRentalListings: number;
  totalAttractionListings: number;
  totalBookings: number;
}

export interface AuthResponse {
  token: string;
  userId: string;
  role: Role;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
