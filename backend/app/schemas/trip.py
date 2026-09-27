from __future__ import annotations
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, Field
import uuid


# ── Chat schemas ──────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))


class ChatResponse(BaseModel):
    message: str
    session_id: str
    itinerary: Optional[ItinerarySchema] = None


# ── Activity schemas ──────────────────────────────────────────

class ActivitySchema(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    time: str
    duration_hours: float
    estimated_cost: float
    currency: str = "INR"
    is_estimate: bool = True
    category: str
    location: Optional[str] = None


# ── Accommodation schema ──────────────────────────────────────

class AccommodationSchema(BaseModel):
    name: str
    type: str
    estimated_cost_per_night: float
    currency: str = "INR"
    is_estimate: bool = True
    rating: Optional[float] = None
    location: Optional[str] = None


# ── Day plan schema ───────────────────────────────────────────

class DayPlanSchema(BaseModel):
    day: int
    date: str
    title: str
    theme: str
    activities: list[ActivitySchema]
    accommodation: Optional[AccommodationSchema] = None
    day_total_cost: float


# ── Transport schema ──────────────────────────────────────────

class TransportInfoSchema(BaseModel):
    mode: str
    from_: str = Field(alias="from")
    to: str
    estimated_cost: float
    currency: str = "INR"
    duration: str
    is_estimate: bool = True
    notes: Optional[str] = None

    model_config = {"populate_by_name": True}


# ── Research source schema ────────────────────────────────────

class ResearchSourceSchema(BaseModel):
    title: str
    url: str
    description: Optional[str] = None


# ── Itinerary schema ──────────────────────────────────────────

class ItinerarySchema(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    destination: str
    overview: str
    num_days: int
    num_travelers: int
    total_estimated_cost: float
    budget: float
    currency: str = "INR"
    budget_remaining: float
    days: list[DayPlanSchema]
    transportation: list[TransportInfoSchema] = []
    research_sources: list[ResearchSourceSchema] = []
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    tags: list[str] = []


# ── Trip requirement schemas ──────────────────────────────────

class TripRequirementsSchema(BaseModel):
    from_location: str
    destination: str
    start_date: str
    end_date: str
    num_days: int = Field(ge=1, le=30)
    num_travelers: int = Field(ge=1, le=20)
    budget: float = Field(gt=0)
    currency: str = "INR"
    travel_style: str = "mid-range"
    interests: list[str] = []


class TripResponseSchema(BaseModel):
    id: str
    title: str
    destination: str
    start_date: Optional[str]
    end_date: Optional[str]
    created_at: str
    session_id: str
    itinerary: Optional[ItinerarySchema] = None

    model_config = {"from_attributes": True}


class TripListResponse(BaseModel):
    trips: list[TripResponseSchema]
    total: int
