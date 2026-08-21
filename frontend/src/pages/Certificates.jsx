import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";

const API_URL = "http://127.0.0.1:8000";

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
      } catch (error) {
        console.error("Certificate error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const generateCertificate = (course) => {
    try {
      setGenerating(true);

      const pdf = new jsPDF("landscape", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Border
      pdf.setLineWidth(2);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

      pdf.setLineWidth(0.5);
      pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

      // Logo / Brand
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(28);
      pdf.text("LearnAI", pageWidth / 2, 35, {
        align: "center",
      });

      // Certificate title
      pdf.setFontSize(30);
      pdf.text(
        "CERTIFICATE OF COMPLETION",
        pageWidth / 2,
        60,
        {
          align: "center",
        }
      );

      // Subtitle
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(15);

      pdf.text(
        "This certificate is proudly presented to",
        pageWidth / 2,
        78,
        {
          align: "center",
        }
      );

      // Student name
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(26);

      pdf.text(
        "Adam",
        pageWidth / 2,
        98,
        {
          align: "center",
        }
      );

      // Completion text
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(14);

      pdf.text(
        "for successfully completing the course",
        pageWidth / 2,
        115,
        {
          align: "center",
        }
      );

      // Course name
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);

      pdf.text(
        course.title,
        pageWidth / 2,
        133,
        {
          align: "center",
          maxWidth: pageWidth - 60,
        }
      );

      // Date
      const date = new Date().toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);

      pdf.text(
        `Completed on ${date}`,
        pageWidth / 2,
        155,
        {
          align: "center",
        }
      );

      // Signature
      pdf.line(45, 175, 105, 175);
      pdf.line(190, 175, 250, 175);

      pdf.setFontSize(11);

      pdf.text(
        "LearnAI",
        75,
        182,
        {
          align: "center",
        }
      );

      pdf.text(
        "Course Completion",
        220,
        182,
        {
          align: "center",
        }
      );

      pdf.save(
        `${course.title.replace(/\s+/g, "-")}-Certificate.pdf`
      );
    } catch (error) {
      console.error(
        "Certificate generation error:",
        error
      );

      setError("Failed to generate certificate.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <main className="main">
          <div className="topbar">
            <div>
              <h1>Certificates</h1>
              <p>Loading your certificates...</p>
            </div>
          </div>

          <section className="progress-content">
            <p>Loading...</p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">
            L
          </div>

          <span>LearnAI</span>
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
              Celebrate your learning achievements.
            </p>
          </div>

          <div className="profile">
            <div className="avatar">
              A
            </div>

            <div>
              <strong>Adam</strong>
              <span>Student</span>
            </div>
          </div>
        </header>

        <section className="progress-content">
          <div className="progress-label">
            YOUR ACHIEVEMENTS
          </div>

          <h2 className="progress-title">
            Course Certificates
          </h2>

          <p className="progress-subtitle">
            Complete a course to unlock your certificate.
          </p>

          {error && (
            <div className="quiz-error">
              <p>{error}</p>
            </div>
          )}

          <div className="course-grid">
            {courses.map((course) => {
              const courseProgress =
                progress[course.id];

              const percentage =
                courseProgress?.percentage || 0;

              const completed =
                percentage >= 100;

              return (
                <div
                  className="course-card"
                  key={course.id}
                >
                  <div className="course-icon">
                    {completed ? "🏆" : "🔒"}
                  </div>

                  <div className="course-info">
                    <span className="category">
                      {course.category}
                    </span>

                    <h3>
                      {course.title}
                    </h3>

                    <p>
                      {completed
                        ? "Congratulations! You completed this course."
                        : `Complete ${course.title} to unlock your certificate.`}
                    </p>

                    <div className="progress-info">
                      <span>
                        {percentage}% Complete
                      </span>
                    </div>

                    <div className="progress">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <button
                      className="next-button"
                      disabled={
                        !completed ||
                        generating
                      }
                      onClick={() =>
                        generateCertificate(course)
                      }
                      style={{
                        marginTop: "16px",
                        opacity:
                          completed ? 1 : 0.5,
                        cursor:
                          completed
                            ? "pointer"
                            : "not-allowed",
                      }}
                    >
                      {generating
                        ? "Generating..."
                        : completed
                        ? "🏆 Download Certificate"
                        : "🔒 Certificate Locked"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {courses.length === 0 && (
            <div className="achievement-card">
              <div className="achievement-icon">
                📚
              </div>

              <div>
                <span className="progress-small-label">
                  NO COURSES
                </span>

                <h2>
                  No courses available yet.
                </h2>

                <p>
                  Complete a course to earn your
                  first certificate.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Certificates;