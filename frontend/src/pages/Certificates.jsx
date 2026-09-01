import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import "./Certificates.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

function Certificates() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [generatingCourseId, setGeneratingCourseId] = useState(null);
  const [error, setError] = useState("");

  // =========================
  // LOAD COURSES + PROGRESS
  // =========================

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        // =========================
        // LOAD COURSES
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
        // LOAD COURSE-WISE PROGRESS
        // =========================

        const progressData = {};

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

            progressData[course.id] = {
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
              `Progress error for course ${course.id}:`,
              error
            );

            progressData[course.id] = {
              total_lessons: 0,
              completed_lessons: 0,
              percentage: 0,
            };
          }
        }

        if (!mounted) return;

        setProgress(progressData);
      } catch (err) {
        console.error(
          "Certificate loading error:",
          err
        );

        if (mounted) {
          setError(
            "Unable to load your certificates."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Refresh when user comes back to the page
    const handleFocus = () => {
      loadData();
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
  // GENERATE CERTIFICATE
  // =========================

  const generateCertificate = (course) => {
    try {
      setGeneratingCourseId(course.id);
      setError("");

      // Safety check:
      // Certificate can only be generated at 100%.
      const percentage =
        progress[course.id]?.percentage || 0;

      if (percentage < 100) {
        setError(
          "Complete the course before generating the certificate."
        );
        return;
      }

      const pdf = new jsPDF(
        "landscape",
        "mm",
        "a4"
      );

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      // =========================
      // STUDENT DATA
      // =========================

      const studentName =
        localStorage.getItem("user_name") ||
        "Student";

      const certificateId =
        `LAI-${course.id}-${Date.now()
          .toString()
          .slice(-6)}`;

      const completionDate =
        new Date().toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }
        );

      // =========================
      // BACKGROUND
      // =========================

      pdf.setFillColor(
        248,
        250,
        252
      );

      pdf.rect(
        0,
        0,
        pageWidth,
        pageHeight,
        "F"
      );

      // =========================
      // OUTER BORDER
      // =========================

      pdf.setDrawColor(
        180,
        140,
        40
      );

      pdf.setLineWidth(2);

      pdf.rect(
        8,
        8,
        pageWidth - 16,
        pageHeight - 16
      );

      // =========================
      // INNER BORDER
      // =========================

      pdf.setDrawColor(
        210,
        180,
        90
      );

      pdf.setLineWidth(0.6);

      pdf.rect(
        13,
        13,
        pageWidth - 26,
        pageHeight - 26
      );

      // =========================
      // BRAND
      // =========================

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(28);

      pdf.setTextColor(
        30,
        41,
        59
      );

      pdf.text(
        "LearnAI",
        pageWidth / 2,
        34,
        {
          align: "center",
        }
      );

      // Divider

      pdf.setDrawColor(
        180,
        140,
        40
      );

      pdf.setLineWidth(0.8);

      pdf.line(
        pageWidth / 2 - 25,
        40,
        pageWidth / 2 + 25,
        40
      );

      // =========================
      // TITLE
      // =========================

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(25);

      pdf.setTextColor(
        15,
        23,
        42
      );

      pdf.text(
        "CERTIFICATE OF COMPLETION",
        pageWidth / 2,
        56,
        {
          align: "center",
        }
      );

      // =========================
      // SUBTITLE
      // =========================

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(13);

      pdf.setTextColor(
        100,
        116,
        139
      );

      pdf.text(
        "This certificate is proudly presented to",
        pageWidth / 2,
        70,
        {
          align: "center",
        }
      );

      // =========================
      // STUDENT NAME
      // =========================

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(30);

      pdf.setTextColor(
        30,
        41,
        59
      );

      pdf.text(
        studentName.toUpperCase(),
        pageWidth / 2,
        91,
        {
          align: "center",
        }
      );

      // Name underline

      pdf.setDrawColor(
        180,
        140,
        40
      );

      pdf.setLineWidth(0.7);

      pdf.line(
        pageWidth / 2 - 45,
        97,
        pageWidth / 2 + 45,
        97
      );

      // =========================
      // COMPLETION MESSAGE
      // =========================

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(13);

      pdf.setTextColor(
        71,
        85,
        105
      );

      pdf.text(
        "for successfully completing the course",
        pageWidth / 2,
        111,
        {
          align: "center",
        }
      );

      // =========================
      // COURSE NAME
      // =========================

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(23);

      pdf.setTextColor(
        37,
        99,
        235
      );

      const courseTitle =
        course.title || "Learning Course";

      const courseLines =
        pdf.splitTextToSize(
          courseTitle,
          pageWidth - 70
        );

      pdf.text(
        courseLines,
        pageWidth / 2,
        128,
        {
          align: "center",
        }
      );

      // =========================
      // DATE
      // =========================

      const dateY =
        128 +
        courseLines.length * 9 +
        5;

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(11);

      pdf.setTextColor(
        100,
        116,
        139
      );

      pdf.text(
        `Completed on ${completionDate}`,
        pageWidth / 2,
        dateY,
        {
          align: "center",
        }
      );

      // =========================
      // CERTIFICATE ID
      // =========================

      pdf.setFontSize(9);

      pdf.setTextColor(
        148,
        163,
        184
      );

      pdf.text(
        `Certificate ID: ${certificateId}`,
        pageWidth / 2,
        dateY + 9,
        {
          align: "center",
        }
      );

      // =========================
      // SIGNATURES
      // =========================

      const signatureY = 174;

      pdf.setDrawColor(
        100,
        116,
        139
      );

      pdf.setLineWidth(0.5);

      pdf.line(
        45,
        signatureY,
        105,
        signatureY
      );

      pdf.line(
        190,
        signatureY,
        250,
        signatureY
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(10);

      pdf.setTextColor(
        51,
        65,
        85
      );

      pdf.text(
        "LearnAI",
        75,
        181,
        {
          align: "center",
        }
      );

      pdf.text(
        "Course Director",
        220,
        181,
        {
          align: "center",
        }
      );

      // =========================
      // FOOTER
      // =========================

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(8);

      pdf.setTextColor(
        148,
        163,
        184
      );

      pdf.text(
        "LearnAI • AI Powered Learning Platform",
        pageWidth / 2,
        193,
        {
          align: "center",
        }
      );

      // =========================
      // DOWNLOAD
      // =========================

      const safeCourseName =
        courseTitle
          .replace(
            /[^a-zA-Z0-9]/g,
            "-"
          )
          .replace(
            /-+/g,
            "-"
          )
          .replace(
            /^-|-$/g,
            ""
          );

      pdf.save(
        `${safeCourseName || "Course"}-Certificate.pdf`
      );
    } catch (err) {
      console.error(
        "Certificate generation error:",
        err
      );

      setError(
        "Failed to generate certificate. Please try again."
      );
    } finally {
      setGeneratingCourseId(null);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="app">

        <main className="main">

          <header className="topbar">

            <div>
              <h1>Certificates</h1>

              <p>
                Loading your achievements...
              </p>
            </div>

          </header>

          <section className="certificate-loading">

            <div className="loading-spinner"></div>

            <p>
              Preparing your certificates...
            </p>

          </section>

        </main>

      </div>
    );
  }

  // =========================
  // COMPLETED COURSES
  // =========================

  const completedCourses =
    courses.filter(
      (course) =>
        progress[course.id]?.percentage >=
        100
    );

  const completionRate =
    courses.length > 0
      ? Math.round(
          (completedCourses.length /
            courses.length) *
            100
        )
      : 0;

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
            className="nav-item"
          >
            <span>📈</span>
            Progress
          </Link>

          <Link
            to="/certificates"
            className="nav-item active"
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

        </div>

      </aside>

      {/* =========================
          MAIN
      ========================= */}

      <main className="main">

        <header className="topbar">

          <div>

            <h1>
              Certificates
            </h1>

            <p>
              Your achievements and course
              completion certificates.
            </p>

          </div>

          <div className="profile">

            <div className="avatar">

              {(localStorage.getItem(
                "user_name"
              ) || "Student")
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

        {/* =========================
            HERO
        ========================= */}

        <section className="certificate-hero">

          <div className="certificate-hero-content">

            <span className="certificate-eyebrow">
              YOUR ACHIEVEMENTS
            </span>

            <h2>
              Keep learning.
              <br />
              <span>
                Earn your next certificate.
              </span>
            </h2>

            <p>
              Complete your courses and
              showcase your learning
              achievements with official
              LearnAI certificates.
            </p>

          </div>

          <div className="certificate-trophy">
            🏆
          </div>

        </section>

        {/* =========================
            STATS
        ========================= */}

        <section className="certificate-stats">

          <div className="certificate-stat">

            <div className="certificate-stat-icon">
              🏆
            </div>

            <div>

              <strong>
                {completedCourses.length}
              </strong>

              <span>
                Certificates Earned
              </span>

            </div>

          </div>

          <div className="certificate-stat">

            <div className="certificate-stat-icon">
              📚
            </div>

            <div>

              <strong>
                {courses.length}
              </strong>

              <span>
                Available Courses
              </span>

            </div>

          </div>

          <div className="certificate-stat">

            <div className="certificate-stat-icon">
              🎯
            </div>

            <div>

              <strong>
                {completionRate}%
              </strong>

              <span>
                Completion Rate
              </span>

            </div>

          </div>

        </section>

        {/* =========================
            ERROR
        ========================= */}

        {error && (

          <div className="certificate-error">

            <span>
              ⚠️
            </span>

            <p>
              {error}
            </p>

          </div>

        )}

        {/* =========================
            CERTIFICATES
        ========================= */}

        <section className="certificates-section">

          <div className="certificates-heading">

            <div>

              <span className="section-eyebrow">
                LEARNING ACHIEVEMENTS
              </span>

              <h2>
                Course Certificates
              </h2>

              <p>
                Complete a course to unlock
                its certificate.
              </p>

            </div>

            <div className="certificate-count">

              {completedCourses.length} /{" "}
              {courses.length} unlocked

            </div>

          </div>

          <div className="certificate-grid">

            {courses.map((course) => {

              const courseProgress =
                progress[course.id] || {
                  total_lessons: 0,
                  completed_lessons: 0,
                  percentage: 0,
                };

              const percentage =
                courseProgress.percentage;

              const completed =
                percentage >= 100;

              const isGenerating =
                generatingCourseId ===
                course.id;

              return (

                <article
                  className={`certificate-card ${
                    completed
                      ? "certificate-card-completed"
                      : "certificate-card-locked"
                  }`}
                  key={course.id}
                >

                  {/* CARD HEADER */}

                  <div className="certificate-card-top">

                    <div
                      className={`certificate-course-icon ${
                        completed
                          ? "unlocked"
                          : "locked"
                      }`}
                    >
                      {completed
                        ? "🏆"
                        : "🔒"}
                    </div>

                    <span
                      className={`certificate-status ${
                        completed
                          ? "status-unlocked"
                          : "status-locked"
                      }`}
                    >
                      {completed
                        ? "UNLOCKED"
                        : "LOCKED"}
                    </span>

                  </div>

                  {/* COURSE INFO */}

                  <div className="certificate-card-body">

                    <span className="certificate-category">
                      {course.category ||
                        "Learning"}
                    </span>

                    <h3>
                      {course.title}
                    </h3>

                    <p>
                      {completed
                        ? "Congratulations! You have successfully completed this course."
                        : `Complete ${course.title} to unlock your certificate.`}
                    </p>

                    {/* PROGRESS */}

                    <div className="certificate-progress-header">

                      <span>
                        Course Progress
                      </span>

                      <strong>
                        {percentage}%
                      </strong>

                    </div>

                    <div className="certificate-progress">

                      <div
                        className="certificate-progress-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />

                    </div>

                    {/* BUTTON */}

                    <button
                      className={`certificate-button ${
                        completed
                          ? "certificate-button-active"
                          : "certificate-button-disabled"
                      }`}
                      disabled={
                        !completed ||
                        isGenerating
                      }
                      onClick={() =>
                        generateCertificate(
                          course
                        )
                      }
                    >

                      {isGenerating ? (

                        <>
                          <span className="button-spinner"></span>
                          Generating...
                        </>

                      ) : completed ? (

                        <>
                          <span>↓</span>
                          Download Certificate
                        </>

                      ) : (

                        <>
                          <span>🔒</span>
                          Certificate Locked
                        </>

                      )}

                    </button>

                  </div>

                </article>

              );
            })}

          </div>

          {/* =========================
              NO COURSES
          ========================= */}

          {courses.length === 0 && (

            <div className="empty-certificates">

              <div>
                📚
              </div>

              <h2>
                No courses available yet
              </h2>

              <p>
                Start learning to earn your
                first certificate.
              </p>

              <Link
                to="/courses"
                className="empty-button"
              >
                Explore Courses →
              </Link>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default Certificates;