import uuid
from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, JSON, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[str]             = mapped_column(String(36), primary_key=True, default=_uuid)
    title: Mapped[str]          = mapped_column(String(255), nullable=False)
    session_id: Mapped[str]     = mapped_column(String(36), nullable=False, index=True)
    destination: Mapped[str]    = mapped_column(String(255), nullable=False)
    from_location: Mapped[str]  = mapped_column(String(255), nullable=True)
    start_date: Mapped[str]     = mapped_column(String(20), nullable=True)
    end_date: Mapped[str]       = mapped_column(String(20), nullable=True)
    num_days: Mapped[int]       = mapped_column(Integer, default=1)
    num_travelers: Mapped[int]  = mapped_column(Integer, default=1)
    budget: Mapped[float]       = mapped_column(Float, default=0.0)
    currency: Mapped[str]       = mapped_column(String(3), default="INR")
    travel_style: Mapped[str]   = mapped_column(String(50), nullable=True)
    interests: Mapped[list]     = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # One-to-one itinerary
    itinerary: Mapped["Itinerary"] = relationship(
        "Itinerary", back_populates="trip", uselist=False, cascade="all, delete-orphan"
    )


class Itinerary(Base):
    __tablename__ = "itineraries"

    id: Mapped[str]                   = mapped_column(String(36), primary_key=True, default=_uuid)
    trip_id: Mapped[str]              = mapped_column(ForeignKey("trips.id", ondelete="CASCADE"))
    destination: Mapped[str]          = mapped_column(String(255), nullable=False)
    overview: Mapped[str]             = mapped_column(Text, nullable=True)
    num_days: Mapped[int]             = mapped_column(Integer, default=1)
    num_travelers: Mapped[int]        = mapped_column(Integer, default=1)
    total_estimated_cost: Mapped[float] = mapped_column(Float, default=0.0)
    budget: Mapped[float]             = mapped_column(Float, default=0.0)
    currency: Mapped[str]             = mapped_column(String(3), default="INR")
    budget_remaining: Mapped[float]   = mapped_column(Float, default=0.0)
    days: Mapped[list]                = mapped_column(JSON, default=list)
    transportation: Mapped[list]      = mapped_column(JSON, default=list)
    research_sources: Mapped[list]    = mapped_column(JSON, default=list)
    tags: Mapped[list]                = mapped_column(JSON, default=list)
    raw_llm_response: Mapped[str]     = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime]      = mapped_column(DateTime, default=datetime.utcnow)

    trip: Mapped[Trip] = relationship("Trip", back_populates="itinerary")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[str]           = mapped_column(String(36), primary_key=True, default=_uuid)
    session_id: Mapped[str]   = mapped_column(String(36), nullable=False, unique=True, index=True)
    title: Mapped[str]        = mapped_column(String(255), default="New Conversation")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    messages: Mapped[list["ChatMessage"]] = relationship(
        "ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at"
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[str]           = mapped_column(String(36), primary_key=True, default=_uuid)
    session_id: Mapped[str]   = mapped_column(ForeignKey("chat_sessions.session_id", ondelete="CASCADE"))
    role: Mapped[str]         = mapped_column(String(20), nullable=False)  # "user" | "assistant"
    content: Mapped[str]      = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    session: Mapped[ChatSession] = relationship("ChatSession", back_populates="messages")
