from __future__ import annotations

import json
import logging
from typing import Any

from groq import Groq

from app.config import get_settings
from app.schemas.trip import (
    AccommodationSchema,
    ActivitySchema,
    DayPlanSchema,
    ItinerarySchema,
    ResearchSourceSchema,
    TransportInfoSchema,
)

logger = logging.getLogger(__name__)


class GroqService:
    def __init__(self) -> None:
        settings = get_settings()
        self.settings = settings
        self.client = Groq(api_key=settings.groq_api_key) if settings.groq_api_key else None

    async def chat(
        self,
        message: str,
        history: list[dict[str, str]] | None = None,
    ) -> tuple[str, ItinerarySchema | None]:
        if not self.client:
            logger.warning("Groq API key not configured. Using fallback travel planner response.")
            fallback_itinerary = self._fallback_itinerary(message)
            return (
                "I’m currently running in offline fallback mode. I can still suggest a practical trip plan based on your request.",
                fallback_itinerary,
            )

        messages = self._build_messages(message, history or [])

        try:
            completion = self.client.chat.completions.create(
                model=self.settings.groq_model,
                messages=messages,
                temperature=0.7,
                response_format={"type": "json_object"},
                max_tokens=1800,
            )

            content = completion.choices[0].message.content
            if not content:
                raise ValueError("Empty response from Groq")

            payload = json.loads(content)
            follow_up = self._evaluate_missing_trip_details(message, history or [])
            if follow_up:
                return follow_up, None

            assistant_message = payload.get("assistant_message") or self._default_assistant_message(message)
            itinerary = self._parse_itinerary(payload.get("itinerary"), message)
            return assistant_message, itinerary

        except Exception as exc:  # pragma: no cover - defensive fallback
            logger.exception("Groq request failed: %s", exc)
            fallback_itinerary = self._fallback_itinerary(message)
            return (
                "The AI service is temporarily unavailable, so I prepared a fallback travel plan based on your request.",
                fallback_itinerary,
            )

    def _evaluate_missing_trip_details(
        self,
        latest_message: str,
        history: list[dict[str, str]],
    ) -> str | None:
        combined = " ".join([latest_message] + [entry.get("content", "") for entry in history])
        text = combined.lower()

        destination_keywords = ["destination", "go to", "travel to", "trip to", "visit", "city", "place"]
        has_destination = any(keyword in text for keyword in destination_keywords)

        budget_match = self._extract_budget_from_text(text)
        has_budget = budget_match is not None

        if not has_destination and not has_budget:
            return "Before I build your itinerary, could you share your destination, travel dates, and budget? I’ll tailor the plan around your preferences and price range."

        if not has_budget:
            return "I can create a plan for you, but I need your budget first so I can recommend the right stay, activities, and daily cost range."

        if not has_destination:
            return "I can help with that. Please share your destination, and I’ll build a custom itinerary around it."

        return None

    def _extract_budget_from_text(self, text: str) -> float | None:
        import re

        patterns = [
            r"(?:budget|spend|cost|price)\s*(?:is|around|about|of)?\s*(?:inr\s*)?(?:rs\.?\s*)?(\d+(?:,\d{3})*(?:\.\d+)?)",
            r"(?:my\s+)?(?:budget|limit)\s*(?:is|around|about|of)?\s*(?:inr\s*)?(?:rs\.?\s*)?(\d+(?:,\d{3})*(?:\.\d+)?)",
            r"(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:inr|rs|rupees|k)\b",
        ]

        for pattern in patterns:
            match = re.search(pattern, text, flags=re.IGNORECASE)
            if match:
                value = match.group(1).replace(",", "")
                num = float(value)
                if "k" in match.group(0).lower():
                    num *= 1000
                return num
        return None

    def _build_messages(
        self,
        latest_message: str,
        history: list[dict[str, str]],
    ) -> list[dict[str, str]]:
        system_prompt = (
            "You are SmartTrip-Agent, an expert travel planner. "
            "If the user has not specified the destination, budget, dates, or trip length, ask only the missing questions in a concise, professional, and premium style. "
            "Do not invent a budget or create a fake itinerary until the required trip details are known. "
            "When enough details are present, return JSON with this structure: {\n"
            "  \"assistant_message\": string,\n"
            "  \"itinerary\": {\n"
            "    \"destination\": string,\n"
            "    \"overview\": string,\n"
            "    \"num_days\": number,\n"
            "    \"num_travelers\": number,\n"
            "    \"total_estimated_cost\": number,\n"
            "    \"budget\": number,\n"
            "    \"currency\": string,\n"
            "    \"budget_remaining\": number,\n"
            "    \"days\": [ { day, date, title, theme, activities: [ { name, description, time, duration_hours, estimated_cost, currency, is_estimate, category, location } ], accommodation: { name, type, estimated_cost_per_night, currency, is_estimate, rating, location }, day_total_cost } ],\n"
            "    \"transportation\": [ { mode, from, to, estimated_cost, currency, duration, is_estimate, notes } ],\n"
            "    \"research_sources\": [ { title, url, description } ],\n"
            "    \"tags\": [string]\n"
            "  }\n"
            "}"
        )

        messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]
        for entry in history:
            role = entry.get("role", "user")
            content = entry.get("content", "")
            if role in {"user", "assistant"}:
                messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": latest_message})
        return messages

    def _default_assistant_message(self, message: str) -> str:
        return f"I’ve prepared a trip plan for your request: {message[:180]}"

    def _parse_itinerary(self, itinerary_payload: Any, message: str) -> ItinerarySchema | None:
        if not isinstance(itinerary_payload, dict):
            return self._fallback_itinerary(message)

        if not itinerary_payload.get("budget") and not self._extract_budget_from_text(message.lower()):
            return None

        destination = str(itinerary_payload.get("destination") or "Travel Destination")
        overview = str(itinerary_payload.get("overview") or f"A curated {destination} itinerary tailored to your preferences.")
        num_days = int(itinerary_payload.get("num_days") or 3)
        num_travelers = int(itinerary_payload.get("num_travelers") or 2)
        total_estimated_cost = float(itinerary_payload.get("total_estimated_cost") or 0.0)
        budget = float(itinerary_payload.get("budget") or total_estimated_cost or 10000)
        currency = str(itinerary_payload.get("currency") or "INR")
        budget_remaining = float(itinerary_payload.get("budget_remaining") or max(budget - total_estimated_cost, 0.0))

        raw_days = itinerary_payload.get("days") or []
        days: list[DayPlanSchema] = []
        for idx, day in enumerate(raw_days[:num_days], start=1):
            if not isinstance(day, dict):
                continue
            activities_payload = day.get("activities") or []
            activities = [
                ActivitySchema(
                    id=f"activity-{idx}-{i}",
                    name=str(item.get("name") or "Activity"),
                    description=str(item.get("description") or "Planned activity."),
                    time=str(item.get("time") or "09:00"),
                    duration_hours=float(item.get("duration_hours") or 2.0),
                    estimated_cost=float(item.get("estimated_cost") or 0.0),
                    currency=str(item.get("currency") or currency),
                    is_estimate=bool(item.get("is_estimate", True)),
                    category=str(item.get("category") or "sightseeing"),
                    location=item.get("location"),
                )
                for i, item in enumerate(activities_payload)
            ]

            accommodation_payload = day.get("accommodation")
            accommodation = None
            if isinstance(accommodation_payload, dict):
                accommodation = AccommodationSchema(
                    name=str(accommodation_payload.get("name") or "Recommended stay"),
                    type=str(accommodation_payload.get("type") or "Hotel"),
                    estimated_cost_per_night=float(accommodation_payload.get("estimated_cost_per_night") or 0.0),
                    currency=str(accommodation_payload.get("currency") or currency),
                    is_estimate=bool(accommodation_payload.get("is_estimate", True)),
                    rating=accommodation_payload.get("rating"),
                    location=accommodation_payload.get("location"),
                )

            days.append(
                DayPlanSchema(
                    day=idx,
                    date=str(day.get("date") or f"Day {idx}"),
                    title=str(day.get("title") or f"Day {idx}"),
                    theme=str(day.get("theme") or "Local discovery"),
                    activities=activities,
                    accommodation=accommodation,
                    day_total_cost=float(day.get("day_total_cost") or 0.0),
                )
            )

        transportation_payload = itinerary_payload.get("transportation") or []
        transportation = [
            TransportInfoSchema(
                mode=str(item.get("mode") or "Road"),
                from_=str(item.get("from") or "Start"),
                to=str(item.get("to") or destination),
                estimated_cost=float(item.get("estimated_cost") or 0.0),
                currency=str(item.get("currency") or currency),
                duration=str(item.get("duration") or "Flexible"),
                is_estimate=bool(item.get("is_estimate", True)),
                notes=item.get("notes"),
            )
            for item in transportation_payload
        ]

        research_sources_payload = itinerary_payload.get("research_sources") or []
        research_sources = [
            ResearchSourceSchema(
                title=str(item.get("title") or "Local source"),
                url=str(item.get("url") or "https://example.com"),
                description=item.get("description"),
            )
            for item in research_sources_payload
        ]

        tags = itinerary_payload.get("tags") or [destination, "travel", "recommended"]

        return ItinerarySchema(
            id=f"itin-{destination.lower().replace(' ', '-')}-{num_days}",
            destination=destination,
            overview=overview,
            num_days=num_days,
            num_travelers=num_travelers,
            total_estimated_cost=total_estimated_cost,
            budget=budget,
            currency=currency,
            budget_remaining=budget_remaining,
            days=days or [self._fallback_day_plan(1, destination)],
            transportation=transportation,
            research_sources=research_sources,
            tags=[str(tag) for tag in tags],
        )

    def _fallback_itinerary(self, message: str) -> ItinerarySchema:
        destination = "Suggested Destination"
        if "ooty" in message.lower() or "ooty" in message.lower():
            destination = "Ooty"
        elif "goa" in message.lower():
            destination = "Goa"
        elif "jaipur" in message.lower():
            destination = "Jaipur"
        elif "manali" in message.lower():
            destination = "Manali"

        return ItinerarySchema(
            id=f"fallback-{destination.lower().replace(' ', '-')}-3",
            destination=destination,
            overview=f"A practical {destination} travel plan tailored to your preferences and budget.",
            num_days=3,
            num_travelers=2,
            total_estimated_cost=8200,
            budget=10000,
            currency="INR",
            budget_remaining=1800,
            days=[self._fallback_day_plan(1, destination), self._fallback_day_plan(2, destination), self._fallback_day_plan(3, destination)],
            transportation=[
                TransportInfoSchema(
                    mode="Taxi",
                    from_="Arrival point",
                    to=destination,
                    estimated_cost=1400,
                    currency="INR",
                    duration="1-2 hours",
                    is_estimate=True,
                    notes="Estimated local transfer.",
                )
            ],
            research_sources=[
                ResearchSourceSchema(
                    title="Local travel guidance",
                    url="https://example.com",
                    description="General destination planning reference.",
                )
            ],
            tags=[destination, "trip plan", "budget travel"],
        )

    def _fallback_day_plan(self, day_number: int, destination: str) -> DayPlanSchema:
        return DayPlanSchema(
            day=day_number,
            date=f"Day {day_number}",
            title=f"Explore {destination}",
            theme="City and culture",
            activities=[
                ActivitySchema(
                    id=f"fallback-{day_number}-1",
                    name="Local sightseeing",
                    description="Explore the highlight attractions and scenic spots of the destination.",
                    time="09:00",
                    duration_hours=3,
                    estimated_cost=800,
                    currency="INR",
                    is_estimate=True,
                    category="sightseeing",
                    location=destination,
                ),
                ActivitySchema(
                    id=f"fallback-{day_number}-2",
                    name="Local food experience",
                    description="Try regional dishes and cafés around the city center.",
                    time="13:00",
                    duration_hours=2,
                    estimated_cost=600,
                    currency="INR",
                    is_estimate=True,
                    category="food",
                    location=destination,
                ),
            ],
            accommodation=AccommodationSchema(
                name="Recommended stay",
                type="Hotel",
                estimated_cost_per_night=2500,
                currency="INR",
                is_estimate=True,
                rating=4.3,
                location=destination,
            ),
            day_total_cost=3500,
        )
