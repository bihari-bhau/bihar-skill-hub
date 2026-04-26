import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../utils/api";

/*
  3-Step Registration Flow:
  Step 1 → Enter email + send OTP
  Step 2 → Enter 6-digit OTP
  Step 3 → Fill name, phone, password → register
*/

const LOTTIE_URL = "https://assets5.lottiefiles.com/packages/lf20_jcikwtux.json";

export default function Register() {
  const navigate  = useNavigate();
  const lottieRef = useRef(null);

  const [step,     setStep]    = useState(1);
  const [loading,  setLoading] = useState(false);
  const [error,    setError]   = useState("");
  const [success,  setSuccess] = useState("");
  const [timer,    setTimer]   = useState(0);
  const [showPass, setShowPass] = useState(false);

  // Form data
  const [email,    setEmail]    = useState("");
  const [otp,      setOtp]      = useState(["", "", "", "", "", ""]);
  const [form,     setForm]     = useState({
    full_name: "", phone: "", password: "", confirm_password: ""
  });

  const otpRefs = useRef([]);

  // Load Lottie
  useEffect(() => {
    if (lottieRef.current) {
      const script = document.createElement("script");
      script.src   = "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";
      document.body.appendChild(script);
    }
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // ── Step 1: Send OTP ────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e?.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email."); return; }

    setLoading(true); setError(""); setSuccess("");
    try {
      const res  = await api.post("/auth/send-otp/", { email }, false);
      const data = await res.json();
      if (res.ok) {
        setSuccess(`OTP sent to ${email}! Check your inbox.`);
        setStep(2);
        setTimer(60);
      } else {
        setError(data.error || "Failed to send OTP. Try again.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────
  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (!value && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    const otpStr = otp.join("");
    if (otpStr.length !== 6) { setError("Please enter the complete 6-digit OTP."); return; }

    setLoading(true); setError(""); setSuccess("");
    try {
      const res  = await api.post("/auth/verify-otp/", { email, otp: otpStr }, false);
      const data = await res.json();
      if (res.ok && data.verified) {
        setSuccess("Email verified! Now complete your registration.");
        setStep(3);
      } else {
        setError(data.error || "Invalid OTP. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const res  = await api.post("/auth/resend-otp/", { email }, false);
      const data = await res.json();
      if (res.ok) { setSuccess("New OTP sent!"); setTimer(60); setOtp(["","","","","",""]); }
      else setError(data.error || "Failed to resend OTP.");
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify when all 6 digits filled
  useEffect(() => {
    if (otp.join("").length === 6 && step === 2) {
      handleVerifyOTP();
    }
  }, [otp]);

  // ── Step 3: Complete Registration ───────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!form.full_name.trim())                      { setError("Full name is required."); return; }
    if (!form.password)                               { setError("Password is required."); return; }
    if (form.password.length < 8)                    { setError("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirm_password)     { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const res  = await api.post("/auth/register/", {
        email,
        full_name: form.full_name,
        phone:     form.phone,
        password:  form.password,
      }, false);
      const data = await res.json();
      if (res.ok) {
        setSuccess("🎉 Account created! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        const firstError = Object.values(data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError || "Registration failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step indicators ─────────────────────────────────────────────────────
  const STEPS = ["Email", "Verify OTP", "Complete"];

  return (
    <div className="auth-page">

      {/* Left — Lottie */}
      <div className="auth-left">
        <div ref={lottieRef}>
          <lottie-player
            src={LOTTIE_URL}
            background="transparent"
            speed="1"
            loop autoplay
            style={{ width: "280px", height: "280px" }}
          />
        </div>
        <h1>Join Bihar Skill Hub</h1>
        <p>Create your account in 3 simple steps and start your tech career journey today!</p>

        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          {["✅ Free courses available", "🏆 Certificate on completion", "📄 Offer letter included"].map(t => (
            <span key={t} style={{ color: "#bfdbfe", fontSize: 14 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Right — Form */}
      <div className="auth-right">
        <div className="auth-card">

          {/* Step indicator */}
          <div className="step-indicator" style={{ marginBottom: 20 }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`step-dot ${step > i ? "done" : step === i + 1 ? "done" : ""}`}
                  style={{ background: step > i + 1 ? "#10b981" : step === i + 1 ? "#1d4ed8" : "#e2e8f0",
                           color: step >= i + 1 ? "#fff" : "#94a3b8" }}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                {i < 2 && <div className="step-line" style={{ background: step > i + 1 ? "#10b981" : "#e2e8f0" }} />}
              </React.Fragment>
            ))}
          </div>

          {/* Title */}
          <h2 style={{ textAlign: "center", fontSize: "1.4rem", color: "#1e293b", marginBottom: 4 }}>
            {step === 1 ? "Create Account" : step === 2 ? "Verify Your Email" : "Complete Profile"}
          </h2>
          <p className="auth-subtitle">
            {step === 1 ? "Enter your email to get started" :
             step === 2 ? `We sent a 6-digit OTP to ${email}` :
             "Just a few more details!"}
          </p>

          {/* Messages */}
          {error   && <div className="auth-error">{error}</div>}
          {success && <div style={{ background: "#d1fae5", color: "#065f46", border: "1px solid #86efac", borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontSize: 13, textAlign: "center" }}>{success}</div>}

          {/* ── STEP 1: Email ─────────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handleSendOTP}>
              <div className="auth-field">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  required autoFocus
                />
              </div>
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP →"}
              </button>
              <div className="auth-toggle" style={{ marginTop: 16 }}>
                Already have an account? <Link to="/login">Login here</Link>
              </div>
            </form>
          )}

          {/* ── STEP 2: OTP ──────────────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              {/* 6-digit OTP boxes */}
              <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "20px 0" }}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOTPChange(i, e.target.value)}
                    onKeyDown={e => handleOTPKeyDown(i, e)}
                    style={{
                      width: 48, height: 56,
                      textAlign: "center",
                      fontSize: 22, fontWeight: 700,
                      border: `2px solid ${digit ? "#1d4ed8" : "#e2e8f0"}`,
                      borderRadius: 10,
                      outline: "none",
                      transition: "border .2s",
                      background: digit ? "#eff6ff" : "#fff",
                      color: "#1e293b",
                    }}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <button type="submit" className="auth-btn" disabled={loading || otp.join("").length !== 6}>
                {loading ? "Verifying..." : "Verify OTP ✓"}
              </button>

              {/* Resend */}
              <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#64748b" }}>
                Didn't receive OTP?{" "}
                {timer > 0
                  ? <span style={{ color: "#94a3b8" }}>Resend in {timer}s</span>
                  : <button type="button" onClick={handleResendOTP} disabled={loading}
                      style={{ background: "none", border: "none", color: "#1d4ed8", fontWeight: 600, cursor: "pointer" }}>
                      Resend OTP
                    </button>
                }
              </div>

              {/* Change email */}
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <button type="button" onClick={() => { setStep(1); setOtp(["","","","","",""]); setError(""); }}
                  style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>
                  ← Change email
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3: Complete Registration ────────────────────────── */}
          {step === 3 && (
            <form onSubmit={handleRegister}>
              <div className="auth-field">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={form.full_name}
                  onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  required autoFocus
                />
              </div>
              <div className="auth-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="auth-field">
                <label>Email</label>
                <input type="email" value={email} disabled
                  style={{ background: "#f8fafc", color: "#64748b", cursor: "not-allowed" }} />
              </div>
              <div className="auth-field">
                <label>Password *</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required
                    style={{ paddingRight: 40 }}
                  />
                  <button type="button"
                    onClick={() => setShowPass(p => !p)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>
              <div className="auth-field">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirm_password}
                  onChange={e => setForm(p => ({ ...p, confirm_password: e.target.value }))}
                  required
                />
              </div>

              {/* Password strength */}
              {form.password && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ height: 4, borderRadius: 2, background: "#e2e8f0", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 2, transition: "width .3s",
                      width: form.password.length < 6 ? "33%" : form.password.length < 10 ? "66%" : "100%",
                      background: form.password.length < 6 ? "#ef4444" : form.password.length < 10 ? "#f59e0b" : "#10b981",
                    }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    {form.password.length < 6 ? "Weak" : form.password.length < 10 ? "Medium" : "Strong"}
                  </span>
                </div>
              )}

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? "Creating Account..." : "🎓 Create My Account"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}