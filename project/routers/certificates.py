from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from database import get_db
from models.user import User
from models.course import Course
from models.certificate import Certificate
from models.lesson import Lesson
from models.progress import LessonProgress
from models.chapter import Chapter
from models.level import Level
from services.auth import get_current_user


router = APIRouter(
    prefix="/api/certificates",
    tags=["Certificates"]
)


# ============================================================
# GET MY CERTIFICATES
# ============================================================

@router.get("/")
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    certificates = db.query(Certificate).filter(
        Certificate.user_id == current_user.id
    ).order_by(
        Certificate.issued_at.desc()
    ).all()

    return [
        {
            "id": certificate.id,
            "certificate_id": certificate.certificate_id,
            "course_id": certificate.course_id,
            "course_title": certificate.course.title,
            "student_name": current_user.name,
            "issued_at": certificate.issued_at.isoformat()
        }
        for certificate in certificates
    ]


# ============================================================
# GENERATE CERTIFICATE
# ============================================================

@router.post("/{course_id}/generate")
def generate_certificate(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # --------------------------------------------------------
    # Course check
    # --------------------------------------------------------

    course = db.query(Course).filter(
        Course.id == course_id
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    # --------------------------------------------------------
    # Get all lessons in course
    # --------------------------------------------------------

    lessons = (
        db.query(Lesson)
        .join(Lesson.chapter)
        .filter(
            Lesson.chapter.has(
                Chapter.level.has(
                    Level.course_id == course_id
                )
            )
        )
        .all()
    )

    total_lessons = len(lessons)

    if total_lessons == 0:
        raise HTTPException(
            status_code=400,
            detail="This course has no lessons"
        )

    lesson_ids = [
        lesson.id
        for lesson in lessons
    ]

    # --------------------------------------------------------
    # Completed lessons
    # --------------------------------------------------------

    completed_lessons = db.query(
        LessonProgress
    ).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.lesson_id.in_(lesson_ids)
    ).count()

    # --------------------------------------------------------
    # Eligibility
    # --------------------------------------------------------

    if completed_lessons < total_lessons:
        percentage = round(
            (completed_lessons / total_lessons) * 100
        )

        raise HTTPException(
            status_code=400,
            detail=f"Course is only {percentage}% complete. Complete all lessons first."
        )

    # --------------------------------------------------------
    # Already generated?
    # --------------------------------------------------------

    existing = db.query(Certificate).filter(
        Certificate.user_id == current_user.id,
        Certificate.course_id == course_id
    ).first()

    if existing:
        return {
            "message": "Certificate already exists",
            "certificate_id": existing.certificate_id,
            "course_id": course.id,
            "course_title": course.title,
            "student_name": current_user.name,
            "issued_at": existing.issued_at.isoformat(),
            "already_exists": True
        }

    # --------------------------------------------------------
    # Generate unique certificate ID
    # --------------------------------------------------------

    certificate_id = (
        f"LA-{datetime.utcnow().strftime('%Y')}-"
        f"{uuid.uuid4().hex[:8].upper()}"
    )

    certificate = Certificate(
        certificate_id=certificate_id,
        user_id=current_user.id,
        course_id=course.id
    )

    db.add(certificate)
    db.commit()
    db.refresh(certificate)

    return {
        "message": "Certificate generated successfully",
        "certificate_id": certificate.certificate_id,
        "course_id": course.id,
        "course_title": course.title,
        "student_name": current_user.name,
        "issued_at": certificate.issued_at.isoformat(),
        "already_exists": False
    }


# ============================================================
# GET SINGLE CERTIFICATE
# ============================================================

@router.get("/{certificate_id}")
def get_certificate(
    certificate_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    certificate = db.query(Certificate).filter(
        Certificate.certificate_id == certificate_id,
        Certificate.user_id == current_user.id
    ).first()

    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Certificate not found"
        )

    return {
        "id": certificate.id,
        "certificate_id": certificate.certificate_id,
        "student_name": current_user.name,
        "course_id": certificate.course_id,
        "course_title": certificate.course.title,
        "issued_at": certificate.issued_at.isoformat()
    }