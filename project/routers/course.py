# routers/course.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db

from models.course import Course
from models.level import Level
from models.chapter import Chapter
from models.lesson import Lesson

from services.auth import get_current_user
from models.user import User


router = APIRouter(
    prefix="/api/courses",
    tags=["Courses"]
)


# =====================================================
# BUILD COMPLETE COURSE DATA
# =====================================================

def build_course_data(course: Course, db: Session):

    result = {
        "id": course.id,
        "title": course.title,
        "category": course.category,
        "instructor": course.instructor,
        "level": course.level,
        "icon": course.icon,
        "description": course.description,
        "created_by": course.created_by,
        "levels": []
    }

    levels = (
        db.query(Level)
        .filter(Level.course_id == course.id)
        .order_by(Level.id.asc())
        .all()
    )

    for level in levels:

        level_data = {
            "id": level.id,
            "title": level.title,
            "chapters": []
        }

        chapters = (
            db.query(Chapter)
            .filter(Chapter.level_id == level.id)
            .order_by(Chapter.id.asc())
            .all()
        )

        for chapter in chapters:

            chapter_data = {
                "id": chapter.id,
                "title": chapter.title,
                "lessons": []
            }

            lessons = (
                db.query(Lesson)
                .filter(Lesson.chapter_id == chapter.id)
                .order_by(Lesson.id.asc())
                .all()
            )

            for lesson in lessons:

                chapter_data["lessons"].append({
                    "id": lesson.id,
                    "title": lesson.title,
                    "duration": lesson.duration or 0,
                    "xp": lesson.xp or 0,
                    "content": lesson.content or ""
                })

            level_data["chapters"].append(chapter_data)

        result["levels"].append(level_data)

    return result


# =====================================================
# GET USER'S GENERATED COURSES
# =====================================================

@router.get("/")
def get_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    try:

        courses = (
            db.query(Course)
            .filter(
                Course.created_by == current_user.id
            )
            .order_by(
                Course.id.desc()
            )
            .all()
        )

        result = []

        for course in courses:

            result.append(
                build_course_data(
                    course,
                    db
                )
            )

        return result

    except Exception as error:

        print(
            "GET COURSES ERROR:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail="Could not load courses"
        )


# =====================================================
# GET SINGLE USER COURSE
# =====================================================

@router.get("/{course_id}")
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    course = (
        db.query(Course)
        .filter(
            Course.id == course_id,
            Course.created_by == current_user.id
        )
        .first()
    )

    if not course:

        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return build_course_data(
        course,
        db
    )