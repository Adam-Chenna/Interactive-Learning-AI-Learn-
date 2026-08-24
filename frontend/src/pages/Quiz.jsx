import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Quiz.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");

function Quiz() {
  const { lessonId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);

  const [score, setScore] = useState(0);

  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // LOAD QUIZ
  // ============================================================

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/quiz/lesson/${lessonId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load quiz"
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("Invalid quiz data received");
        }

        setQuestions(data);
      } catch (err) {
        console.error("QUIZ LOAD ERROR:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      loadQuiz();
    }
  }, [lessonId]);

  // ============================================================
  // CHECK ANSWER
  // ============================================================

  const handleAnswer = async (answer) => {
    if (answered || submitting) {
      return;
    }

    if (!questions[currentIndex]) {
      return;
    }

    const questionId = questions[currentIndex].id;

    setSelectedAnswer(answer);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/quiz/check/${questionId}?answer=${encodeURIComponent(
          answer
        )}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      console.log("ANSWER RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to check answer"
        );
      }

      setCorrect(Boolean(data.correct));
      setAnswered(true);

      if (data.correct) {
        setScore((previous) => previous + 1);
      }
    } catch (err) {
      console.error("ANSWER ERROR:", err);

      setSelectedAnswer(null);
      setError(err.message);
    }
  };

  // ============================================================
  // SUBMIT QUIZ
  // ============================================================

  const submitQuiz = async () => {
    if (submitting || finished) {
      return;
    }

    const token = localStorage.getItem("access_token");

    console.log("QUIZ TOKEN:", token);
    console.log(
      "TOKEN SEGMENTS:",
      token ? token.split(".").length : 0
    );

    if (
      !token ||
      token === "undefined" ||
      token === "null"
    ) {
      setError(
        "Login session expired. Please login again."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const finalScore = score;

      const url =
        `${API_URL}/api/quiz/submit/${lessonId}` +
        `?score=${finalScore}` +
        `&total_questions=${questions.length}`;

      console.log("QUIZ SUBMIT URL:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log(
        "QUIZ SUBMIT STATUS:",
        response.status
      );

      console.log(
        "QUIZ SUBMIT RESPONSE:",
        data
      );

      if (response.status === 401) {
        localStorage.removeItem("access_token");

        setError(
          "Your login session expired. Please login again."
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to submit quiz"
        );
      }

      setFinished(true);
    } catch (err) {
      console.error(
        "QUIZ SUBMIT ERROR:",
        err
      );

      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // NEXT QUESTION
  // ============================================================

  const handleNext = () => {
    if (submitting) {
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(
        (previous) => previous + 1
      );

      setSelectedAnswer(null);
      setAnswered(false);
      setCorrect(false);
      setError("");

      return;
    }

    submitQuiz();
  };

  // ============================================================
  // RETRY
  // ============================================================

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setCorrect(false);
    setScore(0);
    setFinished(false);
    setSubmitting(false);
    setError("");
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="quiz-loading">
          <div className="loading-spinner"></div>

          <h2>Loading Quiz</h2>

          <p>
            Preparing your questions...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // LOAD ERROR
  // ============================================================

  if (error && questions.length === 0) {
    return (
      <div className="quiz-page">
        <div className="quiz-empty-card">

          <div className="empty-icon">
            ⚠️
          </div>

          <span className="quiz-label">
            QUIZ ERROR
          </span>

          <h2>
            Unable to load quiz
          </h2>

          <p>
            {error}
          </p>

          <Link
            className="back-button"
            to={`/lessons/${lessonId}`}
          >
            ← Back to Lesson
          </Link>

        </div>
      </div>
    );
  }

  // ============================================================
  // NO QUESTIONS
  // ============================================================

  if (questions.length === 0) {
    return (
      <div className="quiz-page">
        <div className="quiz-empty-card">

          <div className="empty-icon">
            📝
          </div>

          <span className="quiz-label">
            QUIZ
          </span>

          <h2>
            No Quiz Available
          </h2>

          <p>
            There are no quiz questions
            for this lesson yet.
          </p>

          <Link
            className="back-button"
            to={`/lessons/${lessonId}`}
          >
            ← Back to Lesson
          </Link>

        </div>
      </div>
    );
  }

  // ============================================================
  // RESULT
  // ============================================================

  if (finished) {
    const percentage = Math.round(
      (score / questions.length) * 100
    );

    const earnedXP = score * 10;

    return (
      <div className="quiz-page">

        <div className="quiz-result-card">

          <div className="result-icon">
            {percentage >= 70
              ? "🏆"
              : "📚"}
          </div>

          <span className="quiz-label">
            QUIZ COMPLETE
          </span>

          <h1>
            {percentage >= 70
              ? "Great job!"
              : "Keep practicing!"}
          </h1>

          <p className="result-description">
            You completed the quiz
            successfully.
          </p>

          <div className="result-score">
            <strong>
              {score}
            </strong>

            <span>
              / {questions.length}
            </span>
          </div>

          <div className="result-percentage">
            {percentage}% Correct
          </div>

          <div className="xp-earned">
            <span>⚡</span>
            You earned{" "}
            <strong>{earnedXP} XP</strong>
          </div>

          <div className="result-actions">

            <button
              className="retry-button"
              onClick={handleRetry}
            >
              ↻ Try Again
            </button>

            <Link
              className="lesson-button"
              to={`/lessons/${lessonId}`}
            >
              ← Back to Lesson
            </Link>

          </div>

        </div>
      </div>
    );
  }

  // ============================================================
  // CURRENT QUESTION
  // ============================================================

  const currentQuestion =
    questions[currentIndex];

  const progress =
    ((currentIndex + 1) /
      questions.length) *
    100;

  // ============================================================
  // QUIZ
  // ============================================================

  return (
    <div className="quiz-page">

      <div className="quiz-wrapper">

        {/* TOP BAR */}

        <div className="quiz-topbar">

          <Link
            to={`/lessons/${lessonId}`}
            className="quiz-back"
          >
            ← Back to Lesson
          </Link>

          <div className="quiz-xp-badge">
            ⚡ {score * 10} XP
          </div>

        </div>

        {/* HEADER */}

        <div className="quiz-heading">

          <div>

            <span className="quiz-label">
              KNOWLEDGE CHECK
            </span>

            <h1>
              Test Your Knowledge
            </h1>

            <p>
              Answer the questions and
              earn XP as you learn.
            </p>

          </div>

          <div className="quiz-counter">

            <strong>
              {currentIndex + 1}
            </strong>

            <span>
              / {questions.length}
            </span>

          </div>

        </div>

        {/* PROGRESS */}

        <div className="progress-section">

          <div className="progress-info">

            <span>
              Question {currentIndex + 1}
            </span>

            <span>
              {Math.round(progress)}%
            </span>

          </div>

          <div className="progress-track">

            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

        {/* QUESTION CARD */}

        <div className="question-card">

          <div className="question-top">

            <span className="question-number">
              QUESTION {currentIndex + 1}
            </span>

          </div>

          <h2 className="question-title">
            {currentQuestion.question}
          </h2>

          <p className="select-text">
            Select the best answer
          </p>

          {/* OPTIONS */}

          <div className="options">

            {currentQuestion.options.map(
              (option, index) => {

                const optionLetter =
                  String.fromCharCode(
                    65 + index
                  );

                const isSelected =
                  selectedAnswer ===
                  optionLetter;

                const isCorrectSelected =
                  answered &&
                  isSelected &&
                  correct;

                const isWrongSelected =
                  answered &&
                  isSelected &&
                  !correct;

                return (
                  <button
                    key={index}
                    type="button"
                    className={[
                      "option-button",
                      isSelected
                        ? "option-selected"
                        : "",
                      isCorrectSelected
                        ? "option-correct"
                        : "",
                      isWrongSelected
                        ? "option-wrong"
                        : "",
                    ].join(" ")}
                    onClick={() =>
                      handleAnswer(
                        optionLetter
                      )
                    }
                    disabled={answered}
                  >

                    <span className="option-letter">
                      {optionLetter}
                    </span>

                    <span className="option-text">
                      {option}
                    </span>

                    {isCorrectSelected && (
                      <span className="option-status">
                        ✓
                      </span>
                    )}

                    {isWrongSelected && (
                      <span className="option-status">
                        ✕
                      </span>
                    )}

                  </button>
                );
              }
            )}

          </div>

          {/* FEEDBACK */}

          {answered && (
            <div
              className={
                correct
                  ? "answer-feedback correct-feedback"
                  : "answer-feedback wrong-feedback"
              }
            >

              <div className="feedback-icon">
                {correct ? "✓" : "✕"}
              </div>

              <div>

                <strong>
                  {correct
                    ? "Correct answer!"
                    : "Not quite!"}
                </strong>

                <p>
                  {correct
                    ? "Excellent! Keep going."
                    : "Review the lesson and keep practicing."}
                </p>

              </div>

            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="quiz-error-message">
              ⚠️ {error}
            </div>
          )}

          {/* NEXT */}

          {answered && (
            <button
              className="next-button"
              onClick={handleNext}
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : currentIndex ===
                  questions.length - 1
                ? "Finish Quiz →"
                : "Next Question →"}
            </button>
          )}

        </div>

      </div>

    </div>
  );
}

export default Quiz;