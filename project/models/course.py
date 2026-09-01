from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)

    category = Column(String, nullable=False)

    instructor = Column(String, nullable=False)

    level = Column(String, nullable=False)

    icon = Column(String, nullable=True)

    description = Column(Text, nullable=True)

    # NULL = static/default course
    # user id = AI generated course owner
    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )

    # Course → Levels
    levels = relationship(
        "Level",
        back_populates="course",
        cascade="all, delete-orphan"
    )