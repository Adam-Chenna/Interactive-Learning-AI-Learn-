from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.quiz import QuizQuestion
from models.quiz_progress import QuizProgress
from models.user import User
from services.auth import get_current_user


router = APIRouter(
    prefix="/api/quiz",
    tags=["Quiz"]
)


# ============================================================
# GET QUIZ FOR LESSON
# ============================================================

@router.get("/lesson/{lesson_id}")
def get_lesson_quiz(
    lesson_id: int,
    db: Session = Depends(get_db)
):
    questions = (
        db.query(QuizQuestion)
        .filter(QuizQuestion.lesson_id == lesson_id)
        .all()
    )

    return [
        {
            "id": question.id,
            "question": question.question,
            "options": [
                question.option_a,
                question.option_b,
                question.option_c,
                question.option_d,
            ],
        }
        for question in questions
    ]


# ============================================================
# CHECK ANSWER
# ============================================================

@router.post("/check/{question_id}")
def check_answer(
    question_id: int,
    answer: str,
    db: Session = Depends(get_db)
):
    question = (
        db.query(QuizQuestion)
        .filter(QuizQuestion.id == question_id)
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Quiz question not found"
        )

    # --------------------------------------------------------
    # Normalize frontend answer
    # --------------------------------------------------------

    submitted_answer = answer.strip().upper()

    # --------------------------------------------------------
    # Map A/B/C/D to actual option text
    # --------------------------------------------------------

    options = {
        "A": question.option_a,
        "B": question.option_b,
        "C": question.option_c,
        "D": question.option_d,
    }

    selected_text = options.get(submitted_answer)

    if selected_text is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid answer option"
        )

    # --------------------------------------------------------
    # Support BOTH formats:
    #
    # correct_answer = "A"
    #
    # OR
    #
    # correct_answer = "What is Python?"
    # --------------------------------------------------------

    correct_value = question.correct_answer.strip()

    is_correct = (
        submitted_answer == correct_value.upper()
        or
        selected_text.strip().lower()
        == correct_value.lower()
    )

    return {
        "correct": is_correct,
        "selected_answer": submitted_answer,
        "correct_answer": correct_value,
        "message": (
            "Correct answer! 🎉"
            if is_correct
            else "Incorrect answer. Try again."
        )
    }


# ============================================================
# SUBMIT QUIZ
# ============================================================

@router.post("/submit/{lesson_id}")
def submit_quiz(
    lesson_id: int,
    score: int,
    total_questions: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print("======================================")
    print("QUIZ SUBMIT")
    print("USER:", current_user.id)
    print("LESSON:", lesson_id)
    print("SCORE:", score)
    print("TOTAL:", total_questions)
    print("======================================")

    # --------------------------------------------------------
    # Validate total questions
    # --------------------------------------------------------

    if total_questions <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid total questions"
        )

    # --------------------------------------------------------
    # Validate score
    # --------------------------------------------------------

    if score < 0 or score > total_questions:
        raise HTTPException(
            status_code=400,
            detail="Invalid quiz score"
        )

    # --------------------------------------------------------
    # Verify lesson actually has questions
    # --------------------------------------------------------

    actual_questions = (
        db.query(QuizQuestion)
        .filter(QuizQuestion.lesson_id == lesson_id)
        .count()
    )

    if actual_questions == 0:
        raise HTTPException(
            status_code=404,
            detail="No quiz available for this lesson"
        )

    # --------------------------------------------------------
    # Prevent duplicate XP
    # --------------------------------------------------------

    existing = (
        db.query(QuizProgress)
        .filter(
            QuizProgress.user_id == current_user.id,
            QuizProgress.lesson_id == lesson_id
        )
        .first()
    )

    if existing:
        return {
            "message": "Quiz already completed",
            "score": existing.score,
            "total_questions": existing.total_questions,
            "xp": 0,
            "already_completed": True
        }

    # --------------------------------------------------------
    # XP
    # --------------------------------------------------------

    xp = score * 10

    # --------------------------------------------------------
    # Save progress
    # --------------------------------------------------------

    progress = QuizProgress(
        user_id=current_user.id,
        lesson_id=lesson_id,
        score=score,
        total_questions=total_questions,
        xp_earned=xp
    )

    db.add(progress)
    db.commit()
    db.refresh(progress)

    return {
        "message": "Quiz completed successfully",
        "score": score,
        "total_questions": total_questions,
        "xp": xp,
        "already_completed": False
    }