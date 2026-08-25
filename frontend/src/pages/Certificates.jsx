import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import "./Certificates.css";

const API_URL = import.meta.env.VITE_API_URL;

function Certificates() {
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

      try {
        const coursesResponse = await fetch(
          `${API_URL}/api/courses/`
        );

        if (!coursesResponse.ok) {
          throw new Error("Failed to load courses");
        }

        const coursesData = await coursesResponse.json();
        setCourses(coursesData);

        const progressData = {};

        for (const course of coursesData) {
          const response = await fetch(
            `${API_URL}/api/progress/course/${course.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            progressData[course.id] = data;
          }
        }

        setProgress(progressData);
      } catch (err) {
        console.error("Certificate error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  
const generateCertificate = (course) => {
  try {
    setGenerating(true);
    setError("");

    const pdf = new jsPDF("landscape", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // ==========================================
    // STUDENT DATA
    // ==========================================

    const studentName =
      localStorage.getItem("user_name") || "Adam";

    const certificateId =
      `LAI-${course.id}-${Date.now()
        .toString()
        .slice(-6)}`;

    const completionDate =
      new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

    // ==========================================
    // BACKGROUND
    // ==========================================

    pdf.setFillColor(248, 250, 252);
    pdf.rect(
      0,
      0,
      pageWidth,
      pageHeight,
      "F"
    );

    // ==========================================
    // OUTER GOLD BORDER
    // ==========================================

    pdf.setDrawColor(180, 140, 40);
    pdf.setLineWidth(2);

    pdf.rect(
      8,
      8,
      pageWidth - 16,
      pageHeight - 16
    );

    // ==========================================
    // INNER BORDER
    // ==========================================

    pdf.setDrawColor(210, 180, 90);
    pdf.setLineWidth(0.6);

    pdf.rect(
      13,
      13,
      pageWidth - 26,
      pageHeight - 26
    );

    // ==========================================
    // TOP BRAND
    // ==========================================

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(28);
    pdf.setTextColor(30, 41, 59);

    pdf.text(
      "LearnAI",
      pageWidth / 2,
      34,
      {
        align: "center",
      }
    );

    // Small divider

    pdf.setDrawColor(180, 140, 40);
    pdf.setLineWidth(0.8);

    pdf.line(
      pageWidth / 2 - 25,
      40,
      pageWidth / 2 + 25,
      40
    );

    // ==========================================
    // CERTIFICATE TITLE
    // ==========================================

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(25);
    pdf.setTextColor(15, 23, 42);

    pdf.text(
      "CERTIFICATE OF COMPLETION",
      pageWidth / 2,
      56,
      {
        align: "center",
      }
    );

    // ==========================================
    // SUBTITLE
    // ==========================================

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(13);
    pdf.setTextColor(100, 116, 139);

    pdf.text(
      "This certificate is proudly presented to",
      pageWidth / 2,
      70,
      {
        align: "center",
      }
    );

    // ==========================================
    // STUDENT NAME
    // ==========================================

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(30);
    pdf.setTextColor(30, 41, 59);

    pdf.text(
      studentName.toUpperCase(),
      pageWidth / 2,
      91,
      {
        align: "center",
      }
    );

    // ==========================================
    // NAME UNDERLINE
    // ==========================================

    pdf.setDrawColor(180, 140, 40);
    pdf.setLineWidth(0.7);

    pdf.line(
      pageWidth / 2 - 45,
      97,
      pageWidth / 2 + 45,
      97
    );

    // ==========================================
    // COMPLETION MESSAGE
    // ==========================================

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(13);
    pdf.setTextColor(71, 85, 105);

    pdf.text(
      "for successfully completing the course",
      pageWidth / 2,
      111,
      {
        align: "center",
      }
    );

    // ==========================================
    // COURSE NAME
    // ==========================================

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(23);
    pdf.setTextColor(37, 99, 235);

    pdf.text(
      course.title,
      pageWidth / 2,
      128,
      {
        align: "center",
        maxWidth: pageWidth - 70,
      }
    );

    // ==========================================
    // COMPLETION DATE
    // ==========================================

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(100, 116, 139);

    pdf.text(
      `Completed on ${completionDate}`,
      pageWidth / 2,
      143,
      {
        align: "center",
      }
    );

    // ==========================================
    // CERTIFICATE ID
    // ==========================================

    pdf.setFontSize(9);
    pdf.setTextColor(148, 163, 184);

    pdf.text(
      `Certificate ID: ${certificateId}`,
      pageWidth / 2,
      151,
      {
        align: "center",
      }
    );

    // ==========================================
    // SIGNATURE AREA
    // ==========================================

    pdf.setDrawColor(100, 116, 139);
    pdf.setLineWidth(0.5);

    // Left signature

    pdf.line(
      45,
      174,
      105,
      174
    );

    // Right signature

    pdf.line(
      190,
      174,
      250,
      174
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(51, 65, 85);

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

    // ==========================================
    // FOOTER
    // ==========================================

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);

    pdf.text(
      "LearnAI • AI Powered Learning Platform",
      pageWidth / 2,
      193,
      {
        align: "center",
      }
    );

    // ==========================================
    // SAVE
    // ==========================================

    const safeCourseName =
      course.title
        .replace(/[^a-zA-Z0-9]/g, "-")
        .replace(/-+/g, "-");

    pdf.save(
      `${safeCourseName}-Certificate.pdf`
    );

  } catch (error) {
    console.error(
      "Certificate generation error:",
      error
    );

    setError(
      "Failed to generate certificate."
    );

  } finally {
    setGenerating(false);
  }
};



  if (loading) {
    return (
      <div className="app">
        <main className="main">
          <header className="topbar">
            <div>
              <h1>Certificates</h1>
              <p>Loading your achievements...</p>
            </div>
          </header>

          <section className="certificate-loading">
            <div className="loading-spinner"></div>
            <p>Preparing your certificates...</p>
          </section>
        </main>
      </div>
    );
  }

  const completedCourses = courses.filter(
    (course) =>
      (progress[course.id]?.percentage || 0) >= 100
  );

  return (
    <div className="app">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="logo">
          <img
            src="/logo.png"
            alt="LearnAI Logo"
          />

          <span>LearnAI</span>
        </div>

        <nav className="nav">
          <Link to="/" className="nav-item">
            <span>⌂</span>
            Dashboard
          </Link>

          <Link to="/" className="nav-item">
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
            to="/"
            className="nav-item"
          >
            <span>⚙</span>
            Settings
          </Link>
        </div>
      </aside>

      {/* MAIN */}

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Certificates</h1>
            <p>
              Your achievements and course
              completion certificates.
            </p>
          </div>

          <div className="profile">
            <div className="avatar">A</div>

            <div>
              <strong>Adam</strong>
              <span>Student</span>
            </div>
          </div>
        </header>

        {/* HERO */}

        <section className="certificate-hero">
          <div className="certificate-hero-content">
            <span className="certificate-eyebrow">
              YOUR ACHIEVEMENTS
            </span>

            <h2>
              Keep learning.
              <br />
              <span>Earn your next certificate.</span>
            </h2>

            <p>
              Complete your courses and showcase
              your learning achievements with
              official LearnAI certificates.
            </p>
          </div>

          <div className="certificate-trophy">
            🏆
          </div>
        </section>

        {/* STATS */}

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
                {courses.length
                  ? Math.round(
                      (completedCourses.length /
                        courses.length) *
                        100
                    )
                  : 0}
                %
              </strong>

              <span>
                Completion Rate
              </span>
            </div>
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="certificate-error">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {/* COURSE CERTIFICATES */}

        <section className="certificates-section">
          <div className="certificates-heading">
            <div>
              <span className="section-eyebrow">
                LEARNING ACHIEVEMENTS
              </span>

              <h2>Course Certificates</h2>

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
                progress[course.id];

              const percentage =
                courseProgress?.percentage || 0;

              const completed =
                percentage >= 100;

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
                      {course.category}
                    </span>

                    <h3>{course.title}</h3>

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
                        generating
                      }
                      onClick={() =>
                        generateCertificate(
                          course
                        )
                      }
                    >
                      {generating ? (
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

          {courses.length === 0 && (
            <div className="empty-certificates">
              <div>📚</div>

              <h2>
                No courses available yet
              </h2>

              <p>
                Start learning to earn your
                first certificate.
              </p>

              <Link to="/" className="empty-button">
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

