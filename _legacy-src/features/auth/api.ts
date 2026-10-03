import { httpClient } from "../../shared/api/httpClient";
import type { AuthResponse, Role } from "../../shared/api/types";

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload) {
  await httpClient.post("/auth/register", payload);
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await httpClient.post<AuthResponse>("/auth/login", payload);
  return data;
}
