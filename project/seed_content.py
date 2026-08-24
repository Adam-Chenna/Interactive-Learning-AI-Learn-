from database import SessionLocal
from models.course import Course
from models.level import Level
from models.chapter import Chapter
from models.lesson import Lesson

# Progress / quiz models
from models.progress import LessonProgress
from models.quiz import QuizQuestion
from models.quiz_progress import QuizProgress

# ============================================================
# QUIZ GENERATOR
# ============================================================

def create_quiz_for_lesson(db, lesson):

    title = lesson.title.strip()
    content = lesson.content.strip()

    # --------------------------------------------------------
    # QUESTION 1
    # --------------------------------------------------------

    question_1 = QuizQuestion(
        lesson_id=lesson.id,

        question=f"What is the main topic of the lesson '{title}'?",

        option_a=title,
        option_b="Database Management",
        option_c="Network Security",
        option_d="Operating System Design",

        correct_answer=title
    )

    db.add(question_1)

    # --------------------------------------------------------
    # QUESTION 2
    # --------------------------------------------------------

    first_sentence = content.split(".")[0].strip()

    if not first_sentence:
        first_sentence = f"This lesson explains {title}."

    question_2 = QuizQuestion(
        lesson_id=lesson.id,

        question=f"Which statement best describes '{title}'?",

        option_a=first_sentence,
        option_b="It is mainly used for designing computer hardware.",
        option_c="It is primarily a database administration technique.",
        option_d="It is a method used only for network configuration.",

        correct_answer=first_sentence
    )

    db.add(question_2)

    # --------------------------------------------------------
    # QUESTION 3
    # --------------------------------------------------------

    question_3 = QuizQuestion(
        lesson_id=lesson.id,

        question=f"Which option is most closely related to '{title}'?",

        option_a=title,
        option_b="Unrelated computer hardware maintenance",
        option_c="Physical cable installation",
        option_d="Printer cartridge replacement",

        correct_answer=title
    )

    db.add(question_3)

    # --------------------------------------------------------
    # QUESTION 4
    # --------------------------------------------------------

    question_4 = QuizQuestion(
        lesson_id=lesson.id,

        question=f"Why is learning '{title}' useful?",

        option_a=f"It helps learners understand {title}.",
        option_b="It completely replaces the need for computers.",
        option_c="It is used only to repair physical hardware.",
        option_d="It prevents software from being installed.",

        correct_answer=f"It helps learners understand {title}."
    )

    db.add(question_4)

    db.flush()


# ============================================================
# ADD COURSE CONTENT
# ============================================================

def add_course_content(db, course_title, levels_data):

    course = db.query(Course).filter(
        Course.title == course_title
    ).first()

    if not course:
        print(f"❌ Course not found: {course_title}")
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
                db.flush()

                # ==========================================
                # CREATE QUIZ FOR THIS LESSON
                # ==========================================

                create_quiz_for_lesson(
                    db,
                    lesson
                )

    print(f"✓ Course + quizzes added: {course_title}")


# ============================================================
# CLEAR OLD CONTENT
# ============================================================

def clear_course_content(db):

    print("\nClearing old course content...")

    # --------------------------------------------------------
    # Quiz progress
    # --------------------------------------------------------

    try:
        deleted = db.query(QuizProgress).delete()
        print(f"✓ Quiz progress removed: {deleted}")
    except Exception as error:
        print("QuizProgress cleanup skipped:", error)

    # --------------------------------------------------------
    # Quiz questions
    # --------------------------------------------------------

    try:
        deleted = db.query(QuizQuestion).delete()
        print(f"✓ Quiz questions removed: {deleted}")
    except Exception as error:
        print("QuizQuestion cleanup skipped:", error)

    # --------------------------------------------------------
    # Lesson progress
    # --------------------------------------------------------

    try:
        deleted = db.query(LessonProgress).delete()
        print(f"✓ Lesson progress removed: {deleted}")
    except Exception as error:
        print("LessonProgress cleanup skipped:", error)

    # --------------------------------------------------------
    # Lessons
    # --------------------------------------------------------

    deleted = db.query(Lesson).delete()
    print(f"✓ Lessons removed: {deleted}")

    # --------------------------------------------------------
    # Chapters
    # --------------------------------------------------------

    deleted = db.query(Chapter).delete()
    print(f"✓ Chapters removed: {deleted}")

    # --------------------------------------------------------
    # Levels
    # --------------------------------------------------------

    deleted = db.query(Level).delete()
    print(f"✓ Levels removed: {deleted}")

    db.commit()

    print("✓ Old course content completely removed.\n")

# ============================================================
# WEB DEVELOPMENT
# ============================================================

