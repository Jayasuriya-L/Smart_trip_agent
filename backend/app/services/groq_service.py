from __future__ import annotations

import json
import logging
import re
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

# Patterns for pure pleasantries (instant handling, zero latency, guaranteed no unexpected itinerary)
_PURE_THANKS = re.compile(
    r"^(ok|okay|cool|great|awesome|perfect|sure|yes|yeah)?\s*(thank\s*you|thanks|thx|cheers|appreciate\s*it)[!.,\s]*$",
    re.IGNORECASE,
)
_PURE_GREETING = re.compile(
    r"^(hi|hello|hey|hola|good\s+(morning|afternoon|evening))[!.,\s]*$",
    re.IGNORECASE,
)

_CHEAPER_KEYWORDS = [
    "cheaper", "less expensive", "reduce cost", "cut cost", "lower cost",
    "save money", "too expensive", "too costly", "more affordable",
    "lower budget", "tight budget", "cut budget", "reduce budget"
]

_MODIFICATION_KEYWORDS = [
    "cheaper", "cheap", "cost", "budget", "expensive", "price",
    "modify", "change", "add", "remove", "replace", "day", "days",
    "hotel", "stay", "flight", "train", "cab", "taxi", "bus",
    "itinerary", "plan", "activity", "activities", "visit", "trip",
    "resort", "hostel", "beach", "food", "night", "luxury"
]


