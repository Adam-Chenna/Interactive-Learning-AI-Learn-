import { useEffect, useState } from "react";
import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate,
} from "react-router-dom";

import CourseDetails from "./pages/CourseDetails";
import Lesson from "./pages/Lesson";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Progress from "./pages/Progress";
import AITutor from "./pages/AITutor";
import Quiz from "./pages/Quiz";
import Certificates from "./pages/Certificates";
import Settings from "./pages/Settings";
import MyCourses from "./pages/MyCourses";


// =====================================================
// API URL
// =====================================================

// Handles:
// VITE_API_URL=http://127.0.0.1:8000
// VITE_API_URL=http://127.0.0.1:8000/
// VITE_API_URL=http://127.0.0.1:8000/api
//
// All of them become:
// http://127.0.0.1:8000

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");


// =====================================================
// AUTH HELPERS
// =====================================================

const getToken = () => {
  const token = localStorage.getItem("access_token");

  if (
    !token ||
    token === "undefined" ||
    token === "null"
  ) {
    return null;
  }

  return token;
};


// =====================================================
// API JSON HELPER
// =====================================================

const getResponseData = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      detail: text,
    };
  }
};


// =====================================================
// LOGOUT HELPER
// =====================================================

const clearAuth = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_name");
};


// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({ children }) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// =====================================================
// DASHBOARD
// =====================================================

