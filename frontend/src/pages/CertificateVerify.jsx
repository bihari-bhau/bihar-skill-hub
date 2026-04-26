import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CertificateVerify() {
  const { certId }  = useParams();
  const navigate    = useNavigate();
  const apiBase     = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const [cert,    setCert]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!certId) { setError("No certificate ID provided."); setLoading(false); return; }
    fetch(`${apiBase}/api/certificates/verify/${certId}/`)
      .then((r) => {
        if (!r.ok) throw new Error("Certificate not found");
        return r.json();
      })
      .then((d) => setCert(d))
      .catch(() => setError("❌ Certificate not found or invalid. Please check the ID and try again."))
      .finally(() => setLoading(false));
  }, [certId]);

  const isValid    = cert && cert.is_valid !== false;
  const isOfferLetter = cert?.cert_type === "offer_letter";

  return (
    <div className="verify-page">

      {/* Header */}
      <div className="verify-header">
        <button className="verify-back-btn" onClick={() => navigate("/")}>← Bihar Skill Hub</button>
        <h1>Certificate Verification</h1>
        <p>Verify the authenticity of Bihar Skill Hub certificates</p>
      </div>

      {/* Search Box */}
      <div className="verify-search-section">
        <div className="verify-search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Enter Certificate ID to verify..."
            defaultValue={certId||""}
            onKeyDown={(e) => {
              if (e.key==="Enter" && e.target.value.trim()) {
                navigate(`/verify/${e.target.value.trim()}`);
              }
            }}
          />
          <button onClick={(e) => {
            const inp = e.target.previousSibling;
            if (inp.value.trim()) navigate(`/verify/${inp.value.trim()}`);
          }}>
            Verify
          </button>
        </div>
        <p className="verify-hint">💡 Scan the QR code on the certificate or enter the Certificate ID above</p>
      </div>

      {/* Result */}
      <div className="verify-result-section">

        {loading && (
          <div className="verify-loading">
            <div className="verify-spinner" />
            <p>Verifying certificate...</p>
          </div>
        )}

        {!loading && error && (
          <div className="verify-card invalid">
            <div className="verify-status-icon">❌</div>
            <h2>Certificate Not Found</h2>
            <p>{error}</p>
            <div className="verify-tips">
              <h4>Possible reasons:</h4>
              <ul>
                <li>The certificate ID is incorrect</li>
                <li>The certificate has been revoked</li>
                <li>The QR code may be damaged</li>
              </ul>
            </div>
            <button className="verify-try-btn" onClick={() => navigate("/verify")}>
              Try Another ID
            </button>
          </div>
        )}

        {!loading && cert && (
          <div className={`verify-card ${isValid?"valid":"invalid"}`}>

            {/* Status Banner */}
            <div className={`verify-status-banner ${isValid?"valid":"invalid"}`}>
              <span className="verify-status-icon">{isValid?"✅":"❌"}</span>
              <div>
                <h2>{isValid?"Certificate Verified!":"Certificate Invalid"}</h2>
                <p>{isValid
                  ? "This is an authentic certificate issued by Bihar Skill Hub."
                  : "This certificate could not be verified."
                }</p>
              </div>
            </div>

            {/* Certificate Details */}
            {isValid && (
              <>
                <div className="verify-cert-type-badge">
                  {isOfferLetter ? "📄 Offer Letter" : "🏆 Course Completion Certificate"}
                </div>

                <div className="verify-details-grid">
                  <div className="verify-detail-item">
                    <span className="verify-detail-label">👤 Student Name</span>
                    <span className="verify-detail-value">{cert.student_name}</span>
                  </div>
                  <div className="verify-detail-item">
                    <span className="verify-detail-label">📚 Course</span>
                    <span className="verify-detail-value">{cert.course_title}</span>
                  </div>
                  <div className="verify-detail-item">
                    <span className="verify-detail-label">🏢 Issued By</span>
                    <span className="verify-detail-value">Bihar Skill Hub</span>
                  </div>
                  <div className="verify-detail-item">
                    <span className="verify-detail-label">📅 Issue Date</span>
                    <span className="verify-detail-value">
                      {new Date(cert.issued_at).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}
                    </span>
                  </div>
                  <div className="verify-detail-item">
                    <span className="verify-detail-label">🆔 Certificate ID</span>
                    <span className="verify-detail-value cert-id-mono">{cert.certificate_id||certId}</span>
                  </div>
                  {isOfferLetter && cert.role && (
                    <div className="verify-detail-item">
                      <span className="verify-detail-label">💼 Role</span>
                      <span className="verify-detail-value">{cert.role}</span>
                    </div>
                  )}
                  {isOfferLetter && cert.stipend && (
                    <div className="verify-detail-item">
                      <span className="verify-detail-label">💰 Stipend</span>
                      <span className="verify-detail-value">{cert.stipend}</span>
                    </div>
                  )}
                </div>

                {/* Authenticity seal */}
                <div className="verify-seal">
                  <div className="verify-seal-inner">
                    <span>🏆</span>
                    <div>
                      <strong>Verified & Authentic</strong>
                      <small>Bihar Skill Hub • biharskillhub.co.in</small>
                    </div>
                  </div>
                </div>

                {/* Download button */}
                {cert.pdf_file && (
                  <a
                    href={`${apiBase}${cert.pdf_file}`}
                    target="_blank" rel="noreferrer"
                    className="verify-download-btn"
                  >
                    ⬇ Download Certificate PDF
                  </a>
                )}
              </>
            )}
          </div>
        )}

        {/* Info cards */}
        {!loading && (
          <div className="verify-info-cards">
            {[
              { icon: "🔒", title: "Secure Verification", desc: "All certificates are digitally signed and tamper-proof" },
              { icon: "🌐", title: "Instant Verification", desc: "Verify any certificate in seconds with the unique ID or QR code" },
              { icon: "📱", title: "Share Anywhere",       desc: "Share your certificate link on LinkedIn, resume, and more" },
            ].map((c) => (
              <div className="verify-info-card" key={c.title}>
                <span>{c.icon}</span>
                <h4>{c.title}</h4>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}