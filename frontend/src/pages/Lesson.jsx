
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function Lesson() {
  const { lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  // AI Tutor
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [askingAI, setAskingAI] = useState(false);

  // =========================
  // LOAD LESSON
  // =========================

  useEffect(() => {
    const loadLesson = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/lessons/${lessonId}`
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
              "http://127.0.0.1:8000/api/progress/me",
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
  // ASK AI TUTOR
  // =========================

  const askAITutor = async (e) => {
    e.preventDefault();

    if (!question.trim() || askingAI) {
      return;
    }

    const userQuestion = question.trim();

    setAskingAI(true);
    setAiAnswer("");

    try {
      const token =
        localStorage.getItem("access_token");

      if (
        !token ||
        token === "undefined" ||
        token === "null"
      ) {
        alert(
          "Please login first to use AI Tutor."
        );

        setAskingAI(false);
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/ai-tutor/ask",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            question: userQuestion,
            lesson_id: Number(lessonId),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to get AI response"
        );
      }

      setAiAnswer(
        data.answer ||
          "AI Tutor could not generate a response."
      );

      setQuestion("");
    } catch (error) {
      console.error(
        "AI Tutor error:",
        error
      );

      setAiAnswer(
        "Sorry, AI Tutor could not respond right now. Please try again."
      );
    } finally {
      setAskingAI(false);
    }
  };

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
        `http://127.0.0.1:8000/api/progress/complete/${lessonId}`,
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
    AI TUTOR
========================= */}

<section className="lesson-ai-tutor">

  <div className="ai-tutor-title">

    <div className="ai-tutor-small-icon">
      ✦
    </div>

    <div>
      <span className="ai-tutor-label">
        AI LEARNING ASSISTANT
      </span>

      <h2>
        Ask AI Tutor
      </h2>

      <p>
        Stuck on something? Get a clear explanation
        based on this lesson.
      </p>
    </div>

  </div>

  <form
    className="lesson-ai-form"
    onSubmit={askAITutor}
  >

    <div className="ai-input-wrapper">

      <span className="ai-input-icon">
        ✨
      </span>

      <input
        type="text"
        value={question}
        onChange={(e) =>
          setQuestion(e.target.value)
        }
        placeholder="Ask anything about this lesson..."
        disabled={askingAI}
      />

    </div>

    <button
      type="submit"
      disabled={
        askingAI ||
        !question.trim()
      }
    >
      {askingAI ? (
        <>
          <span className="ai-loading-dot" />
          Thinking...
        </>
      ) : (
        <>
          Ask AI
          <span>→</span>
        </>
      )}
    </button>

  </form>

  {aiAnswer && (
    <div className="lesson-ai-answer">

      <div className="ai-answer-icon">
        ✦
      </div>

      <div className="ai-answer-content">

        <div className="ai-answer-header">
          <strong>AI Tutor</strong>
          <span>Just now</span>
        </div>

        <p>
          {aiAnswer}
        </p>

      </div>

    </div>
  )}

</section>

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

