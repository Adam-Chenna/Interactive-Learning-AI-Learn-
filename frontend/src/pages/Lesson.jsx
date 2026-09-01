// ============================================================
// pages/Lesson.jsx
// IMPORT REPLACE
// ============================================================

import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

function Lesson() {
  const { lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);


  // =========================
  // LOAD LESSON
  // =========================

  useEffect(() => {
    const loadLesson = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/lessons/${lessonId}`
        );

        if (!response.ok) {
          throw new Error("Lesson not found");
        }

        const data = await response.json();

        setLesson(data);
        
        

        // Load user progress
        const token = localStorage.getItem("access_token");

        if (token) {
          try {
            const progressResponse = await fetch(
              `${import.meta.env.VITE_API_URL}/api/progress/me`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (progressResponse.ok) {
              const progressData =
                await progressResponse.json();

              const completedIds =
                progressData.completed_lesson_ids || [];

              setCompleted(
                completedIds.includes(Number(lessonId))
              );
            }
          } catch (error) {
            console.error(
              "Progress load error:",
              error
            );
          }
        }
      } catch (error) {
        console.error("Lesson error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId]);


  // =========================
  // MARK LESSON COMPLETE
  // =========================

  const markComplete = async () => {
    if (completing) {
      return;
    }

    try {
      setCompleting(true);

      const token =
        localStorage.getItem("access_token");

      console.log(
        "FRONTEND TOKEN:",
        token
      );

      if (
        !token ||
        token === "undefined" ||
        token === "null"
      ) {
        alert(
          "Your login session is invalid. Please login again."
        );

        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/progress/complete/${lessonId}`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log(
        "PROGRESS RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to complete lesson"
        );
      }

      setCompleted(true);

      console.log(
        "Lesson completed successfully!"
      );
    } catch (error) {
      console.error(
        "Progress error:",
        error
      );

      alert(error.message);
    } finally {
      setCompleting(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="lesson-page">
        <p>Loading lesson...</p>
      </div>
    );
  }

  // =========================
  // LESSON NOT FOUND
  // =========================

  if (!lesson) {
    return (
      <div className="lesson-page">
        <h2>Lesson not found</h2>

        <Link to="/">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="lesson-page">

      {/* Back */}

      <Link
        to="/"
        className="back-link"
      >
        ← Back to Dashboard
      </Link>

      <div className="lesson-container">

        {/* =========================
            LESSON HEADER
        ========================= */}

        <div className="lesson-header">

          <span className="lesson-label">
            LESSON
          </span>

          <h1>{lesson.title}</h1>

          <div className="lesson-meta">

            <span>
              ⏱ {lesson.duration} min
            </span>

            <span>
              ⚡ {lesson.xp} XP
            </span>

          </div>

        </div>

        {/* =========================
            LESSON CONTENT
        ========================= */}

       <article className="lesson-content">
  {(lesson.content || "")
    .split("\n")
    .map((line, index) => (
      <p key={index}>
        {line || "\u00A0"}
      </p>
    ))}
</article>

  

        {/* =========================
            COMPLETION
        ========================= */}

        <div className="lesson-completion">

          {completed ? (

  <>
    <div className="completed-message">

      <span>✓</span>

      <div>

        <strong>
          Lesson Completed!
        </strong>

        <p>
          You earned {lesson.xp} XP 🎉
        </p>

      </div>

    </div>

    <Link
      to={`/quiz/${lessonId}`}
      className="quiz-button"
    >
      📝 Take Quiz →
    </Link>
  </>

) : (

            <button
              className="complete-button"
              onClick={markComplete}
              disabled={completing}
            >
              {completing
                ? "Completing..."
                : "✓ Mark as Complete"}
            </button>

          )}

        </div>

      </div>

    </div>
  );

}
export default Lesson;

