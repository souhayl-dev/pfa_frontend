import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import { translate } from "./errorMessages";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

export const http = axios.create({ baseURL: API_BASE_URL });

/** Uploaded files are served from the API origin at /uploads/**, not under the /api prefix. */
export function resolveAssetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const origin = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${origin}${path}`;
}

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // An expired or revoked token; a failed login is a 401 too, but there is no session to clear.
    if (error.response?.status === 401 && useAuthStore.getState().token) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "Le serveur est injoignable. Vérifiez que l'API est démarrée.";
    const message = error.response.data?.message as string | undefined;
    if (message) return translate(message);
  }
  return "Une erreur est survenue. Veuillez réessayer.";
}
