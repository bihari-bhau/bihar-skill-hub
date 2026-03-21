import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setAuth } from "../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

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
      navigate("/dashboard");
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome Back</h2>
        <p className="form-subtitle">Login to continue learning</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email" name="email" placeholder="Email Address"
            value={formData.email} onChange={handleChange}
          />
          <input
            type="password" name="password" placeholder="Password"
            value={formData.password} onChange={handleChange}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        <p className="form-footer">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
