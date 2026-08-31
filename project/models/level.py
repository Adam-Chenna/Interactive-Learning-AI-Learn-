from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Level(Base):
    __tablename__ = "levels"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String,
        nullable=False
    )

    course_id = Column(
        Integer,
        ForeignKey("courses.id"),
        nullable=False
    )

    # =================================================
    # RELATIONSHIP WITH COURSE
    # =================================================

    course = relationship(
        "Course",
        back_populates="levels"
    )

    chapters = relationship(
        "Chapter",
        back_populates="level",
        cascade="all, delete-orphan"
    )