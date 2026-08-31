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

def build_course_data(
    course: Course,
    db: Session
):

    # -------------------------------------------------
    # COURSE
    # -------------------------------------------------

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
    # GET LEVELS
    # =================================================

    levels = (
        db.query(Level)
        .filter(
            Level.course_id == course.id
        )
        .order_by(
            Level.id.asc()
        )
        .all()
    )


    # =================================================
    # BUILD LEVELS
    # =================================================

    for level in levels:

        level_data = {
            "id": level.id,
            "title": level.title,
            "chapters": []
        }


        # =================================================
        # GET CHAPTERS
        # =================================================

        chapters = (
            db.query(Chapter)
            .filter(
                Chapter.level_id == level.id
            )
            .order_by(
                Chapter.id.asc()
            )
            .all()
        )


        # =================================================
        # BUILD CHAPTERS
        # =================================================

        for chapter in chapters:

            chapter_data = {
                "id": chapter.id,
                "title": chapter.title,
                "lessons": []
            }


            # =================================================
            # GET LESSONS
            # =================================================

            lessons = (
                db.query(Lesson)
                .filter(
                    Lesson.chapter_id == chapter.id
                )
                .order_by(
                    Lesson.id.asc()
                )
                .all()
            )


            # =================================================
            # BUILD LESSONS
            # =================================================

            for lesson in lessons:

                chapter_data["lessons"].append({

                    "id": lesson.id,

                    "title": lesson.title,

                    "duration": lesson.duration or 0,

                    "xp": lesson.xp or 0,

                    "content": lesson.content or ""

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

    try:

        courses = (
            db.query(Course)
            .order_by(
                Course.id.asc()
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
# GET SINGLE COURSE
# =====================================================

@router.get("/{course_id}")
def get_course(
    course_id: int,
    db: Session = Depends(get_db)
):

    course = (
        db.query(Course)
        .filter(
            Course.id == course_id
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