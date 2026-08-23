import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function Progress() {
  const navigate = useNavigate();

  const [progress, setProgress] = useState({
    completed_lessons: 0,
    total_xp: 0,
    completed_lesson_ids: [],
  });

  const [totalLessons, setTotalLessons] = useState(0);
  const [loading, setLoading] = useState(true);

  // =========================
  // LOAD PROGRESS
  // =========================

  useEffect(() => {
    const loadProgress = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/progress/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }

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
      }
    };

    loadProgress();
  }, [navigate]);


  // =========================
  // LOAD TOTAL LESSONS
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

        const courses = await response.json();

        let lessons = 0;

        for (const course of courses) {
          try {
            const courseResponse = await fetch(
              `${API_URL}/api/courses/${course.id}`
            );

            if (!courseResponse.ok) continue;

            const courseData =
              await courseResponse.json();

            courseData.levels?.forEach((level) => {
              level.chapters?.forEach((chapter) => {
                lessons += chapter.lessons?.length || 0;
              });
            });

          } catch (error) {
            console.error(
              "Course loading error:",
              error
            );
          }
        }

        setTotalLessons(lessons);

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


  // =========================
  // CALCULATE PROGRESS
  // =========================

  const completedLessons =
    progress.completed_lessons || 0;

  const percentage =
    totalLessons > 0
      ? Math.min(
          Math.round(
            (completedLessons / totalLessons) * 100
          ),
          100
        )
      : 0;


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

          <div className="logo-icon">
            L
          </div>

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
            to="/"
            className="nav-item"
          >
            <span>📚</span>
            My Courses
          </Link>


          <a
            href="#"
            className="nav-item"
            onClick={(e) => e.preventDefault()}
          >
            <span>🤖</span>
            AI Tutor
          </a>


          <Link
            to="/progress"
            className="nav-item active"
          >
            <span>📈</span>
            Progress
          </Link>


          <a
            href="#"
            className="nav-item"
            onClick={(e) => e.preventDefault()}
          >
            <span>🏆</span>
            Certificates
          </a>

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
              Progress
            </h1>

            <p>
              Track your learning journey and achievements.
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
            PROGRESS CONTENT
        ========================= */}

        <section className="progress-content">

          <div className="progress-label">
            YOUR LEARNING
          </div>

          <h2 className="progress-title">
            Learning Progress
          </h2>

          <p className="progress-subtitle">
            Keep improving your skills and complete your goals.
          </p>


          {/* =========================
              STATS
          ========================= */}

          <div className="progress-stats">

            {/* Lessons */}

            <div className="progress-stat-card">

              <div className="progress-stat-icon">
                📚
              </div>

              <div>

                <strong>
                  {loading
                    ? "..."
                    : completedLessons}
                </strong>

                <span>
                  Lessons Completed
                </span>

              </div>

            </div>


            {/* XP */}

            <div className="progress-stat-card">

              <div className="progress-stat-icon">
                ⚡
              </div>

              <div>

                <strong>
                  {progress.total_xp}
                </strong>

                <span>
                  Total XP
                </span>

              </div>

            </div>


            {/* Streak */}

            <div className="progress-stat-card">

              <div className="progress-stat-icon">
                🔥
              </div>

              <div>

                <strong>
                  7
                </strong>

                <span>
                  Day Streak
                </span>

              </div>

            </div>


            {/* Certificates */}

            <div className="progress-stat-card">

              <div className="progress-stat-icon">
                🏆
              </div>

              <div>

                <strong>
                  0
                </strong>

                <span>
                  Certificates
                </span>

              </div>

            </div>

          </div>


          {/* =========================
              OVERALL PROGRESS
          ========================= */}

          <section className="overall-progress-card">

            <div className="overall-progress-header">

              <div>

                <span className="progress-small-label">
                  OVERALL PROGRESS
                </span>

                <h2>
                  Keep learning
                </h2>

                <p>
                  Complete more lessons to improve your progress.
                </p>

              </div>


              <div className="overall-percentage">

                {percentage}%

              </div>

            </div>


            <div className="large-progress">

              <div
                className="large-progress-fill"
                style={{
                  width: `${percentage}%`,
                }}
              />

            </div>


            <div className="overall-progress-footer">

              <span>
                {completedLessons} of{" "}
                {totalLessons || 0} lessons completed
              </span>

              <span>
                {percentage === 100
                  ? "Course complete 🎉"
                  : "Keep going 🚀"}
              </span>

            </div>

          </section>


          {/* =========================
              ACHIEVEMENT
          ========================= */}

          <section className="achievement-card">

            <div className="achievement-icon">
              🚀
            </div>

            <div>

              <span className="progress-small-label">
                KEEP IT UP
              </span>

              <h2>
                Great job! Keep going!
              </h2>

              <p>
                Every completed lesson brings you
                closer to your learning goals.
              </p>

            </div>

          </section>

        </section>

      </main>

    </div>
  );
}

export default Progress;