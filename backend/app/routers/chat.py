"""
Chat router — /api/chat
Handles conversational messages, session listing, history loading, and session deletion.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.database import get_db
from app.models.trip import ChatSession, ChatMessage as ChatMessageModel
from app.schemas.trip import ChatRequest, ChatResponse
from app.services.groq_service import GroqService

router = APIRouter(prefix="/api/chat", tags=["chat"])
logger = logging.getLogger(__name__)
_groq = GroqService()


@router.post("", response_model=ChatResponse)
async def send_message(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    session_id = body.session_id

    # ── Get or create chat session ────────────────────────────
    result = await db.execute(
        select(ChatSession).where(ChatSession.session_id == session_id)
    )
    session = result.scalar_one_or_none()

    clean_title = body.message.strip()[:50]
    if not session:
        session = ChatSession(session_id=session_id, title=clean_title)
        db.add(session)
        await db.flush()
    else:
        # Update timestamp and title if it was default
        session.updated_at = datetime.utcnow()
        if session.title in {"New Conversation", "New Trip", ""}:
            session.title = clean_title
        db.add(session)
        await db.flush()

    # ── Build message history for context ─────────────────────
    history_result = await db.execute(
        select(ChatMessageModel)
        .where(ChatMessageModel.session_id == session_id)
        .order_by(ChatMessageModel.created_at.desc())
        .limit(20)
    )
    past_msgs = history_result.scalars().all()
    history = [{"role": m.role, "content": m.content} for m in reversed(past_msgs)]

    # ── Call Groq ─────────────────────────────────────────────
    try:
        ack, itinerary = await _groq.chat(body.message, history)
    except Exception as exc:
        logger.error("Groq error: %s", exc)
        raise HTTPException(status_code=502, detail=f"AI service error: {exc}")

    # ── Persist messages ───────────────────────────────────────
    db.add(ChatMessageModel(
        session_id=session_id, role="user", content=body.message
    ))

    saved_assistant_content = ack
    if itinerary:
        saved_assistant_content += (
            f"\n\n[Previous Itinerary Summary: Destination: {itinerary.destination}, "
            f"Days: {itinerary.num_days}, Travelers: {itinerary.num_travelers}, "
            f"Budget: {itinerary.currency} {itinerary.budget}, "
            f"Total Cost: {itinerary.currency} {itinerary.total_estimated_cost}, "
            f"Remaining: {itinerary.currency} {itinerary.budget_remaining}]"
            f"\n<!--ITINERARY_DATA:{itinerary.model_dump_json()}-->"
        )

    db.add(ChatMessageModel(
        session_id=session_id, role="assistant", content=saved_assistant_content
    ))

    return ChatResponse(
        message=ack,
        session_id=session_id,
        itinerary=itinerary,
    )


@router.get("/sessions")
async def list_sessions(
    db: AsyncSession = Depends(get_db),
):
    """List all real chat sessions ordered by most recent activity."""
    result = await db.execute(
        select(ChatSession).order_by(ChatSession.updated_at.desc())
    )
    sessions = result.scalars().all()
    return [
        {
            "session_id": s.session_id,
            "title": s.title or "Travel Inquiry",
            "created_at": s.created_at.isoformat() if s.created_at else datetime.utcnow().isoformat(),
            "updated_at": s.updated_at.isoformat() if s.updated_at else datetime.utcnow().isoformat(),
        }
        for s in sessions
    ]


@router.get("/sessions/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Fetch full chat history and any generated itineraries for a given session."""
    result = await db.execute(
        select(ChatMessageModel)
        .where(ChatMessageModel.session_id == session_id)
        .order_by(ChatMessageModel.created_at.asc())
    )
    messages = result.scalars().all()
    out = []
    for m in messages:
        content = m.content
        itinerary = None

        if "<!--ITINERARY_DATA:" in content:
            parts = content.split("<!--ITINERARY_DATA:")
            content = parts[0].strip()
            raw_json = parts[1].split("-->")[0].strip()
            try:
                itinerary = json.loads(raw_json)
            except Exception:
                pass

        if "[Previous Itinerary Summary:" in content:
            content = content.split("[Previous Itinerary Summary:")[0].strip()

        out.append({
            "id": m.id,
            "role": m.role,
            "content": content,
            "created_at": m.created_at.isoformat() if m.created_at else datetime.utcnow().isoformat(),
            "itinerary": itinerary,
        })
    return out


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete a chat session and all its messages."""
    result = await db.execute(
        select(ChatSession).where(ChatSession.session_id == session_id)
    )
    session = result.scalar_one_or_none()
    if session:
        await db.delete(session)
        await db.commit()
    return {"status": "deleted", "session_id": session_id}
