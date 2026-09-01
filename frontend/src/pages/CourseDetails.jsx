import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

// ============================================================
// pages/CourseDetails.jsx
// API URL + AUTH HELPER
// ============================================================

const API_URL =
  (
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000"
  )
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");

const getToken = () => {

  const token =
    localStorage.getItem(
      "access_token"
    );

  if (
    !token ||
    token === "undefined" ||
    token === "null"
  ) {
    return null;
  }

  return token;
};

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [completedLessonIds, setCompletedLessonIds] =
    useState([]);

  const [progressLoading, setProgressLoading] =
    useState(true);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD COURSE
  // =====================================================

  useEffect(() => {
    const loadCourse = async () => {
      const token = getToken();

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/courses/${courseId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        // AUTH ERROR
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_name");

          navigate("/login", {
            replace: true,
          });

          return;
        }

        if (!response.ok) {
          throw new Error(
            `Course not found (${response.status})`
          );
        }

        const data = await response.json();

        setCourse(data);
      } catch (error) {
        console.error(
          "Course loading error:",
          error
        );

        setError(
          error.message ||
          "Could not load course."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId, navigate]);

  // =====================================================
  // LOAD USER PROGRESS
  // =====================================================

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
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            cache: "no-store",
          }
        );

        // AUTH ERROR
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

        setCompletedLessonIds(
          Array.isArray(
            data.completed_lesson_ids
          )
            ? data.completed_lesson_ids
            : []
        );
      } catch (error) {
        console.error(
          "Progress loading error:",
          error
        );

        setCompletedLessonIds([]);
      } finally {
        setProgressLoading(false);
      }
    };

    loadProgress();
  }, [navigate]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="course-page">
        <div className="page-loading">
          <div className="loading-spinner"></div>

          <p>
            Loading course...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !course) {
    return (
      <div className="course-page">
        <h2>
          {error || "Course not found"}
        </h2>

        <Link
          to="/courses"
          className="back-link"
        >
          ← Back to My Courses
        </Link>
      </div>
    );
  }

  // =====================================================
  // GET ALL LESSONS
  // =====================================================

  const allLessons = [];

  if (Array.isArray(course.levels)) {
    course.levels.forEach((level) => {
      if (!Array.isArray(level.chapters)) {
        return;
      }

      level.chapters.forEach((chapter) => {
        if (!Array.isArray(chapter.lessons)) {
          return;
        }

        chapter.lessons.forEach((lesson) => {
          if (lesson) {
            allLessons.push(lesson);
          }
        });
      });
    });
  }

  // =====================================================
  // COURSE PROGRESS
  // =====================================================

  const totalLessons =
    allLessons.length;

  const completedLessons =
    allLessons.filter((lesson) =>
      completedLessonIds.includes(
        lesson.id
      )
    ).length;

  const courseProgress =
    totalLessons > 0
      ? Math.round(
          (completedLessons /
            totalLessons) *
            100
        )
      : 0;

  // =====================================================
  // NEXT LESSON
  // =====================================================

  const nextLesson =
    allLessons.find(
      (lesson) =>
        !completedLessonIds.includes(
          lesson.id
        )
    );

  // =====================================================
  // CONTINUE LEARNING
  // =====================================================

  const handleContinueLearning = () => {
    if (nextLesson) {
      navigate(
        `/lessons/${nextLesson.id}`
      );

      return;
    }

    if (allLessons.length > 0) {
      const lastLesson =
        allLessons[
          allLessons.length - 1
        ];

      navigate(
        `/lessons/${lastLesson.id}`
      );
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="course-page">

      {/* BACK */}

      <Link
        to="/courses"
        className="back-link"
      >
        ← Back to My Courses
      </Link>

      {/* =================================================
          COURSE HERO
      ================================================= */}

      <section className="course-hero">

        <div className="course-hero-icon">
          {course.icon || "📚"}
        </div>

        <div>

          <span className="category">
            {course.category ||
              "General"}
          </span>

          <h1>
            {course.title ||
              "Untitled Course"}
          </h1>

          <p>
            {course.description ||
              "Start learning this course."}
          </p>

          <div className="course-meta">

            {course.instructor && (
              <span>
                👨‍🏫 {course.instructor}
              </span>
            )}

            {course.level && (
              <span>
                📊 {course.level}
              </span>
            )}

          </div>

        </div>

      </section>

      {/* =================================================
          PROGRESS
      ================================================= */}

      <section className="course-progress-card">

        <div className="course-progress-header">

          <div>

            <strong>
              Your Progress
            </strong>

            <p>
              {completedLessons} of{" "}
              {totalLessons} lessons completed
            </p>

          </div>

          <strong>
            {courseProgress}%
          </strong>

        </div>

        <div className="progress">

          <div
            className="progress-fill"
            style={{
              width:
                `${courseProgress}%`,
            }}
          />

        </div>

        {!progressLoading &&
          allLessons.length > 0 && (

          <button
            type="button"
            className="continue-course-button"
            onClick={
              handleContinueLearning
            }
          >
            {courseProgress === 100
              ? "Review Course →"
              : "Continue Learning →"}
          </button>

        )}

      </section>

      {/* =================================================
          COURSE CONTENT
      ================================================= */}

      <section className="learning-content">

        <h2>
          Course Content
        </h2>

        {Array.isArray(course.levels) &&
          course.levels.length > 0 ? (

          course.levels.map(
            (level, levelIndex) => (

              <div
                className="level-card"
                key={
                  level.id ||
                  `level-${levelIndex}`
                }
              >

                {/* LEVEL HEADER */}

                <div className="level-header">

                  <div>

                    <span className="level-label">
                      LEVEL {levelIndex + 1}
                    </span>

                    <h3>
                      {level.title}
                    </h3>

                  </div>

                  <span>
                    {level.chapters?.length ||
                      0}{" "}
                    Chapters
                  </span>

                </div>

                {/* CHAPTERS */}

                <div className="chapters">

                  {Array.isArray(
                    level.chapters
                  ) &&
                    level.chapters.map(
                      (
                        chapter,
                        chapterIndex
                      ) => (

                        <div
                          className="chapter-card"
                          key={
                            chapter.id ||
                            `chapter-${levelIndex}-${chapterIndex}`
                          }
                        >

                          {/* CHAPTER TITLE */}

                          <div className="chapter-title">

                            <span>
                              📖
                            </span>

                            <div>

                              <h4>
                                {chapter.title}
                              </h4>

                              <p>
                                {chapter.lessons?.length ||
                                  0}{" "}
                                Lessons
                              </p>

                            </div>

                          </div>

                          {/* LESSONS */}

                          <div className="lessons">

                            {Array.isArray(
                              chapter.lessons
                            ) &&
                              chapter.lessons.map(
                                (
                                  lesson,
                                  lessonIndex
                                ) => {

                                  const isCompleted =
                                    completedLessonIds.includes(
                                      lesson.id
                                    );

                                  return (
                                    <Link
                                      to={`/lessons/${lesson.id}`}
                                      className={
                                        isCompleted
                                          ? "lesson-item completed"
                                          : "lesson-item"
                                      }
                                      key={
                                        lesson.id ||
                                        `lesson-${levelIndex}-${chapterIndex}-${lessonIndex}`
                                      }
                                    >

                                      <div
                                        className={
                                          isCompleted
                                            ? "lesson-icon completed-icon"
                                            : "lesson-icon"
                                        }
                                      >
                                        {isCompleted
                                          ? "✓"
                                          : "▶"}
                                      </div>

                                      <div className="lesson-info">

                                        <strong>
                                          {lesson.title ||
                                            "Untitled Lesson"}
                                        </strong>

                                        <span>
                                          {lesson.duration ||
                                            0}{" "}
                                          min ·{" "}
                                          {lesson.xp ||
                                            0}{" "}
                                          XP
                                        </span>

                                      </div>

                                      {isCompleted ? (

                                        <span className="lesson-completed">
                                          Completed
                                        </span>

                                      ) : (

                                        <span className="lesson-arrow">
                                          →
                                        </span>

                                      )}

                                    </Link>
                                  );
                                }
                              )}

                          </div>

                        </div>

                      )
                    )}

                </div>

              </div>

            )
          )

        ) : (

          <div className="courses-empty-state">

            <div className="courses-empty-icon">
              📚
            </div>

            <h3>
              No course content yet
            </h3>

            <p>
              This course does not have
              any lessons yet.
            </p>

          </div>

        )}

      </section>

    </div>
  );
}

export default CourseDetails;