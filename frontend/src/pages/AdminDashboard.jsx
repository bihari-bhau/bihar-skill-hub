import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getUser, clearAuth } from "../utils/api";

const TABS = [
  { key: "overview",      label: "Overview",       icon: "📊" },
  { key: "students",      label: "Students",        icon: "👥" },
  { key: "courses",       label: "Courses",         icon: "📚" },
  { key: "enrollments",   label: "Enrollments",     icon: "📋" },
  { key: "payments",      label: "Payments",        icon: "💰" },
  { key: "certificates",  label: "Certificates",    icon: "🏆" },
  { key: "quizzes",       label: "Quiz Results",    icon: "📝" },
];

export default function AdminDashboard() {
  const navigate  = useNavigate();
  const user      = getUser();
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData]           = useState({});
  const [loading, setLoading]     = useState(true);
  const [msg, setMsg]             = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") { navigate("/login"); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sRes, cRes, eRes, pRes, certRes, qRes] = await Promise.all([
        api.get("/auth/students/"),
        api.get("/courses/"),
        api.get("/enrollments/all/"),
        api.get("/payments/my/"),
        api.get("/certificates/all/"),
        api.get("/quizzes/my-attempts/"),
      ]);
      const students     = await sRes.json();
      const courses      = await cRes.json();
      const enrollments  = await eRes.json();
      const payments     = await pRes.json();
      const certs        = await certRes.json();
      const quizzes      = await qRes.json();
      setData({
        students:    students.results    ?? students,
        courses:     courses.results     ?? courses,
        enrollments: enrollments.results ?? enrollments,
        payments:    payments.results    ?? payments,
        certs:       certs.results       ?? certs,
        quizzes:     quizzes.results     ?? quizzes,
      });
    } catch { }
    finally { setLoading(false); }
  };

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const handleLogout = async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) await api.post("/auth/logout/", { refresh }).catch(() => {});
    clearAuth(); navigate("/login");
  };

  const issueCert = async (studentId, courseId, type) => {
    try {
      if (type === "offer_letter") {
        const res = await api.post("/certificates/issue-offer-letter/", {
          student: studentId, course: courseId,
          role: "Intern", start_date: new Date().toISOString().split("T")[0],
          stipend: "₹5,000/month",
        });
        if (res.ok) showMsg("✅ Offer letter issued successfully!");
        else showMsg("❌ Failed to issue offer letter.");
      }
    } catch { showMsg("❌ Network error."); }
  };

  const markComplete = async (enrollmentId) => {
    try {
      const res = await api.post(`/enrollments/${enrollmentId}/complete/`, {});
      if (res.ok) { showMsg("✅ Course marked as completed!"); loadAll(); }
      else showMsg("❌ Failed to mark complete.");
    } catch { showMsg("❌ Network error."); }
  };

  if (loading) return (
    <div className="admin-page">
      <div className="admin-loading">Loading Admin Dashboard...</div>
    </div>
  );

  const totalRevenue = (data.payments || [])
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  // ── Overview Tab ─────────────────────────────────────────────────────────────
  const OverviewTab = () => (
    <div className="admin-tab-content">
      <h2>Dashboard Overview</h2>
      <div className="admin-stats-grid">
        {[
          { label: "Total Students",   value: (data.students || []).length,    icon: "👥", color: "#1d4ed8" },
          { label: "Total Courses",    value: (data.courses || []).length,     icon: "📚", color: "#7c3aed" },
          { label: "Total Enrollments",value: (data.enrollments || []).length, icon: "📋", color: "#059669" },
          { label: "Total Revenue",    value: `₹${totalRevenue.toLocaleString()}`, icon: "💰", color: "#d97706" },
          { label: "Certificates",     value: (data.certs || []).filter(c => c.cert_type === "certificate").length, icon: "🏆", color: "#dc2626" },
          { label: "Offer Letters",    value: (data.certs || []).filter(c => c.cert_type === "offer_letter").length, icon: "📄", color: "#0891b2" },
        ].map((s) => (
          <div className="admin-stat-card" key={s.label} style={{ borderTop: `4px solid ${s.color}` }}>
            <span className="admin-stat-icon">{s.icon}</span>
            <h3 style={{ color: s.color }}>{s.value}</h3>
            <p>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Enrollments */}
      <div className="admin-section">
        <h3>Recent Enrollments</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Student</th><th>Course</th><th>Status</th><th>Progress</th></tr>
            </thead>
            <tbody>
              {(data.enrollments || []).slice(0, 8).map((e) => (
                <tr key={e.id}>
                  <td>{e.student_name || "—"}</td>
                  <td>{e.course_detail?.title || e.course}</td>
                  <td><span className={`enrollment-status status-${e.status}`}>{e.status}</span></td>
                  <td>{e.completion_percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ── Students Tab ──────────────────────────────────────────────────────────────
  const StudentsTab = () => (
    <div className="admin-tab-content">
      <h2>All Students ({(data.students || []).length})</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th></tr>
          </thead>
          <tbody>
            {(data.students || []).map((s, i) => (
              <tr key={s.id}>
                <td>{i + 1}</td>
                <td><strong>{s.full_name}</strong></td>
                <td>{s.email}</td>
                <td>{s.phone || "—"}</td>
                <td>{new Date(s.date_joined).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Courses Tab ───────────────────────────────────────────────────────────────
  const CoursesTab = () => (
    <div className="admin-tab-content">
      <h2>All Courses ({(data.courses || []).length})</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>#</th><th>Title</th><th>Category</th><th>Level</th><th>Price</th><th>Status</th><th>Students</th></tr>
          </thead>
          <tbody>
            {(data.courses || []).map((c, i) => (
              <tr key={c.id}>
                <td>{i + 1}</td>
                <td><strong>{c.title}</strong></td>
                <td>{c.category_name}</td>
                <td><span className="card-level" style={{ background: "#eff6ff", color: "#1d4ed8" }}>{c.level}</span></td>
                <td>{c.is_free ? <span style={{ color: "#10b981", fontWeight: 700 }}>Free</span> : `₹${c.price}`}</td>
                <td><span className={`enrollment-status status-${c.status}`}>{c.status}</span></td>
                <td>{c.students_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Enrollments Tab ───────────────────────────────────────────────────────────
  const EnrollmentsTab = () => (
    <div className="admin-tab-content">
      <h2>All Enrollments ({(data.enrollments || []).length})</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>#</th><th>Student</th><th>Course</th><th>Status</th><th>Progress</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {(data.enrollments || []).map((e, i) => (
              <tr key={e.id}>
                <td>{i + 1}</td>
                <td>{e.student_name || "—"}</td>
                <td>{e.course_detail?.title || e.course}</td>
                <td><span className={`enrollment-status status-${e.status}`}>{e.status}</span></td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="progress-bar" style={{ width: 80 }}>
                      <div className="progress-fill" style={{ width: `${e.completion_percentage}%` }} />
                    </div>
                    <span style={{ fontSize: 12 }}>{e.completion_percentage}%</span>
                  </div>
                </td>
                <td>
                  {e.status === "active" && (
                    <button className="admin-action-btn" onClick={() => markComplete(e.id)}>
                      ✅ Mark Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Payments Tab ──────────────────────────────────────────────────────────────
  const PaymentsTab = () => (
    <div className="admin-tab-content">
      <h2>All Payments</h2>
      <div className="admin-revenue-card">
        <span>💰</span>
        <div>
          <h3>₹{totalRevenue.toLocaleString()}</h3>
          <p>Total Revenue from successful payments</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>#</th><th>Course</th><th>Amount</th><th>Status</th><th>Payment ID</th><th>Date</th></tr>
          </thead>
          <tbody>
            {(data.payments || []).length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "#64748b" }}>No payments yet</td></tr>
            ) : (data.payments || []).map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>{p.course}</td>
                <td>₹{p.amount}</td>
                <td><span className={`enrollment-status status-${p.status === "success" ? "completed" : p.status === "pending" ? "active" : "cancelled"}`}>{p.status}</span></td>
                <td style={{ fontSize: 12, color: "#64748b" }}>{p.payment_id || "—"}</td>
                <td>{new Date(p.created_at).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Certificates Tab ──────────────────────────────────────────────────────────
  const CertificatesTab = () => (
    <div className="admin-tab-content">
      <h2>Certificates & Offer Letters ({(data.certs || []).length})</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>#</th><th>Student</th><th>Course</th><th>Type</th><th>Issued</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {(data.certs || []).length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "#64748b" }}>No certificates issued yet</td></tr>
            ) : (data.certs || []).map((c, i) => (
              <tr key={c.id}>
                <td>{i + 1}</td>
                <td>{c.student_name}</td>
                <td>{c.course_title}</td>
                <td><span className={`enrollment-status ${c.cert_type === "certificate" ? "status-completed" : "status-active"}`}>{c.cert_type === "certificate" ? "🏆 Certificate" : "📄 Offer Letter"}</span></td>
                <td>{new Date(c.issued_at).toLocaleDateString("en-IN")}</td>
                <td>
                  {c.pdf_file && (
                    <a href={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/certificates/admin/${c.id}/download/`} className="admin-action-btn" target="_blank" rel="noreferrer">
                      ⬇ Download
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Issue Offer Letter */}
      <div className="admin-section">
        <h3>Issue Offer Letter</h3>
        <p style={{ color: "#64748b", marginBottom: 16, fontSize: 14 }}>
          Select a student and course from the enrollments tab, then use the API to issue offer letters.
          Or go to <a href={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/admin/`} target="_blank" rel="noreferrer" style={{ color: "#1d4ed8" }}>Django Admin</a> to issue offer letters directly.
        </p>
      </div>
    </div>
  );

  // ── Quiz Results Tab ──────────────────────────────────────────────────────────
  const QuizzesTab = () => (
    <div className="admin-tab-content">
      <h2>Quiz Results ({(data.quizzes || []).length})</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>#</th><th>Quiz</th><th>Score</th><th>Status</th><th>Result</th><th>Date</th></tr>
          </thead>
          <tbody>
            {(data.quizzes || []).length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "#64748b" }}>No quiz attempts yet</td></tr>
            ) : (data.quizzes || []).map((q, i) => (
              <tr key={q.id}>
                <td>{i + 1}</td>
                <td>Quiz #{q.quiz}</td>
                <td><strong>{q.score !== null ? `${q.score}%` : "—"}</strong></td>
                <td><span className={`enrollment-status status-${q.status === "submitted" ? "completed" : "active"}`}>{q.status}</span></td>
                <td>
                  {q.status === "submitted" && (
                    <span className={`enrollment-status ${q.passed ? "status-completed" : "status-cancelled"}`}>
                      {q.passed ? "✅ Passed" : "❌ Failed"}
                    </span>
                  )}
                </td>
                <td>{q.submitted_at ? new Date(q.submitted_at).toLocaleDateString("en-IN") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CONTENT = {
    overview:     <OverviewTab />,
    students:     <StudentsTab />,
    courses:      <CoursesTab />,
    enrollments:  <EnrollmentsTab />,
    payments:     <PaymentsTab />,
    certificates: <CertificatesTab />,
    quizzes:      <QuizzesTab />,
  };

  return (
    <div className="admin-page">

      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">BSH</div>
          <div>
            <h3>Admin Panel</h3>
            <p>{user?.full_name}</p>
          </div>
        </div>

        <nav className="admin-nav">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`admin-nav-btn ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-btn" onClick={() => navigate("/")}>🌐 View Site</button>
          <button className="admin-logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {msg && <div className="admin-msg">{msg}</div>}
        {CONTENT[activeTab]}
      </main>

    </div>
  );
}