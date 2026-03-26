import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setAuth } from "../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [lottieReady, setLottieReady] = useState(false);

  useEffect(() => {
    // Load lottie-player script dynamically
    if (!customElements.get("lottie-player")) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";
      script.onload = () => setLottieReady(true);
      document.head.appendChild(script);
    } else {
      setLottieReady(true);
    }
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.email || !formData.password) {
      setError("Please fill all fields.");
      return;
    }
    try {
      setLoading(true);
      const res  = await api.post("/auth/login/", formData);
      const data = await res.json();
      if (!res.ok) {
        setError(data.non_field_errors?.[0] || data.detail || "Login failed.");
        return;
      }
      setAuth(data);
      navigate("/profile");
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* Left Side */}
      <div className="auth-left">
        <div className="lottie-wrap">
          {lottieReady ? (
            <lottie-player
              src="https://assets3.lottiefiles.com/packages/lf20_DMgKk1.json"
              background="transparent"
              speed="1"
              style={{ width: "280px", height: "280px" }}
              loop
              autoplay
            />
          ) : (
            <div className="lottie-fallback">🎓</div>
          )}
        </div>
        <h1>Bihar Skill Hub</h1>
        <p>Upskill yourself with industry-ready courses and build your future.</p>
      </div>

      {/* Right Side */}
      <div className="auth-right">
        <div className="auth-card">
          <h2>Welcome Back 👋</h2>
          <p className="auth-subtitle">Login to continue learning</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email Address</label>
              <input
                type="email" name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="auth-field">
              <label>Password</label>
              <input
                type="password" name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Logging in…" : "Login"}
            </button>
          </form>

          <p className="auth-toggle">
            New user? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;