from database import SessionLocal
from models.course import Course


def seed_courses():
    db = SessionLocal()

    existing_courses = db.query(Course).count()

    if existing_courses > 0:
        print("Courses already exist.")
        db.close()
        return

    courses = [
        Course(
            title="Python Programming",
            category="Programming",
            instructor="LearnAI Team",
            level="Beginner",
            icon="🐍",
            description="Learn Python programming from the fundamentals to practical projects."
        ),
        Course(
            title="Web Development",
            category="Development",
            instructor="LearnAI Team",
            level="Beginner",
            icon="🌐",
            description="Learn HTML, CSS, JavaScript and modern web development."
        ),
        Course(
            title="Artificial Intelligence",
            category="AI",
            instructor="LearnAI Team",
            level="Intermediate",
            icon="🤖",
            description="Understand AI concepts, machine learning and modern AI systems."
        ),
        Course(
            title="Data Science",
            category="Data",
            instructor="LearnAI Team",
            level="Intermediate",
            icon="📊",
            description="Learn data analysis, visualization and data science fundamentals."
        )
    ]

    db.add_all(courses)
    db.commit()

    print("Courses added successfully!")

    db.close()


if __name__ == "__main__":
    seed_courses()