function Dashboard() {

  const navigate = useNavigate();


  // ===================================================
  // COURSES
  // ===================================================

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);


  // ===================================================
  // USER
  // ===================================================

  const [userName, setUserName] = useState(
    localStorage.getItem("user_name") || "Student"
  );


  // ===================================================
  // PROGRESS
  // ===================================================

  const [progress, setProgress] = useState({
    completed_lessons: 0,
    total_xp: 0,
    completed_lesson_ids: [],
  });

  const [progressLoading, setProgressLoading] =
    useState(true);


  // ===================================================
  // AI LEARNING PATH
  // ===================================================

  const [aiPrompt, setAiPrompt] = useState("");

  const [learningPath, setLearningPath] =
    useState(null);

  const [generatingPath, setGeneratingPath] =
    useState(false);

  const [savingPath, setSavingPath] =
    useState(false);

  const [aiError, setAiError] =
    useState("");

  const [saveMessage, setSaveMessage] =
    useState("");

  const [savedCourseId, setSavedCourseId] =
    useState(null);


  // ===================================================
  // LOAD USER NAME
  // ===================================================

  useEffect(() => {

    const savedName =
      localStorage.getItem("user_name");

    setUserName(
      savedName || "Student"
    );

  }, []);


  // ===================================================
  // LOAD COURSES
  // ===================================================

  useEffect(() => {

    const loadCourses = async () => {

      try {

        const response = await fetch(
          `${API_URL}/api/courses/`
        );

        const data =
          await getResponseData(response);

        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Failed to load courses"
          );

        }

        setCourses(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          "Failed to load courses:",
          error
        );

      } finally {

        setLoading(false);

      }

    };

    loadCourses();

  }, []);


  // ===================================================
  // LOAD USER PROGRESS
  // ===================================================

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
            },
          }
        );


        // ---------------------------------------------
        // AUTH ERROR
        // ---------------------------------------------

        if (response.status === 401) {

          clearAuth();

          navigate(
            "/login",
            {
              replace: true,
            }
          );

          return;

        }


        const data =
          await getResponseData(response);


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Failed to load progress"
          );

        }


        setProgress({

          completed_lessons:
            data.completed_lessons || 0,

          total_xp:
            data.total_xp || 0,

          completed_lesson_ids:
            Array.isArray(
              data.completed_lesson_ids
            )
              ? data.completed_lesson_ids
              : [],

        });

      } catch (error) {

        console.error(
          "Progress error:",
          error
        );

      } finally {

        setProgressLoading(false);

      }

    };


    loadProgress();

  }, [navigate]);


  // ===================================================
  // COURSE PROGRESS
  // ===================================================

  const getCourseProgress = (course) => {

    let totalLessons = 0;
    let completedLessons = 0;


    if (!course?.levels) {

      return {
        percentage: 0,
        completed: 0,
        total: 0,
      };

    }


    course.levels.forEach(
      (level) => {

        if (!level?.chapters) {
          return;
        }


        level.chapters.forEach(
          (chapter) => {

            if (!chapter?.lessons) {
              return;
            }


            chapter.lessons.forEach(
              (lesson) => {

                totalLessons++;


                if (
                  progress.completed_lesson_ids.includes(
                    lesson.id
                  )
                ) {

                  completedLessons++;

                }

              }
            );

          }
        );

      }
    );


    const percentage =
      totalLessons > 0
        ? Math.round(
            (
              completedLessons /
              totalLessons
            ) * 100
          )
        : 0;


    return {

      percentage,

      completed:
        completedLessons,

      total:
        totalLessons,

    };

  };


  // ===================================================
  // COMPLETED COURSES
  // ===================================================

  const completedCoursesCount =
    courses.filter(
      (course) => {

        const courseProgress =
          getCourseProgress(course);

        return (
          courseProgress.percentage >= 100
        );

      }
    ).length;


  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout = () => {

    clearAuth();

    navigate(
      "/login",
      {
        replace: true,
      }
    );

  };


  // ===================================================
  // GENERATE AI LEARNING PATH
  // ===================================================

  const handleGenerateLearningPath =
    async () => {

      const prompt =
        aiPrompt.trim();


      // ---------------------------------------------
      // VALIDATION
      // ---------------------------------------------

      if (!prompt) {

        setAiError(
          "Please tell the AI what you want to learn."
        );

        return;

      }


      const token =
        getToken();


      if (!token) {

        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;

      }


      setGeneratingPath(true);

      setAiError("");

      setSaveMessage("");

      setLearningPath(null);

      setSavedCourseId(null);


      try {

        // IMPORTANT:
        // Backend endpoint is:
        // POST /api/ai-tutor/generate-learning-path

        const endpoint =
          `${API_URL}/api/ai-tutor/generate-learning-path`;


        console.log(
          "AI Learning Path URL:",
          endpoint
        );


        const response =
          await fetch(
            endpoint,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                prompt: prompt,
              }),

            }
          );


        // ---------------------------------------------
        // READ RESPONSE SAFELY
        // ---------------------------------------------

        const data =
          await getResponseData(
            response
          );


        // ---------------------------------------------
        // AUTH ERROR
        // ---------------------------------------------

        if (
          response.status === 401
        ) {

          clearAuth();

          navigate(
            "/login",
            {
              replace: true,
            }
          );

          return;

        }


        // ---------------------------------------------
        // OTHER ERROR
        // ---------------------------------------------

        if (!response.ok) {

          console.error(
            "Generate Learning Path API Error:",
            response.status,
            data
          );


          throw new Error(
            data.detail ||
            `Server returned ${response.status}`
          );

        }


        // ---------------------------------------------
        // CHECK AI RESPONSE
        // ---------------------------------------------

        if (
          !data.learning_path
        ) {

          console.error(
            "Invalid learning path response:",
            data
          );


          throw new Error(
            "AI did not return a learning path."
          );

        }


        // ---------------------------------------------
        // SUCCESS
        // ---------------------------------------------

        console.log(
          "Generated Learning Path:",
          data.learning_path
        );


        setLearningPath(
          data.learning_path
        );


      } catch (error) {

        console.error(
          "AI Learning Path Error:",
          error
        );


        setAiError(
          error.message ||
          "Something went wrong while generating the learning path."
        );

      } finally {

        setGeneratingPath(false);

      }

    };


  // ===================================================
  // SAVE AI LEARNING PATH
  // ===================================================

  const handleSaveLearningPath =
    async () => {

      if (!learningPath) {
        return;
      }


      const token =
        getToken();


      if (!token) {

        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;

      }


      setSavingPath(true);

      setSaveMessage("");

      setAiError("");


      try {

        const endpoint =
          `${API_URL}/api/ai-tutor/save-learning-path`;


        console.log(
          "Save Learning Path URL:",
          endpoint
        );


        const response =
          await fetch(
            endpoint,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({

                learning_path:
                  learningPath,

              }),

            }
          );


        const data =
          await getResponseData(
            response
          );


        // ---------------------------------------------
        // AUTH ERROR
        // ---------------------------------------------

        if (
          response.status === 401
        ) {

          clearAuth();

          navigate(
            "/login",
            {
              replace: true,
            }
          );

          return;

        }


        // ---------------------------------------------
        // API ERROR
        // ---------------------------------------------

        if (!response.ok) {

          console.error(
            "Save Learning Path Error:",
            response.status,
            data
          );


          throw new Error(
            data.detail ||
            `Server returned ${response.status}`
          );

        }


        // ---------------------------------------------
        // SUCCESS
        // ---------------------------------------------

        setSavedCourseId(
          data.course_id
        );


        setSaveMessage(
          "Personalized course saved successfully!"
        );


        // ---------------------------------------------
        // REFRESH COURSES
        // ---------------------------------------------

        try {

          const coursesResponse =
            await fetch(
              `${API_URL}/api/courses/`
            );


          if (
            coursesResponse.ok
          ) {

            const coursesData =
              await getResponseData(
                coursesResponse
              );


            setCourses(
              Array.isArray(
                coursesData
              )
                ? coursesData
                : []
            );

          }

        } catch (
          refreshError
        ) {

          console.error(
            "Course refresh error:",
            refreshError
          );

        }


      } catch (error) {

        console.error(
          "Save Learning Path Error:",
          error
        );


        setAiError(
          error.message ||
          "Could not save learning path."
        );

      } finally {

        setSavingPath(false);

      }

    };


  // ===================================================
  // CLEAR AI PATH
  // ===================================================

  const handleClearLearningPath =
    () => {

      setLearningPath(null);

      setAiError("");

      setSaveMessage("");

      setSavedCourseId(null);

    };


  // ===================================================
  // DASHBOARD UI
  // ===================================================

  return (

    <div className="app">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">


        {/* LOGO */}

        <div className="logo">

          <img
            src="/logo.png"
            alt="LearnAI Logo"
          />

          <span>
            LearnAI
          </span>

        </div>


        {/* NAVIGATION */}

        <nav className="nav">

          <Link
            to="/"
            className="nav-item active"
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
            className="nav-item"
          >
            <span>🏆</span>
            Certificates
          </Link>

        </nav>


        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          <Link
            to="/settings"
            className="nav-item"
          >
            <span>⚙</span>
            Settings
          </Link>


          <button
            className="nav-item logout"
            onClick={
              handleLogout
            }
            type="button"
          >
            <span>↪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="main">


        {/* =================================================
            TOPBAR
        ================================================= */}

        <header className="topbar">

          <div>

            <h1>
              Dashboard
            </h1>

            <p>
              Continue your learning journey.
            </p>

          </div>


          <div className="profile">

            <div className="avatar">

              {userName
                .charAt(0)
                .toUpperCase()}

            </div>


            <div>

              <strong>
                {userName}
              </strong>

              <span>
                Student
              </span>

            </div>

          </div>

        </header>


        {/* =================================================
            WELCOME CARD
        ================================================= */}

        <section className="welcome-card">

          <div>

            <span className="welcome-label">
              KEEP LEARNING
            </span>


            <h2>
              Welcome back, {userName} 👋
            </h2>


            <p>
              Pick up where you left off
              and keep building your skills.
            </p>


            <button
              type="button"
              onClick={() => {

                if (
                  courses.length > 0
                ) {

                  navigate(
                    `/courses/${courses[0].id}`
                  );

                }

              }}
              disabled={
                loading ||
                courses.length === 0
              }
            >

              Continue Learning →

            </button>

          </div>


          <div className="welcome-icon">
            🧠
          </div>

        </section>


        {/* =================================================
            AI LEARNING ASSISTANT
        ================================================= */}

        <section className="ai-learning-section">

          <div className="ai-learning-header">

            <div>

              <span className="ai-badge">
                AI LEARNING ASSISTANT
              </span>


              <h2>
                What do you want to learn?
              </h2>


              <p>
                Tell me your goal, current knowledge,
                or what you want to build. I'll create
                a personalized learning path for you.
              </p>

            </div>

          </div>


          <div className="ai-prompt-card">

            <div className="ai-prompt-icon">
              ✦
            </div>


            <textarea
              className="ai-prompt-input"

              placeholder={
                "Example: I want to learn Python. " +
                "I know the basics and want to become " +
                "good at building real projects..."
              }

              rows="4"

              value={aiPrompt}

              onChange={(event) => {

                setAiPrompt(
                  event.target.value
                );

                if (aiError) {
                  setAiError("");
                }

              }}

              disabled={
                generatingPath
              }

            />


            <div className="ai-prompt-footer">

              <span>
                AI will analyze your goal and
                create a personalized path.
              </span>


              <button
                type="button"
                className="generate-path-btn"

                onClick={
                  handleGenerateLearningPath
                }

                disabled={
                  generatingPath ||
                  !aiPrompt.trim()
                }
              >

                {generatingPath
                  ? "Generating..."
                  : "Generate Learning Path"}

                <span>
                  →
                </span>

              </button>

            </div>


            {/* ERROR */}

            {aiError && (

              <div className="ai-error">

                {aiError}

              </div>

            )}

          </div>

        </section>


        {/* =================================================
            GENERATED LEARNING PATH
        ================================================= */}

        {learningPath && (

          <section className="learning-path-section">


            <div className="section-header">

              <div>

                <span className="section-eyebrow">
                  AI GENERATED
                </span>


                <h2>
                  {learningPath.course_title}
                </h2>


                <p>
                  {learningPath.description}
                </p>

              </div>


              <div className="generated-course-level">

                {learningPath.level}

              </div>

            </div>


            {/* COURSE INFORMATION */}

            <div className="generated-course-info">


              <div className="generated-info-card">

                <span>
                  📂
                </span>

                <div>

                  <strong>
                    Category
                  </strong>

                  <p>
                    {learningPath.category}
                  </p>

                </div>

              </div>


              <div className="generated-info-card">

                <span>
                  ⏱
                </span>

                <div>

                  <strong>
                    Estimated Time
                  </strong>

                  <p>
                    {learningPath.estimated_hours}
                    {" "}
                    hours
                  </p>

                </div>

              </div>


              <div className="generated-info-card">

                <span>
                  📚
                </span>

                <div>

                  <strong>
                    Levels
                  </strong>

                  <p>
                    {learningPath.levels?.length || 0}
                  </p>

                </div>

              </div>

            </div>


            {/* LEVELS */}

            <div className="generated-levels">

              {learningPath.levels?.map(
                (level, levelIndex) => (

                  <div
                    className="generated-level"
                    key={
                      `${level.title}-${levelIndex}`
                    }
                  >

                    <div className="generated-level-header">

                      <div className="level-number">
                        {levelIndex + 1}
                      </div>


                      <div>

                        <span>
                          LEVEL {levelIndex + 1}
                        </span>

                        <h3>
                          {level.title}
                        </h3>

                      </div>

                    </div>


                    <div className="generated-chapters">

                      {level.chapters?.map(
                        (
                          chapter,
                          chapterIndex
                        ) => (

                          <div
                            className="generated-chapter"
                            key={
                              `${chapter.title}-${chapterIndex}`
                            }
                          >

                            <div className="generated-chapter-header">

                              <span>
                                {chapterIndex + 1}
                              </span>

                              <strong>
                                {chapter.title}
                              </strong>

                            </div>


                            <div className="generated-lessons">

                              {chapter.lessons?.map(
                                (
                                  lesson,
                                  lessonIndex
                                ) => (

                                  <div
                                    className="generated-lesson"
                                    key={
                                      `${lesson.title}-${lessonIndex}`
                                    }
                                  >

                                    <div className="lesson-icon">
                                      ✓
                                    </div>


                                    <div className="lesson-info">

                                      <strong>
                                        {lesson.title}
                                      </strong>


                                      {lesson.description && (

                                        <p>
                                          {lesson.description}
                                        </p>

                                      )}


                                      <div className="lesson-meta">

                                        <span>
                                          ⏱ {lesson.duration} min
                                        </span>

                                        <span>
                                          ⚡ {lesson.xp} XP
                                        </span>

                                      </div>

                                    </div>

                                  </div>

                                )
                              )}

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )
              )}

            </div>


            {/* ACTIONS */}

            <div className="learning-path-actions">

              <button
                type="button"
                className="save-learning-path-btn"

                onClick={
                  handleSaveLearningPath
                }

                disabled={
                  savingPath ||
                  savedCourseId !== null
                }
              >

                {savingPath
                  ? "Saving..."
                  : savedCourseId
                  ? "✓ Course Saved"
                  : "Save Learning Path"}

              </button>


              {savedCourseId && (

                <button
                  type="button"
                  className="view-course-btn"

                  onClick={() => {

                    navigate(
                      `/courses/${savedCourseId}`
                    );

                  }}
                >

                  Open Course →

                </button>

              )}


              <button
                type="button"
                className="clear-path-btn"

                onClick={
                  handleClearLearningPath
                }
              >

                Clear

              </button>

            </div>


            {/* SUCCESS */}

            {saveMessage && (

              <div className="ai-success">

                ✓ {saveMessage}

              </div>

            )}

          </section>

        )}


        {/* =================================================
            EMPTY LEARNING PATH
        ================================================= */}

        {!learningPath && (

          <section className="learning-path-section">

            <div className="section-header">

              <div>

                <span className="section-eyebrow">
                  YOUR JOURNEY
                </span>

                <h2>
                  Personalized Learning Path
                </h2>

                <p>
                  Your AI-generated learning journey
                  will appear here.
                </p>

              </div>

            </div>


            <div className="empty-learning-path">

              <div className="empty-path-icon">
                ✦
              </div>

              <h3>
                Your learning path starts here
              </h3>

              <p>
                Tell the AI what you want to learn
                above, and we'll build a course
                specifically for you.
              </p>

            </div>

          </section>

        )}


        {/* =================================================
            STATS
        ================================================= */}

        <section className="stats-section">


          {/* STREAK */}

          <div className="stat-card">

            <span>
              🔥
            </span>

            <div>

              <strong>
                7
              </strong>

              <p>
                Day Streak
              </p>

            </div>

          </div>


          {/* XP */}

          <div className="stat-card">

            <span>
              ⚡
            </span>

            <div>

              <strong>

                {progressLoading
                  ? "..."
                  : progress.total_xp}

              </strong>

              <p>
                Total XP
              </p>

            </div>

          </div>


          {/* LESSONS */}

          <div className="stat-card">

            <span>
              📚
            </span>

            <div>

              <strong>

                {progressLoading
                  ? "..."
                  : progress.completed_lessons}

              </strong>

              <p>
                Lessons Completed
              </p>

            </div>

          </div>


          {/* CERTIFICATES */}

          <div className="stat-card">

            <span>
              🏆
            </span>

            <div>

              <strong>
                {completedCoursesCount}
              </strong>

              <p>
                Certificates
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>

  );
}


// =====================================================
// APP
// =====================================================

function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* LOGIN */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* REGISTER */}

        <Route
          path="/register"
          element={<Register />}
        />


        {/* DASHBOARD */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* MY COURSES */}

        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <MyCourses />
            </ProtectedRoute>
          }
        />


        {/* COURSE DETAILS */}

        <Route
          path="/courses/:courseId"
          element={
            <ProtectedRoute>
              <CourseDetails />
            </ProtectedRoute>
          }
        />


        {/* LESSON */}

        <Route
          path="/lessons/:lessonId"
          element={
            <ProtectedRoute>
              <Lesson />
            </ProtectedRoute>
          }
        />


        {/* PROGRESS */}

        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          }
        />


        {/* AI TUTOR */}

        <Route
          path="/ai-tutor"
          element={
            <ProtectedRoute>
              <AITutor />
            </ProtectedRoute>
          }
        />


        {/* QUIZ */}

        <Route
          path="/quiz/:lessonId"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />


        {/* CERTIFICATES */}

        <Route
          path="/certificates"
          element={
            <ProtectedRoute>
              <Certificates />
            </ProtectedRoute>
          }
        />


        {/* SETTINGS */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />


        {/* UNKNOWN URL */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  );

}


export default App;