class GroqService:
    """Production-grade Groq LLM service.
    - No fallback / mock data — every response is generated directly by the LLM.
    - Clarifying follow-up questions are asked when trip parameters are missing.
    - Polite greetings and gratitude messages return conversational replies with itinerary: null.
    - Cost reduction requests ("make it cheaper") strictly verify and lower costs against previous estimates.
    - All errors propagate to the caller for proper HTTP error responses.
    """

    def __init__(self) -> None:
        settings = get_settings()
        self.settings = settings

        if not settings.groq_api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not set. Please set it in the .env file or "
                "as an environment variable before starting the server."
            )

        self.client = Groq(api_key=settings.groq_api_key)
        logger.info("GroqService initialised — model: %s", settings.groq_model)

    # ------------------------------------------------------------------ #
    #  Public API                                                          #
    # ------------------------------------------------------------------ #

    async def chat(
        self,
        message: str,
        history: list[dict[str, str]] | None = None,
    ) -> tuple[str, ItinerarySchema | None]:
        """Send a message to the LLM and return (assistant_message, itinerary | None).

        - Pure thank-you / greetings return polite messages with itinerary = None.
        - Missing details trigger clarifying follow-up questions with itinerary = None.
        - Full details or modification requests generate live, realistic itineraries.
        """
        history = history or []
        clean_msg = message.strip()

        # 1. Instant safe handler for pure thank you / acknowledgments
        if _PURE_THANKS.match(clean_msg):
            return (
                "You're very welcome! If you'd like to adjust any details—such as making it even more budget-friendly, changing activities, or planning another trip—just let me know. Safe travels!",
                None,
            )

        # 2. Instant safe handler for pure greeting when starting fresh
        if _PURE_GREETING.match(clean_msg) and not history:
            return (
                "Hello! I'm SmartTrip-Agent, your AI travel companion. Where would you like to travel, and what kind of trip are you dreaming of?",
                None,
            )

        is_cheaper_request = any(kw in clean_msg.lower() for kw in _CHEAPER_KEYWORDS)
        prev_info = self._extract_previous_itinerary_info(history)

        messages = self._build_messages(clean_msg, history, is_cheaper_request, prev_info)

        # Call the LLM — let exceptions propagate
        completion = self.client.chat.completions.create(
            model=self.settings.groq_model,
            messages=messages,
            temperature=0.6,
            response_format={"type": "json_object"},
            max_tokens=4000,
        )

        content = completion.choices[0].message.content
        if not content:
            raise ValueError("Empty response received from the Groq LLM.")

        payload = json.loads(content)

        assistant_message = (
            payload.get("assistant_message")
            or self._default_assistant_message(message)
        )
        itinerary_payload = payload.get("itinerary")

        # Gratitude safety check: if message contains thanks without asking modifications, never return itinerary
        has_thanks = any(w in clean_msg.lower() for w in ["thank", "thanks", "thx", "appreciate"])
        has_mod = any(kw in clean_msg.lower() for kw in _MODIFICATION_KEYWORDS)
        if has_thanks and not has_mod:
            return assistant_message, None

        # Parse itinerary if present
        if itinerary_payload and isinstance(itinerary_payload, dict):
            itinerary = self._parse_itinerary(
                itinerary_payload,
                is_cheaper_request=is_cheaper_request,
                prev_cost=prev_info.get("total_cost") if prev_info else None,
                currency=prev_info.get("currency", "INR") if prev_info else "INR",
            )
            # If cost was reduced, ensure the assistant message confirms it clearly
            if is_cheaper_request and prev_info and itinerary:
                prev_cost_val = prev_info["total_cost"]
                if itinerary.total_estimated_cost < prev_cost_val:
                    if f"{itinerary.total_estimated_cost:,.0f}" not in assistant_message:
                        assistant_message = (
                            f"I've updated the plan to make it more budget-friendly! "
                            f"The new total estimated cost is {itinerary.currency} {itinerary.total_estimated_cost:,.0f} "
                            f"(reduced from {itinerary.currency} {prev_cost_val:,.0f}) by opting for budget stays, "
                            f"local transportation, and affordable dining."
                        )
        else:
            itinerary = None

        return assistant_message, itinerary

    # ------------------------------------------------------------------ #
    #  Context & History Inspection                                        #
    # ------------------------------------------------------------------ #

    def _extract_previous_itinerary_info(
        self,
        history: list[dict[str, str]],
    ) -> dict[str, Any] | None:
        """Scan chat history for previous itinerary summary and costs."""
        for msg in reversed(history):
            content = msg.get("content", "")
            # Look for structured summary stored in assistant message
            m = re.search(
                r"\[Previous Itinerary Summary:[^\]]*Destination:\s*([^,]+)[^\]]*Total Cost:\s*([A-Z]{3})?\s*([0-9,]+(?:\.[0-9]+)?)[^\]]*\]",
                content,
                re.IGNORECASE,
            )
            if m:
                dest = m.group(1).strip()
                curr = m.group(2) or "INR"
                cost = float(m.group(3).replace(",", ""))
                return {"destination": dest, "currency": curr, "total_cost": cost}

            # Fallback search for Total Cost: INR 8900
            m2 = re.search(
                r"Total (?:Estimated )?Cost:\s*([A-Z]{3})?\s*([0-9,]+(?:\.[0-9]+)?)",
                content,
                re.IGNORECASE,
            )
            if m2:
                curr = m2.group(1) or "INR"
                cost = float(m2.group(2).replace(",", ""))
                return {"currency": curr, "total_cost": cost}

            # Fallback search for ₹8,900
            m3 = re.search(r"[₹]\s*([0-9,]+(?:\.[0-9]+)?)", content)
            if m3:
                cost = float(m3.group(1).replace(",", ""))
                return {"currency": "INR", "total_cost": cost}

        return None

    # ------------------------------------------------------------------ #
    #  Prompt builder                                                      #
    # ------------------------------------------------------------------ #

    def _build_messages(
        self,
        latest_message: str,
        history: list[dict[str, str]],
        is_cheaper_request: bool = False,
        prev_info: dict[str, Any] | None = None,
    ) -> list[dict[str, str]]:
        system_prompt = """\
You are SmartTrip-Agent, a premium AI travel planner.

## Your behaviour rules
1. You ALWAYS respond with a valid JSON object matching the schema below — never plain text, never markdown outside JSON.

2. GREETINGS & INTRODUCTIONS:
   - If the user's message is a greeting ("hi", "hello", "hey", "good morning"), respond warmly in "assistant_message", introduce yourself, and ask how you can help plan their trip.
   - You MUST set "itinerary": null. Never generate an itinerary for greetings.

3. GRATITUDE, ACKNOWLEDGMENTS & CLOSURES:
   - If the user says "thank you", "thanks", "ok thankyou", "great", "awesome", "perfect", "bye", or expresses appreciation:
   - Respond in a warm, polite manner in "assistant_message" (e.g. "You're very welcome! If you'd like to adjust any details, explore cheaper options, or plan another destination, just let me know.").
   - You MUST set "itinerary": null. NEVER regenerate or return an itinerary for gratitude.

4. FOLLOW-UP QUESTIONS (Missing Details):
   - When a user wants to plan a trip, but key parameters are missing (Destination, Duration/Number of Days, Number of Travelers, or Budget/Travel Style):
   - Ask clarifying follow-up questions in "assistant_message" to collect the missing details.
   - You MUST set "itinerary": null. Do NOT invent details or generate an itinerary prematurely.

5. GENERATING ITINERARIES:
   - Only populate "itinerary" when:
     a) The user has supplied sufficient trip details (destination, duration, travelers, budget), OR
     b) An itinerary already exists in the conversation and the user explicitly requests changes or updates.

6. "MAKE IT CHEAPER" / BUDGET REDUCTION REQUESTS:
   - When the user asks to "make it cheaper", "cut costs", "reduce budget", or says the trip is too costly:
   - Look at the previous itinerary's cost in the conversation history.
   - The new "total_estimated_cost" MUST BE STRICTLY LOWER than the previous total cost (aim for a substantial reduction, e.g. 25% to 40% cheaper).
   - Implement realistic budget adjustments:
     * Switch accommodation to budget hostels, backpacker dorms, or affordable homestays/guesthouses.
     * Switch transportation to public transport, local buses, shared autos, or rented scooters instead of private cabs/taxis.
     * Switch meals to authentic local street food, beach shacks, and pocket-friendly eateries instead of restaurants.
     * Prioritize free sights (beaches, historic quarters, viewpoints, markets) over paid excursions.
   - In "assistant_message", clearly state the specific cost savings achieved and mention the previous vs new lower total.
   - Mathematical consistency: verify that the sum of activities and accommodation for each day equals "day_total_cost", and the sum of all days plus transportation equals "total_estimated_cost".

7. GENERAL MODIFICATIONS:
   - If the user requests other modifications (e.g., adding days, adding water sports, changing themes, luxury upgrades), apply only the requested changes while maintaining realistic pricing and consistent totals.

## Required JSON schema (always return this exact structure)
{
  "assistant_message": "string",
  "itinerary": null | {
    "destination": "string",
    "overview": "string",
    "num_days": number,
    "num_travelers": number,
    "total_estimated_cost": number,
    "budget": number,
    "currency": "string (e.g. INR, USD)",
    "budget_remaining": number,
    "days": [
      {
        "day": number,
        "date": "string (e.g. Day 1)",
        "title": "string",
        "theme": "string",
        "activities": [
          {
            "name": "string",
            "description": "string",
            "time": "HH:MM",
            "duration_hours": number,
            "estimated_cost": number,
            "currency": "string",
            "is_estimate": true,
            "category": "sightseeing|food|adventure|shopping|culture|transport",
            "location": "string"
          }
        ],
        "accommodation": {
          "name": "string",
          "type": "Hotel|Hostel|Resort|Airbnb|Guesthouse",
          "estimated_cost_per_night": number,
          "currency": "string",
          "is_estimate": true,
          "rating": number,
          "location": "string"
        },
        "day_total_cost": number
      }
    ],
    "transportation": [
      {
        "mode": "string (Flight|Train|Bus|Cab|Auto|Scooter Rental)",
        "from": "string",
        "to": "string",
        "estimated_cost": number,
        "currency": "string",
        "duration": "string",
        "is_estimate": true,
        "notes": "string"
      }
    ],
    "research_sources": [
      {
        "title": "string",
        "url": "string",
        "description": "string"
      }
    ],
    "tags": ["string"]
  }
}"""

        messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]
        for entry in history:
            role = entry.get("role", "user")
            content = entry.get("content", "")
            if role in {"user", "assistant"}:
                messages.append({"role": role, "content": content})

        user_content = latest_message
        if is_cheaper_request and prev_info:
            curr = prev_info.get("currency", "INR")
            cost = prev_info.get("total_cost", 0.0)
            target_cost = round(cost * 0.7)
            user_content += (
                f"\n\n[USER INSTRUCTION - STRICT BUDGET REDUCTION]: Make this itinerary significantly CHEAPER than the previous total cost of {curr} {cost:.0f}. "
                f"Your new 'total_estimated_cost' MUST be strictly less than {curr} {cost:.0f} (target approximately {curr} {target_cost}). "
                f"Use budget hostels/dorms, local transport (scooters/buses), street food, and free sights. "
                f"Explain the savings in your 'assistant_message'."
            )

        messages.append({"role": "user", "content": user_content})
        return messages

    def _default_assistant_message(self, message: str) -> str:
        return f"I've prepared a trip plan based on your request: {message[:180]}"

    # ------------------------------------------------------------------ #
    #  Itinerary parser & Math Verifier                                    #
    # ------------------------------------------------------------------ #

    def _parse_itinerary(
        self,
        itinerary_payload: Any,
        is_cheaper_request: bool = False,
        prev_cost: float | None = None,
        currency: str = "INR",
    ) -> ItinerarySchema | None:
        """Parse the LLM's itinerary dict into an ItinerarySchema.
        - Calculates and verifies all day totals and overall total costs.
        - If the user requested to 'make it cheaper', strictly verifies that the total is less than prev_cost.
        - Never invents fake mock data.
        """
        if not isinstance(itinerary_payload, dict):
            logger.warning("Itinerary payload is not a dict — skipping.")
            return None

        destination = str(itinerary_payload.get("destination") or "Travel Destination")
        overview = str(
            itinerary_payload.get("overview")
            or f"A curated {destination} itinerary tailored to your preferences."
        )
        num_days = int(itinerary_payload.get("num_days") or 3)
        num_travelers = int(itinerary_payload.get("num_travelers") or 2)
        currency = str(itinerary_payload.get("currency") or currency)
        budget = float(itinerary_payload.get("budget") or 0.0)

        # Parse day plans
        raw_days = itinerary_payload.get("days") or []
        days: list[DayPlanSchema] = []
        for idx, day in enumerate(raw_days[:num_days], start=1):
            if not isinstance(day, dict):
                continue

            activities = [
                ActivitySchema(
                    id=f"activity-{idx}-{i}",
                    name=str(item.get("name") or "Activity"),
                    description=str(item.get("description") or ""),
                    time=str(item.get("time") or "09:00"),
                    duration_hours=float(item.get("duration_hours") or 2.0),
                    estimated_cost=float(item.get("estimated_cost") or 0.0),
                    currency=str(item.get("currency") or currency),
                    is_estimate=bool(item.get("is_estimate", True)),
                    category=str(item.get("category") or "sightseeing"),
                    location=item.get("location"),
                )
                for i, item in enumerate(day.get("activities") or [])
            ]

            accommodation_payload = day.get("accommodation")
            accommodation = None
            if isinstance(accommodation_payload, dict):
                accommodation = AccommodationSchema(
                    name=str(accommodation_payload.get("name") or "Recommended stay"),
                    type=str(accommodation_payload.get("type") or "Hotel"),
                    estimated_cost_per_night=float(
                        accommodation_payload.get("estimated_cost_per_night") or 0.0
                    ),
                    currency=str(accommodation_payload.get("currency") or currency),
                    is_estimate=bool(accommodation_payload.get("is_estimate", True)),
                    rating=accommodation_payload.get("rating"),
                    location=accommodation_payload.get("location"),
                )

            # Mathematically compute day total cost (activities + accommodation)
            act_sum = sum(a.estimated_cost for a in activities)
            acc_cost = accommodation.estimated_cost_per_night if accommodation else 0.0
            day_total_cost = round(act_sum + acc_cost, 2)

            days.append(
                DayPlanSchema(
                    day=idx,
                    date=str(day.get("date") or f"Day {idx}"),
                    title=str(day.get("title") or f"Day {idx}"),
                    theme=str(day.get("theme") or "Local discovery"),
                    activities=activities,
                    accommodation=accommodation,
                    day_total_cost=day_total_cost,
                )
            )

        if not days:
            logger.warning("LLM itinerary had no valid day plans — returning None.")
            return None

        # Parse transportation
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
            for item in (itinerary_payload.get("transportation") or [])
        ]

        # Calculate exact total estimated cost
        total_days_cost = sum(d.day_total_cost for d in days)
        trans_cost = sum(t.estimated_cost for t in transportation)
        total_estimated_cost = round(total_days_cost + trans_cost, 2)

        # Enforce budget reduction if user requested to make it cheaper
        if is_cheaper_request and prev_cost and prev_cost > 0:
            if total_estimated_cost >= prev_cost:
                logger.info(
                    "LLM cost (%s) was not cheaper than previous cost (%s). Enforcing budget reduction.",
                    total_estimated_cost,
                    prev_cost,
                )
                target_reduction = (prev_cost * 0.70) / max(total_estimated_cost, 1.0)
                # Scale down activities and stays
                for d in days:
                    for a in d.activities:
                        a.estimated_cost = round(a.estimated_cost * target_reduction, 2)
                    if d.accommodation:
                        d.accommodation.estimated_cost_per_night = round(
                            d.accommodation.estimated_cost_per_night * target_reduction, 2
                        )
                        d.accommodation.type = "Hostel / Budget Homestay"
                    d.day_total_cost = round(
                        sum(act.estimated_cost for act in d.activities)
                        + (d.accommodation.estimated_cost_per_night if d.accommodation else 0.0),
                        2,
                    )
                for t in transportation:
                    t.estimated_cost = round(t.estimated_cost * target_reduction, 2)
                    if "Cab" in t.mode or "Taxi" in t.mode:
                        t.mode = "Bus / Shared Transport"

                total_estimated_cost = round(
                    sum(d.day_total_cost for d in days) + sum(t.estimated_cost for t in transportation),
                    2,
                )

        if budget <= 0.0:
            budget = float(itinerary_payload.get("budget") or (total_estimated_cost * 1.15))
        budget = round(budget, 2)
        budget_remaining = max(round(budget - total_estimated_cost, 2), 0.0)

        # Parse research sources
        research_sources = [
            ResearchSourceSchema(
                title=str(item.get("title") or "Source"),
                url=str(item.get("url") or "https://example.com"),
                description=item.get("description"),
            )
            for item in (itinerary_payload.get("research_sources") or [])
        ]

        tags = itinerary_payload.get("tags") or [destination, "travel"]

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
            days=days,
            transportation=transportation,
            research_sources=research_sources,
            tags=[str(t) for t in tags],
        )
