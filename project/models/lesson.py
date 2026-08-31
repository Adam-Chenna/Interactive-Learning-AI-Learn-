from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String,
        nullable=False
    )

    duration = Column(
        Integer,
        default=10
    )

    content = Column(
        Text,
        nullable=True
    )

    xp = Column(
        Integer,
        default=10
    )

    chapter_id = Column(
        Integer,
        ForeignKey("chapters.id"),
        nullable=False
    )

    # =================================================
    # RELATIONSHIP WITH CHAPTER
    # =================================================

    chapter = relationship(
        "Chapter",
        back_populates="lessons"
    )