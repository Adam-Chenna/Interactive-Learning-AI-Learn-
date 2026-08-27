import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState(
    localStorage.getItem("user_name") || "Student"
  );

  const [userEmail, setUserEmail] = useState(
    localStorage.getItem("user_email") || ""
  );

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("dark_mode") !== "false"
  );

  const [animations, setAnimations] = useState(
    localStorage.getItem("animations") !== "false"
  );

  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") !== "false"
  );

  const [aiNotifications, setAiNotifications] = useState(
    localStorage.getItem("ai_notifications") !== "false"
  );

  const [saved, setSaved] = useState(false);

  // =========================
  // LOAD USER INFO
  // =========================

  useEffect(() => {
    const storedName =
      localStorage.getItem("user_name");

    const storedEmail =
      localStorage.getItem("user_email");

    if (storedName) {
      setUserName(storedName);
    }

    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  // =========================
  // SAVE SETTINGS
  // =========================

  const saveSettings = () => {
    localStorage.setItem(
      "user_name",
      userName
    );

    localStorage.setItem(
      "user_email",
      userEmail
    );

    localStorage.setItem(
      "dark_mode",
      darkMode
    );

    localStorage.setItem(
      "animations",
      animations
    );

    localStorage.setItem(
      "notifications",
      notifications
    );

    localStorage.setItem(
      "ai_notifications",
      aiNotifications
    );

    document.body.classList.toggle(
      "reduced-motion",
      !animations
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2200);
  };

  // =========================
  // TOGGLE ANIMATION
  // =========================

  const toggleAnimations = () => {
    const newValue = !animations;

    setAnimations(newValue);

    localStorage.setItem(
      "animations",
      newValue
    );

    document.body.classList.toggle(
      "reduced-motion",
      !newValue
    );
  };

  // =========================
  // TOGGLE DARK MODE
  // =========================

  const toggleDarkMode = () => {
    const newValue = !darkMode;

    setDarkMode(newValue);

    localStorage.setItem(
      "dark_mode",
      newValue
    );

    document.body.classList.toggle(
      "light-mode",
      !newValue
    );
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("access_token");

    navigate("/login");
  };

  // =========================
  // AVATAR
  // =========================

  const initial =
    userName?.charAt(0)?.toUpperCase() || "S";

  return (
    <div className="settings-page">

      {/* BACKGROUND DECORATION */}

      <div className="settings-glow settings-glow-one" />
      <div className="settings-glow settings-glow-two" />

      {/* HEADER */}

      <div className="settings-header">

        <button
          className="settings-back"
          onClick={() => navigate("/")}
        >
          ← Dashboard
        </button>

        <div>
          <span className="settings-label">
            ACCOUNT & PREFERENCES
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Customize your LearnAI experience.
          </p>
        </div>

      </div>

      {/* CONTENT */}

      <div className="settings-layout">

        {/* =========================
            PROFILE
        ========================= */}

        <section className="settings-card profile-settings">

          <div className="settings-card-header">

            <div className="settings-section-icon">
              👤
            </div>

            <div>
              <h2>
                Profile
              </h2>

              <p>
                Manage your learner information.
              </p>
            </div>

          </div>

          <div className="profile-preview">

            <div className="settings-avatar">
              {initial}
            </div>

            <div>
              <strong>
                {userName}
              </strong>

              <span>
                LearnAI Student
              </span>
            </div>

          </div>

          <div className="settings-form-grid">

            <div className="settings-field">

              <label>
                Display Name
              </label>

              <input
                type="text"
                value={userName}
                onChange={(e) =>
                  setUserName(e.target.value)
                }
                placeholder="Your name"
              />

            </div>

            <div className="settings-field">

              <label>
                Email Address
              </label>

              <input
                type="email"
                value={userEmail}
                onChange={(e) =>
                  setUserEmail(e.target.value)
                }
                placeholder="your@email.com"
              />

            </div>

          </div>

        </section>

        {/* =========================
            APPEARANCE
        ========================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-section-icon">
              🎨
            </div>

            <div>
              <h2>
                Appearance
              </h2>

              <p>
                Personalize how LearnAI looks.
              </p>
            </div>

          </div>

          <div className="settings-option">

            <div className="settings-option-icon">
              {darkMode ? "🌙" : "☀️"}
            </div>

            <div className="settings-option-content">

              <strong>
                Dark Mode
              </strong>

              <span>
                Keep the premium dark interface enabled.
              </span>

            </div>

            <button
              className={`settings-toggle ${
                darkMode ? "active" : ""
              }`}
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              <span />
            </button>

          </div>

        </section>

        {/* =========================
            EXPERIENCE
        ========================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-section-icon">
              ✨
            </div>

            <div>
              <h2>
                Experience
              </h2>

              <p>
                Control animations and interactions.
              </p>
            </div>

          </div>

          <div className="settings-option">

            <div className="settings-option-icon">
              ✨
            </div>

            <div className="settings-option-content">

              <strong>
                Interface Animations
              </strong>

              <span>
                Enable smooth transitions and micro-interactions.
              </span>

            </div>

            <button
              className={`settings-toggle ${
                animations ? "active" : ""
              }`}
              onClick={toggleAnimations}
              aria-label="Toggle animations"
            >
              <span />
            </button>

          </div>

        </section>

        {/* =========================
            NOTIFICATIONS
        ========================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-section-icon">
              🔔
            </div>

            <div>
              <h2>
                Notifications
              </h2>

              <p>
                Choose which learning updates you receive.
              </p>
            </div>

          </div>

          <div className="settings-option">

            <div className="settings-option-icon">
              📚
            </div>

            <div className="settings-option-content">

              <strong>
                Learning Reminders
              </strong>

              <span>
                Get reminders to continue your learning journey.
              </span>

            </div>

            <button
              className={`settings-toggle ${
                notifications ? "active" : ""
              }`}
              onClick={() =>
                setNotifications(!notifications)
              }
            >
              <span />
            </button>

          </div>

          <div className="settings-divider" />

          <div className="settings-option">

            <div className="settings-option-icon">
              🤖
            </div>

            <div className="settings-option-content">

              <strong>
                AI Tutor Updates
              </strong>

              <span>
                Receive helpful AI learning notifications.
              </span>

            </div>

            <button
              className={`settings-toggle ${
                aiNotifications ? "active" : ""
              }`}
              onClick={() =>
                setAiNotifications(!aiNotifications)
              }
            >
              <span />
            </button>

          </div>

        </section>

        {/* =========================
            SECURITY
        ========================= */}

        <section className="settings-card">

          <div className="settings-card-header">

            <div className="settings-section-icon">
              🔐
            </div>

            <div>
              <h2>
                Security
              </h2>

              <p>
                Manage your LearnAI session.
              </p>
            </div>

          </div>

          <div className="security-row">

            <div>

              <strong>
                Current Session
              </strong>

              <span>
                Your account is currently signed in.
              </span>

            </div>

            <span className="session-badge">
              ● Active
            </span>

          </div>

        </section>

        {/* =========================
            DANGER ZONE
        ========================= */}

        <section className="settings-card danger-card">

          <div className="settings-card-header">

            <div className="settings-section-icon danger-icon">
              ⚠
            </div>

            <div>
              <h2>
                Account Actions
              </h2>

              <p>
                Manage your current session.
              </p>
            </div>

          </div>

          <div className="danger-action">

            <div>
              <strong>
                Sign out of LearnAI
              </strong>

              <span>
                You can sign back in anytime using your account.
              </span>
            </div>

            <button
              className="danger-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </section>

      </div>

      {/* SAVE BAR */}

      <div className="settings-save-bar">

        <div>

          <span className="save-status-dot" />

          <span>
            Changes are saved locally
          </span>

        </div>

        <button
          className={`save-settings-button ${
            saved ? "saved" : ""
          }`}
          onClick={saveSettings}
        >
          {saved ? (
            <>
              ✓ Saved
            </>
          ) : (
            <>
              Save Changes →
            </>
          )}
        </button>

      </div>

    </div>
  );
}

export default Settings;