from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.lesson import Lesson

router = APIRouter(
    prefix="/api/lessons",
    tags=["Lessons"]
)


@router.get("/{lesson_id}")
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id
    ).first()

    if not lesson:
        raise HTTPException(
            status_code=404,
            detail="Lesson not found"
        )

    return {
        "id": lesson.id,
        "title": lesson.title,
        "duration": lesson.duration,
        "xp": lesson.xp,
        "content": lesson.content,
        "chapter_id": lesson.chapter_id
    }