import { useEffect, useState } from "react";
import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from "react-router-dom";

import CourseDetails from "./pages/CourseDetails";
import Lesson from "./pages/Lesson";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Progress from "./pages/Progress";
import AITutor from "./pages/AITutor";
import Quiz from "./pages/Quiz";
import Certificates from "./pages/Certificates";
import Settings from "./pages/Settings";
import MyCourses from "./pages/MyCourses";

const API_URL = import.meta.env.VITE_API_URL;


// =====================================================
// AUTH HELPERS
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
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({ children }) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// =====================================================
// DASHBOARD
// =====================================================

function Dashboard() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [userName, setUserName] = useState(
    localStorage.getItem("user_name") || "Student"
  );

  const [progress, setProgress] = useState({
    completed_lessons: 0,
    total_xp: 0,
    completed_lesson_ids: [],
  });

  const [progressLoading, setProgressLoading] = useState(true);


  // ===================================================
  // LOAD USER NAME
  // ===================================================

  useEffect(() => {
    const savedName =
      localStorage.getItem("user_name");

    if (savedName) {
      setUserName(savedName);
    } else {
      setUserName("Student");
    }
  }, []);


  // ===================================================
  // LOAD COURSES
  // ===================================================

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/courses/`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load courses"
          );
        }

        const data = await response.json();

        setCourses(data);

      } catch (error) {
        console.error(
          "Failed to load courses:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);


  // ===================================================
  // LOAD USER PROGRESS
  // ===================================================

  useEffect(() => {
    const loadProgress = async () => {
      const token = getToken();

      if (!token) {
        setProgressLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/progress/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Invalid / expired token
        if (response.status === 401) {
          localStorage.removeItem(
            "access_token"
          );

          localStorage.removeItem(
            "user_name"
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        if (!response.ok) {
          throw new Error(
            "Failed to load progress"
          );
        }

        const data =
          await response.json();

        setProgress({
          completed_lessons:
            data.completed_lessons || 0,

          total_xp:
            data.total_xp || 0,

          completed_lesson_ids:
            data.completed_lesson_ids || [],
        });

      } catch (error) {
        console.error(
          "Progress error:",
          error
        );
      } finally {
        setProgressLoading(false);
      }
    };

    loadProgress();
  }, [navigate]);


  // ===================================================
  // COURSE PROGRESS
  // ===================================================

  const getCourseProgress = (course) => {
    let totalLessons = 0;
    let completedLessons = 0;

    if (!course.levels) {
      return {
        percentage: 0,
        completed: 0,
        total: 0,
      };
    }

    course.levels.forEach((level) => {

      if (!level.chapters) {
        return;
      }

      level.chapters.forEach((chapter) => {

        if (!chapter.lessons) {
          return;
        }

        chapter.lessons.forEach((lesson) => {

          totalLessons++;

          if (
            progress.completed_lesson_ids.includes(
              lesson.id
            )
          ) {
            completedLessons++;
          }

        });

      });

    });

    const percentage =
      totalLessons > 0
        ? Math.round(
            (completedLessons /
              totalLessons) *
              100
          )
        : 0;

    return {
      percentage,
      completed: completedLessons,
      total: totalLessons,
    };
  };


  // ===================================================
  // COMPLETED COURSES
  // ===================================================

  const completedCoursesCount =
    courses.filter((course) => {

      const courseProgress =
        getCourseProgress(course);

      return (
        courseProgress.percentage >= 100
      );

    }).length;


  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "user_name"
    );

    navigate("/login", {
      replace: true,
    });
  };


  // ===================================================
  // DASHBOARD UI
  // ===================================================

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

          {/* Dashboard */}

          <Link
            to="/"
            className="nav-item active"
          >
            <span>⌂</span>
            Dashboard
          </Link>


          {/* My Courses */}

<Link
  to="/courses"
  className="nav-item"
>
  <span>📚</span>
  My Courses
</Link>


          {/* AI Tutor */}

          <Link
            to="/ai-tutor"
            className="nav-item"
          >
            <span>🤖</span>
            AI Tutor
          </Link>


          {/* Progress */}

          <Link
            to="/progress"
            className="nav-item"
          >
            <span>📈</span>
            Progress
          </Link>


          {/* Certificates */}

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

          {/* SETTINGS */}

          <Link
            to="/settings"
            className="nav-item"
          >
            <span>⚙</span>
            Settings
          </Link>


          {/* LOGOUT */}

          <button
            className="nav-item logout"
            onClick={handleLogout}
            type="button"
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* MAIN */}

      <main className="main">

        {/* TOPBAR */}

        <header className="topbar">

          <div>

            <h1>
              Dashboard
            </h1>

            <p>
              Continue your learning journey.
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


        {/* WELCOME CARD */}

        <section className="welcome-card">

          <div>

            <span className="welcome-label">
              KEEP LEARNING
            </span>


            <h2>
              Welcome back, {userName} 👋
            </h2>


            <p>
              Pick up where you left off
              and keep building your skills.
            </p>


            <button
              type="button"
              onClick={() => {

                if (courses.length > 0) {

                  navigate(
                    `/courses/${courses[0].id}`
                  );

                }

              }}
            >
              Continue Learning →
            </button>

          </div>


          <div className="welcome-icon">
            🧠
          </div>

        </section>


        {/* COURSES */}

        <section id="courses">

          <div className="section-header">

            <div>

              <h2>
                My Courses
              </h2>

              <p>
                Your current learning progress
              </p>

            </div>


            <span className="view-all">
              {courses.length} Courses
            </span>

          </div>


          <div className="course-grid">

            {loading ? (

              <p>
                Loading courses...
              </p>

            ) : courses.length === 0 ? (

              <p>
                No courses available.
              </p>

            ) : (

              courses.map((course) => {

                const courseProgress =
                  getCourseProgress(course);

                return (

                  <Link
                    to={`/courses/${course.id}`}
                    className="course-card"
                    key={course.id}
                  >

                    {/* COURSE IMAGE */}

                    <div className="course-icon">

                      <img
                        src={
                          course.title ===
                          "Python Programming"
                            ? "/courses/python.png"

                            : course.title ===
                              "Web Development"
                            ? "/courses/webdevelopment.png"

                            : course.title ===
                              "Artificial Intelligence"
                            ? "/courses/ai.jpg"

                            : course.title ===
                              "React"
                            ? "/courses/react.png"

                            : "/courses/react.png"
                        }

                        alt={course.title}
                      />

                    </div>


                    {/* COURSE INFO */}

                    <div className="course-info">

                      <span className="category">
                        {course.category}
                      </span>


                      <h3>
                        {course.title}
                      </h3>


                      <p>
                        {course.description}
                      </p>


                      <div className="progress-info">

                        <span>
                          {courseProgress.percentage}%
                          {" "}Complete
                        </span>


                        <span>
                          {courseProgress.completed}
                          {" "}/{" "}
                          {courseProgress.total}
                          {" "}lessons
                        </span>

                      </div>


                      <div className="progress">

                        <div
                          className="progress-fill"
                          style={{
                            width:
                              `${courseProgress.percentage}%`,
                          }}
                        />

                      </div>

                    </div>

                  </Link>

                );

              })

            )}

          </div>

        </section>


        {/* STATS */}

        <section className="stats-section">


          {/* STREAK */}

          <div className="stat-card">

            <span>
              🔥
            </span>

            <div>

              <strong>
                7
              </strong>

              <p>
                Day Streak
              </p>

            </div>

          </div>


          {/* XP */}

          <div className="stat-card">

            <span>
              ⚡
            </span>

            <div>

              <strong>
                {progressLoading
                  ? "..."
                  : progress.total_xp}
              </strong>

              <p>
                Total XP
              </p>

            </div>

          </div>


          {/* LESSONS */}

          <div className="stat-card">

            <span>
              📚
            </span>

            <div>

              <strong>
                {progressLoading
                  ? "..."
                  : progress.completed_lessons}
              </strong>

              <p>
                Lessons Completed
              </p>

            </div>

          </div>


          {/* CERTIFICATES */}

          <div className="stat-card">

            <span>
              🏆
            </span>

            <div>

              <strong>
                {completedCoursesCount}
              </strong>

              <p>
                Certificates
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}


// =====================================================
// APP ROUTES
// =====================================================

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* DASHBOARD */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* MY COURSES */}

        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <MyCourses />
            </ProtectedRoute>
          }
        />


        {/* COURSE DETAILS */}

        <Route
          path="/courses/:courseId"
          element={
            <ProtectedRoute>
              <CourseDetails />
            </ProtectedRoute>
          }
        />


        {/* LESSON */}

        <Route
          path="/lessons/:lessonId"
          element={
            <ProtectedRoute>
              <Lesson />
            </ProtectedRoute>
          }
        />


        {/* PROGRESS */}

        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          }
        />


        {/* AI TUTOR */}

        <Route
          path="/ai-tutor"
          element={
            <ProtectedRoute>
              <AITutor />
            </ProtectedRoute>
          }
        />


        {/* QUIZ */}

        <Route
          path="/quiz/:lessonId"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />


        {/* CERTIFICATES */}

        <Route
          path="/certificates"
          element={
            <ProtectedRoute>
              <Certificates />
            </ProtectedRoute>
          }
        />


        {/* SETTINGS */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />


        {/* UNKNOWN URL */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;

