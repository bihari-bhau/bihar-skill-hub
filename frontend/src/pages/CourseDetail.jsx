import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, getUser } from "../utils/api";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse]       = useState(null);
  const [lectures, setLectures]   = useState([]);
  const [notes, setNotes]         = useState([]);
  const [enrolled, setEnrolled]   = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading]     = useState(true);

  const user    = getUser();
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, lRes, nRes, eRes] = await Promise.all([
          fetch(`${apiBase}/api/courses/${id}/`),
          api.get(`/lectures/?course=${id}`),
          api.get(`/notes/?course=${id}`),
          user ? api.get("/enrollments/my/") : Promise.resolve(null),
        ]);
        const cData = await cRes.json();
        const lData = await lRes.json();
        const nData = await nRes.json();
        setCourse(cData);
        setLectures(lData.results ?? lData);
        setNotes(nData.results ?? nData);
        if (eRes) {
          const eData = await eRes.json();
          const list  = eData.results ?? eData;
          setEnrolled(list.some((e) => String(e.course) === String(id) && e.status === "active"));
        }
      } catch {
        // handled below via course === null
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleEnroll = async () => {
    if (!user) { navigate("/login"); return; }

    // ── Paid course → redirect to payment page ──────────────────────────────
    if (!course.is_free && parseFloat(course.price) > 0) {
      navigate("/payment", { state: { course } });
      return;
    }

    // ── Free course → enroll directly ───────────────────────────────────────
    setEnrolling(true);
    try {
      const res = await api.post("/enrollments/enroll/", { course_id: id });
      if (res.ok) {
        setEnrolled(true);
      } else {
        const d = await res.json();
        alert(d.error || "Enrollment failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setEnrolling(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="course-detail-page">
      <div className="course-detail-card">
        <div className="course-detail-content"><h1>Loading…</h1></div>
      </div>
    </div>
  );

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!course || course.detail) return (
    <div className="course-detail-page">
      <div className="course-detail-card">
        <div className="course-detail-content">
          <h1>Course Not Found</h1>
          <button className="detail-enroll-btn" onClick={() => navigate("/courses")}>
            Back to Courses
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="course-detail-page">
      <div className="course-detail-card">

        {/* Thumbnail */}
        {course.thumbnail && (
          <div className="course-detail-image">
            <img
              src={`${apiBase}${course.thumbnail}`}
              alt={course.title}
              className="course-detail-real-image"
            />
          </div>
        )}

        <div className="course-detail-content">
          <span className="detail-badge">{course.category?.name}</span>
          <h1>{course.title}</h1>
          <p className="detail-desc">{course.description}</p>

          {/* Course Info */}
          <div className="detail-info">
            <p><strong>Duration:</strong> {course.duration_hours}h</p>
            <p>
              <strong>Price:</strong>{" "}
              {course.is_free
                ? <span style={{ color: "#10b981", fontWeight: 700 }}>FREE</span>
                : <span style={{ color: "#1d4ed8", fontWeight: 700 }}>₹{Number(course.price).toLocaleString()}</span>
              }
            </p>
            <p><strong>Level:</strong> {course.level}</p>
            <p><strong>Passing Score:</strong> {course.passing_score}%</p>
            {course.eligibility && (
              <p><strong>Eligibility:</strong> {course.eligibility}</p>
            )}
            {course.language && (
              <p><strong>Language:</strong> {course.language}</p>
            )}
            {course.next_batch_date && (
              <p><strong>Next Batch:</strong> {new Date(course.next_batch_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
            )}
          </div>

          {/* Enroll / Enrolled */}
          {enrolled ? (
            <div className="enrolled-badge">✅ You are enrolled</div>
          ) : (
            <button
              className="detail-enroll-btn"
              onClick={handleEnroll}
              disabled={enrolling}
            >
              {enrolling
                ? "Processing…"
                : course.is_free
                ? "Enroll for Free 🎓"
                : `Pay ₹${Number(course.price).toLocaleString()} & Enroll →`}
            </button>
          )}

          {/* What you get */}
          {!enrolled && (
            <div className="course-benefits">
              <h4>What you get:</h4>
              <ul>
                <li>✅ Video lectures + Study notes</li>
                <li>✅ Certificate of Completion</li>
                <li>✅ Offer Letter from Bihar Skill Hub</li>
                <li>✅ Quiz based assessment</li>
                <li>✅ Lifetime access</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Lectures */}
      {enrolled && lectures.length > 0 && (
        <div className="course-section">
          <h2>📹 Lectures</h2>
          <div className="lecture-list">
            {lectures.map((lec) => (
              <div className="lecture-item" key={lec.id}>
                <div className="lecture-info">
                  <strong>{lec.order}. {lec.title}</strong>
                  <span>{lec.duration_seconds ? `${Math.round(lec.duration_seconds / 60)} min` : ""}</span>
                </div>
                {lec.video_type === "embed" && lec.video_url ? (
                  <a href={lec.video_url} target="_blank" rel="noreferrer" className="lecture-link">▶ Watch</a>
                ) : lec.video_file ? (
                  <a href={`${apiBase}${lec.video_file}`} target="_blank" rel="noreferrer" className="lecture-link">▶ Watch</a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {enrolled && notes.length > 0 && (
        <div className="course-section">
          <h2>📄 Study Notes</h2>
          <div className="notes-list">
            {notes.map((note) => (
              <div className="note-item" key={note.id}>
                <span>{note.title}</span>
                <a
                  href={`${apiBase}${note.file}`}
                  target="_blank" rel="noreferrer"
                  className="download-btn"
                >
                  ⬇ Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard button */}
      {enrolled && (
        <div className="course-section" style={{ textAlign: "center" }}>
          <button className="detail-enroll-btn" onClick={() => navigate("/profile")}>
            Go to My Profile →
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;