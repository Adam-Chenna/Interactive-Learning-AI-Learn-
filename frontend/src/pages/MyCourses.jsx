import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function MyCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const coursesResponse = await fetch(
          `${API_URL}/api/courses/`
        );

        if (!coursesResponse.ok) {
          throw new Error("Failed to load courses");
        }

        const coursesData =
          await coursesResponse.json();

        setCourses(coursesData);

        if (token) {
          const progressResponse = await fetch(
            `${API_URL}/api/progress/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (progressResponse.ok) {
            const progressData =
              await progressResponse.json();

            setCompletedLessonIds(
              progressData.completed_lesson_ids || []
            );
          }
        }
      } catch (error) {
        console.error(
          "My Courses error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getCourseProgress = (course) => {
    let total = 0;
    let completed = 0;

    course.levels?.forEach((level) => {
      level.chapters?.forEach((chapter) => {
        chapter.lessons?.forEach((lesson) => {
          total++;

          if (
            completedLessonIds.includes(lesson.id)
          ) {
            completed++;
          }
        });
      });
    });

    const percentage =
      total > 0
        ? Math.round((completed / total) * 100)
        : 0;

    return {
      total,
      completed,
      percentage,
    };
  };

  const getCourseImage = (title) => {
    if (title === "Python Programming") {
      return "/courses/python.png";
    }

    if (title === "Web Development") {
      return "/courses/webdevelopment.png";
    }

    if (title === "Artificial Intelligence") {
      return "/courses/ai.jpg";
    }

    if (title === "React") {
      return "/courses/react.png";
    }

    if (title === "Data Science") {
      return "/courses/react.png";
    }

    return "/courses/react.png";
  };

  if (loading) {
    return (
      <div className="app">
        <main className="main">
          <div className="page-loading">
            <div className="loading-spinner"></div>
            <p>Loading your courses...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo">
          <img
            src="/logo.png"
            alt="LearnAI Logo"
          />

          <span>
            LearnAI
          </span>
        </div>

        <nav className="nav">

          <Link
            to="/"
            className="nav-item"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            to="/courses"
            className="nav-item active"
          >
            <span>📚</span>
            My Courses
          </Link>

          <Link
            to="/ai-tutor"
            className="nav-item"
          >
            <span>🤖</span>
            AI Tutor
          </Link>

          <Link
            to="/progress"
            className="nav-item"
          >
            <span>📈</span>
            Progress
          </Link>

          <Link
            to="/certificates"
            className="nav-item"
          >
            <span>🏆</span>
            Certificates
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <Link
            to="/settings"
            className="nav-item"
          >
            <span>⚙</span>
            Settings
          </Link>

          <button
            className="nav-item logout"
            onClick={() => {
              localStorage.removeItem(
                "access_token"
              );

              localStorage.removeItem(
                "user_name"
              );

              navigate("/login", {
                replace: true,
              });
            }}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* MAIN */}

      <main className="main">

        <header className="topbar">

          <div>
            <h1>
              My Courses
            </h1>

            <p>
              Continue learning and track your progress.
            </p>
          </div>

          <div className="profile">

            <div className="avatar">
              {(localStorage.getItem("user_name") ||
                "Student")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {localStorage.getItem(
                  "user_name"
                ) || "Student"}
              </strong>

              <span>
                Student
              </span>
            </div>

          </div>

        </header>


        {/* PAGE HERO */}

        <section className="courses-page-hero">

          <div>
            <span className="welcome-label">
              YOUR LEARNING SPACE
            </span>

            <h2>
              Keep building your skills.
            </h2>

            <p>
              Explore your courses, continue lessons,
              and track how far you've come.
            </p>
          </div>

          <div className="courses-hero-icon">
            📚
          </div>

        </section>


        {/* COURSE HEADER */}

        <div className="section-header courses-header">

          <div>
            <h2>
              All Courses
            </h2>

            <p>
              {courses.length} courses available
            </p>
          </div>

          <span className="view-all">
            {courses.length} Courses
          </span>

        </div>


        {/* COURSES */}

        <div className="my-courses-grid">

          {courses.map((course) => {

            const progress =
              getCourseProgress(course);

            return (
              <div
                className="my-course-card"
                key={course.id}
              >

                <div className="my-course-top">

                  <div className="my-course-icon">
                    <img
                      src={getCourseImage(
                        course.title
                      )}
                      alt={course.title}
                    />
                  </div>

                  <span className="course-status">
                    {progress.percentage === 100
                      ? "Completed"
                      : progress.percentage > 0
                      ? "In Progress"
                      : "Not Started"}
                  </span>

                </div>


                <span className="category">
                  {course.category}
                </span>

                <h3>
                  {course.title}
                </h3>

                <p className="my-course-description">
                  {course.description}
                </p>


                {/* PROGRESS */}

                <div className="my-course-progress-info">

                  <span>
                    {progress.percentage}% Complete
                  </span>

                  <span>
                    {progress.completed} /{" "}
                    {progress.total} lessons
                  </span>

                </div>

                <div className="progress">

                  <div
                    className="progress-fill"
                    style={{
                      width:
                        `${progress.percentage}%`,
                    }}
                  />

                </div>


                {/* BUTTON */}

                <Link
                  to={`/courses/${course.id}`}
                  className="course-continue-button"
                >
                  {progress.percentage === 0
                    ? "Start Learning"
                    : progress.percentage === 100
                    ? "Review Course"
                    : "Continue Learning"}

                  <span>
                    →
                  </span>
                </Link>

              </div>
            );
          })}

        </div>

      </main>

    </div>
  );
}

export default MyCourses;