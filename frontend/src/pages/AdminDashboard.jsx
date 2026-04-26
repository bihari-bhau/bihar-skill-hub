import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api, getUser, clearAuth } from "../utils/api";

const TABS = [
  { key: "overview",     label: "Overview",      icon: "📊" },
  { key: "students",     label: "Students",       icon: "👥" },
  { key: "courses",      label: "Courses",        icon: "📚" },
  { key: "enrollments",  label: "Enrollments",    icon: "📋" },
  { key: "payments",     label: "Payments",       icon: "💰" },
  { key: "certificates", label: "Certificates",   icon: "🏆" },
  { key: "quizzes",      label: "Quiz Results",   icon: "📝" },
];

const LEVEL_OPTIONS    = ["beginner", "intermediate", "advanced"];
const LANGUAGE_OPTIONS = ["hindi", "english", "hinglish"];
const STATUS_OPTIONS   = ["draft", "published", "archived"];

/* ── Reusable Modal ────────────────────────────────────────────────────── */
function Modal({ title, onClose, children }) {
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{title}</h3>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ── Confirm Dialog ────────────────────────────────────────────────────── */
function Confirm({ msg, onConfirm, onCancel }) {
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal" style={{ maxWidth: 400 }}>
        <div className="admin-modal-body" style={{ textAlign: "center", padding: 32 }}>
          <p style={{ fontSize: 16, color: "#1e293b", marginBottom: 24 }}>{msg}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="admin-action-btn danger" onClick={onConfirm}>Yes, Delete</button>
            <button className="admin-btn-secondary" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate     = useNavigate();
  const user         = getUser();
  const apiBase      = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const [tab, setTab]       = useState("overview");
  const [data, setData]     = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]       = useState({ text: "", type: "success" });
  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState(null); // { type, data }
  const [confirm, setConfirm] = useState(null);
  const [form, setForm]     = useState({});
  const [saving, setSaving] = useState(false);
  const [offerForm, setOfferForm] = useState({ role: "Intern", stipend: "₹5,000/month", start_date: new Date().toISOString().split("T")[0] });

  useEffect(() => {
    if (!user || user.role !== "admin") { navigate("/login"); return; }
    loadAll();
  }, []);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "success" }), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sRes, cRes, eRes, pRes, certRes, qRes, catRes] = await Promise.all([
        api.get("/auth/students/"),
        api.get("/courses/"),
        api.get("/enrollments/all/"),
        api.get("/payments/my/"),
        api.get("/certificates/all/"),
        api.get("/quizzes/my-attempts/"),
        api.get("/courses/categories/"),
      ]);
      const parse = async (r) => { const d = await r.json(); return d.results ?? d; };
      setData({
        students:    await parse(sRes),
        courses:     await parse(cRes),
        enrollments: await parse(eRes),
        payments:    await parse(pRes),
        certs:       await parse(certRes),
        quizzes:     await parse(qRes),
        categories:  await parse(catRes),
      });
    } catch { showMsg("Failed to load data", "error"); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) await api.post("/auth/logout/", { refresh }).catch(() => {});
    clearAuth(); navigate("/login");
  };

  /* ── COURSE CRUD ─────────────────────────────────────────────────────── */
  const openAddCourse = () => {
    setForm({ title: "", description: "", category_id: "", price: 0, is_free: true, duration_hours: 0, level: "beginner", language: "hinglish", eligibility: "Any Branch", status: "draft", passing_score: 70 });
    setModal({ type: "course", mode: "add" });
  };

  const openEditCourse = (course) => {
    setForm({ ...course, category_id: course.category?.id || "" });
    setModal({ type: "course", mode: "edit", id: course.id });
  };

  const saveCourse = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      const res = modal.mode === "add"
        ? await api.post("/courses/", payload)
        : await api.patch(`/courses/${modal.id}/`, payload);
      if (res.ok) {
        showMsg(modal.mode === "add" ? "✅ Course added!" : "✅ Course updated!");
        setModal(null); loadAll();
      } else {
        const d = await res.json();
        showMsg(`❌ ${JSON.stringify(d)}`, "error");
      }
    } catch { showMsg("❌ Network error", "error"); }
    finally { setSaving(false); }
  };

  const deleteCourse = (id) => {
    setConfirm({
      msg: "Are you sure you want to delete this course? This cannot be undone.",
      onConfirm: async () => {
        setConfirm(null);
        const res = await api.delete(`/courses/${id}/`);
        if (res.ok) { showMsg("✅ Course deleted!"); loadAll(); }
        else showMsg("❌ Failed to delete course", "error");
      },
      onCancel: () => setConfirm(null),
    });
  };

  /* ── CERTIFICATE CRUD ────────────────────────────────────────────────── */
  const openIssueOfferLetter = (enrollment) => {
    setForm({ student: enrollment.student, course: enrollment.course });
    setOfferForm({ role: "Intern", stipend: "₹5,000/month", start_date: new Date().toISOString().split("T")[0] });
    setModal({ type: "offer_letter", enrollment });
  };

  const issueOfferLetter = async () => {
    setSaving(true);
    try {
      const res = await api.post("/certificates/issue-offer-letter/", {
        student:    form.student,
        course:     form.course,
        role:       offerForm.role,
        stipend:    offerForm.stipend,
        start_date: offerForm.start_date,
      });
      if (res.ok) { showMsg("✅ Offer letter issued!"); setModal(null); loadAll(); }
      else { const d = await res.json(); showMsg(`❌ ${JSON.stringify(d)}`, "error"); }
    } catch { showMsg("❌ Network error", "error"); }
    finally { setSaving(false); }
  };

  const markComplete = async (enrollmentId) => {
    const res = await api.post(`/enrollments/${enrollmentId}/complete/`, {});
    if (res.ok) { showMsg("✅ Marked as completed!"); loadAll(); }
    else showMsg("❌ Failed", "error");
  };

  /* ── SEARCH FILTER ───────────────────────────────────────────────────── */
  const filterList = (list, keys) =>
    search.trim()
      ? list.filter((item) =>
          keys.some((k) =>
            String(item[k] ?? "").toLowerCase().includes(search.toLowerCase())
          )
        )
      : list;

  const totalRevenue = (data.payments || [])
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f1f5f9", fontSize: 18, color: "#64748b" }}>
      ⏳ Loading Admin Dashboard...
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════
     TAB CONTENTS
  ════════════════════════════════════════════════════════════════════════ */

  /* ── OVERVIEW ────────────────────────────────────────────────────────── */
  const OverviewTab = () => (
    <div className="admin-tab-content">
      <h2>Dashboard Overview</h2>
      <div className="admin-stats-grid">
        {[
          { label: "Total Students",    value: (data.students||[]).length,     icon: "👥", color: "#1d4ed8" },
          { label: "Total Courses",     value: (data.courses||[]).length,      icon: "📚", color: "#7c3aed" },
          { label: "Enrollments",       value: (data.enrollments||[]).length,  icon: "📋", color: "#059669" },
          { label: "Revenue",           value: `₹${totalRevenue.toLocaleString()}`, icon: "💰", color: "#d97706" },
          { label: "Certificates",      value: (data.certs||[]).filter(c=>c.cert_type==="certificate").length, icon: "🏆", color: "#dc2626" },
          { label: "Offer Letters",     value: (data.certs||[]).filter(c=>c.cert_type==="offer_letter").length, icon: "📄", color: "#0891b2" },
        ].map((s) => (
          <div className="admin-stat-card" key={s.label} style={{ borderTop: `4px solid ${s.color}` }}>
            <span className="admin-stat-icon">{s.icon}</span>
            <h3 style={{ color: s.color }}>{s.value}</h3>
            <p>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="admin-section">
        <h3>Recent Enrollments</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Student</th><th>Course</th><th>Status</th><th>Progress</th></tr></thead>
            <tbody>
              {(data.enrollments||[]).slice(0,8).map((e) => (
                <tr key={e.id}>
                  <td>{e.student_name||"—"}</td>
                  <td>{e.course_detail?.title||e.course}</td>
                  <td><span className={`enrollment-status status-${e.status}`}>{e.status}</span></td>
                  <td>{e.completion_percentage||0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* ── STUDENTS ────────────────────────────────────────────────────────── */
  const StudentsTab = () => {
    const list = filterList(data.students||[], ["full_name","email"]);
    return (
      <div className="admin-tab-content">
        <div className="admin-tab-header">
          <h2>Students ({list.length})</h2>
          <input className="admin-search" placeholder="🔍 Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th></tr></thead>
            <tbody>
              {list.map((s,i) => (
                <tr key={s.id}>
                  <td>{i+1}</td>
                  <td><strong>{s.full_name}</strong></td>
                  <td>{s.email}</td>
                  <td>{s.phone||"—"}</td>
                  <td>{new Date(s.date_joined).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
              {list.length===0 && <tr><td colSpan={5} className="admin-empty">No students found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* ── COURSES (Full CRUD) ─────────────────────────────────────────────── */
  const CoursesTab = () => {
    const list = filterList(data.courses||[], ["title","category_name","level"]);
    return (
      <div className="admin-tab-content">
        <div className="admin-tab-header">
          <h2>Courses ({list.length})</h2>
          <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            <input className="admin-search" placeholder="🔍 Search courses..." value={search} onChange={e=>setSearch(e.target.value)} />
            <button className="admin-add-btn" onClick={openAddCourse}>+ Add Course</button>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>#</th><th>Title</th><th>Category</th><th>Level</th><th>Price</th><th>Status</th><th>Students</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map((c,i) => (
                <tr key={c.id}>
                  <td>{i+1}</td>
                  <td><strong>{c.title}</strong></td>
                  <td>{c.category_name}</td>
                  <td><span className="card-level" style={{background:"#eff6ff",color:"#1d4ed8"}}>{c.level}</span></td>
                  <td>{c.is_free ? <span style={{color:"#10b981",fontWeight:700}}>Free</span> : `₹${c.price}`}</td>
                  <td><span className={`enrollment-status status-${c.status==="published"?"completed":c.status==="draft"?"active":"cancelled"}`}>{c.status}</span></td>
                  <td>{c.students_count||0}</td>
                  <td>
                    <div style={{display:"flex",gap:6}}>
                      <button className="admin-action-btn" onClick={()=>openEditCourse(c)}>✏️ Edit</button>
                      <button className="admin-action-btn danger" onClick={()=>deleteCourse(c.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length===0 && <tr><td colSpan={8} className="admin-empty">No courses found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* ── ENROLLMENTS ─────────────────────────────────────────────────────── */
  const EnrollmentsTab = () => {
    const list = filterList(data.enrollments||[], ["student_name"]);
    return (
      <div className="admin-tab-content">
        <div className="admin-tab-header">
          <h2>Enrollments ({list.length})</h2>
          <input className="admin-search" placeholder="🔍 Search by student..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>#</th><th>Student</th><th>Course</th><th>Status</th><th>Progress</th><th>Actions</th></tr></thead>
            <tbody>
              {list.map((e,i) => (
                <tr key={e.id}>
                  <td>{i+1}</td>
                  <td>{e.student_name||"—"}</td>
                  <td style={{maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.course_detail?.title||e.course}</td>
                  <td><span className={`enrollment-status status-${e.status}`}>{e.status}</span></td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div className="progress-bar" style={{width:60}}>
                        <div className="progress-fill" style={{width:`${e.completion_percentage||0}%`}}/>
                      </div>
                      <span style={{fontSize:12}}>{e.completion_percentage||0}%</span>
                    </div>
                  </td>
                  <td>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      {e.status==="active" && <button className="admin-action-btn" onClick={()=>markComplete(e.id)}>✅ Complete</button>}
                      <button className="admin-action-btn" style={{background:"#7c3aed"}} onClick={()=>openIssueOfferLetter(e)}>📄 Offer Letter</button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length===0 && <tr><td colSpan={6} className="admin-empty">No enrollments found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* ── PAYMENTS ────────────────────────────────────────────────────────── */
  const PaymentsTab = () => (
    <div className="admin-tab-content">
      <h2>Payments & Revenue</h2>
      <div className="admin-revenue-card">
        <span>💰</span>
        <div>
          <h3>₹{totalRevenue.toLocaleString()}</h3>
          <p>Total revenue from {(data.payments||[]).filter(p=>p.status==="success").length} successful payments</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>#</th><th>Course</th><th>Amount</th><th>Status</th><th>Payment ID</th><th>Date</th></tr></thead>
          <tbody>
            {(data.payments||[]).length===0
              ? <tr><td colSpan={6} className="admin-empty">No payments yet</td></tr>
              : (data.payments||[]).map((p,i) => (
                <tr key={p.id}>
                  <td>{i+1}</td>
                  <td>{p.course}</td>
                  <td><strong>₹{p.amount}</strong></td>
                  <td><span className={`enrollment-status status-${p.status==="success"?"completed":p.status==="pending"?"active":"cancelled"}`}>{p.status}</span></td>
                  <td style={{fontSize:11,color:"#64748b"}}>{p.payment_id||"—"}</td>
                  <td>{new Date(p.created_at).toLocaleDateString("en-IN")}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );

  /* ── CERTIFICATES ────────────────────────────────────────────────────── */
  const CertificatesTab = () => {
    const list = filterList(data.certs||[], ["student_name","course_title"]);
    return (
      <div className="admin-tab-content">
        <div className="admin-tab-header">
          <h2>Certificates & Offer Letters ({list.length})</h2>
          <input className="admin-search" placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>#</th><th>Student</th><th>Course</th><th>Type</th><th>Certificate ID</th><th>Issued</th><th>Actions</th></tr></thead>
            <tbody>
              {list.length===0
                ? <tr><td colSpan={7} className="admin-empty">No certificates issued yet</td></tr>
                : list.map((c,i) => (
                  <tr key={c.id}>
                    <td>{i+1}</td>
                    <td><strong>{c.student_name}</strong></td>
                    <td>{c.course_title}</td>
                    <td><span className={`enrollment-status ${c.cert_type==="certificate"?"status-completed":"status-active"}`}>{c.cert_type==="certificate"?"🏆 Certificate":"📄 Offer Letter"}</span></td>
                    <td style={{fontSize:11,color:"#1d4ed8",fontFamily:"monospace"}}>{c.certificate_id||c.id}</td>
                    <td>{new Date(c.issued_at).toLocaleDateString("en-IN")}</td>
                    <td>
                      <div style={{display:"flex",gap:6}}>
                        {c.pdf_file && (
                          <a href={`${apiBase}/api/certificates/admin/${c.id}/download/`} className="admin-action-btn" target="_blank" rel="noreferrer">⬇️ PDF</a>
                        )}
                        <button className="admin-action-btn" style={{background:"#059669"}} onClick={()=>{ navigator.clipboard.writeText(`${window.location.origin}/verify/${c.certificate_id||c.id}`); showMsg("✅ Verify link copied!"); }}>
                          🔗 Copy Link
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  /* ── QUIZ RESULTS ────────────────────────────────────────────────────── */
  const QuizzesTab = () => {
    const list = filterList(data.quizzes||[], ["quiz"]);
    return (
      <div className="admin-tab-content">
        <h2>Quiz Results ({list.length})</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>#</th><th>Quiz</th><th>Score</th><th>Status</th><th>Result</th><th>Date</th></tr></thead>
            <tbody>
              {list.length===0
                ? <tr><td colSpan={6} className="admin-empty">No quiz attempts yet</td></tr>
                : list.map((q,i) => (
                  <tr key={q.id}>
                    <td>{i+1}</td>
                    <td>Quiz #{q.quiz}</td>
                    <td><strong>{q.score!=null?`${q.score}%`:"—"}</strong></td>
                    <td><span className={`enrollment-status status-${q.status==="submitted"?"completed":"active"}`}>{q.status}</span></td>
                    <td>{q.status==="submitted" && <span className={`enrollment-status ${q.passed?"status-completed":"status-cancelled"}`}>{q.passed?"✅ Passed":"❌ Failed"}</span>}</td>
                    <td>{q.submitted_at?new Date(q.submitted_at).toLocaleDateString("en-IN"):"—"}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const CONTENT = {
    overview:     <OverviewTab />,
    students:     <StudentsTab />,
    courses:      <CoursesTab />,
    enrollments:  <EnrollmentsTab />,
    payments:     <PaymentsTab />,
    certificates: <CertificatesTab />,
    quizzes:      <QuizzesTab />,
  };

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="admin-page">

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">BSH</div>
          <div>
            <h3>Admin Panel</h3>
            <p>{user?.full_name}</p>
          </div>
        </div>

        <nav className="admin-nav">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`admin-nav-btn ${tab===t.key?"active":""}`}
              onClick={() => { setTab(t.key); setSearch(""); }}
            >
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-nav-btn" onClick={() => navigate("/")}>🌐 View Site</button>
          <button className="admin-logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="admin-main">
        {msg.text && (
          <div className={`admin-msg ${msg.type==="error"?"admin-msg-error":""}`}>
            {msg.text}
          </div>
        )}
        {CONTENT[tab]}
      </main>

      {/* ── Course Add/Edit Modal ───────────────────────────────────────── */}
      {modal?.type==="course" && (
        <Modal title={modal.mode==="add"?"Add New Course":"Edit Course"} onClose={()=>setModal(null)}>
          <div className="admin-form-grid">
            <div className="admin-form-group full">
              <label>Title *</label>
              <input value={form.title||""} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Course title" />
            </div>
            <div className="admin-form-group full">
              <label>Description *</label>
              <textarea rows={4} value={form.description||""} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Course description" />
            </div>
            <div className="admin-form-group">
              <label>Category</label>
              <select value={form.category_id||""} onChange={e=>setForm(p=>({...p,category_id:e.target.value}))}>
                <option value="">Select category</option>
                {(data.categories||[]).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label>Level</label>
              <select value={form.level||"beginner"} onChange={e=>setForm(p=>({...p,level:e.target.value}))}>
                {LEVEL_OPTIONS.map(l=><option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label>Language</label>
              <select value={form.language||"hinglish"} onChange={e=>setForm(p=>({...p,language:e.target.value}))}>
                {LANGUAGE_OPTIONS.map(l=><option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label>Status</label>
              <select value={form.status||"draft"} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
                {STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label>Price (₹)</label>
              <input type="number" value={form.price||0} onChange={e=>setForm(p=>({...p,price:e.target.value,is_free:parseFloat(e.target.value)===0}))} placeholder="0 for free" />
            </div>
            <div className="admin-form-group">
              <label>Duration (hours)</label>
              <input type="number" value={form.duration_hours||0} onChange={e=>setForm(p=>({...p,duration_hours:e.target.value}))} />
            </div>
            <div className="admin-form-group">
              <label>Eligibility</label>
              <input value={form.eligibility||""} onChange={e=>setForm(p=>({...p,eligibility:e.target.value}))} placeholder="Any Branch" />
            </div>
            <div className="admin-form-group">
              <label>Passing Score (%)</label>
              <input type="number" value={form.passing_score||70} onChange={e=>setForm(p=>({...p,passing_score:e.target.value}))} />
            </div>
            <div className="admin-form-group">
              <label>Next Batch Date</label>
              <input type="date" value={form.next_batch_date||""} onChange={e=>setForm(p=>({...p,next_batch_date:e.target.value}))} />
            </div>
          </div>
          <div style={{display:"flex",gap:12,marginTop:24,justifyContent:"flex-end"}}>
            <button className="admin-btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
            <button className="admin-add-btn" onClick={saveCourse} disabled={saving}>
              {saving?"Saving...":modal.mode==="add"?"Add Course":"Save Changes"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Offer Letter Modal ───────────────────────────────────────────── */}
      {modal?.type==="offer_letter" && (
        <Modal title="Issue Offer Letter" onClose={()=>setModal(null)}>
          <div className="admin-form-grid">
            <div className="admin-form-group full">
              <label>Role / Position *</label>
              <input value={offerForm.role} onChange={e=>setOfferForm(p=>({...p,role:e.target.value}))} placeholder="e.g. Web Development Intern" />
            </div>
            <div className="admin-form-group">
              <label>Stipend</label>
              <input value={offerForm.stipend} onChange={e=>setOfferForm(p=>({...p,stipend:e.target.value}))} placeholder="₹5,000/month" />
            </div>
            <div className="admin-form-group">
              <label>Start Date</label>
              <input type="date" value={offerForm.start_date} onChange={e=>setOfferForm(p=>({...p,start_date:e.target.value}))} />
            </div>
          </div>
          <div style={{display:"flex",gap:12,marginTop:24,justifyContent:"flex-end"}}>
            <button className="admin-btn-secondary" onClick={()=>setModal(null)}>Cancel</button>
            <button className="admin-add-btn" onClick={issueOfferLetter} disabled={saving}>
              {saving?"Issuing...":"📄 Issue Offer Letter"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Confirm Dialog ───────────────────────────────────────────────── */}
      {confirm && <Confirm {...confirm} />}
    </div>
  );
}