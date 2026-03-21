import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setAuth } from "../utils/api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "", email: "", password: "", password2: "",
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.full_name || !formData.email || !formData.password || !formData.password2) {
      setError("Please fill all fields.");
      return;
    }
    if (formData.password !== formData.password2) {
      setError("Passwords do not match.");
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
      navigate("/dashboard");
    } catch {
      setError("Network error. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Create Account</h2>
        <p className="form-subtitle">Join thousands of learners today</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text" name="full_name" placeholder="Full Name"
            value={formData.full_name} onChange={handleChange}
          />
          <input
            type="email" name="email" placeholder="Email Address"
            value={formData.email} onChange={handleChange}
          />
          <input
            type="password" name="password" placeholder="Password (min 8 chars)"
            value={formData.password} onChange={handleChange}
          />
          <input
            type="password" name="password2" placeholder="Confirm Password"
            value={formData.password2} onChange={handleChange}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className="form-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
