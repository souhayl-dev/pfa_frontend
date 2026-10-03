import { httpClient } from "../../shared/api/httpClient";
import type { UserProfile } from "../../shared/api/types";

export async function getMyProfile(): Promise<UserProfile> {
  const { data } = await httpClient.get<UserProfile>("/profile/me");
  return data;
}

export async function updateProfile(payload: { fullName: string; email: string }): Promise<UserProfile> {
  const { data } = await httpClient.patch<UserProfile>("/profile/me", payload);
  return data;
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
  await httpClient.post("/profile/me/change-password", payload);
}
