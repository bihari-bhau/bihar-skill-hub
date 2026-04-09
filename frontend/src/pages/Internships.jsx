import React, { useState } from "react";

const WHATSAPP_NUMBER = "919999999999";

const INTERNSHIPS = [
  {
    id: 1, title: "Web Development Intern", company: "Bihar Skill Hub", location: "Remote", duration: "2 Months",
    stipend: "₹5,000/month", type: "Paid", skills: ["HTML", "CSS", "React", "JavaScript"],
    eligibility: "Any Branch", openings: 5, deadline: "30 Apr 2025",
    description: "Work on real web development projects and gain hands-on experience building responsive websites and web applications.",
    color: "#1d4ed8",
  },
  {
    id: 2, title: "Python & Data Science Intern", company: "Bihar Skill Hub", location: "Remote", duration: "3 Months",
    stipend: "₹6,000/month", type: "Paid", skills: ["Python", "Pandas", "NumPy", "ML"],
    eligibility: "CSE/IT/ECE", openings: 3, deadline: "15 Apr 2025",
    description: "Assist in building data pipelines, performing data analysis, and creating machine learning models for real-world datasets.",
    color: "#7c3aed",
  },
  {
    id: 3, title: "Digital Marketing Intern", company: "Bihar Skill Hub", location: "Remote", duration: "2 Months",
    stipend: "₹4,000/month", type: "Paid", skills: ["SEO", "Social Media", "Content", "Analytics"],
    eligibility: "Any Branch", openings: 4, deadline: "20 Apr 2025",
    description: "Manage social media accounts, create content, run ad campaigns, and analyze marketing performance metrics.",
    color: "#d97706",
  },
  {
    id: 4, title: "Manual Testing Intern", company: "Bihar Skill Hub", location: "Remote", duration: "2 Months",
    stipend: "₹4,500/month", type: "Paid", skills: ["JIRA", "Test Cases", "Bug Reporting", "Agile"],
    eligibility: "Any Branch", openings: 6, deadline: "25 Apr 2025",
    description: "Write and execute test cases, report bugs, and work with the development team to ensure software quality.",
    color: "#059669",
  },
  {
    id: 5, title: "UI/UX Design Intern", company: "Bihar Skill Hub", location: "Remote", duration: "2 Months",
    stipend: "₹5,000/month", type: "Paid", skills: ["Figma", "Wireframing", "Prototyping", "Design"],
    eligibility: "Any Branch", openings: 2, deadline: "10 Apr 2025",
    description: "Design user interfaces, create wireframes and prototypes, and collaborate with developers to build great user experiences.",
    color: "#ec4899",
  },
  {
    id: 6, title: "Content Writing Intern", company: "Bihar Skill Hub", location: "Remote", duration: "1 Month",
    stipend: "₹3,000/month", type: "Paid", skills: ["Writing", "SEO", "Research", "Hindi/English"],
    eligibility: "Any Branch", openings: 8, deadline: "05 Apr 2025",
    description: "Write blog posts, course descriptions, social media content, and educational articles for Bihar Skill Hub platform.",
    color: "#0891b2",
  },
];

