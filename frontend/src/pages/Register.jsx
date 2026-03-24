import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, setAuth } from "../utils/api";

const Register = () => {
  const navigate  = useNavigate();
  const [step, setStep]       = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "", email: "", password: "", password2: "",
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleNext = (e) => {
    e.preventDefault();
    setError("");
    if (!formData.full_name || !formData.email) {
      setError("Please fill all fields.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.password || !formData.password2) {
      setError("Please fill all fields.");
      return;
    }
    if (formData.password !== formData.password2) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      setLoading(true);
      const res  = await api.post("/auth/register/", formData);
      const data = await res.json();
      if (!res.ok) {
        const msg = Object.values(data).flat().join(" ");
        setError(msg || "Registration failed.");
        return;
      }
      setAuth(data);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/profile");
      }, 2500);
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
        <lottie-player
          src="https://assets10.lottiefiles.com/packages/lf20_tno6cg2w.json"
          background="transparent"
          speed="1"
          style={{ width: "260px", height: "260px" }}
          loop autoplay
        />
        <h1>Bihar Skill Hub</h1>
        <p>Join thousands of learners and build your future today.</p>
      </div>

      {/* Right Side */}
      <div className="auth-right">
        <div className="auth-card">
          <h2>Create Account 🚀</h2>
          <p className="auth-subtitle">Step {step} of 2</p>

          {/* Step indicator */}
          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? "done" : ""}`}>1</div>
            <div className={`step-line ${step === 2 ? "done" : ""}`} />
            <div className={`step-dot ${step === 2 ? "done" : ""}`}>2</div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleNext}>
              <div className="auth-field">
                <label>Full Name</label>
                <input
                  type="text" name="full_name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </div>
              <div className="auth-field">
                <label>Email Address</label>
                <input
                  type="email" name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="auth-btn">
                Next →
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div className="auth-field">
                <label>Password</label>
                <input
                  type="password" name="password"
                  placeholder="Min 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="auth-field">
                <label>Confirm Password</label>
                <input
                  type="password" name="password2"
                  placeholder="Repeat your password"
                  value={formData.password2}
                  onChange={handleChange}
                />
              </div>
              <div className="auth-two-btns">
                <button
                  type="button"
                  className="auth-btn-outline"
                  onClick={() => { setStep(1); setError(""); }}
                >
                  ← Back
                </button>
                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? "Creating…" : "Sign Up"}
                </button>
              </div>
            </form>
          )}

          <p className="auth-toggle">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <lottie-player
              src="https://assets2.lottiefiles.com/packages/lf20_jbrw3hcz.json"
              background="transparent"
              speed="1"
              style={{ width: "180px", height: "180px" }}
              autoplay
            />
            <h3>Registration Successful! 🎉</h3>
            <p>Welcome to Bihar Skill Hub!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;