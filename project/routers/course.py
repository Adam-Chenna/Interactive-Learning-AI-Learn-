from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.course import Course
from models.level import Level
from models.chapter import Chapter
from models.lesson import Lesson


# =====================================================
# ROUTER
# =====================================================

router = APIRouter(
    prefix="/api/courses",
    tags=["Courses"]
)


# =====================================================
# BUILD COMPLETE COURSE DATA
# =====================================================

def build_course_data(course, db):

    levels = db.query(Level).filter(
        Level.course_id == course.id
    ).all()

    result = {
        "id": course.id,
        "title": course.title,
        "category": course.category,
        "instructor": course.instructor,
        "level": course.level,
        "icon": course.icon,
        "description": course.description,
        "levels": []
    }

    # =================================================
    # LEVELS
    # =================================================

    for level in levels:

        chapters = db.query(Chapter).filter(
            Chapter.level_id == level.id
        ).all()

        level_data = {
            "id": level.id,
            "title": level.title,
            "chapters": []
        }

        # =================================================
        # CHAPTERS
        # =================================================

        for chapter in chapters:

            lessons = db.query(Lesson).filter(
                Lesson.chapter_id == chapter.id
            ).all()

            chapter_data = {
                "id": chapter.id,
                "title": chapter.title,
                "lessons": []
            }

            # =================================================
            # LESSONS
            # =================================================

            for lesson in lessons:

                chapter_data["lessons"].append({
                    "id": lesson.id,
                    "title": lesson.title,
                    "duration": lesson.duration,
                    "xp": lesson.xp,
                    "content": lesson.content
                })

            level_data["chapters"].append(
                chapter_data
            )

        result["levels"].append(
            level_data
        )

    return result


# =====================================================
# GET ALL COURSES
# =====================================================

@router.get("/")
def get_courses(
    db: Session = Depends(get_db)
):

    courses = db.query(Course).all()

    return [
        build_course_data(course, db)
        for course in courses
    ]


# =====================================================
# GET SINGLE COURSE
# =====================================================

@router.get("/{course_id}")
def get_course(
    course_id: int,
    db: Session = Depends(get_db)
):

    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:

        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return build_course_data(
        course,
        db
    )