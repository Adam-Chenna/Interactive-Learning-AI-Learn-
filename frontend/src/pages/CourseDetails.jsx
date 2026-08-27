
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();

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
        <h2>Course not found</h2>

        <Link to="/">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  // =========================
  // GET ALL LESSONS
  // =========================

  const allLessons = [];

  course.levels?.forEach((level) => {
    level.chapters?.forEach((chapter) => {
      chapter.lessons?.forEach((lesson) => {
        allLessons.push(lesson);
      });
    });
  });

  // =========================
  // CALCULATE PROGRESS
  // =========================

  const totalLessons = allLessons.length;

  const completedLessons = allLessons.filter((lesson) =>
    completedLessonIds.includes(lesson.id)
  ).length;

  const courseProgress =
    totalLessons > 0
      ? Math.round(
          (completedLessons / totalLessons) * 100
        )
      : 0;

  // =========================
  // FIND NEXT LESSON
  // =========================

  const nextLesson = allLessons.find(
    (lesson) =>
      !completedLessonIds.includes(lesson.id)
  );

  // =========================
  // CONTINUE LEARNING
  // =========================

  const handleContinueLearning = () => {
    if (nextLesson) {
      navigate(`/lessons/${nextLesson.id}`);
      return;
    }

    // If every lesson is completed,
    // open the last lesson.
    if (allLessons.length > 0) {
      const lastLesson =
        allLessons[allLessons.length - 1];

      navigate(`/lessons/${lastLesson.id}`);
    }
  };

  return (
    <div className="course-page">

      {/* =========================
          BACK
      ========================= */}

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

        {/* =========================
            CONTINUE BUTTON
        ========================= */}

        {!progressLoading &&
          allLessons.length > 0 && (

          <button
            className="continue-course-button"
            onClick={handleContinueLearning}
          >
            {courseProgress === 100
              ? "Review Course →"
              : "Continue Learning →"}
          </button>

        )}

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
                {level.chapters?.length || 0} Chapters
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
                        {chapter.lessons?.length || 0} Lessons
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
                            {isCompleted
                              ? "✓"
                              : "▶"}
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

                          {/* STATUS */}

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

