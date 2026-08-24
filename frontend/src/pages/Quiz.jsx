
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

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

  // =========================
  // LOAD QUIZ
  // =========================

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

        setQuestions(data);
      } catch (error) {
        console.error("Quiz error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [lessonId]);

  // =========================
  // CHECK ANSWER
  // =========================

  const handleAnswer = async (answer) => {
    if (answered) {
      return;
    }

    setSelectedAnswer(answer);
    setError("");

    try {
      const questionId = questions[currentIndex].id;

      const response = await fetch(
        `${API_URL}/api/quiz/check/${questionId}?answer=${encodeURIComponent(
          answer
        )}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to check answer"
        );
      }

      setCorrect(data.correct);
      setAnswered(true);

      if (data.correct) {
        setScore((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Answer error:", error);
      setError(error.message);
    }
  };

  // =========================
  // SUBMIT QUIZ
  // =========================

  
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
    setError("Login session expired. Please login again.");
    return;
  }

  try {
    // Immediately lock submission
    setSubmitting(true);
    setError("");

    const url =
      `${API_URL}/api/quiz/submit/${lessonId}` +
      `?score=${score}&total_questions=${questions.length}`;

    console.log("QUIZ SUBMIT URL:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("QUIZ SUBMIT STATUS:", response.status);

    const data = await response.json();

    console.log("QUIZ SUBMIT RESPONSE:", data);

    if (response.status === 401) {
      localStorage.removeItem("access_token");
      setError("Your login session expired. Please login again.");
      return;
    }

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to submit quiz"
      );
    }

    setFinished(true);

  } catch (error) {
    console.error("Quiz submit error:", error);
    setError(error.message);
  } finally {
    setSubmitting(false);
  }
};


  // =========================
  // NEXT QUESTION
  // =========================


const handleNext = () => {
  // Prevent double click / double submit
  if (submitting) {
    return;
  }

  if (currentIndex < questions.length - 1) {
    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswer(null);
    setAnswered(false);
    setCorrect(false);
    return;
  }

  // Last question
  submitQuiz();
};



  // =========================
  // RETRY
  // =========================

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

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="quiz-container">
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error && !questions.length) {
    return (
      <div className="quiz-page">
        <div className="quiz-container quiz-error">
          <h2>Unable to load quiz</h2>

          <p>{error}</p>

          <Link to={`/lessons/${lessonId}`}>
            ← Back to Lesson
          </Link>
        </div>
      </div>
    );
  }

  // =========================
  // NO QUESTIONS
  // =========================

  if (questions.length === 0) {
    return (
      <div className="quiz-page">
        <div className="quiz-container quiz-empty">
          <div className="quiz-icon">
            📝
          </div>

          <h2>No Quiz Available</h2>

          <p>
            There are no quiz questions for this lesson yet.
          </p>

          <Link to={`/lessons/${lessonId}`}>
            ← Back to Lesson
          </Link>
        </div>
      </div>
    );
  }

  // =========================
  // RESULT
  // =========================

  if (finished) {
    const percentage = Math.round(
      (score / questions.length) * 100
    );

    return (
      <div className="quiz-page">
        <div className="quiz-container quiz-result">

          <div className="result-icon">
            {percentage >= 70 ? "🏆" : "📚"}
          </div>

          <span className="quiz-label">
            QUIZ COMPLETE
          </span>

          <h1>
            {percentage >= 70
              ? "Great job! 🎉"
              : "Keep practicing!"}
          </h1>

          <p className="result-text">
            You scored
          </p>

          <div className="score">
            {score}
            <span> / {questions.length}</span>
          </div>

          <p className="percentage">
            {percentage}% correct
          </p>

          <p className="quiz-xp">
            ⚡ You earned {score * 10} XP
          </p>

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

  const currentQuestion =
    questions[currentIndex];

  // =========================
  // QUIZ UI
  // =========================

  return (
    <div className="quiz-page">

      <div className="quiz-container">

        <Link
          to={`/lessons/${lessonId}`}
          className="quiz-back"
        >
          ← Back to Lesson
        </Link>

        <div className="quiz-header">

          <div>
            <span className="quiz-label">
              QUIZ
            </span>

            <h1>
              Test Your Knowledge
            </h1>
          </div>

          <div className="question-count">
            {currentIndex + 1} / {questions.length}
          </div>

        </div>

        <div className="quiz-progress">
          <div
            className="quiz-progress-fill"
            style={{
              width: `${
                ((currentIndex + 1) /
                  questions.length) *
                100
              }%`,
            }}
          />
        </div>

        <div className="question-card">

          <span className="question-number">
            QUESTION {currentIndex + 1}
          </span>

          <h2>
            {currentQuestion.question}
          </h2>

          <div className="options">

            {currentQuestion.options.map(
              (option, index) => {

                const optionLetter =
                  String.fromCharCode(65 + index);

                const isSelected =
                  selectedAnswer === optionLetter;

                return (
                  <button
                    key={index}
                    className={`option ${
                      isSelected
                        ? "selected"
                        : ""
                    } ${
                      answered && isSelected
                        ? correct
                          ? "correct"
                          : "incorrect"
                        : ""
                    }`}
                    onClick={() =>
                      handleAnswer(optionLetter)
                    }
                    disabled={answered}
                  >
                    <span className="option-letter">
                      {optionLetter}
                    </span>

                    <span className="option-text">
                      {option}
                    </span>
                  </button>
                );
              }
            )}

          </div>

          {answered && (
            <div
              className={`answer-feedback ${
                correct
                  ? "feedback-correct"
                  : "feedback-incorrect"
              }`}
            >
              <strong>
                {correct
                  ? "✓ Correct!"
                  : "✕ Incorrect"}
              </strong>

              <span>
                {correct
                  ? "Nice work! You got it right."
                  : "Don't worry. Keep learning and try the next one."}
              </span>
            </div>
          )}

          {error && (
            <div className="answer-feedback feedback-incorrect">
              <strong>⚠ Error</strong>
              <span>{error}</span>
            </div>
          )}

          {answered && (
            <button
              className="next-button"
              onClick={handleNext}
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : currentIndex === questions.length - 1
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

