# ============================================================
# models/ai_chat.py
# POORA FILE REPLACE KARO
# ============================================================

from datetime import datetime

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey

from database import Base


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # NULL = Main AI Tutor
    # chapter_id = Chapter-wise AI Tutor
    chapter_id = Column(
        Integer,
        ForeignKey("chapters.id"),
        nullable=True,
        index=True
    )

    title = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    conversation_id = Column(
        Integer,
        ForeignKey("ai_conversations.id"),
        nullable=False,
        index=True
    )

    role = Column(
        Text,
        nullable=False
    )

    content = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )