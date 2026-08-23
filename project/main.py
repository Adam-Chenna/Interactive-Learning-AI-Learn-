from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from models.user import User
from models.course import Course
from models.level import Level
from models.chapter import Chapter
from models.lesson import Lesson
from routers.auth import router as auth_router

from routers.lesson import router as lesson_router

from routers.course import router as course_router

from models.progress import LessonProgress

from routers.progress import router as progress_router

from routers.ai_tutor import router as ai_tutor_router

from models.quiz import QuizQuestion

from routers.quiz import router as quiz_router

from models.quiz_progress import QuizProgress

app = FastAPI(
    title="LearnAI API",
    description="Backend API for the LearnAI learning platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://interactive-learning-ai-learn.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)

from seed import seed_courses
from seed_content import seed_content

seed_courses()
seed_content()


app.include_router(auth_router)
app.include_router(course_router)
app.include_router(lesson_router)
app.include_router(progress_router)
app.include_router(ai_tutor_router)
app.include_router(quiz_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to LearnAI",
        "status": "running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "LearnAI API"
    }