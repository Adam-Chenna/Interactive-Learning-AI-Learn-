import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

        <div className="auth-logo">
          <div className="logo-icon">
            L
          </div>

          <h1>LearnAI</h1>
        </div>

        <h2>Welcome back</h2>

        <p className="auth-subtitle">
          Login to continue learning.
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

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