import {
  ChatRequest,
  ChatResponse,
  Trip,
  TripListResponse,
  TripRequirements,
  Itinerary,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Generic fetcher ───────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? "API request failed");
  }

  return res.json() as Promise<T>;
}

// ── Chat ──────────────────────────────────────────────────────
export const chatApi = {
  sendMessage: (payload: ChatRequest): Promise<ChatResponse> =>
    apiFetch<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ── Trips ─────────────────────────────────────────────────────
export const tripsApi = {
  createTrip: (requirements: TripRequirements): Promise<Trip> =>
    apiFetch<Trip>("/api/trips", {
      method: "POST",
      body: JSON.stringify(requirements),
    }),

  listTrips: (): Promise<TripListResponse> =>
    apiFetch<TripListResponse>("/api/trips"),

  getTrip: (tripId: string): Promise<Trip> =>
    apiFetch<Trip>(`/api/trips/${tripId}`),

  getItinerary: (tripId: string): Promise<Itinerary> =>
    apiFetch<Itinerary>(`/api/trips/${tripId}/itinerary`),
};
