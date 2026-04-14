import React, { useState } from "react";
import "../styles/certificate.css";

const SAMPLE_DATA = {
  "BSH-2024-001234": {
    name: "Aman Kumar Singh",
    parent: "S/O Rajesh Kumar Singh",
    enrollmentNo: "BSH-2024-001234",
    course: "Electrician (ITI)",
    sector: "Electrical Technology",
    institute: "Bihar Skill Development Centre, Patna",
    district: "Patna",
    issueDate: "15 March 2024",
    validUntil: "14 March 2027",
    overallGrade: "A+ (91%)",
    status: "verified",
    subjects: [
      { name: "Electrical Theory",     marks: 92, maxMarks: 100, grade: "A+", status: "pass" },
      { name: "Workshop Practice",     marks: 88, maxMarks: 100, grade: "A",  status: "pass" },
      { name: "Safety & Regulations",  marks: 95, maxMarks: 100, grade: "A+", status: "pass" },
      { name: "Wiring & Installation", marks: 89, maxMarks: 100, grade: "A",  status: "pass" },
    ],
  },
  "BSH-2023-005678": {
    name: "Priya Kumari",
    parent: "D/O Suresh Prasad",
    enrollmentNo: "BSH-2023-005678",
    course: "Beautician & Cosmetology",
    sector: "Beauty & Wellness",
    institute: "Mahila Kaushal Kendra, Muzaffarpur",
    district: "Muzaffarpur",
    issueDate: "20 July 2023",
    validUntil: "19 July 2026",
    overallGrade: "B+ (78%)",
    status: "verified",
    subjects: [
      { name: "Skin Care Fundamentals", marks: 82, maxMarks: 100, grade: "A",  status: "pass" },
      { name: "Hair Styling",           marks: 76, maxMarks: 100, grade: "B+", status: "pass" },
      { name: "Makeup Techniques",      marks: 74, maxMarks: 100, grade: "B",  status: "pass" },
      { name: "Salon Management",       marks: 79, maxMarks: 100, grade: "B+", status: "pass" },
    ],
  },
  "BSH-2024-009912": {
    name: "Rahul Ranjan",
    parent: "S/O Vinod Kumar",
    enrollmentNo: "BSH-2024-009912",
    course: "Computer Hardware & Networking",
    sector: "IT & ITES",
    institute: "NSDC Training Centre, Gaya",
    district: "Gaya",
    issueDate: "10 January 2024",
    validUntil: "09 January 2027",
    overallGrade: "A (85%)",
    status: "verified",
    subjects: [
      { name: "PC Hardware",            marks: 86, maxMarks: 100, grade: "A",  status: "pass" },
      { name: "Networking Basics",      marks: 91, maxMarks: 100, grade: "A+", status: "pass" },
      { name: "Troubleshooting",        marks: 83, maxMarks: 100, grade: "A",  status: "pass" },
      { name: "Cyber Security Basics",  marks: 79, maxMarks: 100, grade: "B+", status: "pass" },
    ],
  },
  "BSH-2022-003301": {
    name: "Sunita Devi",
    parent: "W/O Manoj Yadav",
    enrollmentNo: "BSH-2022-003301",
    course: "Tailoring & Garment Making",
    sector: "Apparel & Textile",
    institute: "Gramin Kaushal Kendra, Nalanda",
    district: "Nalanda",
    issueDate: "5 November 2022",
    validUntil: "4 November 2025",
    overallGrade: "A (87%)",
    status: "verified",
    subjects: [
      { name: "Basic Stitching",  marks: 88, maxMarks: 100, grade: "A",  status: "pass" },
      { name: "Pattern Making",   marks: 90, maxMarks: 100, grade: "A+", status: "pass" },
      { name: "Fabric Knowledge", marks: 84, maxMarks: 100, grade: "A",  status: "pass" },
      { name: "Business Skills",  marks: 85, maxMarks: 100, grade: "A",  status: "pass" },
    ],
  },
};