web_development = [

    {
        "title": "HTML Fundamentals",
        "chapters": [

            {
                "title": "Introduction to HTML",
                "lessons": [

                    {
                        "title": "What is HTML?",
                        "duration": 15,
                        "xp": 15,
                        "content": """
HTML stands for HyperText Markup Language and is the standard language
used to structure content on the web.

HTML is not a programming language. Instead, it is a markup language
that tells the browser how different pieces of content should be
structured.

A typical web page contains headings, paragraphs, images, links,
buttons, lists and other elements.

HTML documents use elements represented by tags such as h1, p, a,
img and div.

Understanding HTML is the first step toward becoming a web developer.
"""
                    },

                    {
                        "title": "HTML Elements and Tags",
                        "duration": 20,
                        "xp": 20,
                        "content": """
HTML pages are built from elements.

Most HTML elements have an opening tag and a closing tag.

For example:

<h1>Welcome to LearnAI</h1>

The opening tag tells the browser where the element starts, while the
closing tag tells the browser where it ends.

Some elements such as img and input do not require traditional closing
tags.

HTML elements can also contain attributes that provide additional
information.
"""
                    },

                    {
                        "title": "HTML Document Structure",
                        "duration": 20,
                        "xp": 20,
                        "content": """
A standard HTML document contains several important parts.

The DOCTYPE declaration tells the browser that the document uses HTML5.

The html element is the root element.

The head section contains metadata such as the page title.

The body contains the visible content of the page.

A basic structure looks like:

<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>

Learning this structure makes it easier to create valid web pages.
"""
                    },

                    {
                        "title": "HTML Headings and Paragraphs",
                        "duration": 15,
                        "xp": 15,
                        "content": """
HTML provides six heading levels from h1 to h6.

The h1 element represents the main heading of a page.

The p element is used for paragraphs.

Headings should be organized logically because they help users,
search engines and accessibility tools understand page structure.

Good heading hierarchy improves readability and SEO.
"""
                    }

                ]
            },

            {
                "title": "Links, Images and Lists",
                "lessons": [

                    {
                        "title": "HTML Links",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Links allow users to navigate between web pages and resources.

The anchor element is written using the a tag.

Example:

<a href="https://example.com">Visit Website</a>

The href attribute contains the destination URL.

Links can point to another page, a section of the same page,
an email address or an external website.
"""
                    },

                    {
                        "title": "HTML Images",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Images are added using the img element.

Example:

<img src="image.jpg" alt="Learning">

The src attribute specifies the image location.

The alt attribute provides alternative text.

Alternative text is important for accessibility and is also useful
when an image cannot be loaded.
"""
                    },

                    {
                        "title": "HTML Lists",
                        "duration": 20,
                        "xp": 20,
                        "content": """
HTML supports ordered and unordered lists.

An unordered list uses ul and displays bullet points.

An ordered list uses ol and displays numbered items.

Each list item is created using the li element.

Lists are commonly used for navigation menus, features,
instructions and collections of information.
"""
                    },

                    {
                        "title": "Semantic HTML",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Semantic HTML uses elements that clearly describe their purpose.

Examples include:

header
nav
main
section
article
aside
footer

Semantic elements make websites easier to understand and improve
accessibility and search engine optimization.

Using semantic HTML is generally better than creating every section
with generic div elements.
"""
                    }

                ]
            },

            {
                "title": "HTML Forms",
                "lessons": [

                    {
                        "title": "Form Basics",
                        "duration": 20,
                        "xp": 20,
                        "content": """
HTML forms collect information from users.

A form can contain text fields, email fields, password fields,
checkboxes, radio buttons and submit buttons.

Forms are commonly used for login pages, registration pages,
search interfaces and contact forms.
"""
                    },

                    {
                        "title": "Input Elements",
                        "duration": 20,
                        "xp": 20,
                        "content": """
The input element supports many types.

Common input types include:

text
email
password
number
date
checkbox
radio
file

Choosing the correct input type improves validation and user
experience.
"""
                    },

                    {
                        "title": "Labels and Form Accessibility",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Labels describe form controls.

A label should be associated with its input so that users and
assistive technologies can understand what information is required.

Accessible forms are easier for everyone to use.
"""
                    },

                    {
                        "title": "HTML Form Validation",
                        "duration": 25,
                        "xp": 25,
                        "content": """
HTML provides built-in form validation.

Attributes such as required, minlength, maxlength, min and max
can restrict user input.

The browser can automatically display validation messages when
input does not satisfy the defined rules.
"""
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
                        "duration": 15,
                        "xp": 15,
                        "content": """
CSS stands for Cascading Style Sheets.

CSS controls the visual appearance of HTML elements.

It can control colors, fonts, spacing, borders, layouts,
animations and responsive behavior.

CSS separates presentation from the structure of HTML.
"""
                    },

                    {
                        "title": "CSS Selectors",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Selectors determine which HTML elements receive styles.

Common selectors include:

element selectors
class selectors
ID selectors
attribute selectors
pseudo-classes

For example, a class selector can style multiple elements that
share the same class.
"""
                    },

                    {
                        "title": "Colors and Typography",
                        "duration": 20,
                        "xp": 20,
                        "content": """
CSS provides many properties for typography.

Common properties include:

color
font-family
font-size
font-weight
line-height
text-align

Colors can be represented using names, hexadecimal values,
RGB, HSL and other formats.
"""
                    },

                    {
                        "title": "CSS Box Model",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Every CSS element can be understood through the box model.

The box model consists of:

content
padding
border
margin

Understanding the box model is essential for controlling spacing
and element dimensions.
"""
                    }

                ]
            },

            {
                "title": "CSS Layout",
                "lessons": [

                    {
                        "title": "Display Property",
                        "duration": 20,
                        "xp": 20,
                        "content": """
The display property controls how an element participates in layout.

Common values include block, inline, inline-block and none.

Modern CSS layouts commonly use Flexbox and Grid.
"""
                    },

                    {
                        "title": "Flexbox Basics",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Flexbox is a one-dimensional CSS layout system.

Important properties include:

display: flex
flex-direction
justify-content
align-items
gap
flex-wrap

Flexbox is especially useful for navigation bars, cards and
horizontal or vertical layouts.
"""
                    },

                    {
                        "title": "CSS Grid",
                        "duration": 25,
                        "xp": 25,
                        "content": """
CSS Grid is a two-dimensional layout system.

Grid allows developers to control rows and columns.

Important properties include:

grid-template-columns
grid-template-rows
gap
grid-column
grid-row

Grid is excellent for dashboards, galleries and complex layouts.
"""
                    },

                    {
                        "title": "Responsive Design",
                        "duration": 30,
                        "xp": 30,
                        "content": """
Responsive design allows websites to work across different
screen sizes.

CSS media queries can apply different styles depending on
viewport dimensions.

Responsive websites should consider mobile, tablet and desktop
layouts.

Flexible widths, responsive grids and media queries are common
tools for creating responsive interfaces.
"""
                    }

                ]
            }

        ]
    },

    {
        "title": "JavaScript Fundamentals",
        "chapters": [

            {
                "title": "JavaScript Basics",
                "lessons": [

                    {
                        "title": "What is JavaScript?",
                        "duration": 20,
                        "xp": 20,
                        "content": """
JavaScript is a programming language widely used to create
interactive web applications.

JavaScript can modify HTML, respond to user events, communicate
with APIs and manage application state.

Modern frontend frameworks such as React use JavaScript heavily.
"""
                    },

                    {
                        "title": "Variables and Data Types",
                        "duration": 25,
                        "xp": 25,
                        "content": """
JavaScript provides let, const and historically var for variables.

Common data types include:

string
number
boolean
object
array
null
undefined

Modern JavaScript code generally prefers let and const.
"""
                    },

                    {
                        "title": "Operators and Expressions",
                        "duration": 25,
                        "xp": 25,
                        "content": """
JavaScript provides arithmetic, comparison and logical operators.

Examples include:

+
-
*
/
===
!==
>
<
&&
||

Operators allow developers to calculate values and build conditions.
"""
                    },

                    {
                        "title": "Conditional Statements",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Conditional statements allow programs to make decisions.

JavaScript supports if, else if and else.

The switch statement can also be used when comparing one value
against multiple possible cases.
"""
                    }

                ]
            },

            {
                "title": "Functions and Arrays",
                "lessons": [

                    {
                        "title": "JavaScript Functions",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Functions are reusable blocks of code.

Functions can accept parameters and return values.

JavaScript supports traditional functions as well as arrow
functions.

Reusable functions make applications easier to maintain.
"""
                    },

                    {
                        "title": "Arrays",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Arrays store multiple values in a single structure.

JavaScript arrays provide methods such as:

map
filter
find
reduce
forEach
push
pop

These methods are commonly used when working with collections
of data.
"""
                    },

                    {
                        "title": "Objects",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Objects store related data using key-value pairs.

For example, a user object might contain name, email and role.

Objects are fundamental to JavaScript and are heavily used when
working with API responses.
"""
                    },

                    {
                        "title": "Async JavaScript",
                        "duration": 30,
                        "xp": 30,
                        "content": """
Modern web applications frequently perform asynchronous operations.

Promises, async functions and await are commonly used for handling
operations such as API requests.

The fetch function can be used to communicate with backend APIs.
"""
                    }

                ]
            }

        ]
    }

]


# ============================================================
# ARTIFICIAL INTELLIGENCE
# ============================================================

artificial_intelligence = [

    {
        "title": "AI Fundamentals",
        "chapters": [

            {
                "title": "Introduction to AI",
                "lessons": [

                    {
                        "title": "What is Artificial Intelligence?",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Artificial Intelligence is the field of creating computer systems
that can perform tasks that normally require aspects of human
intelligence.

Examples include language understanding, image recognition,
recommendation systems, planning and decision making.

AI systems use algorithms, data and computational resources
to solve problems.
"""
                    },

                    {
                        "title": "History of AI",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Artificial Intelligence has developed through several periods.

Early research focused on symbolic reasoning and rule-based systems.

Later, machine learning became increasingly important because
systems could learn patterns from data.

Modern AI has been strongly influenced by deep learning,
large datasets and powerful computing hardware.
"""
                    },

                    {
                        "title": "Types of AI",
                        "duration": 25,
                        "xp": 25,
                        "content": """
AI can be discussed using different classifications.

Narrow AI is designed for specific tasks.

General AI refers to a hypothetical system capable of performing
a broad range of intellectual tasks.

Most AI systems available today are examples of narrow AI.
"""
                    },

                    {
                        "title": "Applications of AI",
                        "duration": 25,
                        "xp": 25,
                        "content": """
AI is used in many industries.

Examples include:

healthcare
finance
education
recommendation systems
robotics
computer vision
natural language processing
cybersecurity

The effectiveness of an AI system depends heavily on the quality
and suitability of its data and design.
"""
                    }

                ]
            },

            {
                "title": "Machine Learning",
                "lessons": [

                    {
                        "title": "What is Machine Learning?",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Machine Learning is a branch of AI where algorithms learn patterns
from data.

Instead of manually writing every rule, developers provide data
and allow a model to learn relationships within that data.

Machine learning is widely used for prediction, classification,
recommendation and pattern recognition.
"""
                    },

                    {
                        "title": "Supervised Learning",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Supervised learning uses labeled training data.

Each training example contains an input and an expected output.

Common supervised learning tasks include classification and
regression.

Examples include spam detection and house-price prediction.
"""
                    },

                    {
                        "title": "Unsupervised Learning",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Unsupervised learning works with data without predefined labels.

The algorithm attempts to discover useful structures or patterns.

Clustering is a common unsupervised learning technique.

It can be used to group customers or documents based on similarity.
"""
                    },

                    {
                        "title": "Model Training and Testing",
                        "duration": 30,
                        "xp": 30,
                        "content": """
Machine learning models are commonly trained using one portion
of the available data and evaluated using another portion.

Training data helps the model learn.

Validation data can help with model selection and tuning.

Test data provides an estimate of how the final model performs
on unseen examples.
"""
                    }

                ]
            }

        ]
    },

    {
        "title": "Deep Learning",
        "chapters": [

            {
                "title": "Neural Networks",
                "lessons": [

                    {
                        "title": "Introduction to Neural Networks",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Neural networks are machine learning models made from connected
computational units called neurons.

A basic neural network contains input, hidden and output layers.

Each connection has a weight that is adjusted during training.
"""
                    },

                    {
                        "title": "Neurons and Activation Functions",
                        "duration": 25,
                        "xp": 25,
                        "content": """
A neuron receives inputs, applies weights and produces an output.

Activation functions introduce non-linearity into neural networks.

Common activation functions include ReLU, sigmoid and tanh.

Non-linear activation allows neural networks to learn complex
relationships.
"""
                    },

                    {
                        "title": "Backpropagation",
                        "duration": 30,
                        "xp": 30,
                        "content": """
Backpropagation is a method used to calculate how changes in
model parameters affect the loss.

The calculated gradients are used by optimization algorithms
to update model weights.

Backpropagation is fundamental to training neural networks.
"""
                    },

                    {
                        "title": "Deep Learning",
                        "duration": 30,
                        "xp": 30,
                        "content": """
Deep learning uses neural networks containing multiple layers.

Deep models can learn increasingly complex representations from
raw data.

Deep learning has achieved strong results in computer vision,
speech recognition and natural language processing.
"""
                    }

                ]
            },

            {
                "title": "Generative AI",
                "lessons": [

                    {
                        "title": "What is Generative AI?",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Generative AI refers to systems that generate new content.

Generated content can include text, images, audio, video and code.

Modern generative systems learn statistical patterns from large
datasets and use those patterns to produce new outputs.
"""
                    },

                    {
                        "title": "Large Language Models",
                        "duration": 30,
                        "xp": 30,
                        "content": """
Large Language Models are neural network models trained on large
collections of text.

They learn statistical relationships between tokens and can generate
coherent text.

LLMs are commonly used for question answering, summarization,
translation and code generation.
"""
                    },

                    {
                        "title": "Prompt Engineering",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Prompt engineering is the practice of designing effective
instructions for AI systems.

Good prompts clearly describe the task, context, desired format
and relevant constraints.

Clear instructions can improve the usefulness and consistency
of model responses.
"""
                    },

                    {
                        "title": "AI Safety and Responsible AI",
                        "duration": 30,
                        "xp": 30,
                        "content": """
Responsible AI involves considering reliability, privacy,
security, fairness and potential misuse.

AI systems can produce incorrect or biased outputs.

Developers should evaluate systems carefully and avoid treating
model outputs as automatically correct.
"""
                    }

                ]
            }

        ]
    }

]


# ============================================================
# DATA SCIENCE
# ============================================================

data_science = [

    {
        "title": "Data Science Fundamentals",
        "chapters": [

            {
                "title": "Introduction to Data Science",
                "lessons": [

                    {
                        "title": "What is Data Science?",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Data Science combines statistics, programming, data analysis
and domain knowledge to extract useful insights from data.

Data scientists collect, clean, analyze and visualize data
and may build machine learning models.

The goal is to turn raw data into useful information for decisions.
"""
                    },

                    {
                        "title": "Types of Data",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Data can be structured, semi-structured or unstructured.

Structured data is organized into tables.

Semi-structured data may use formats such as JSON or XML.

Unstructured data can include text, images, audio and video.
"""
                    },

                    {
                        "title": "Data Collection",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Data can be collected from many sources.

Examples include databases, APIs, surveys, sensors,
web applications and transaction systems.

The quality of collected data strongly affects later analysis.
"""
                    },

                    {
                        "title": "Data Quality",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Data quality involves factors such as accuracy, completeness,
consistency and validity.

Poor-quality data can lead to misleading conclusions.

Data quality checks should therefore be performed before
important analysis.
"""
                    }

                ]
            },

            {
                "title": "Data Cleaning",
                "lessons": [

                    {
                        "title": "Missing Data",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Missing values are common in real-world datasets.

Depending on the situation, missing values may be removed,
replaced with a suitable value or handled using statistical
imputation techniques.

The correct approach depends on why the data is missing.
"""
                    },

                    {
                        "title": "Duplicate Data",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Duplicate records can affect analysis and produce misleading
results.

Data cleaning often involves identifying and removing or
correcting duplicate records.

The appropriate method depends on the meaning of the data.
"""
                    },

                    {
                        "title": "Outliers",
                        "duration": 25,
                        "xp": 25,
                        "content": """
An outlier is an observation that differs substantially from
other observations.

Outliers may represent errors, unusual events or legitimate
rare cases.

They should not automatically be removed without understanding
their cause.
"""
                    },

                    {
                        "title": "Data Preprocessing",
                        "duration": 30,
                        "xp": 30,
                        "content": """
Data preprocessing transforms raw data into a form suitable
for analysis or machine learning.

Common operations include cleaning, encoding categorical data,
scaling numerical features and splitting datasets.
"""
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
                        "duration": 20,
                        "xp": 20,
                        "content": """
NumPy is a Python library for numerical computing.

It provides efficient multidimensional arrays and many mathematical
operations.

NumPy is widely used as a foundation for scientific Python tools.
"""
                    },

                    {
                        "title": "NumPy Arrays",
                        "duration": 25,
                        "xp": 25,
                        "content": """
NumPy arrays store values in an efficient multidimensional structure.

Arrays can have one or more dimensions.

NumPy provides operations for indexing, slicing, reshaping and
mathematical calculations.
"""
                    },

                    {
                        "title": "Array Operations",
                        "duration": 25,
                        "xp": 25,
                        "content": """
NumPy supports vectorized operations.

Instead of manually processing every element with a Python loop,
many operations can be applied directly to an entire array.

This can make numerical calculations concise and efficient.
"""
                    },

                    {
                        "title": "NumPy Statistics",
                        "duration": 25,
                        "xp": 25,
                        "content": """
NumPy provides statistical functions such as mean, median,
standard deviation, minimum and maximum.

These operations are useful when exploring numerical datasets.
"""
                    }

                ]
            },

            {
                "title": "Pandas",
                "lessons": [

                    {
                        "title": "Introduction to Pandas",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Pandas is a Python library designed for data manipulation
and analysis.

Its main structures include Series and DataFrame.

Pandas makes it easier to load, clean, transform and analyze
tabular datasets.
"""
                    },

                    {
                        "title": "DataFrames",
                        "duration": 25,
                        "xp": 25,
                        "content": """
A DataFrame is a two-dimensional data structure with rows
and columns.

DataFrames are commonly used to represent datasets.

They support indexing, filtering, sorting, grouping and
aggregation operations.
"""
                    },

                    {
                        "title": "Filtering Data",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Pandas allows rows to be selected using conditions.

Filtering is useful when analyzing only the records that
satisfy particular requirements.

Multiple conditions can be combined to create more specific
data selections.
"""
                    },

                    {
                        "title": "GroupBy and Aggregation",
                        "duration": 30,
                        "xp": 30,
                        "content": """
The groupby operation allows data to be divided into groups
based on one or more columns.

Aggregation functions such as sum, mean, count and max can then
be applied to each group.

This is useful for summarizing datasets.
"""
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
                        "duration": 20,
                        "xp": 20,
                        "content": """
Data visualization converts information into graphical forms.

Charts can make trends, comparisons and relationships easier
to understand.

Effective visualization should communicate information clearly
without unnecessary complexity.
"""
                    },

                    {
                        "title": "Bar Charts",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Bar charts are useful for comparing values across categories.

They can display counts, totals or other measurements.

Bars should be labeled clearly so that users can understand
what the values represent.
"""
                    },

                    {
                        "title": "Line Charts",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Line charts are commonly used to show changes over an ordered
sequence such as time.

They can reveal trends, increases, decreases and patterns.
"""
                    },

                    {
                        "title": "Scatter Plots",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Scatter plots display relationships between two numerical variables.

Each point represents an observation.

Scatter plots can help identify patterns, clusters and possible
relationships between variables.
"""
                    }

                ]
            },

            {
                "title": "Matplotlib",
                "lessons": [

                    {
                        "title": "Introduction to Matplotlib",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Matplotlib is a popular Python library for creating charts.

It supports many visualization types including line charts,
bar charts, scatter plots and histograms.

Matplotlib provides detailed control over chart appearance.
"""
                    },

                    {
                        "title": "Creating Charts",
                        "duration": 25,
                        "xp": 25,
                        "content": """
A typical Matplotlib workflow involves creating a figure,
plotting data and displaying or saving the result.

Labels, titles and legends help communicate the meaning
of a visualization.
"""
                    },

                    {
                        "title": "Chart Customization",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Charts can be customized using titles, axis labels, legends,
markers, line styles and figure dimensions.

Customization should improve readability rather than simply
add visual decoration.
"""
                    },

                    {
                        "title": "Data Visualization Best Practices",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Good visualizations should have clear labels, appropriate scales
and a simple visual structure.

Avoid misleading axes, unnecessary decoration and confusing
color choices.

The purpose of a chart should always be clear to the viewer.
"""
                    }

                ]
            }

        ]
    }

]


# ============================================================
# PYTHON PROGRAMMING
# ============================================================

python_programming = [

    {
        "title": "Python Fundamentals",
        "chapters": [

            {
                "title": "Getting Started with Python",
                "lessons": [

                    {
                        "title": "What is Python?",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Python is a high-level, general-purpose programming language.

It is known for its readable syntax and large ecosystem of libraries.

Python is used in web development, automation, data science,
machine learning, scripting and many other areas.

Python emphasizes readable and maintainable code.
"""
                    },

                    {
                        "title": "Installing Python",
                        "duration": 15,
                        "xp": 15,
                        "content": """
Python can be installed on Windows, macOS and Linux.

After installation, the Python interpreter can execute Python programs.

Developers commonly use editors such as VS Code together with
a Python virtual environment.

Virtual environments help isolate project dependencies.
"""
                    },

                    {
                        "title": "Your First Python Program",
                        "duration": 15,
                        "xp": 15,
                        "content": """
A simple Python program can print text to the console.

Example:

print("Hello, World!")

The print function displays information.

Running small programs is a good way to understand the Python
execution process.
"""
                    },

                    {
                        "title": "Python Comments",
                        "duration": 10,
                        "xp": 10,
                        "content": """
Comments are notes written inside source code.

Single-line comments in Python begin with the # symbol.

Comments are ignored when the program executes.

Good comments explain important decisions without unnecessarily
describing obvious code.
"""
                    }

                ]
            },

            {
                "title": "Variables and Data Types",
                "lessons": [

                    {
                        "title": "Python Variables",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Variables allow programs to store and work with values.

Example:

name = "Adam"
age = 20

Python determines the type of a value dynamically.

Variables can be reassigned during program execution.
"""
                    },

                    {
                        "title": "Strings",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Strings represent text.

Examples include:

"Hello"
"LearnAI"
"Python Programming"

Python provides many string operations including concatenation,
formatting, searching and slicing.
"""
                    },

                    {
                        "title": "Numbers",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Python supports integers and floating-point numbers.

Examples:

10
25
3.14
99.5

Python provides arithmetic operators for addition, subtraction,
multiplication, division and other calculations.
"""
                    },

                    {
                        "title": "Booleans and None",
                        "duration": 15,
                        "xp": 15,
                        "content": """
Boolean values are True and False.

They are commonly used in conditions.

Python also provides None to represent the absence of a value.

Understanding these values is important when building logic.
"""
                    }

                ]
            }

        ]
    },

    {
        "title": "Python Control Flow",
        "chapters": [

            {
                "title": "Conditional Logic",
                "lessons": [

                    {
                        "title": "if Statements",
                        "duration": 20,
                        "xp": 20,
                        "content": """
The if statement allows Python programs to execute code only
when a condition is true.

Example:

if age >= 18:
    print("Adult")

Conditions are evaluated as Boolean expressions.
"""
                    },

                    {
                        "title": "if elif else",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Python supports multiple conditional branches.

if handles the first condition.

elif allows additional conditions.

else handles the remaining case.

This structure is useful when a program must choose between
multiple possible outcomes.
"""
                    },

                    {
                        "title": "Comparison Operators",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Python provides comparison operators such as:

==
!=
>
<
>=
<=

These operators produce Boolean results and are commonly used
inside conditional statements.
"""
                    },

                    {
                        "title": "Logical Operators",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Python provides logical operators:

and
or
not

They allow multiple conditions to be combined.

Logical operators are useful for building more complex program
decisions.
"""
                    }

                ]
            },

            {
                "title": "Loops",
                "lessons": [

                    {
                        "title": "for Loops",
                        "duration": 25,
                        "xp": 25,
                        "content": """
A for loop iterates over items in an iterable.

Example:

for item in items:
    print(item)

For loops are commonly used with lists, strings, ranges and
other iterable objects.
"""
                    },

                    {
                        "title": "while Loops",
                        "duration": 25,
                        "xp": 25,
                        "content": """
A while loop repeatedly executes code while a condition remains true.

It is useful when the number of iterations is not known in advance.

Care must be taken to ensure the loop condition eventually changes
when necessary.
"""
                    },

                    {
                        "title": "break and continue",
                        "duration": 20,
                        "xp": 20,
                        "content": """
The break statement exits a loop immediately.

The continue statement skips the remaining code in the current
iteration and moves to the next iteration.

These statements can provide useful control over loops.
"""
                    },

                    {
                        "title": "Nested Loops",
                        "duration": 25,
                        "xp": 25,
                        "content": """
A loop can contain another loop.

Nested loops are useful when working with grids, tables and
combinations of values.

However, deeply nested loops can make code harder to understand
and may increase execution time.
"""
                    }

                ]
            }

        ]
    },

    {
        "title": "Python Data Structures",
        "chapters": [

            {
                "title": "Lists and Tuples",
                "lessons": [

                    {
                        "title": "Python Lists",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Lists are ordered, mutable collections.

Example:

numbers = [10, 20, 30]

Lists support indexing, slicing and many useful methods.

They are one of the most commonly used data structures in Python.
"""
                    },

                    {
                        "title": "List Methods",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Common list methods include:

append
extend
insert
remove
pop
sort
reverse

These methods allow programs to modify and organize list data.
"""
                    },

                    {
                        "title": "Tuples",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Tuples are ordered collections that cannot be modified after
creation.

Example:

point = (10, 20)

Tuples are useful when representing fixed collections of values.
"""
                    },

                    {
                        "title": "List Comprehensions",
                        "duration": 25,
                        "xp": 25,
                        "content": """
List comprehensions provide a concise way to create lists.

They can include expressions and optional conditions.

They are useful for transforming collections while keeping
code compact and readable.
"""
                    }

                ]
            },

            {
                "title": "Dictionaries and Sets",
                "lessons": [

                    {
                        "title": "Python Dictionaries",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Dictionaries store key-value pairs.

Example:

user = {
    "name": "Adam",
    "role": "Student"
}

Dictionaries are useful for representing structured information.
"""
                    },

                    {
                        "title": "Dictionary Methods",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Useful dictionary methods include:

get
keys
values
items
update
pop

These methods make it easier to access and modify dictionary data.
"""
                    },

                    {
                        "title": "Python Sets",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Sets are collections of unique elements.

They are useful for removing duplicates and performing
mathematical set operations.

Sets support operations such as union, intersection and difference.
"""
                    },

                    {
                        "title": "Choosing Data Structures",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Different data structures solve different problems.

Lists are useful for ordered mutable collections.

Tuples are useful for fixed collections.

Dictionaries are useful for key-value relationships.

Sets are useful when uniqueness is important.

Choosing an appropriate structure improves code clarity and
performance.
"""
                    }

                ]
            }

        ]
    },

    {
        "title": "Python Functions and Projects",
        "chapters": [

            {
                "title": "Functions",
                "lessons": [

                    {
                        "title": "Defining Functions",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Functions allow developers to organize reusable logic.

Example:

def greet(name):
    return "Hello " + name

Functions can accept parameters and return values.

Using functions reduces duplicated code.
"""
                    },

                    {
                        "title": "Parameters and Arguments",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Parameters are variables defined by a function.

Arguments are the actual values passed when calling the function.

Python also supports default parameters and keyword arguments.

These features make functions flexible and reusable.
"""
                    },

                    {
                        "title": "Return Values",
                        "duration": 20,
                        "xp": 20,
                        "content": """
The return statement sends a value back to the caller.

A function can return numbers, strings, collections or objects.

Returning values allows functions to become reusable building
blocks in larger programs.
"""
                    },

                    {
                        "title": "Lambda Functions",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Lambda expressions provide a concise way to create small anonymous
functions.

They are commonly used with operations such as sorting and
functional-style transformations.

For larger logic, regular named functions are usually easier
to understand.
"""
                    }

                ]
            },

            {
                "title": "Errors and Modules",
                "lessons": [

                    {
                        "title": "Exception Handling",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Python uses try and except blocks to handle exceptions.

Handling expected errors prevents programs from crashing
unexpectedly.

finally can be used for cleanup code that should run regardless
of whether an exception occurs.
"""
                    },

                    {
                        "title": "Reading and Writing Files",
                        "duration": 25,
                        "xp": 25,
                        "content": """
Python provides the open function for working with files.

Files can be opened for reading, writing or appending.

Using a with statement is recommended because it automatically
handles closing the file.
"""
                    },

                    {
                        "title": "Python Modules",
                        "duration": 20,
                        "xp": 20,
                        "content": """
Modules allow Python code to be organized into reusable files.

Python includes a large standard library.

Developers can import functions, classes and variables from modules
using import statements.
"""
                    },

                    {
                        "title": "Building a Mini Python Project",
                        "duration": 35,
                        "xp": 35,
                        "content": """
A good way to learn Python is by building a small project.

Example beginner projects include:

calculator
todo list
quiz application
expense tracker
number guessing game

Projects combine variables, conditions, loops, functions and
data structures into a complete application.
"""
                    }

                ]
            }

        ]
    }

]


# ============================================================
# SEED EVERYTHING
# ============================================================

# ============================================================
# SEED EVERYTHING
# ============================================================

def seed_content():

    db = SessionLocal()

    try:

        print("\n")
        print("=" * 60)
        print("STARTING LEARNAI DATABASE SEED")
        print("=" * 60)

        # ----------------------------------------------------
        # CLEAR OLD CONTENT
        # ----------------------------------------------------

        clear_course_content(db)

        # ----------------------------------------------------
        # ADD COURSES
        # ----------------------------------------------------

        add_course_content(
            db,
            "Python Programming",
            python_programming
        )

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

        # ----------------------------------------------------
        # COMMIT EVERYTHING
        # ----------------------------------------------------

        db.commit()

        # ----------------------------------------------------
        # STATISTICS
        # ----------------------------------------------------

        courses_count = db.query(Course).count()
        levels_count = db.query(Level).count()
        chapters_count = db.query(Chapter).count()
        lessons_count = db.query(Lesson).count()
        quiz_count = db.query(QuizQuestion).count()

        print("\n")
        print("=" * 60)
        print("LEARN AI DATABASE SEEDED SUCCESSFULLY")
        print("=" * 60)

        print(f"\nCourses         : {courses_count}")
        print(f"Levels          : {levels_count}")
        print(f"Chapters        : {chapters_count}")
        print(f"Lessons         : {lessons_count}")
        print(f"Quiz Questions  : {quiz_count}")

        print("\n✓ Courses added")
        print("✓ Lessons added")
        print("✓ Quiz questions added")
        print("✓ Progress tables cleaned")
        print("✓ Quiz progress cleaned")

        print("\nYour LearnAI content is ready!")
        print("=" * 60)

    except Exception as error:

        db.rollback()

        print("\n")
        print("=" * 60)
        print("❌ SEED ERROR")
        print("=" * 60)

        print(error)

        raise

    finally:

        db.close()


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    seed_content()