// pages/MyCourses.jsx

import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");


const getToken = () => {
  const token = localStorage.getItem("access_token");

  if (
    !token ||
    token === "undefined" ||
    token === "null"
  ) {
    return null;
  }

  return token;
};


function MyCourses() {

  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);


  const handleAuthError = useCallback(() => {

    localStorage.removeItem("access_token");
    localStorage.removeItem("user_name");

    navigate("/login", {
      replace: true
    });

  }, [navigate]);


  const loadCourses = useCallback(async () => {

    const token = getToken();

    if (!token) {
      handleAuthError();
      return;
    }

    try {

      setError("");
      setRefreshing(true);

      const response = await fetch(
        `${API_URL}/api/courses/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          },
          cache: "no-store"
        }
      );

      if (response.status === 401) {

        handleAuthError();
        return;
      }

      if (!response.ok) {

        throw new Error(
          `Failed to load courses (${response.status})`
        );
      }

      const data = await response.json();

      let coursesList = [];

      if (Array.isArray(data)) {

        coursesList = data;

      } else if (
        data &&
        Array.isArray(data.courses)
      ) {

        coursesList = data.courses;

      } else if (
        data &&
        Array.isArray(data.data)
      ) {

        coursesList = data.data;
      }

      setCourses(coursesList);

    } catch (err) {

      console.error(
        "Courses error:",
        err
      );

      setError(
        err.message ||
        "Could not load courses."
      );

      setCourses([]);

    } finally {

      setLoading(false);
      setRefreshing(false);
    }

  }, [handleAuthError]);


  const loadProgress = useCallback(async () => {

    const token = getToken();

    if (!token) {
      return;
    }

    try {

      const response = await fetch(
        `${API_URL}/api/progress/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          },
          cache: "no-store"
        }
      );

      if (response.status === 401) {

        handleAuthError();
        return;
      }

      if (!response.ok) {

        setCompletedLessonIds([]);
        return;
      }

      const data = await response.json();

      setCompletedLessonIds(
        Array.isArray(
          data.completed_lesson_ids
        )
          ? data.completed_lesson_ids
          : []
      );

    } catch (err) {

      console.error(
        "Progress error:",
        err
      );

      setCompletedLessonIds([]);
    }

  }, [handleAuthError]);


  const loadData = useCallback(async () => {

    await Promise.all([
      loadCourses(),
      loadProgress()
    ]);

  }, [
    loadCourses,
    loadProgress
  ]);


  useEffect(() => {

    loadData();

  }, [loadData]);


  const getCourseProgress = (course) => {

    let total = 0;
    let completed = 0;

    if (
      !course ||
      !Array.isArray(course.levels)
    ) {

      return {
        total: 0,
        completed: 0,
        percentage: 0
      };
    }

    course.levels.forEach((level) => {

      if (
        !level ||
        !Array.isArray(level.chapters)
      ) {
        return;
      }

      level.chapters.forEach((chapter) => {

        if (
          !chapter ||
          !Array.isArray(chapter.lessons)
        ) {
          return;
        }

        chapter.lessons.forEach((lesson) => {

          if (!lesson) {
            return;
          }

          total++;

          if (
            completedLessonIds.includes(
              lesson.id
            )
          ) {

            completed++;
          }

        });

      });

    });

    return {
      total,
      completed,
      percentage:
        total > 0
          ? Math.round(
              (completed / total) * 100
            )
          : 0
    };
  };


  const getCourseImage = (
    title = "",
    category = ""
  ) => {

    const text =
      `${title} ${category}`.toLowerCase();

    if (text.includes("python")) {
      return "/courses/python.png";
    }

    if (
      text.includes("web development") ||
      text.includes("frontend") ||
      text.includes("backend") ||
      text.includes("html") ||
      text.includes("css") ||
      text.includes("javascript")
    ) {

      return "/courses/webdevelopment.png";
    }

    if (
      text.includes("artificial intelligence") ||
      text.includes("machine learning") ||
      text.includes("deep learning") ||
      text.includes("ai")
    ) {

      return "/courses/ai.jpg";
    }

    if (text.includes("react")) {
      return "/courses/react.png";
    }

    if (text.includes("data science")) {
      return "/courses/ai.jpg";
    }

    return "/courses/react.png";
  };


  const getCourseStatus = (
    percentage
  ) => {

    if (percentage >= 100) {

      return {
        text: "Completed",
        className: "completed"
      };
    }

    if (percentage > 0) {

      return {
        text: "In Progress",
        className: "in-progress"
      };
    }

    return {
      text: "Not Started",
      className: "not-started"
    };
  };


  const userName =
    localStorage.getItem("user_name") ||
    "Student";


  if (loading) {

    return (
      <div className="app">

        <main className="main">

          <div className="page-loading">

            <div className="loading-spinner" />

            <p>
              Loading your courses...
            </p>

          </div>

        </main>

      </div>
    );
  }


  return (

    <div className="app">

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
            type="button"
            className="nav-item logout"
            onClick={handleAuthError}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      <main className="main">

        <header className="topbar">

          <div>

            <h1>
              My Courses
            </h1>

            <p>
              Continue learning and track
              your progress.
            </p>

          </div>


          <div className="profile">

            <div className="avatar">

              {userName
                .charAt(0)
                .toUpperCase()}

            </div>

            <div>

              <strong>
                {userName}
              </strong>

              <span>
                Student
              </span>

            </div>

          </div>

        </header>


        {error && (

          <div className="courses-error">

            <div>
              ⚠️
            </div>

            <div>

              <strong>
                Unable to load courses
              </strong>

              <p>
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={loadData}
            >
              Try Again
            </button>

          </div>

        )}


        <section className="courses-page-hero">

          <div>

            <span className="welcome-label">
              YOUR LEARNING SPACE
            </span>

            <h2>
              Keep building your skills.
            </h2>

            <p>
              Explore your courses, continue
              lessons, and track how far
              you've come.
            </p>

            <div
              style={{
                marginTop: "16px",
                fontSize: "14px",
                opacity: 0.85
              }}
            >
              🤖 AI-generated courses will
              appear here automatically after
              you save them.
            </div>

          </div>


          <div className="courses-hero-icon">
            📚
          </div>

        </section>


        <div className="section-header courses-header">

          <div>

            <h2>
              All Courses
            </h2>

            <p>

              {courses.length === 0
                ? "No courses available yet"
                : `${courses.length} ${
                    courses.length === 1
                      ? "course"
                      : "courses"
                  } available`}

            </p>

          </div>


          <button
            type="button"
            className="view-all"
            onClick={loadData}
            disabled={refreshing}
            style={{
              cursor: refreshing
                ? "not-allowed"
                : "pointer",
              border: "none"
            }}
          >

            {refreshing
              ? "Updating..."
              : "↻ Refresh"}

          </button>

        </div>


        {courses.length === 0 ? (

          <div className="courses-empty-state">

            <div className="courses-empty-icon">
              📚
            </div>

            <h2>
              No courses yet
            </h2>

            <p>
              Your saved courses will appear
              here. Generate a personalized
              learning path to get started.
            </p>

            <Link
              to="/"
              className="course-continue-button"
            >
              Go to Dashboard
              <span>→</span>
            </Link>

          </div>

        ) : (

          <div className="my-courses-grid">

            {courses.map((course) => {

              const progress =
                getCourseProgress(course);

              const status =
                getCourseStatus(
                  progress.percentage
                );

              return (

                <div
                  className="my-course-card"
                  key={course.id}
                >

                  <div className="my-course-top">

                    <div className="my-course-icon">

                      <img
                        src={
                          course.icon &&
                          course.icon.startsWith("/")
                            ? course.icon
                            : getCourseImage(
                                course.title,
                                course.category
                              )
                        }
                        alt={
                          course.title ||
                          "Course"
                        }
                        onError={(event) => {

                          event.currentTarget.src =
                            "/courses/react.png";

                        }}
                      />

                    </div>


                    <span
                      className={
                        `course-status ${status.className}`
                      }
                    >
                      {status.text}
                    </span>

                  </div>


                  <span className="category">

                    {course.category ||
                      "General"}

                  </span>


                  <h3>

                    {course.title ||
                      "Untitled Course"}

                  </h3>


                  <p className="my-course-description">

                    {course.description ||
                      "Start learning this course and build your skills step by step."}

                  </p>


                  {course.level && (

                    <div
                      style={{
                        marginTop: "8px",
                        marginBottom: "14px",
                        fontSize: "13px",
                        opacity: 0.75
                      }}
                    >

                      Level:{" "}

                      <strong>
                        {course.level}
                      </strong>

                    </div>

                  )}


                  <div className="my-course-progress-info">

                    <span>
                      {progress.percentage}% Complete
                    </span>

                    <span>
                      {progress.completed}
                      {" / "}
                      {progress.total}
                      {" "}
                      {progress.total === 1
                        ? "lesson"
                        : "lessons"}
                    </span>

                  </div>


                  <div className="progress">

                    <div
                      className="progress-fill"
                      style={{
                        width:
                          `${progress.percentage}%`
                      }}
                    />

                  </div>


                  <Link
                    to={`/courses/${course.id}`}
                    className="course-continue-button"
                  >

                    {progress.percentage === 0
                      ? "Start Learning"
                      : progress.percentage >= 100
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

        )}

      </main>

    </div>
  );
}


export default MyCourses;