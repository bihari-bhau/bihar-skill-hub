import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const WHATSAPP_NUMBER = "919801917901";
const WHATSAPP_MSG    = encodeURIComponent("Hi! I want to know more about Bihar Skill Hub courses.");

const STORIES = [
  {
    id: 1,
    name:    "Smriti Kaushik",
    location: "Patna, Bihar",
    course:   "Python Full Stack",
    avatar:   "SK",
    color:    "#1d4ed8",
    rating:   5,
    quote:    "One of the best online platforms for the students of Bihar to learn from home or any remote location. The Python Full Stack course gave me hands-on experience with real projects. The video lectures are very clear and the study notes helped me revise quickly. I now have the confidence to apply for software jobs. Bihar Skill Hub is truly changing lives here in Bihar!",
    tags:     ["Python", "Django", "React", "Full Stack"],
  },
  {
    id: 2,
    name:    "Saurav Kumar",
    location: "Sasaram, Bihar",
    course:   "Manual Testing",
    avatar:   "SK",
    color:    "#7c3aed",
    rating:   5,
    quote:    "I had no idea about software testing before joining Bihar Skill Hub. The Manual Testing course explained everything from basics to advanced concepts in a very simple way. The quiz-based certification gave me proof of my skills. I am now actively applying for QA roles and the certificate from Bihar Skill Hub has helped me stand out in interviews. Highly recommended for all Bihar students!",
    tags:     ["JIRA", "Test Cases", "Bug Reporting", "QA"],
  },
  {
    id: 3,
    name:    "Manjeet Kumar",
    location: "Vaishali, Bihar",
    course:   "Web Development",
    avatar:   "MK",
    color:    "#059669",
    rating:   5,
    quote:    "Bihar Skill Hub opened the door to a completely new world for me. Coming from a small town in Vaishali, I never thought I could learn web development so easily. The HTML, CSS and JavaScript concepts were explained with real examples. I built my first website during the course itself! The offer letter I received after completion boosted my confidence tremendously. Thank you Bihar Skill Hub!",
    tags:     ["HTML", "CSS", "JavaScript", "React"],
  },
  {
    id: 4,
    name:    "Lalit Kumar",
    location: "Muzaffarpur, Bihar",
    course:   "Selenium Automation",
    avatar:   "LK",
    color:    "#dc2626",
    rating:   5,
    quote:    "I completed my graduation but was struggling to find the right direction for my career. Bihar Skill Hub's Selenium course changed everything. I learned automation testing from scratch and the hands-on projects gave me real experience. The certificate I earned after passing the quiz is now my biggest achievement. I am grateful to Bihar Skill Hub for making quality tech education accessible in Bihar!",
    tags:     ["Selenium", "Java", "TestNG", "Automation"],
  },
  {
    id: 5,
    name:    "Smita Thakur",
    location: "Gaya, Bihar",
    course:   "Prompt Engineering",
    avatar:   "ST",
    color:    "#d97706",
    rating:   5,
    quote:    "Prompt Engineering is the skill of the future and Bihar Skill Hub was one of the first platforms to offer it in Hindi-friendly language. I learned how to use AI tools professionally and now I help businesses use AI in their work. The course content was up to date and very practical. Being a girl from Gaya, I am proud that I could learn such a cutting-edge skill from the comfort of my home!",
    tags:     ["ChatGPT", "AI Tools", "Prompt Design", "LLMs"],
  },
];

const STATS = [
  { value: "500+", label: "Students Trained",    icon: "🎓" },
  { value: "11+",  label: "Skill Categories",    icon: "📚" },
  { value: "100%", label: "Online Learning",      icon: "💻" },
  { value: "4.8★", label: "Average Rating",       icon: "⭐" },
];

function StarRating({ count }) {
  return (
    <div className="ss-stars">
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </div>
  );
}

export default function SuccessStories() {
  const navigate  = useNavigate();
  const [active, setActive] = useState(null);

  return (
    <div className="ss-page">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="ss-hero">
        <div className="ss-hero-content">
          <div className="ss-hero-badge">🏆 Real Stories, Real Results</div>
          <h1>Success Stories from<br /><span className="ss-highlight">Bihar's Students</span></h1>
          <p>
            These are real students from Bihar who transformed their careers
            with Bihar Skill Hub. Their stories prove that quality tech
            education is now accessible to everyone in Bihar.
          </p>
          <div className="ss-hero-stats">
            {STATS.map((s) => (
              <div className="ss-hero-stat" key={s.label}>
                <span>{s.icon}</span>
                <strong>{s.value}</strong>
                <small>{s.label}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stories Grid ──────────────────────────────────────────────────── */}
      <section className="ss-section">
        <div className="section-header">
          <h2>Meet Our Students</h2>
          <p>From small towns of Bihar to big tech careers</p>
        </div>

        <div className="ss-grid">
          {STORIES.map((s) => (
            <div
              className={`ss-card ${active === s.id ? "expanded" : ""}`}
              key={s.id}
            >
              {/* Card Header */}
              <div className="ss-card-header" style={{ background: `linear-gradient(135deg, ${s.color}22, ${s.color}11)`, borderTop: `4px solid ${s.color}` }}>
                <div className="ss-avatar" style={{ background: s.color }}>
                  {s.avatar}
                </div>
                <div className="ss-info">
                  <h3>{s.name}</h3>
                  <p className="ss-location">📍 {s.location}</p>
                  <span className="ss-course" style={{ background: `${s.color}22`, color: s.color }}>
                    {s.course}
                  </span>
                </div>
                <StarRating count={s.rating} />
              </div>

              {/* Quote */}
              <div className="ss-quote">
                <span className="ss-quote-mark">"</span>
                <p className={active === s.id ? "" : "ss-clamp"}>
                  {s.quote}
                </p>
                <button
                  className="ss-read-more"
                  onClick={() => setActive(active === s.id ? null : s.id)}
                >
                  {active === s.id ? "Show less ↑" : "Read more ↓"}
                </button>
              </div>

              {/* Tags */}
              <div className="ss-tags">
                {s.tags.map((tag) => (
                  <span key={tag} className="ss-tag">{tag}</span>
                ))}
              </div>

              {/* Footer */}
              <div className="ss-card-footer">
                <span className="ss-verified">✅ Verified Student</span>
                <button
                  className="ss-enroll-btn"
                  style={{ background: s.color }}
                  onClick={() => navigate("/courses")}
                >
                  Enroll Like {s.name.split(" ")[0]}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Share Your Story ──────────────────────────────────────────────── */}
      <section className="ss-share">
        <div className="ss-share-content">
          <h2>Are You a Bihar Skill Hub Student?</h2>
          <p>Share your success story and inspire thousands of students across Bihar!</p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I want to share my success story with Bihar Skill Hub.")}`}
            target="_blank" rel="noreferrer"
            className="btn-hero-whatsapp"
          >
            💬 Share Your Story on WhatsApp
          </a>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>Your Success Story Starts Today!</h2>
          <p>Join 500+ students from Bihar who are already learning and growing.</p>
          <div className="cta-buttons">
            <button className="btn-hero-primary" onClick={() => navigate("/courses")}>
              🚀 Start Learning Now
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
              target="_blank" rel="noreferrer"
              className="btn-hero-whatsapp"
            >
              💬 Free Career Counseling
            </a>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
        target="_blank" rel="noreferrer"
        className="whatsapp-float"
      >
        <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span>Chat with us</span>
      </a>

    </div>
  );
}