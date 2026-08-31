from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String,
        nullable=False
    )

    level_id = Column(
        Integer,
        ForeignKey("levels.id"),
        nullable=False
    )

    # =================================================
    # RELATIONSHIP WITH LEVEL
    # =================================================

    level = relationship(
        "Level",
        back_populates="chapters"
    )

    lessons = relationship(
        "Lesson",
        back_populates="chapter",
        cascade="all, delete-orphan"
    )