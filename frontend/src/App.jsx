import { useEffect, useState } from "react";
import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

import CourseDetails from "./pages/CourseDetails";
import Lesson from "./pages/Lesson";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Progress from "./pages/Progress";
import AITutor from "./pages/AITutor";
import Quiz from "./pages/Quiz";
import Certificates from "./pages/Certificates";

const API_URL = "import.meta.env.VITE_API_URL";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");

  if (!token || token === "undefined" || token === "null") {
    return <Login />;
  }

  return children;
}

function Dashboard() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState({
    completed_lessons: 0,
    total_xp: 0,
    completed_lesson_ids: [],
  });

  const [progressLoading, setProgressLoading] = useState(true);

  // =========================
  // LOAD COURSES
  // =========================

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/courses/`
        );

        if (!response.ok) {
          throw new Error("Failed to load courses");
        }

        const data = await response.json();

        setCourses(data);
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // =========================
  // LOAD USER PROGRESS
  // =========================

  useEffect(() => {
    const loadProgress = async () => {
      const token = localStorage.getItem("access_token");

      if (!token || token === "undefined" || token === "null") {
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

        if (!response.ok) {
          throw new Error("Failed to load progress");
        }

        const data = await response.json();

        setProgress({
          completed_lessons: data.completed_lessons || 0,
          total_xp: data.total_xp || 0,
          completed_lesson_ids:
            data.completed_lesson_ids || [],
        });
      } catch (error) {
        console.error("Progress error:", error);
      } finally {
        setProgressLoading(false);
      }
    };

    loadProgress();
  }, []);

  // =========================
  // CALCULATE COURSE PROGRESS
  // =========================

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
      if (!level.chapters) return;

      level.chapters.forEach((chapter) => {
        if (!chapter.lessons) return;

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
            (completedLessons / totalLessons) * 100
          )
        : 0;

    return {
      percentage,
      completed: completedLessons,
      total: totalLessons,
    };
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="app">

      {/* =========================
          SIDEBAR
      ========================= */}

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
            className="nav-item active"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            to="/"
            className="nav-item"
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

          <a
            href="#"
            className="nav-item"
            onClick={(e) => e.preventDefault()}
          >
            <span>⚙</span>
            Settings
          </a>

          <button
            className="nav-item logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}

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

          <div className="profile">

            <div className="avatar">
              A
            </div>

            <div>
              <strong>
                Adam
              </strong>

              <span>
                Student
              </span>
            </div>

          </div>

        </header>

        {/* =========================
            WELCOME CARD
        ========================= */}

        <section className="welcome-card">

          <div>

            <span className="welcome-label">
              KEEP LEARNING
            </span>

            <h2>
              Welcome back, Adam 👋
            </h2>

            <p>
              Pick up where you left off and keep
              building your skills.
            </p>

            <button
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

        {/* =========================
            COURSES
        ========================= */}

        <section>

          <div className="section-header">

            <div>
              <h2>
                My Courses
              </h2>

              <p>
                Your current learning progress
              </p>
            </div>

            <Link
              to="/"
              className="view-all"
            >
              View All →
            </Link>

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

                    <div className="course-icon">
  <img
    src={
      course.title === "Python Programming"
        ? "/courses/python.png"
        : course.title === "Web Development"
        ? "/courses/webdevelopment.png"
        : course.title === "Artificial Intelligence"
        ? "/courses/ai.jpg"
        : course.title === "React"
        ? "/courses/react.png"
        : "/courses/react.png"
    }
    alt={course.title}
  />
</div>

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
                          {courseProgress.percentage}% Complete
                        </span>

                        <span>
                          {courseProgress.completed} /{" "}
                          {courseProgress.total} lessons
                        </span>

                      </div>

                      <div className="progress">

                        <div
                          className="progress-fill"
                          style={{
                            width: `${courseProgress.percentage}%`,
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

        {/* =========================
            STATS
        ========================= */}

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

          {/* TOTAL XP */}

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

          {/* COMPLETED LESSONS */}

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
                0
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

// =========================
// APP ROUTES
// =========================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
  path="/"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
  path="/progress"
  element={
    <ProtectedRoute>
      <Progress />
    </ProtectedRoute>
  }
/>

        <Route
  path="/courses/:courseId"
  element={
    <ProtectedRoute>
      <CourseDetails />
    </ProtectedRoute>
  }
/>

        <Route
  path="/lessons/:lessonId"
  element={
    <ProtectedRoute>
      <Lesson />
    </ProtectedRoute>
  }
/>
        <Route
  path="/ai-tutor"
  element={
    <ProtectedRoute>
      <AITutor />
    </ProtectedRoute>
  }
/>

<Route
  path="/quiz/:lessonId"
  element={
    <ProtectedRoute>
      <Quiz />
    </ProtectedRoute>
  }
/>
<Route
  path="/certificates"
  element={
    <ProtectedRoute>
      <Certificates />
    </ProtectedRoute>
  }
/>



      </Routes>

    </BrowserRouter>
  );
}

export default App;