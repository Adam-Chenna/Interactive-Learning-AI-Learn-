from sqlalchemy import Column, Integer, ForeignKey, DateTime
from datetime import datetime

from database import Base


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    lesson_id = Column(
        Integer,
        ForeignKey("lessons.id"),
        nullable=False
    )

    xp_earned = Column(
        Integer,
        default=0
    )

    completed_at = Column(
        DateTime,
        default=datetime.utcnow
    )