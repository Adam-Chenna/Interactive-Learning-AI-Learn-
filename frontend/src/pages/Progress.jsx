import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

function Progress() {
  const navigate = useNavigate();

  const [progress, setProgress] = useState({
    completed_lessons: 0,
    total_xp: 0,
    completed_lesson_ids: [],
  });

  const [courses, setCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});
  const [loading, setLoading] = useState(true);

  // =========================
  // USER INFO
  // =========================

  const userName =
    localStorage.getItem("user_name") || "Student";

  const userInitial = userName
    .charAt(0)
    .toUpperCase();

  // =========================
  // LOAD ALL PROGRESS
  // =========================

  useEffect(() => {
    let mounted = true;

    const loadProgress = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);

        // =========================
        // 1. LOAD USER PROGRESS
        // =========================

        const progressResponse = await fetch(
          `${API_URL}/api/progress/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (progressResponse.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }

        if (!progressResponse.ok) {
          throw new Error("Failed to load user progress");
        }

        const progressData =
          await progressResponse.json();

        if (!mounted) return;

        setProgress({
          completed_lessons:
            Number(progressData.completed_lessons) || 0,

          total_xp:
            Number(progressData.total_xp) || 0,

          completed_lesson_ids:
            Array.isArray(
              progressData.completed_lesson_ids
            )
              ? progressData.completed_lesson_ids
              : [],
        });

        // =========================
        // 2. LOAD USER COURSES
        // =========================

        const coursesResponse = await fetch(
          `${API_URL}/api/courses/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (coursesResponse.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }

        if (!coursesResponse.ok) {
          throw new Error("Failed to load courses");
        }

        const coursesData =
          await coursesResponse.json();

        if (!mounted) return;

        setCourses(
          Array.isArray(coursesData)
            ? coursesData
            : []
        );

        // =========================
        // 3. LOAD COURSE-WISE PROGRESS
        // =========================

        const progressMap = {};

        for (const course of coursesData) {
          try {
            const response = await fetch(
              `${API_URL}/api/progress/course/${course.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.status === 401) {
              localStorage.removeItem(
                "access_token"
              );
              navigate("/login");
              return;
            }

            if (!response.ok) {
              continue;
            }

            const data = await response.json();

            progressMap[course.id] = {
              total_lessons:
                Number(data.total_lessons) || 0,

              completed_lessons:
                Number(data.completed_lessons) || 0,

              percentage: Math.min(
                Math.max(
                  Number(data.percentage) || 0,
                  0
                ),
                100
              ),
            };
          } catch (error) {
            console.error(
              `Failed to load progress for course ${course.id}:`,
              error
            );

            progressMap[course.id] = {
              total_lessons: 0,
              completed_lessons: 0,
              percentage: 0,
            };
          }
        }

        if (!mounted) return;

        setCourseProgress(progressMap);
      } catch (error) {
        console.error(
          "Progress loading error:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProgress();

    // Refresh progress whenever user comes back
    // to the Progress page/window.
    const handleFocus = () => {
      loadProgress();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      mounted = false;

      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [navigate]);

  // =========================
  // CALCULATE OVERALL PROGRESS
  // =========================

  const completedLessons =
    progress.completed_lessons || 0;

  const totalLessons = Object.values(
    courseProgress
  ).reduce(
    (total, course) =>
      total + (course.total_lessons || 0),
    0
  );

  const completedCourseLessons =
    Object.values(courseProgress).reduce(
      (total, course) =>
        total + (course.completed_lessons || 0),
      0
    );

  const overallPercentage =
    totalLessons > 0
      ? Math.min(
          Math.round(
            (completedCourseLessons /
              totalLessons) *
              100
          ),
          100
        )
      : 0;

  // =========================
  // COMPLETED COURSES
  // =========================

  const completedCourses = courses.filter(
    (course) =>
      courseProgress[course.id]?.percentage >=
      100
  );

  const certificatesCount =
    completedCourses.length;

  // =========================
  // OVERALL STATUS
  // =========================

  const getOverallTitle = () => {
    if (overallPercentage === 100) {
      return "Learning complete!";
    }

    if (overallPercentage >= 75) {
      return "Almost there!";
    }

    if (overallPercentage >= 50) {
      return "Great progress!";
    }

    if (overallPercentage > 0) {
      return "Keep going!";
    }

    return "Start learning";
  };

  const getOverallMessage = () => {
    if (overallPercentage === 100) {
      return "You have completed all available lessons. Great work!";
    }

    if (overallPercentage >= 75) {
      return "You are very close to completing your learning goals.";
    }

    if (overallPercentage >= 50) {
      return "You are halfway there. Keep building your skills.";
    }

    if (overallPercentage > 0) {
      return "Every completed lesson brings you closer to your goals.";
    }

    return "Start a course and begin your learning journey.";
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  // =========================
  // RENDER
  // =========================

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
            to="/courses"
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
            className="nav-item active"
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

        {/* =========================
            TOPBAR
        ========================= */}

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
              {userInitial}
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
                  {loading
                    ? "..."
                    : progress.total_xp}
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
                  {loading
                    ? "..."
                    : certificatesCount}
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
                  {getOverallTitle()}
                </h2>

                <p>
                  {getOverallMessage()}
                </p>

              </div>

              <div className="overall-percentage">
                {loading
                  ? "..."
                  : `${overallPercentage}%`}
              </div>

            </div>

            <div className="large-progress">

              <div
                className="large-progress-fill"
                style={{
                  width: `${overallPercentage}%`,
                }}
              />

            </div>

            <div className="overall-progress-footer">

              <span>
                {completedCourseLessons} of{" "}
                {totalLessons} lessons completed
              </span>

              <span>
                {overallPercentage === 100
                  ? "All courses complete 🎉"
                  : "Keep going 🚀"}
              </span>

            </div>

          </section>

          {/* =========================
              COURSE-WISE PROGRESS
          ========================= */}

          <section className="overall-progress-card">

            <div className="overall-progress-header">

              <div>

                <span className="progress-small-label">
                  COURSE PROGRESS
                </span>

                <h2>
                  Your Courses
                </h2>

                <p>
                  See the progress of each course separately.
                </p>

              </div>

            </div>

            {loading ? (

              <div
                style={{
                  padding: "30px 0",
                  textAlign: "center",
                  opacity: 0.7,
                }}
              >
                Loading course progress...
              </div>

            ) : courses.length === 0 ? (

              <div
                style={{
                  padding: "30px 0",
                  textAlign: "center",
                  opacity: 0.7,
                }}
              >
                No courses available yet.
              </div>

            ) : (

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  marginTop: "20px",
                }}
              >

                {courses.map((course) => {

                  const currentProgress =
                    courseProgress[course.id] || {
                      total_lessons: 0,
                      completed_lessons: 0,
                      percentage: 0,
                    };

                  const percentage =
                    currentProgress.percentage;

                  const isComplete =
                    percentage >= 100;

                  return (

                    <div
                      key={course.id}
                      style={{
                        padding: "20px",
                        borderRadius: "16px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        background:
                          "rgba(255,255,255,0.03)",
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems: "center",
                          gap: "15px",
                          marginBottom: "12px",
                        }}
                      >

                        <div>

                          <h3
                            style={{
                              margin: "0 0 5px",
                            }}
                          >
                            {course.title}
                          </h3>

                          <span
                            style={{
                              fontSize: "13px",
                              opacity: 0.65,
                            }}
                          >
                            {currentProgress.completed_lessons}{" "}
                            of{" "}
                            {currentProgress.total_lessons}{" "}
                            lessons completed
                          </span>

                        </div>

                        <strong
                          style={{
                            fontSize: "20px",
                          }}
                        >
                          {percentage}%
                        </strong>

                      </div>

                      <div className="large-progress">

                        <div
                          className="large-progress-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                      <div
                        style={{
                          marginTop: "12px",
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems: "center",
                        }}
                      >

                        <span
                          style={{
                            fontSize: "13px",
                            opacity: 0.65,
                          }}
                        >
                          {isComplete
                            ? "Course completed 🎉"
                            : "Continue learning 🚀"}
                        </span>

                        {isComplete ? (

                          <Link
                            to="/certificates"
                            style={{
                              textDecoration: "none",
                            }}
                          >
                            🏆 Certificate
                          </Link>

                        ) : (

                          <Link
                            to={`/courses/${course.id}`}
                            style={{
                              textDecoration: "none",
                            }}
                          >
                            Continue →
                          </Link>

                        )}

                      </div>

                    </div>

                  );
                })}

              </div>

            )}

          </section>

          {/* =========================
              ACHIEVEMENT
          ========================= */}

          <section className="achievement-card">

            <div className="achievement-icon">
              {overallPercentage === 100
                ? "🏆"
                : "🚀"}
            </div>

            <div>

              <span className="progress-small-label">
                {overallPercentage === 100
                  ? "CONGRATULATIONS"
                  : "KEEP IT UP"}
              </span>

              <h2>
                {overallPercentage === 100
                  ? "Amazing! You completed your learning!"
                  : "Great job! Keep going!"}
              </h2>

              <p>
                {overallPercentage === 100
                  ? "Your completed courses are now eligible for certificates."
                  : "Every completed lesson brings you closer to your learning goals."}
              </p>

            </div>

          </section>

        </section>

      </main>

    </div>
  );
}

export default Progress;