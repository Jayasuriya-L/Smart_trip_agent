// ────────────────────────────────────────────────────────────
//  TypeScript interfaces for SmartTrip-Agent
// ────────────────────────────────────────────────────────────

// ── Chat ──────────────────────────────────────────────────────
export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  itinerary?: Itinerary;
  isLoading?: boolean;
}

export interface ChatRequest {
  message: string;
  session_id: string;
}

export interface ChatResponse {
  message: string;
  session_id: string;
  itinerary?: Itinerary;
}

// ── Trip Requirements ─────────────────────────────────────────
export interface TripRequirements {
  from_location: string;
  destination: string;
  start_date: string;
  end_date: string;
  num_days: number;
  num_travelers: number;
  budget: number;
  currency: string;
  travel_style: TravelStyle;
  interests: string[];
}

export type TravelStyle =
  | "budget"
  | "mid-range"
  | "luxury"
  | "backpacker"
  | "family"
  | "adventure";

// ── Itinerary ─────────────────────────────────────────────────
export interface Activity {
  id: string;
  name: string;
  description: string;
  time: string;
  duration_hours: number;
  estimated_cost: number;
  currency: string;
  is_estimate: boolean;
  category: ActivityCategory;
  location?: string;
}

export type ActivityCategory =
  | "sightseeing"
  | "food"
  | "accommodation"
  | "transport"
  | "adventure"
  | "shopping"
  | "culture"
  | "relaxation";

export interface DayPlan {
  day: number;
  date: string;
  title: string;
  theme: string;
  activities: Activity[];
  accommodation?: AccommodationSuggestion;
  day_total_cost: number;
}

export interface AccommodationSuggestion {
  name: string;
  type: string;
  estimated_cost_per_night: number;
  currency: string;
  is_estimate: boolean;
  rating?: number;
  location?: string;
}

export interface TransportInfo {
  mode: string;
  from: string;
  to: string;
  estimated_cost: number;
  currency: string;
  duration: string;
  is_estimate: boolean;
  notes?: string;
}

export interface ResearchSource {
  title: string;
  url: string;
  description?: string;
}

export interface Itinerary {
  id: string;
  destination: string;
  overview: string;
  num_days: number;
  num_travelers: number;
  total_estimated_cost: number;
  budget: number;
  currency: string;
  budget_remaining: number;
  days: DayPlan[];
  transportation: TransportInfo[];
  research_sources: ResearchSource[];
  created_at: string;
  tags: string[];
}

// ── Trip (saved) ──────────────────────────────────────────────
export interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  created_at: string;
  session_id: string;
  itinerary?: Itinerary;
  requirements?: TripRequirements;
}

export interface TripListResponse {
  trips: Trip[];
  total: number;
}

// ── API helpers ───────────────────────────────────────────────
export interface ApiError {
  detail: string;
  status_code: number;
}

export interface Conversation {
  id: string;
  title: string;
  last_message: string;
  updated_at: string;
  session_id: string;
}
