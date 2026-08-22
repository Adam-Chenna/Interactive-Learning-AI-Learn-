from sqlalchemy import Column, Integer, ForeignKey, DateTime
from datetime import datetime

from database import Base


class QuizProgress(Base):
    __tablename__ = "quiz_progress"

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

    score = Column(
        Integer,
        nullable=False
    )

    total_questions = Column(
        Integer,
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