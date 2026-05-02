// EmailPreferences.jsx
// Add this as a new tab inside Profile.jsx
// Shows email notification preferences for the student

import React, { useState } from "react";
import { api } from "../utils/api";

const PREFS = [
  {
    key: "enrollment_email",
    icon: "📚",
    title: "Course Enrollment",
    desc: "Get notified when you enroll in a course",
    default: true,
  },
  {
    key: "certificate_email",
    icon: "🏆",
    title: "Certificate Issued",
    desc: "Get notified when your certificate is ready",
    default: true,
  },
  {
    key: "offer_letter_email",
    icon: "📄",
    title: "Offer Letter",
    desc: "Get notified when your offer letter is issued",
    default: true,
  },
  {
    key: "quiz_result_email",
    icon: "📝",
    title: "Quiz Results",
    desc: "Get notified when your quiz is evaluated",
    default: true,
  },
  {
    key: "payment_email",
    icon: "💰",
    title: "Payment Confirmation",
    desc: "Get payment receipts via email",
    default: true,
  },
  {
    key: "promotional_email",
    icon: "🎯",
    title: "New Courses & Offers",
    desc: "Receive updates about new courses and discounts",
    default: false,
  },
];

export default function EmailPreferences() {
  const [prefs, setPrefs]   = useState(
    Object.fromEntries(PREFS.map(p => [p.key, p.default]))
  );
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState("");
  const [testSent, setTestSent] = useState(false);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save preferences to backend
      const res = await api.patch("/auth/profile/", { email_preferences: prefs });
      if (res.ok) {
        setMsg("✅ Preferences saved successfully!");
        setTimeout(() => setMsg(""), 3000);
      }
    } catch { setMsg("❌ Failed to save. Try again."); }
    finally { setSaving(false); }
  };

  const handleTestEmail = async () => {
    try {
      const res = await api.post("/auth/send-test-email/", {});
      if (res.ok) { setTestSent(true); setTimeout(() => setTestSent(false), 5000); }
    } catch { }
  };

  return (
    <div className="tab-content">
      <h2>📧 Email Preferences</h2>

      {msg && (
        <div style={{
          padding: "10px 16px", borderRadius: 8, marginBottom: 16,
          background: msg.includes("✅") ? "#d1fae5" : "#fee2e2",
          color: msg.includes("✅") ? "#065f46" : "#b91c1c",
          fontSize: 14, fontWeight: 600,
        }}>{msg}</div>
      )}

      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        Choose which email notifications you want to receive from Bihar Skill Hub.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
        {PREFS.map((pref) => (
          <div key={pref.key} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 20px", borderRadius: 12,
            background: prefs[pref.key] ? "#eff6ff" : "#f8fafc",
            border: `1.5px solid ${prefs[pref.key] ? "#93c5fd" : "#e2e8f0"}`,
            transition: "all .2s", cursor: "pointer",
          }} onClick={() => toggle(pref.key)}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: "1.6rem" }}>{pref.icon}</span>
              <div>
                <p style={{ fontWeight: 700, color: "#1e293b", margin: "0 0 2px", fontSize: 14 }}>
                  {pref.title}
                </p>
                <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>{pref.desc}</p>
              </div>
            </div>
            {/* Toggle Switch */}
            <div style={{
              width: 48, height: 26, borderRadius: 13,
              background: prefs[pref.key] ? "#1d4ed8" : "#cbd5e1",
              position: "relative", transition: "background .2s", flexShrink: 0,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: "50%",
                background: "#fff", position: "absolute",
                top: 3, transition: "left .2s",
                left: prefs[pref.key] ? 24 : 4,
                boxShadow: "0 2px 4px rgba(0,0,0,.2)",
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: "linear-gradient(135deg,#1e3a8a,#1d4ed8)",
            color: "#fff", border: "none", borderRadius: 10,
            padding: "12px 24px", fontSize: 14, fontWeight: 700,
            cursor: "pointer", opacity: saving ? .6 : 1,
          }}
        >
          {saving ? "Saving..." : "💾 Save Preferences"}
        </button>

        <button
          onClick={handleTestEmail}
          style={{
            background: "#fff", color: "#1d4ed8",
            border: "1.5px solid #1d4ed8", borderRadius: 10,
            padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}
        >
          {testSent ? "✅ Test Sent!" : "📧 Send Test Email"}
        </button>
      </div>

      <div style={{
        marginTop: 24, padding: "14px 16px",
        background: "#fffbeb", border: "1px solid #fde68a",
        borderRadius: 10, fontSize: 13, color: "#92400e",
      }}>
        💡 <strong>Note:</strong> Important emails like OTP, payment receipts,
        and security alerts will always be sent regardless of preferences.
      </div>
    </div>
  );
}
