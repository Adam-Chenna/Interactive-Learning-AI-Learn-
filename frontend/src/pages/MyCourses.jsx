import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

// =====================================================
// AUTH HELPER
// =====================================================

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


// =====================================================
// MY COURSES
// =====================================================

function MyCourses() {
  const navigate = useNavigate();

  // ===================================================
  // STATE
  // ===================================================

  const [courses, setCourses] = useState([]);

  const [completedLessonIds, setCompletedLessonIds] =
    useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [refreshing, setRefreshing] = useState(false);


  // ===================================================
  // AUTH ERROR
  // ===================================================

  const handleAuthError = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_name");

    navigate("/login", {
      replace: true,
    });
  };


  // ===================================================
  // LOAD COURSES + PROGRESS
  // ===================================================

  const loadData = async () => {
    const token = getToken();

    if (!token) {
      handleAuthError();
      return;
    }

    try {
      setError("");

      if (courses.length > 0) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }


      // =================================================
      // LOAD COURSES
      // =================================================

      const coursesResponse = await fetch(
        `${API_URL}/api/courses/`,
        {
          method: "GET",

          headers: {
            "Content-Type": "application/json",
          },

          cache: "no-store",
        }
      );


      // =================================================
      // AUTH ERROR
      // =================================================

      if (coursesResponse.status === 401) {
        handleAuthError();
        return;
      }


      if (!coursesResponse.ok) {
        throw new Error(
          `Failed to load courses (${coursesResponse.status})`
        );
      }


      const coursesData =
        await coursesResponse.json();


      console.log(
        "MY COURSES FROM BACKEND:",
        coursesData
      );


      // =================================================
      // HANDLE DIFFERENT BACKEND RESPONSE FORMATS
      // =================================================

      let coursesList = [];


      if (Array.isArray(coursesData)) {
        coursesList = coursesData;
      } else if (
        coursesData &&
        Array.isArray(coursesData.courses)
      ) {
        coursesList = coursesData.courses;
      } else if (
        coursesData &&
        Array.isArray(coursesData.data)
      ) {
        coursesList = coursesData.data;
      }


      setCourses(coursesList);


      // =================================================
      // LOAD USER PROGRESS
      // =================================================

      const progressResponse = await fetch(
        `${API_URL}/api/progress/me`,
        {
          method: "GET",

          headers: {
            "Content-Type": "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          cache: "no-store",
        }
      );


      if (progressResponse.status === 401) {
        handleAuthError();
        return;
      }


      if (progressResponse.ok) {
        const progressData =
          await progressResponse.json();


        console.log(
          "MY COURSE PROGRESS:",
          progressData
        );


        setCompletedLessonIds(
          Array.isArray(
            progressData.completed_lesson_ids
          )
            ? progressData.completed_lesson_ids
            : []
        );
      } else {
        // Progress failure should NOT prevent
        // courses from being displayed.

        setCompletedLessonIds([]);
      }


    } catch (err) {

      console.error(
        "My Courses error:",
        err
      );


      setError(
        err.message ||
        "Could not load your courses."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }
  };


  // ===================================================
  // LOAD DATA ON PAGE OPEN
  // ===================================================

  useEffect(() => {
    loadData();
  }, []);


  // ===================================================
  // COURSE PROGRESS
  // ===================================================

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
        percentage: 0,
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


    const percentage =
      total > 0
        ? Math.round(
            (completed / total) * 100
          )
        : 0;


    return {
      total,
      completed,
      percentage,
    };
  };


  // ===================================================
  // COURSE IMAGE
  // ===================================================

  const getCourseImage = (title = "") => {

    const normalizedTitle =
      title.toLowerCase();


    if (
      normalizedTitle.includes(
        "python"
      )
    ) {
      return "/courses/python.png";
    }


    if (
      normalizedTitle.includes(
        "web development"
      ) ||
      normalizedTitle.includes(
        "web development"
      )
    ) {
      return "/courses/webdevelopment.png";
    }


    if (
      normalizedTitle.includes(
        "artificial intelligence"
      ) ||
      normalizedTitle.includes(
        "machine learning"
      ) ||
      normalizedTitle.includes(
        "ai"
      )
    ) {
      return "/courses/ai.jpg";
    }


    if (
      normalizedTitle.includes(
        "react"
      )
    ) {
      return "/courses/react.png";
    }


    if (
      normalizedTitle.includes(
        "data science"
      )
    ) {
      return "/courses/react.png";
    }


    // Generic fallback
    return "/courses/react.png";
  };


  // ===================================================
  // COURSE STATUS
  // ===================================================

  const getCourseStatus = (
    percentage
  ) => {

    if (percentage === 100) {
      return {
        text: "Completed",
        className: "completed",
      };
    }


    if (percentage > 0) {
      return {
        text: "In Progress",
        className: "in-progress",
      };
    }


    return {
      text: "Not Started",
      className: "not-started",
    };
  };


  // ===================================================
  // USER NAME
  // ===================================================

  const userName =
    localStorage.getItem(
      "user_name"
    ) || "Student";


  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loading) {

    return (
      <div className="app">

        <main className="main">

          <div className="page-loading">

            <div className="loading-spinner"></div>

            <p>
              Loading your courses...
            </p>

          </div>

        </main>

      </div>
    );
  }


  // ===================================================
  // UI
  // ===================================================

  return (

    <div className="app">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">


        {/* LOGO */}

        <div className="logo">

          <img
            src="/logo.png"
            alt="LearnAI Logo"
          />

          <span>
            LearnAI
          </span>

        </div>


        {/* NAVIGATION */}

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


        {/* SIDEBAR BOTTOM */}

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
            onClick={() => {

              localStorage.removeItem(
                "access_token"
              );

              localStorage.removeItem(
                "user_name"
              );

              navigate(
                "/login",
                {
                  replace: true,
                }
              );

            }}
          >

            <span>
              ↪
            </span>

            Logout

          </button>


        </div>

      </aside>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="main">


        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className="topbar">


          <div>

            <h1>
              My Courses
            </h1>

            <p>
              Continue learning and track your progress.
            </p>

          </div>


          {/* PROFILE */}

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


        {/* =================================================
            ERROR
        ================================================= */}

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


        {/* =================================================
            HERO
        ================================================= */}

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
              lessons, and track how far you've
              come.
            </p>


            {/* GENERATED COURSE NOTE */}

            <div
              style={{
                marginTop: "16px",
                fontSize: "14px",
                opacity: 0.85,
              }}
            >

              🤖 Courses generated by AI
              will appear here automatically
              after you save them.

            </div>

          </div>


          <div className="courses-hero-icon">
            📚
          </div>


        </section>


        {/* =================================================
            COURSE HEADER
        ================================================= */}

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


          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >

            {refreshing && (
              <span
                style={{
                  fontSize: "13px",
                  opacity: 0.7,
                }}
              >
                Updating...
              </span>
            )}


            <button
              type="button"
              className="view-all"
              onClick={loadData}
              style={{
                cursor: "pointer",
                border: "none",
              }}
            >

              ↻ Refresh

            </button>

          </div>


        </div>


        {/* =================================================
            EMPTY STATE
        ================================================= */}

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

              <span>
                →
              </span>

            </Link>


          </div>

        ) : (


          /* =================================================
             COURSE GRID
          ================================================= */

          <div className="my-courses-grid">


            {courses.map((course) => {


              const progress =
                getCourseProgress(
                  course
                );


              const status =
                getCourseStatus(
                  progress.percentage
                );


              return (

                <div
                  className="my-course-card"
                  key={course.id}
                >


                  {/* =================================================
                      COURSE TOP
                  ================================================= */}

                  <div className="my-course-top">


                    <div className="my-course-icon">

                      <img
                        src={getCourseImage(
                          course.title
                        )}
                        alt={
                          course.title ||
                          "Course"
                        }

                        onError={(e) => {

                          e.currentTarget.src =
                            "/courses/react.png";

                        }}
                      />

                    </div>


                    <span
                      className={`course-status ${status.className}`}
                    >

                      {status.text}

                    </span>


                  </div>


                  {/* =================================================
                      CATEGORY
                  ================================================= */}

                  <span className="category">

                    {course.category ||
                      "General"}

                  </span>


                  {/* =================================================
                      TITLE
                  ================================================= */}

                  <h3>

                    {course.title ||
                      "Untitled Course"}

                  </h3>


                  {/* =================================================
                      DESCRIPTION
                  ================================================= */}

                  <p className="my-course-description">

                    {course.description ||
                      "Start learning this course and build your skills step by step."}

                  </p>


                  {/* =================================================
                      LEVEL
                  ================================================= */}

                  {course.level && (

                    <div
                      style={{
                        marginTop: "8px",
                        marginBottom: "14px",
                        fontSize: "13px",
                        opacity: 0.75,
                      }}
                    >

                      Level:{" "}
                      <strong>
                        {course.level}
                      </strong>

                    </div>

                  )}


                  {/* =================================================
                      PROGRESS INFO
                  ================================================= */}

                  <div className="my-course-progress-info">


                    <span>
                      {progress.percentage}%
                      {" "}Complete
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


                  {/* =================================================
                      PROGRESS BAR
                  ================================================= */}

                  <div className="progress">


                    <div
                      className="progress-fill"
                      style={{
                        width:
                          `${progress.percentage}%`,
                      }}
                    />


                  </div>


                  {/* =================================================
                      COURSE BUTTON
                  ================================================= */}

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

        )}


      </main>

    </div>

  );
}


export default MyCourses;