function getInitials(name) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function gradeClass(grade) {
  if (grade === "A+") return "grade-aplus";
  if (grade === "A")  return "grade-a";
  if (grade === "B+") return "grade-bplus";
  return "grade-b";
}

const InfoCell = ({ label, value, highlight }) => (
  <div className={`cert-info-cell${highlight ? " cert-info-cell--highlight" : ""}`}>
    <div className="cert-info-label">{label}</div>
    <div className="cert-info-value">{value}</div>
  </div>
);

const CertificateVerification = () => {
  const [certInput, setCertInput] = useState("");
  const [dobInput, setDobInput]   = useState("");
  const [status, setStatus]       = useState(null); // null | 'loading' | 'found' | 'notfound'
  const [student, setStudent]     = useState(null);
  const [copied, setCopied]       = useState(false);
  const [verifiedAt, setVerifiedAt] = useState("");

  const handleVerify = () => {
    const certNum = certInput.trim().toUpperCase();
    if (!certNum) return;

    setStatus("loading");
    setStudent(null);

    fetch(`/api/verify?cert=${encodeURIComponent(certNum)}&dob=${encodeURIComponent(dobInput)}`)
  .then(r => r.json())
  .then(data => {
    if (data.found) {
      setStudent(data.student);
      setStatus("found");
      setVerifiedAt(new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }));
    } else {
      setStatus("notfound");
    }
  })
  .catch(() => setStatus("notfound"));

    setTimeout(() => {
      const found = SAMPLE_DATA[certNum];
      if (found) {
        setStudent(found);
        setStatus("found");
        setVerifiedAt(
          new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
        );
      } else {
        setStatus("notfound");
      }
    }, 800);
  };

  const handleSample = (id) => {
    setCertInput(id);
    setStatus("loading");
    setStudent(null);
    setTimeout(() => {
      setStudent(SAMPLE_DATA[id]);
      setStatus("found");
      setVerifiedAt(
        new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
      );
    }, 800);
  };

  const handleCopy = () => {
    if (!student) return;
    navigator.clipboard.writeText(student.enrollmentNo).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="cert-page">
      {/* ── HERO ── */}
      <div className="cert-hero">
        <div className="cert-hero__badge">
          <span className="cert-hero__dot" />
          Official Certificate Verification
        </div>
        <h1 className="cert-hero__title">Certificate Verification Portal</h1>
        <p className="cert-hero__sub">
          Verify the authenticity of skill certificates issued by Bihar Skill Hub training centres.
        </p>
        <div className="cert-hero__devanagari">
          बिहार स्किल हब – प्रमाण पत्र सत्यापन
        </div>
      </div>

      <div className="cert-main">
        {/* ── SEARCH CARD ── */}
        <div className="cert-search-card">
          <h2 className="cert-section-title">Verify a Certificate</h2>

          <div className="cert-search-row">
            <div className="cert-field">
              <label className="cert-label">Certificate / Enrollment Number *</label>
              <input
                className="cert-input"
                type="text"
                placeholder="e.g. BSH-2024-001234"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div className="cert-field cert-field--dob">
              <label className="cert-label">Date of Birth (optional)</label>
              <input
                className="cert-input"
                type="date"
                value={dobInput}
                onChange={(e) => setDobInput(e.target.value)}
              />
            </div>
            <button
              className="cert-btn-verify"
              onClick={handleVerify}
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <span className="cert-spinner" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="6.5" cy="6.5" r="4.5" />
                  <path d="M10.5 10.5l3 3" />
                </svg>
              )}
              {status === "loading" ? "Verifying…" : "Verify"}
            </button>
          </div>

          {/* Sample chips */}
          <div className="cert-samples">
            <span className="cert-samples__label">Try sample:</span>
            {["BSH-2024-001234", "BSH-2023-005678", "BSH-2024-009912", "BSH-2022-003301"].map((id) => (
              <button key={id} className="cert-chip" onClick={() => handleSample(id)}>
                {id}
              </button>
            ))}
          </div>

          {/* Status banners */}
          {status === "found" && (
            <div className="cert-banner cert-banner--success">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="#059669" />
                <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Certificate found and verified successfully.
            </div>
          )}
          {status === "notfound" && (
            <div className="cert-banner cert-banner--error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="8" fill="#DC2626" />
                <path d="M5 5l6 6M11 5l-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Certificate not found. Please check the number and try again.
            </div>
          )}
        </div>

        {/* ── RESULT CARD ── */}
        {status === "found" && student && (
          <div className="cert-result-card">
            {/* Top banner */}
            <div className="cert-result-top">
              <div className="cert-avatar">{getInitials(student.name)}</div>
              <div className="cert-result-info">
                <div className="cert-result-name">{student.name}</div>
                <div className="cert-result-parent">{student.parent}</div>
              </div>
              <div className="cert-verified-badge">
                <div className="cert-verified-pill">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="6" fill="rgba(255,255,255,0.25)" />
                    <path d="M3 6l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  VERIFIED
                </div>
                <div className="cert-serial">{student.enrollmentNo}</div>
              </div>
            </div>

            {/* Info grid */}
            <div className="cert-body">
              <div className="cert-info-grid">
                <InfoCell label="Enrollment No."   value={student.enrollmentNo} />
                <InfoCell label="Course / Trade"   value={student.course}       highlight />
                <InfoCell label="Training Institute" value={student.institute}  />
                <InfoCell label="District"         value={student.district}     />
                <InfoCell label="Issue Date"       value={student.issueDate}    />
                <InfoCell label="Valid Until"      value={student.validUntil}   />
                <InfoCell label="Overall Grade"    value={student.overallGrade} highlight />
                <InfoCell label="Sector"           value={student.sector}       />
              </div>

              {/* Certificate ID bar */}
              <div className="cert-id-bar">
                <div className="cert-id-seal">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill="#059669" />
                  </svg>
                </div>
                <div>
                  <div className="cert-id-label">Certificate ID (Unique)</div>
                  <div className="cert-id-value">{student.enrollmentNo}</div>
                </div>
                <button className="cert-copy-btn" onClick={handleCopy}>
                  {copied ? "Copied!" : "Copy ID"}
                </button>
              </div>

              {/* Subjects table */}
              <div className="cert-subjects">
                <h3 className="cert-subjects-title">Subject / Module Results</h3>
                <div className="cert-table-wrap">
                  <table className="cert-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Subject / Module</th>
                        <th>Marks</th>
                        <th>Grade</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student.subjects.map((sub, i) => (
                        <tr key={i}>
                          <td className="cert-table__num">{i + 1}</td>
                          <td>{sub.name}</td>
                          <td className="cert-table__marks">{sub.marks}/{sub.maxMarks}</td>
                          <td>
                            <span className={`cert-grade-pill ${gradeClass(sub.grade)}`}>
                              {sub.grade}
                            </span>
                          </td>
                          <td className={`cert-table__status cert-table__status--${sub.status}`}>
                            {sub.status === "pass" ? "✓ Pass" : "✗ Fail"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="cert-result-footer">
              <p>
                Verified on {verifiedAt} &bull; Official digital verification &bull;{" "}
                <a href="mailto:info@biharskillhub.co.in">info@biharskillhub.co.in</a>
              </p>
              <button className="cert-print-btn" onClick={() => window.print()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M9 14h6v8H9z" />
                </svg>
                Print / Save PDF
              </button>
            </div>
          </div>
        )}

        {/* ── HOW IT WORKS ── */}
        <div className="cert-how">
          <h2 className="cert-section-title">How to verify</h2>
          <div className="cert-steps">
            {[
              { n: 1, text: "Enter the Certificate Number printed on your physical or digital certificate" },
              { n: 2, text: "Optionally enter the student's Date of Birth for extra security" },
              { n: 3, text: "Click Verify — results appear instantly with full details" },
              { n: 4, text: "Print or save the verified result as a PDF proof" },
            ].map((s) => (
              <div key={s.n} className="cert-step">
                <div className="cert-step__num">{s.n}</div>
                <p className="cert-step__text">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerification;
