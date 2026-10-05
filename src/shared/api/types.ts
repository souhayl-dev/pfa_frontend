// Mirrors the request and response classes of the backend's api module.

export type ListingType = "HOTEL" | "RESTAURANT" | "GUIDE" | "TRAVEL_AGENCY" | "CAR_RENTAL_AGENCY";
export type ListingSort = "RECOMMENDED" | "PRICE_ASC" | "PRICE_DESC" | "RATING" | "NAME";
export type ListingStatus = "DRAFT" | "ACTIVE" | "INACTIVE";
export type UnitType = "ROOM" | "TABLE" | "GUIDE_SERVICE" | "TRANSPORT" | "TOUR" | "CAR";
export type PricingUnit = "PER_NIGHT" | "PER_DAY" | "PER_TRIP" | "PER_PERSON";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
export type ProviderStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type MemberRole = "OWNER" | "MANAGER" | "STAFF";
export type MemberStatus = "ACTIVE" | "SUSPENDED";
export type Gender = "MALE" | "FEMALE";
export type UserRole = "ADMIN";

export type RoomType = "SINGLE" | "DOUBLE" | "TWIN" | "TRIPLE" | "SUITE" | "FAMILY";
export type CarCategory = "ECONOMY" | "COMPACT" | "SUV" | "LUXURY" | "VAN";
export type Transmission = "MANUAL" | "AUTOMATIC";
export type FuelType = "PETROL" | "DIESEL" | "HYBRID" | "ELECTRIC";
export type VehicleType = "CAR" | "VAN" | "MINIBUS" | "BUS" | "FOUR_BY_FOUR";

export interface ApiError {
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface User {
  id: string;
  email: string;
  username: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  gender: Gender | null;
  profileImage: string | null;
  active: boolean;
  verified: boolean;
  notificationsEnabled: boolean;
  roles: UserRole[];
  clientId: string | null;
  nationality: string | null;
  birthDate: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Photo {
  id: string;
  url: string;
  sortOrder: number;
}

export interface HotelDetails {
  stars: number | null;
  checkInTime: string | null;
  checkOutTime: string | null;
}
export interface RestaurantDetails {
  cuisineType: string | null;
}
export interface GuideDetails {
  yearsExperience: number | null;
}
export interface TravelAgencyDetails {
  licenseNumber: string;
}
export interface CarRentalAgencyDetails {
  licenseNumber: string;
  minDriverAge: number;
  depositAmount: number;
}

export interface RoomDetails {
  roomNumber: string;
  roomType: RoomType;
}
export interface CarDetails {
  brand: string;
  model: string;
  year: number;
  category: CarCategory;
  transmission: Transmission;
  fuelType: FuelType;
  doors: number;
  hasAc: boolean;
  plateNumber: string;
  mileageLimitKm: number | null;
}
export interface TransportDetails {
  vehicleType: VehicleType;
}
export interface TourStep {
  stepOrder: number;
  dayNumber: number;
  city: string;
  description: string | null;
}
export interface TourDetails {
  durationDays: number;
  steps: TourStep[];
}

export interface Unit {
  id: string;
  listingId: string;
  type: UnitType;
  pricingUnit: PricingUnit;
  name: string;
  description: string | null;
  basePrice: number;
  currency: string;
  capacity: number;
  active: boolean;
  room?: RoomDetails;
  car?: CarDetails;
  transport?: TransportDetails;
  tour?: TourDetails;
  photos: Photo[];
}

export interface UnitRequest {
  type: UnitType;
  name: string;
  description: string | null;
  basePrice: number;
  capacity: number;
  room?: RoomDetails;
  car?: CarDetails;
  transport?: TransportDetails;
  tour?: TourDetails;
}

export interface ListingSummary {
  id: string;
  providerId: string;
  type: ListingType;
  name: string;
  city: string;
  countryCode: string;
  status: ListingStatus;
  currency: string;
  ratingAvg: number;
  reviewsCount: number;
  coverPhotoUrl: string | null;
  fromPrice: number | null;
}

/** Each facet applies every filter except its own; the price bounds are null when nothing has a price. */
export interface ListingFacets {
  total: number;
  types: Partial<Record<ListingType, number>>;
  cities: Record<string, number>;
  minPrice: number | null;
  maxPrice: number | null;
}

export interface Listing {
  id: string;
  providerId: string;
  providerName: string;
  type: ListingType;
  name: string;
  description?: string;
  address?: string;
  city: string;
  countryCode: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  currency: string;
  phone?: string;
  email?: string;
  status: ListingStatus;
  ratingAvg: number;
  reviewsCount: number;
  hotel?: HotelDetails;
  restaurant?: RestaurantDetails;
  guide?: GuideDetails;
  travelAgency?: TravelAgencyDetails;
  carRentalAgency?: CarRentalAgencyDetails;
  photos: Photo[];
  units: Unit[];
}

export interface ListingRequest {
  type: ListingType;
  name: string;
  description: string | null;
  address: string | null;
  city: string;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  phone: string | null;
  email: string | null;
  hotel?: HotelDetails;
  restaurant?: RestaurantDetails;
  guide?: GuideDetails;
  travelAgency?: TravelAgencyDetails;
  carRentalAgency?: CarRentalAgencyDetails;
}

export interface Quote {
  available: boolean;
  reason: string | null;
  startAt: string;
  endAt: string;
  billedUnits: number;
  unitPrice: number;
  total: number;
  currency: string;
}

export interface Booking {
  id: string;
  code: string;
  listingId: string;
  listingName: string;
  timezone: string;
  unitId: string;
  unitName: string;
  unitType: UnitType;
  status: BookingStatus;
  startAt: string;
  endAt: string;
  guestsCount: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  specialRequests: string | null;
  clientName: string | null;
  reviewId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceBookingRequest {
  unitId: string;
  start: string | null;
  end: string | null;
  guestsCount: number;
  specialRequests: string | null;
}

export interface StatusChange {
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  changedBy: string | null;
  reason: string | null;
  changedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  authorName: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  companyName: string;
  legalName: string | null;
  taxId: string | null;
  verificationDocumentUrl: string | null;
  description: string | null;
  status: ProviderStatus;
  createdAt: string;
}

export interface ProviderRequest {
  companyName: string;
  legalName: string | null;
  taxId: string | null;
  verificationDocumentUrl: string | null;
  description: string | null;
}

export interface Membership {
  memberId: string;
  providerId: string;
  companyName: string;
  providerStatus: ProviderStatus;
  role: MemberRole;
  status: MemberStatus;
}

export interface Member {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
}
