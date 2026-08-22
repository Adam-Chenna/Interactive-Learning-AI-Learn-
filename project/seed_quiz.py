from database import SessionLocal
from models.lesson import Lesson
from models.quiz import QuizQuestion


db = SessionLocal()


questions = [
    QuizQuestion(
        lesson_id=1,
        question="What is Java?",
        option_a="A database",
        option_b="A programming language",
        option_c="An operating system",
        option_d="A web browser",
        correct_answer="B"
    ),

    QuizQuestion(
        lesson_id=1,
        question="Which method is the entry point of a Java program?",
        option_a="start()",
        option_b="run()",
        option_c="main()",
        option_d="begin()",
        correct_answer="C"
    ),

    QuizQuestion(
        lesson_id=1,
        question="What does JVM stand for?",
        option_a="Java Variable Machine",
        option_b="Java Virtual Machine",
        option_c="Java Visual Machine",
        option_d="Java Version Manager",
        correct_answer="B"
    ),
]


try:
    db.add_all(questions)
    db.commit()

    print("Quiz questions added successfully!")

except Exception as error:
    db.rollback()
    print("Error:", error)

finally:
    db.close()