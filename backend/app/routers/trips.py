"""
Trips router — manages saved trips & itineraries.
Endpoints:
  POST /api/trips              - Save trip requirements & generate itinerary
  GET  /api/trips              - List saved trips
  GET  /api/trips/{trip_id}    - Get single trip
  GET  /api/trips/{trip_id}/itinerary - Get itinerary for a trip
"""
from __future__ import annotations

import logging
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.trip import Trip as TripModel, Itinerary as ItineraryModel
from app.schemas.trip import (
    TripRequirementsSchema,
    TripResponseSchema,
    TripListResponse,
    ItinerarySchema,
)
from app.services.groq_service import GroqService

router = APIRouter(prefix="/api/trips", tags=["trips"])
logger = logging.getLogger(__name__)
_groq = GroqService()


@router.post("", response_model=TripResponseSchema, status_code=201)
async def create_trip(
    req: TripRequirementsSchema,
    db: AsyncSession = Depends(get_db),
) -> TripResponseSchema:
    session_id = str(uuid.uuid4())
    
    prompt = (
        f"Plan a {req.num_days}-day trip to {req.destination} starting from {req.from_location}. "
        f"Travel dates: {req.start_date} to {req.end_date}. "
        f"Number of travelers: {req.num_travelers}. Total budget: {req.currency} {req.budget}. "
        f"Travel style: {req.travel_style}. Interests: {', '.join(req.interests)}."
    )

    try:
        ack, itinerary = await _groq.chat(prompt, [])
    except Exception as exc:
        logger.error("Failed to generate itinerary: %s", exc)
        itinerary = None

    trip = TripModel(
        id=str(uuid.uuid4()),
        title=f"{req.num_days} Days in {req.destination}",
        session_id=session_id,
        destination=req.destination,
        from_location=req.from_location,
        start_date=req.start_date,
        end_date=req.end_date,
        num_days=req.num_days,
        num_travelers=req.num_travelers,
        budget=req.budget,
        currency=req.currency,
        travel_style=req.travel_style,
        interests=req.interests,
    )
    db.add(trip)
    await db.flush()

    if itinerary:
        itin_model = ItineraryModel(
            id=itinerary.id,
            trip_id=trip.id,
            destination=itinerary.destination,
            overview=itinerary.overview,
            num_days=itinerary.num_days,
            num_travelers=itinerary.num_travelers,
            total_estimated_cost=itinerary.total_estimated_cost,
            budget=itinerary.budget,
            currency=itinerary.currency,
            budget_remaining=itinerary.budget_remaining,
            days=[d.model_dump() for d in itinerary.days],
            transportation=[t.model_dump(by_alias=True) for t in itinerary.transportation],
            research_sources=[s.model_dump() for s in itinerary.research_sources],
            tags=itinerary.tags,
        )
        db.add(itin_model)
        await db.flush()

    # Re-query trip with relationship
    res = await db.execute(
        select(TripModel).options(selectinload(TripModel.itinerary)).where(TripModel.id == trip.id)
    )
    saved_trip = res.scalar_one()

    return _to_trip_response(saved_trip)


@router.get("", response_model=TripListResponse)
async def list_trips(
    db: AsyncSession = Depends(get_db),
) -> TripListResponse:
    res = await db.execute(
        select(TripModel)
        .options(selectinload(TripModel.itinerary))
        .order_by(TripModel.created_at.desc())
    )
    trips = res.scalars().all()
    return TripListResponse(
        trips=[_to_trip_response(t) for t in trips],
        total=len(trips),
    )


@router.get("/{trip_id}", response_model=TripResponseSchema)
async def get_trip(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
) -> TripResponseSchema:
    res = await db.execute(
        select(TripModel)
        .options(selectinload(TripModel.itinerary))
        .where(TripModel.id == trip_id)
    )
    trip = res.scalar_one_or_none()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return _to_trip_response(trip)


@router.get("/{trip_id}/itinerary", response_model=ItinerarySchema)
async def get_itinerary(
    trip_id: str,
    db: AsyncSession = Depends(get_db),
) -> ItinerarySchema:
    res = await db.execute(
        select(ItineraryModel).where(ItineraryModel.trip_id == trip_id)
    )
    itin = res.scalar_one_or_none()
    if not itin:
        raise HTTPException(status_code=404, detail="Itinerary not found for this trip")
    return _to_itinerary_schema(itin)


def _to_trip_response(trip: TripModel) -> TripResponseSchema:
    itinerary_schema = _to_itinerary_schema(trip.itinerary) if trip.itinerary else None
    return TripResponseSchema(
        id=trip.id,
        title=trip.title,
        destination=trip.destination,
        start_date=trip.start_date,
        end_date=trip.end_date,
        created_at=trip.created_at.isoformat() if trip.created_at else datetime.utcnow().isoformat(),
        session_id=trip.session_id,
        itinerary=itinerary_schema,
    )


def _to_itinerary_schema(itin: ItineraryModel) -> ItinerarySchema:
    return ItinerarySchema(
        id=itin.id,
        destination=itin.destination,
        overview=itin.overview or "",
        num_days=itin.num_days,
        num_travelers=itin.num_travelers,
        total_estimated_cost=itin.total_estimated_cost,
        budget=itin.budget,
        currency=itin.currency,
        budget_remaining=itin.budget_remaining,
        days=itin.days or [],
        transportation=itin.transportation or [],
        research_sources=itin.research_sources or [],
        created_at=itin.created_at.isoformat() if itin.created_at else datetime.utcnow().isoformat(),
        tags=itin.tags or [],
    )
