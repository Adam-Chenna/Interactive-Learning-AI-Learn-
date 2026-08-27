
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      console.log(
        "API URL:",
        import.meta.env.VITE_API_URL
      );

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        throw new Error(
          data.detail || "Login failed"
        );
      }

      // Get JWT token
      const token = data.access_token;

      console.log("LOGIN TOKEN:", token);

      // Make sure backend actually returned a token
      if (
        !token ||
        token === "undefined" ||
        token === "null"
      ) {
        throw new Error(
          "Login successful, but server did not return a valid access token."
        );
      }

      // Save token
      localStorage.setItem(
        "access_token",
        token
      );

      // Save user name
      localStorage.setItem(
        "user_name",
        data.user.name
      );

      console.log(
        "TOKEN SAVED:",
        localStorage.getItem("access_token")
      );

      // Go to dashboard
      navigate("/");

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="auth-logo">

          <div className="logo-icon">
            L
          </div>

          <h1>
            LearnAI
          </h1>

        </div>


        {/* =================================================
            TITLE
        ================================================= */}

        <h2>
          Welcome back
        </h2>

        <p className="auth-subtitle">
          Login to continue learning.
        </p>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}


        {/* =================================================
            LOGIN FORM
        ================================================= */}

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
            />

            {/* =================================================
                PROFESSIONAL EYE TOGGLE
            ================================================= */}

            <button
              type="button"
              className="password-eye"
              onClick={() =>
                setShowPassword(
                  (previous) => !previous
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


          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>


        {/* =================================================
            FOOTER
        ================================================= */}

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

