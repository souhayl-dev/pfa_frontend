import { httpClient } from "../../shared/api/httpClient";
import type { ListingType, Review } from "../../shared/api/types";

export async function listReviews(listingType: ListingType, listingId: string): Promise<Review[]> {
  const { data } = await httpClient.get<Review[]>("/reviews", { params: { listingType, listingId } });
  return data;
}

export interface CreateReviewPayload {
  listingType: ListingType;
  listingId: string;
  rating: number;
  comment: string;
}

export async function createReview(payload: CreateReviewPayload): Promise<Review> {
  const { data } = await httpClient.post<Review>("/reviews", payload);
  return data;
}
