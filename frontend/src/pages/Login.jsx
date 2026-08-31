import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // HANDLE BACKEND ERROR
  // =====================================================

  const getErrorMessage = (data) => {
    if (!data) {
      return "Login failed";
    }

    // Normal FastAPI error
    if (typeof data.detail === "string") {
      return data.detail;
    }

    // FastAPI 422 validation error
    if (Array.isArray(data.detail)) {
      return data.detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item?.msg) {
            const location = Array.isArray(item.loc)
              ? item.loc.join(" → ")
              : "";

            return location
              ? `${location}: ${item.msg}`
              : item.msg;
          }

          return JSON.stringify(item);
        })
        .join("\n");
    }

    // Object error
    if (typeof data.detail === "object") {
      return JSON.stringify(data.detail);
    }

    return "Login failed";
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL;

      console.log("API URL:", apiUrl);

      if (!apiUrl) {
        throw new Error(
          "VITE_API_URL is not configured."
        );
      }

      const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/auth/login`,
  {
    method: "POST",

    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },

    body: new URLSearchParams({
      username: email.trim(),
      password: password,
    }),
  }
);

      // =================================================
      // READ RESPONSE SAFELY
      // =================================================

      const text = await response.text();

      let data = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        data = {
          detail:
            text || "Invalid server response",
        };
      }

      console.log(
        "LOGIN STATUS:",
        response.status
      );

      console.log(
        "LOGIN RESPONSE:",
        data
      );

      // =================================================
      // ERROR
      // =================================================

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data)
        );
      }

      // =================================================
      // TOKEN
      // =================================================

      const token =
        data.access_token;

      console.log(
        "LOGIN TOKEN:",
        token
      );

      if (
        !token ||
        token === "undefined" ||
        token === "null"
      ) {
        throw new Error(
          "Login successful, but server did not return an access token."
        );
      }

      // =================================================
      // SAVE TOKEN
      // =================================================

      localStorage.setItem(
        "access_token",
        token
      );

      // =================================================
      // SAVE USER NAME
      // =================================================

      if (data.user?.name) {
        localStorage.setItem(
          "user_name",
          data.user.name
        );
      }

      console.log(
        "TOKEN SAVED:",
        localStorage.getItem(
          "access_token"
        )
      );

      // =================================================
      // GO DASHBOARD
      // =================================================

      navigate("/");

    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        error?.message ||
        "Something went wrong while logging in."
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* LOGO */}

        <div className="auth-logo">

          <div className="logo-icon">
            L
          </div>

          <h1>
            LearnAI
          </h1>

        </div>


        {/* TITLE */}

        <h2>
          Welcome back
        </h2>

        <p className="auth-subtitle">
          Login to continue learning.
        </p>


        {/* ERROR */}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}


        {/* FORM */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <label>
            Email
          </label>

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            disabled={loading}
          />


          {/* PASSWORD */}

          <label>
            Password
          </label>

          <div className="password-input-wrapper">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              disabled={loading}
            />

            <button
              type="button"
              className="password-eye"
              onClick={() =>
                setShowPassword(
                  (previous) =>
                    !previous
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              title={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              disabled={loading}
            >

              {showPassword ? (
                <EyeOff
                  size={19}
                  strokeWidth={1.8}
                />
              ) : (
                <Eye
                  size={19}
                  strokeWidth={1.8}
                />
              )}

            </button>

          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={
              loading ||
              !email.trim() ||
              !password
            }
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>


        {/* FOOTER */}

        <p className="auth-footer">

          Don't have an account?{" "}

          <Link to="/register">
            Create one
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;