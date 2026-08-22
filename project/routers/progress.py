from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.course import Course
from models.level import Level
from models.chapter import Chapter
from models.user import User
from models.lesson import Lesson
from models.progress import LessonProgress
from models.quiz_progress import QuizProgress
from services.auth import get_current_user


router = APIRouter(
    prefix="/api/progress",
    tags=["Progress"]
)


# =====================================================
# COMPLETE LESSON
# =====================================================

@router.post("/complete/{lesson_id}")
def complete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find lesson
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id
    ).first()

    if not lesson:
        raise HTTPException(
            status_code=404,
            detail="Lesson not found"
        )

    # Check whether user already completed this lesson
    progress = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.lesson_id == lesson_id
    ).first()

    if progress:
        return {
            "message": "Lesson already completed",
            "xp": 0,
            "completed": True
        }

    # Create progress record
    progress = LessonProgress(
        user_id=current_user.id,
        lesson_id=lesson_id,
        xp_earned=lesson.xp
    )

    db.add(progress)
    db.commit()
    db.refresh(progress)

    return {
        "message": "Lesson completed successfully",
        "xp": lesson.xp,
        "completed": True
    }


# =====================================================
# MY PROGRESS
# =====================================================

@router.get("/me")
def get_my_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Lesson progress
    progress_records = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id
    ).all()

    completed_lessons = len(progress_records)

    lesson_xp = sum(
        progress.xp_earned
        for progress in progress_records
    )

    # Quiz progress
    quiz_records = db.query(QuizProgress).filter(
        QuizProgress.user_id == current_user.id
    ).all()

    quiz_xp = sum(
        quiz.xp_earned
        for quiz in quiz_records
    )

    # Total XP
    total_xp = lesson_xp + quiz_xp

    # Completed lesson IDs
    completed_lesson_ids = [
        progress.lesson_id
        for progress in progress_records
    ]

    return {
        "completed_lessons": completed_lessons,
        "total_xp": total_xp,
        "lesson_xp": lesson_xp,
        "quiz_xp": quiz_xp,
        "completed_lesson_ids": completed_lesson_ids
    }


# =====================================================
# COURSE PROGRESS
# =====================================================

@router.get("/course/{course_id}")
def get_course_progress(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check whether course exists
    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    # Get course levels
    levels = db.query(Level).filter(
        Level.course_id == course_id
    ).all()

    level_ids = [
        level.id
        for level in levels
    ]

    if not level_ids:
        return {
            "course_id": course_id,
            "total_lessons": 0,
            "completed_lessons": 0,
            "percentage": 0
        }

    # Get chapters
    chapters = db.query(Chapter).filter(
        Chapter.level_id.in_(level_ids)
    ).all()

    chapter_ids = [
        chapter.id
        for chapter in chapters
    ]

    if not chapter_ids:
        return {
            "course_id": course_id,
            "total_lessons": 0,
            "completed_lessons": 0,
            "percentage": 0
        }

    # Get lessons
    lessons = db.query(Lesson).filter(
        Lesson.chapter_id.in_(chapter_ids)
    ).all()

    lesson_ids = [
        lesson.id
        for lesson in lessons
    ]

    total_lessons = len(lesson_ids)

    if total_lessons == 0:
        return {
            "course_id": course_id,
            "total_lessons": 0,
            "completed_lessons": 0,
            "percentage": 0
        }

    # Count completed lessons for current user
    completed_lessons = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.lesson_id.in_(lesson_ids)
    ).count()

    percentage = round(
        (completed_lessons / total_lessons) * 100
    )

    return {
        "course_id": course_id,
        "total_lessons": total_lessons,
        "completed_lessons": completed_lessons,
        "percentage": percentage
    }

