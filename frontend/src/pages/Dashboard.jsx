import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getUser, clearAuth } from "../utils/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [enrollments, setEnrollments] = useState([]);
  const [certs, setCerts]             = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const load = async () => {
      try {
        const [eRes, cRes] = await Promise.all([
          api.get("/enrollments/my/"),
          api.get("/certificates/my/"),
        ]);
        const eData = await eRes.json();
        const cData = await cRes.json();
        setEnrollments(eData.results ?? eData);
        setCerts(cData.results ?? cData);
      } catch {
        // show empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) await api.post("/auth/logout/", { refresh });
    clearAuth();
    navigate("/login");
  };

  const downloadCert = async (cert) => {
    try {
      const res = await fetch(`http://localhost:8000/api/certificates/${cert.id}/download/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      if (!res.ok) { alert("Download failed."); return; }
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${cert.cert_type === "offer_letter" ? "offer_letter" : "certificate"}_${cert.course_title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download error.");
    }
  };

  if (loading) return <div className="dashboard-page"><p>Loading dashboard…</p></div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.full_name} 👋</h1>
          <p className="dashboard-email">{user?.email}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{enrollments.length}</h3>
          <p>Enrolled Courses</p>
        </div>
        <div className="stat-card">
          <h3>{enrollments.filter((e) => e.status === "completed").length}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-card">
          <h3>{certs.filter((c) => c.cert_type === "certificate").length}</h3>
          <p>Certificates</p>
        </div>
        <div className="stat-card">
          <h3>{certs.filter((c) => c.cert_type === "offer_letter").length}</h3>
          <p>Offer Letters</p>
        </div>
      </div>

      {/* Enrolled Courses */}
      <section className="dashboard-section">
        <h2>My Courses</h2>
        {enrollments.length === 0 ? (
          <div className="empty-state">
            <p>You haven&apos;t enrolled in any courses yet.</p>
            <button onClick={() => navigate("/courses")}>Browse Courses</button>
          </div>
        ) : (
          <div className="enrollment-list">
            {enrollments.map((e) => (
              <div className="enrollment-card" key={e.id}>
                <div className="enrollment-info">
                  <h3>{e.course_detail?.title}</h3>
                  <span className={`enrollment-status status-${e.status}`}>{e.status}</span>
                </div>
                <div className="enrollment-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${e.completion_percentage}%` }} />
                  </div>
                  <span>{e.completion_percentage}% complete</span>
                </div>
                <div className="enrollment-actions">
                  <button onClick={() => navigate(`/course/${e.course}`)}>Continue</button>
                  {e.status === "active" && (
                    <button onClick={() => navigate(`/quiz/${e.course}`)}>Take Quiz</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Certificates & Offer Letters */}
      <section className="dashboard-section">
        <h2>My Certificates &amp; Offer Letters</h2>
        {certs.length === 0 ? (
          <p className="empty-note">Complete a course quiz to earn your certificate.</p>
        ) : (
          <div className="cert-list">
            {certs.map((cert) => (
              <div className="cert-card" key={cert.id}>
                <div className="cert-icon">
                  {cert.cert_type === "offer_letter" ? "📄" : "🏆"}
                </div>
                <div className="cert-info">
                  <h4>{cert.cert_type === "offer_letter" ? "Offer Letter" : "Certificate of Completion"}</h4>
                  <p>{cert.course_title}</p>
                  <small>{new Date(cert.issued_at).toLocaleDateString()}</small>
                </div>
                <button className="download-btn" onClick={() => downloadCert(cert)}>
                  ⬇ Download PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
