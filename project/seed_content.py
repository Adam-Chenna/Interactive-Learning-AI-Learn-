from database import SessionLocal
from models.course import Course
from models.level import Level
from models.chapter import Chapter
from models.lesson import Lesson


def add_course_content(db, course_title, levels_data):
    course = db.query(Course).filter(
        Course.title == course_title
    ).first()

    if not course:
        print(f"Course not found: {course_title}")
        return

    existing_level = db.query(Level).filter(
        Level.course_id == course.id
    ).first()

    if existing_level:
        print(f"{course_title} already has content. Skipping.")
        return

    for level_data in levels_data:
        level = Level(
            title=level_data["title"],
            course_id=course.id
        )
        db.add(level)
        db.flush()

        for chapter_data in level_data["chapters"]:
            chapter = Chapter(
                title=chapter_data["title"],
                level_id=level.id
            )
            db.add(chapter)
            db.flush()

            for lesson_data in chapter_data["lessons"]:
                lesson = Lesson(
                    title=lesson_data["title"],
                    duration=lesson_data["duration"],
                    xp=lesson_data["xp"],
                    content=lesson_data["content"],
                    chapter_id=chapter.id
                )
                db.add(lesson)

    print(f"Content added: {course_title}")


def seed_content():
    db = SessionLocal()

    try:

        # =========================
        # WEB DEVELOPMENT
        # =========================

        web_development = [
            {
                "title": "HTML Fundamentals",
                "chapters": [
                    {
                        "title": "Introduction to HTML",
                        "lessons": [
                            {
                                "title": "What is HTML?",
                                "duration": 10,
                                "xp": 10,
                                "content": "HTML stands for HyperText Markup Language. It is used to structure content on web pages."
                            },
                            {
                                "title": "HTML Elements",
                                "duration": 12,
                                "xp": 10,
                                "content": "HTML elements are building blocks of web pages. Common elements include headings, paragraphs, links, images and buttons."
                            },
                            {
                                "title": "HTML Page Structure",
                                "duration": 15,
                                "xp": 15,
                                "content": "A basic HTML document contains elements such as html, head, title and body."
                            }
                        ]
                    },
                    {
                        "title": "HTML Forms",
                        "lessons": [
                            {
                                "title": "Form Basics",
                                "duration": 12,
                                "xp": 10,
                                "content": "HTML forms allow users to enter and submit information using inputs, buttons and other form controls."
                            },
                            {
                                "title": "Input Elements",
                                "duration": 12,
                                "xp": 10,
                                "content": "Input elements collect different types of user information such as text, email and passwords."
                            }
                        ]
                    }
                ]
            },
            {
                "title": "CSS Fundamentals",
                "chapters": [
                    {
                        "title": "Introduction to CSS",
                        "lessons": [
                            {
                                "title": "What is CSS?",
                                "duration": 10,
                                "xp": 10,
                                "content": "CSS stands for Cascading Style Sheets. It controls the appearance and layout of HTML elements."
                            },
                            {
                                "title": "CSS Selectors",
                                "duration": 12,
                                "xp": 10,
                                "content": "CSS selectors are used to target HTML elements for styling. Common selectors include element, class and ID selectors."
                            },
                            {
                                "title": "Colors and Typography",
                                "duration": 15,
                                "xp": 15,
                                "content": "CSS can control colors, fonts, text size, spacing and other visual properties."
                            }
                        ]
                    },
                    {
                        "title": "CSS Layout",
                        "lessons": [
                            {
                                "title": "Box Model",
                                "duration": 12,
                                "xp": 10,
                                "content": "The CSS box model describes how margin, border, padding and content determine the size of an element."
                            },
                            {
                                "title": "Flexbox Basics",
                                "duration": 15,
                                "xp": 15,
                                "content": "Flexbox is a CSS layout system designed to arrange elements efficiently in rows or columns."
                            }
                        ]
                    }
                ]
            },
            {
                "title": "JavaScript Basics",
                "chapters": [
                    {
                        "title": "JavaScript Fundamentals",
                        "lessons": [
                            {
                                "title": "What is JavaScript?",
                                "duration": 10,
                                "xp": 10,
                                "content": "JavaScript is a programming language commonly used to add interactivity and dynamic behavior to web pages."
                            },
                            {
                                "title": "JavaScript Variables",
                                "duration": 12,
                                "xp": 10,
                                "content": "JavaScript variables store values. Modern JavaScript commonly uses let and const."
                            },
                            {
                                "title": "JavaScript Functions",
                                "duration": 15,
                                "xp": 15,
                                "content": "Functions are reusable blocks of code that perform a specific task."
                            }
                        ]
                    }
                ]
            }
        ]

        # =========================
        # ARTIFICIAL INTELLIGENCE
        # =========================

        artificial_intelligence = [
            {
                "title": "AI Fundamentals",
                "chapters": [
                    {
                        "title": "Introduction to AI",
                        "lessons": [
                            {
                                "title": "What is Artificial Intelligence?",
                                "duration": 10,
                                "xp": 10,
                                "content": "Artificial Intelligence is the field of creating computer systems that can perform tasks that normally require human intelligence."
                            },
                            {
                                "title": "Types of AI",
                                "duration": 12,
                                "xp": 10,
                                "content": "AI systems can be categorized in different ways based on their capabilities and applications."
                            },
                            {
                                "title": "Applications of AI",
                                "duration": 15,
                                "xp": 15,
                                "content": "AI is used in areas such as recommendation systems, computer vision, natural language processing and robotics."
                            }
                        ]
                    },
                    {
                        "title": "Machine Learning",
                        "lessons": [
                            {
                                "title": "What is Machine Learning?",
                                "duration": 12,
                                "xp": 10,
                                "content": "Machine Learning is a branch of AI where systems learn patterns from data and use those patterns to make predictions or decisions."
                            },
                            {
                                "title": "Supervised Learning",
                                "duration": 15,
                                "xp": 15,
                                "content": "Supervised learning uses labeled training data to learn a relationship between inputs and expected outputs."
                            },
                            {
                                "title": "Unsupervised Learning",
                                "duration": 15,
                                "xp": 15,
                                "content": "Unsupervised learning discovers patterns or structures in data without predefined labels."
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Modern AI",
                "chapters": [
                    {
                        "title": "Neural Networks",
                        "lessons": [
                            {
                                "title": "Introduction to Neural Networks",
                                "duration": 15,
                                "xp": 15,
                                "content": "Neural networks are machine learning models inspired by the structure of biological neural systems."
                            },
                            {
                                "title": "Deep Learning",
                                "duration": 15,
                                "xp": 15,
                                "content": "Deep learning uses neural networks with multiple layers to learn complex patterns from data."
                            }
                        ]
                    },
                    {
                        "title": "Generative AI",
                        "lessons": [
                            {
                                "title": "What is Generative AI?",
                                "duration": 12,
                                "xp": 10,
                                "content": "Generative AI systems create new content such as text, images, audio or code based on learned patterns."
                            },
                            {
                                "title": "Large Language Models",
                                "duration": 15,
                                "xp": 15,
                                "content": "Large Language Models are AI models trained on large collections of text to understand and generate natural language."
                            }
                        ]
                    }
                ]
            }
        ]

        # =========================
        # DATA SCIENCE
        # =========================

        data_science = [
            {
                "title": "Data Science Fundamentals",
                "chapters": [
                    {
                        "title": "Introduction to Data Science",
                        "lessons": [
                            {
                                "title": "What is Data Science?",
                                "duration": 10,
                                "xp": 10,
                                "content": "Data Science combines statistics, programming and domain knowledge to extract useful insights from data."
                            },
                            {
                                "title": "Types of Data",
                                "duration": 12,
                                "xp": 10,
                                "content": "Data can be structured, semi-structured or unstructured and can contain numerical, categorical or textual information."
                            },
                            {
                                "title": "Data Collection",
                                "duration": 12,
                                "xp": 10,
                                "content": "Data can be collected from databases, APIs, surveys, sensors and many other sources."
                            }
                        ]
                    },
                    {
                        "title": "Data Cleaning",
                        "lessons": [
                            {
                                "title": "Missing Data",
                                "duration": 12,
                                "xp": 10,
                                "content": "Missing values can be handled using techniques such as removal, replacement or statistical imputation."
                            },
                            {
                                "title": "Data Preprocessing",
                                "duration": 15,
                                "xp": 15,
                                "content": "Data preprocessing transforms raw data into a clean and usable form for analysis and machine learning."
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Python for Data Science",
                "chapters": [
                    {
                        "title": "NumPy",
                        "lessons": [
                            {
                                "title": "Introduction to NumPy",
                                "duration": 12,
                                "xp": 10,
                                "content": "NumPy is a Python library used for numerical computing and efficient array operations."
                            },
                            {
                                "title": "NumPy Arrays",
                                "duration": 15,
                                "xp": 15,
                                "content": "NumPy arrays provide an efficient structure for storing and processing numerical data."
                            }
                        ]
                    },
                    {
                        "title": "Pandas",
                        "lessons": [
                            {
                                "title": "Introduction to Pandas",
                                "duration": 12,
                                "xp": 10,
                                "content": "Pandas is a Python library widely used for data manipulation and analysis."
                            },
                            {
                                "title": "DataFrames",
                                "duration": 15,
                                "xp": 15,
                                "content": "A Pandas DataFrame is a two-dimensional data structure used to store and analyze tabular data."
                            }
                        ]
                    }
                ]
            },
            {
                "title": "Data Visualization",
                "chapters": [
                    {
                        "title": "Visualization Basics",
                        "lessons": [
                            {
                                "title": "Why Visualize Data?",
                                "duration": 10,
                                "xp": 10,
                                "content": "Data visualization makes patterns, trends and relationships easier to understand."
                            },
                            {
                                "title": "Charts and Graphs",
                                "duration": 12,
                                "xp": 10,
                                "content": "Common visualizations include bar charts, line charts, scatter plots and histograms."
                            },
                            {
                                "title": "Introduction to Matplotlib",
                                "duration": 15,
                                "xp": 15,
                                "content": "Matplotlib is a popular Python library for creating charts and visualizations."
                            }
                        ]
                    }
                ]
            }
        ]

        # Add content
        add_course_content(
            db,
            "Web Development",
            web_development
        )

        add_course_content(
            db,
            "Artificial Intelligence",
            artificial_intelligence
        )

        add_course_content(
            db,
            "Data Science",
            data_science
        )

        db.commit()

        print("All course content added successfully!")

    except Exception as error:
        db.rollback()
        print("Error:", error)

    finally:
        db.close()


if __name__ == "__main__":
    seed_content()

