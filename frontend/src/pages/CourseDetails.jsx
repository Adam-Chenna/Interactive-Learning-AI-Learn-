import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function CourseDetails() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [progressLoading, setProgressLoading] = useState(true);

  // =========================
  // LOAD COURSE
  // =========================

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/courses/${courseId}`
        );

        if (!response.ok) {
          throw new Error("Course not found");
        }

        const data = await response.json();

        setCourse(data);
      } catch (error) {
        console.error("Course error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  // =========================
  // LOAD USER PROGRESS
  // =========================

  useEffect(() => {
    const loadProgress = async () => {
      const token = localStorage.getItem("access_token");

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

        if (!response.ok) {
          throw new Error("Failed to load progress");
        }

        const data = await response.json();

        setCompletedLessonIds(
          data.completed_lesson_ids || []
        );
      } catch (error) {
        console.error(
          "Progress loading error:",
          error
        );
      } finally {
        setProgressLoading(false);
      }
    };

    loadProgress();
  }, []);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="course-page">
        <p>Loading course...</p>
      </div>
    );
  }

  // =========================
  // COURSE NOT FOUND
  // =========================

  if (!course) {
    return (
      <div className="course-page">

        <h2>
          Course not found
        </h2>

        <Link to="/">
          ← Back to Dashboard
        </Link>

      </div>
    );
  }

  // =========================
  // CALCULATE PROGRESS
  // =========================

  let totalLessons = 0;
  let completedLessons = 0;

  course.levels?.forEach((level) => {
    level.chapters?.forEach((chapter) => {
      chapter.lessons?.forEach((lesson) => {

        totalLessons++;

        if (
          completedLessonIds.includes(lesson.id)
        ) {
          completedLessons++;
        }

      });
    });
  });

  const courseProgress =
    totalLessons > 0
      ? Math.round(
          (completedLessons / totalLessons) * 100
        )
      : 0;

  // =========================
  // UI
  // =========================

  return (
    <div className="course-page">

      {/* BACK */}

      <Link
        to="/"
        className="back-link"
      >
        ← Back to Dashboard
      </Link>

      {/* =========================
          COURSE HERO
      ========================= */}

      <section className="course-hero">

        <div className="course-hero-icon">
          {course.icon || "📚"}
        </div>

        <div>

          <span className="category">
            {course.category}
          </span>

          <h1>
            {course.title}
          </h1>

          <p>
            {course.description}
          </p>

          <div className="course-meta">

            <span>
              👨‍🏫 {course.instructor}
            </span>

            <span>
              📊 {course.level}
            </span>

          </div>

        </div>

      </section>

      {/* =========================
          COURSE PROGRESS
      ========================= */}

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
              width: `${courseProgress}%`,
            }}
          />

        </div>

      </section>

      {/* =========================
          COURSE CONTENT
      ========================= */}

      <section className="learning-content">

        <h2>
          Course Content
        </h2>

        {course.levels?.map((level) => (

          <div
            className="level-card"
            key={level.id}
          >

            {/* LEVEL HEADER */}

            <div className="level-header">

              <div>

                <span className="level-label">
                  LEVEL
                </span>

                <h3>
                  {level.title}
                </h3>

              </div>

              <span>
                {level.chapters.length} Chapters
              </span>

            </div>

            {/* CHAPTERS */}

            <div className="chapters">

              {level.chapters?.map((chapter) => (

                <div
                  className="chapter-card"
                  key={chapter.id}
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
                        {chapter.lessons.length} Lessons
                      </p>

                    </div>

                  </div>

                  {/* LESSONS */}

                  <div className="lessons">

                    {chapter.lessons?.map((lesson) => {

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
                          key={lesson.id}
                        >

                          {/* LESSON ICON */}

                          <div
                            className={
                              isCompleted
                                ? "lesson-icon completed-icon"
                                : "lesson-icon"
                            }
                          >
                            {isCompleted ? "✓" : "▶"}
                          </div>

                          {/* LESSON INFO */}

                          <div className="lesson-info">

                            <strong>
                              {lesson.title}
                            </strong>

                            <span>
                              {lesson.duration} min ·{" "}
                              {lesson.xp} XP
                            </span>

                          </div>

                          {/* COMPLETED BADGE / ARROW */}

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

                    })}

                  </div>

                </div>

              ))}

            </div>

          </div>

        ))}

      </section>

    </div>
  );
}

export default CourseDetails;