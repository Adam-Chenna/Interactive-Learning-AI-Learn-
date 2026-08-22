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


@router.get("/lesson/{lesson_id}")
def get_lesson_quiz(
    lesson_id: int,
    db: Session = Depends(get_db)
):
    questions = db.query(QuizQuestion).filter(
        QuizQuestion.lesson_id == lesson_id
    ).all()

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


@router.post("/check/{question_id}")
def check_answer(
    question_id: int,
    answer: str,
    db: Session = Depends(get_db)
):
    question = db.query(QuizQuestion).filter(
        QuizQuestion.id == question_id
    ).first()

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Quiz question not found"
        )

    is_correct = (
        answer.strip().lower()
        == question.correct_answer.strip().lower()
    )

    return {
        "correct": is_correct,
        "message": (
            "Correct answer! 🎉"
            if is_correct
            else "Incorrect answer. Try again."
        )
    }

@router.post("/submit/{lesson_id}")
def submit_quiz(
    lesson_id: int,
    score: int,
    total_questions: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
): 
    print("QUIZ SUBMIT USER:", current_user.id)
    print("QUIZ SUBMIT LESSON:", lesson_id)
    print("QUIZ SUBMIT SCORE:", score)
    print("QUIZ SUBMIT TOTAL:", total_questions)

    if total_questions <= 0:
        raise HTTPException(
            status_code=400,
            detail="Invalid total questions"
        )

    if score < 0 or score > total_questions:
        raise HTTPException(
            status_code=400,
            detail="Invalid quiz score"
        )

    # Prevent duplicate XP for the same lesson quiz
    existing = db.query(QuizProgress).filter(
        QuizProgress.user_id == current_user.id,
        QuizProgress.lesson_id == lesson_id
    ).first()

    if existing:
        return {
            "message": "Quiz already completed",
            "score": existing.score,
            "total_questions": existing.total_questions,
            "xp": 0,
            "already_completed": True
        }

    # 10 XP per correct answer
    xp = score * 10

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