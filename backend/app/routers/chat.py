"""
Chat router — POST /api/chat
Handles conversational messages, calls Groq, persists to DB.
"""
from __future__ import annotations

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.trip import ChatSession, ChatMessage as ChatMessageModel
from app.schemas.trip import ChatRequest, ChatResponse
from app.services.groq_service import GroqService

router  = APIRouter(prefix="/api/chat", tags=["chat"])
logger  = logging.getLogger(__name__)
_groq   = GroqService()


@router.post("", response_model=ChatResponse)
async def send_message(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
) -> ChatResponse:
    session_id = body.session_id

    # ── Get or create chat session ────────────────────────────
    result  = await db.execute(
        select(ChatSession).where(ChatSession.session_id == session_id)
    )
    session = result.scalar_one_or_none()

    if not session:
        session = ChatSession(session_id=session_id, title=body.message[:60])
        db.add(session)
        await db.flush()

    # ── Build message history for context ─────────────────────
    history_result = await db.execute(
        select(ChatMessageModel)
        .where(ChatMessageModel.session_id == session_id)
        .order_by(ChatMessageModel.created_at.desc())
        .limit(20)
    )
    past_msgs  = history_result.scalars().all()
    history    = [{"role": m.role, "content": m.content} for m in reversed(past_msgs)]

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
    db.add(ChatMessageModel(
        session_id=session_id, role="assistant", content=ack
    ))

    return ChatResponse(
        message=ack,
        session_id=session_id,
        itinerary=itinerary,
    )