export default function Internships() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState("All");
  const types = ["All", "Paid", "Remote"];

  const filtered = INTERNSHIPS.filter((i) =>
    filter === "All" ? true : filter === "Paid" ? i.type === "Paid" : i.location === "Remote"
  );

  const applyNow = (intern) => {
    const msg = encodeURIComponent(`Hi! I want to apply for the ${intern.title} internship at Bihar Skill Hub.`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
  };

  return (
    <div className="internship-page">

      {/* Hero */}
      <section className="internship-hero">
        <div className="ss-hero-badge">💼 Launch Your Career</div>
        <h1>Internship Opportunities</h1>
        <p>Get real-world experience with paid internships at Bihar Skill Hub. Build your portfolio and kickstart your career!</p>
        <div className="internship-hero-stats">
          <div><strong>{INTERNSHIPS.length}+</strong><span>Open Positions</span></div>
          <div><strong>100%</strong><span>Remote</span></div>
          <div><strong>Paid</strong><span>Stipend</span></div>
          <div><strong>Certificate</strong><span>Provided</span></div>
        </div>
      </section>

      {/* Benefits */}
      <section className="internship-benefits">
        {[
          { icon: "💰", title: "Paid Stipend",         desc: "Earn ₹3,000–₹6,000/month while gaining experience" },
          { icon: "📜", title: "Internship Certificate", desc: "Get a verified certificate on completion" },
          { icon: "🏠", title: "Work from Home",        desc: "100% remote — work from anywhere in Bihar" },
          { icon: "🎓", title: "Learn & Earn",          desc: "Get mentorship from industry professionals" },
        ].map((b) => (
          <div className="benefit-card" key={b.title}>
            <span>{b.icon}</span>
            <h4>{b.title}</h4>
            <p>{b.desc}</p>
          </div>
        ))}
      </section>

      {/* Listings */}
      <section className="internship-listings">
        <div className="section-header">
          <h2>Open Internship Positions</h2>
          <p>Apply now — limited seats available!</p>
        </div>

        <div className="internship-filter">
          {types.map((t) => (
            <button key={t} className={`level-pill ${filter === t ? "active" : ""}`} onClick={() => setFilter(t)}>
              {t === "All" ? "All Internships" : t}
            </button>
          ))}
        </div>

        <div className="internship-grid">
          {filtered.map((intern) => (
            <div
              className="internship-card"
              key={intern.id}
              style={{ borderTop: `4px solid ${intern.color}` }}
            >
              <div className="internship-card-header">
                <div>
                  <h3>{intern.title}</h3>
                  <p className="internship-company">{intern.company}</p>
                </div>
                <span className="internship-type-badge" style={{ background: `${intern.color}22`, color: intern.color }}>
                  {intern.type}
                </span>
              </div>

              <p className="internship-desc">{intern.description}</p>

              <div className="internship-meta">
                <span>📍 {intern.location}</span>
                <span>⏱ {intern.duration}</span>
                <span>💰 {intern.stipend}</span>
                <span>🎓 {intern.eligibility}</span>
              </div>

              <div className="internship-skills">
                {intern.skills.map((s) => (
                  <span key={s} className="ss-tag">{s}</span>
                ))}
              </div>

              <div className="internship-footer">
                <div>
                  <p className="internship-openings">🟢 {intern.openings} openings left</p>
                  <p className="internship-deadline">📅 Apply by {intern.deadline}</p>
                </div>
                <button
                  className="internship-apply-btn"
                  style={{ background: intern.color }}
                  onClick={() => applyNow(intern)}
                >
                  Apply Now →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How to Apply */}
      <section className="how-to-apply">
        <div className="section-header">
          <h2>How to Apply?</h2>
          <p>Simple 3-step process to get your internship</p>
        </div>
        <div className="apply-steps">
          {[
            { step: "01", title: "Click Apply Now",   desc: "Click the Apply Now button on any internship listing" },
            { step: "02", title: "Message on WhatsApp", desc: "You'll be redirected to WhatsApp — send us your name, course, and resume" },
            { step: "03", title: "Get Selected",       desc: "Our team will review and get back within 24-48 hours" },
          ].map((s) => (
            <div className="apply-step" key={s.step}>
              <div className="apply-step-num">{s.step}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>Have Questions About Internships?</h2>
          <p>Talk to our team on WhatsApp and we'll guide you through the application process.</p>
          <div className="cta-buttons">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I want to know about internship opportunities at Bihar Skill Hub.")}`}
              target="_blank" rel="noreferrer"
              className="btn-hero-whatsapp"
            >
              💬 Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="whatsapp-float">
        <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span>Chat with us</span>
      </a>
    </div>
  );
}