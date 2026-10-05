import { http } from "./http";

/** Stores a file on the API and returns its address, to attach as a listing, unit or profile photo. */
export async function uploadFile(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  return (await http.post<{ url: string }>("/uploads", body)).data.url;
}
