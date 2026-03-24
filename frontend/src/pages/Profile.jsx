import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getUser, clearAuth } from "../utils/api";

const TABS = [
  { key: "courses",      label: "My Courses",       icon: "📚" },
  { key: "certificates", label: "Certificates",      icon: "🏆" },
  { key: "offerletters", label: "Offer Letters",     icon: "📄" },
  { key: "quizzes",      label: "Quiz Results",      icon: "📝" },
  { key: "editprofile",  label: "Edit Profile",      icon: "👤" },
  { key: "password",     label: "Change Password",   icon: "🔒" },
];

const LEVEL_COLORS = {
  beginner:     { bg: "#d1fae5", color: "#065f46" },
  intermediate: { bg: "#dbeafe", color: "#1e40af" },
  advanced:     { bg: "#ede9fe", color: "#5b21b6" },
};

export default function Profile() {
  const navigate  = useNavigate();
  const user      = getUser();
  const [activeTab, setActiveTab]     = useState("courses");
  const [enrollments, setEnrollments] = useState([]);
  const [certs, setCerts]             = useState([]);
  const [attempts, setAttempts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [profileData, setProfileData] = useState({ full_name: "", phone: "", bio: "" });
  const [pwData, setPwData]           = useState({ old_password: "", new_password: "", confirm: "" });
  const [saving, setSaving]           = useState(false);
  const [msg, setMsg]                 = useState({ type: "", text: "" });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    setProfileData({ full_name: user.full_name || "", phone: user.phone || "", bio: user.bio || "" });
    const load = async () => {
      try {
        const [eRes, cRes, aRes] = await Promise.all([
          api.get("/enrollments/my/"),
          api.get("/certificates/my/"),
          api.get("/quizzes/my-attempts/"),
        ]);
        const eData = await eRes.json();
        const cData = await cRes.json();
        const aData = await aRes.json();
        setEnrollments(eData.results ?? eData);
        setCerts(cData.results ?? cData);
        setAttempts(aData.results ?? aData);
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 4000);
  };

  const downloadPDF = async (cert) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/certificates/${cert.id}/download/`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );
      if (!res.ok) { showMsg("error", "Download failed."); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${cert.cert_type === "offer_letter" ? "offer_letter" : "certificate"}_${cert.course_title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { showMsg("error", "Download error."); }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch("/auth/profile/", profileData);
      if (res.ok) {
        const updated = await res.json();
        localStorage.setItem("user", JSON.stringify({ ...user, ...updated }));
        showMsg("success", "Profile updated successfully!");
      } else {
        showMsg("error", "Failed to update profile.");
      }
    } catch { showMsg("error", "Network error."); }
    finally { setSaving(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwData.new_password !== pwData.confirm) {
      showMsg("error", "New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post("/auth/change-password/", {
        old_password: pwData.old_password,
        new_password: pwData.new_password,
      });
      if (res.ok) {
        showMsg("success", "Password changed successfully!");
        setPwData({ old_password: "", new_password: "", confirm: "" });
      } else {
        const d = await res.json();
        showMsg("error", d.old_password?.[0] || d.detail || "Failed to change password.");
      }
    } catch { showMsg("error", "Network error."); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) await api.post("/auth/logout/", { refresh }).catch(() => {});
    clearAuth();
    navigate("/login");
  };

  // ── Courses Tab ──────────────────────────────────────────────────────────────
  const CoursesTab = () => (
    <div className="tab-content">
      <h2>My Courses</h2>
      {loading ? <p className="tab-loading">Loading...</p> :
       enrollments.length === 0 ? (
        <div className="empty-tab">
          <p>📚 You haven't enrolled in any courses yet.</p>
          <button onClick={() => navigate("/courses")}>Browse Courses</button>
        </div>
      ) : (
        <div className="profile-course-list">
          {enrollments.map((e) => (
            <div className="profile-course-card" key={e.id}>
              <div className="pcc-header">
                <div>
                  <h3>{e.course_detail?.title}</h3>
                  <span className="pcc-category">{e.course_detail?.category_name}</span>
                </div>
                <span className={`enrollment-status status-${e.status}`}>{e.status}</span>
              </div>
              <div className="pcc-meta">
                <span>⏱ {e.course_detail?.duration_hours}h</span>
                <span
                  className="card-level"
                  style={LEVEL_COLORS[e.course_detail?.level] || {}}
                >{e.course_detail?.level}</span>
              </div>
              <div className="progress-wrap">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${e.completion_percentage}%` }} />
                </div>
                <span>{e.completion_percentage}% complete</span>
              </div>
              <div className="pcc-actions">
                <button className="btn-primary" onClick={() => navigate(`/course/${e.course}`)}>
                  Continue Learning
                </button>
                {e.status === "active" && (
                  <button className="btn-secondary" onClick={() => navigate(`/quiz/${e.course}`)}>
                    Take Quiz
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Certificates Tab ─────────────────────────────────────────────────────────
  const CertificatesTab = () => {
    const certificates = certs.filter((c) => c.cert_type === "certificate");
    return (
      <div className="tab-content">
        <h2>My Certificates</h2>
        {loading ? <p className="tab-loading">Loading...</p> :
         certificates.length === 0 ? (
          <div className="empty-tab">
            <p>🏆 No certificates yet. Complete a course quiz to earn one!</p>
            <button onClick={() => setActiveTab("courses")}>View My Courses</button>
          </div>
        ) : (
          <div className="cert-grid">
            {certificates.map((cert) => (
              <div className="cert-card-profile" key={cert.id}>
                <div className="cert-badge">🏆</div>
                <div className="cert-details">
                  <h3>Certificate of Completion</h3>
                  <p className="cert-course">{cert.course_title}</p>
                  <p className="cert-date">
                    Issued: {new Date(cert.issued_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </p>
                </div>
                <button className="download-pdf-btn" onClick={() => downloadPDF(cert)}>
                  ⬇ Download PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Offer Letters Tab ────────────────────────────────────────────────────────
  const OfferLettersTab = () => {
    const offers = certs.filter((c) => c.cert_type === "offer_letter");
    return (
      <div className="tab-content">
        <h2>Offer Letters</h2>
        {loading ? <p className="tab-loading">Loading...</p> :
         offers.length === 0 ? (
          <div className="empty-tab">
            <p>📄 No offer letters yet. They are issued by admin upon course completion.</p>
          </div>
        ) : (
          <div className="cert-grid">
            {offers.map((cert) => (
              <div className="cert-card-profile offer" key={cert.id}>
                <div className="cert-badge">📄</div>
                <div className="cert-details">
                  <h3>Offer Letter</h3>
                  <p className="cert-course">{cert.course_title}</p>
                  {cert.role && <p className="cert-role">Role: {cert.role}</p>}
                  {cert.start_date && <p className="cert-date">Start Date: {cert.start_date}</p>}
                  <p className="cert-date">
                    Issued: {new Date(cert.issued_at).toLocaleDateString("en-IN", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </p>
                </div>
                <button className="download-pdf-btn offer-btn" onClick={() => downloadPDF(cert)}>
                  ⬇ Download PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Quiz Results Tab ─────────────────────────────────────────────────────────
  const QuizResultsTab = () => (
    <div className="tab-content">
      <h2>Quiz Results</h2>
      {loading ? <p className="tab-loading">Loading...</p> :
       attempts.length === 0 ? (
        <div className="empty-tab">
          <p>📝 No quiz attempts yet.</p>
          <button onClick={() => setActiveTab("courses")}>View My Courses</button>
        </div>
      ) : (
        <div className="quiz-results-list">
          {attempts.map((a) => (
            <div className="quiz-result-card-profile" key={a.id}>
              <div className="qrc-left">
                <h3>Quiz #{a.quiz}</h3>
                <p className="qrc-date">
                  {a.submitted_at
                    ? new Date(a.submitted_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })
                    : "In Progress"}
                </p>
              </div>
              <div className="qrc-right">
                <div className={`score-circle ${a.passed ? "pass" : "fail"}`}>
                  {a.score !== null ? `${a.score}%` : "—"}
                </div>
                <span className={`result-badge ${a.passed ? "passed" : "failed"}`}>
                  {a.status === "in_progress" ? "In Progress" : a.passed ? "Passed ✅" : "Failed ❌"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── Edit Profile Tab ─────────────────────────────────────────────────────────
  const EditProfileTab = () => (
    <div className="tab-content">
      <h2>Edit Profile</h2>
      {msg.text && <div className={`profile-msg ${msg.type}`}>{msg.text}</div>}
      <form className="profile-form" onSubmit={handleProfileSave}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text" value={profileData.full_name}
            onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
            placeholder="Your full name"
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={user?.email} disabled className="disabled-input" />
          <small>Email cannot be changed</small>
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="text" value={profileData.phone}
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            placeholder="Your phone number"
          />
        </div>
        <div className="form-group">
          <label>Bio</label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            placeholder="Tell us about yourself"
            rows={4}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );

  // ── Change Password Tab ──────────────────────────────────────────────────────
  const ChangePasswordTab = () => (
    <div className="tab-content">
      <h2>Change Password</h2>
      {msg.text && <div className={`profile-msg ${msg.type}`}>{msg.text}</div>}
      <form className="profile-form" onSubmit={handlePasswordSave}>
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password" value={pwData.old_password}
            onChange={(e) => setPwData({ ...pwData, old_password: e.target.value })}
            placeholder="Enter current password"
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input
            type="password" value={pwData.new_password}
            onChange={(e) => setPwData({ ...pwData, new_password: e.target.value })}
            placeholder="Min 8 characters"
          />
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password" value={pwData.confirm}
            onChange={(e) => setPwData({ ...pwData, confirm: e.target.value })}
            placeholder="Repeat new password"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );

  const CONTENT = {
    courses:      <CoursesTab />,
    certificates: <CertificatesTab />,
    offerletters: <OfferLettersTab />,
    quizzes:      <QuizResultsTab />,
    editprofile:  <EditProfileTab />,
    password:     <ChangePasswordTab />,
  };

  return (
    <div className="profile-page">

      {/* Left Sidebar */}
      <aside className="profile-sidebar">

        {/* User Info */}
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <h3>{user?.full_name}</h3>
          <p>{user?.email}</p>
          <span className="role-badge">{user?.role}</span>
        </div>

        {/* Stats */}
        <div className="profile-stats">
          <div className="ps-stat">
            <strong>{enrollments.length}</strong>
            <span>Courses</span>
          </div>
          <div className="ps-stat">
            <strong>{certs.filter(c => c.cert_type === "certificate").length}</strong>
            <span>Certs</span>
          </div>
          <div className="ps-stat">
            <strong>{attempts.filter(a => a.passed).length}</strong>
            <span>Passed</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="profile-nav">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`profile-nav-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="nav-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button className="profile-logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>

      </aside>

      {/* Right Content */}
      <main className="profile-main">
        {CONTENT[activeTab]}
      </main>

    </div>
  );
}
