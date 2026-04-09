import React from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/hero.jpeg";

const WHATSAPP_NUMBER = "919999999999";
const WHATSAPP_MSG    = encodeURIComponent("Hi! I want to know more about Bihar Skill Hub.");

const TEAM = [
  { name: "Shubham Singh", role: "Founder & CEO", avatar: "SS", color: "#1d4ed8", bio: "Passionate about bringing quality tech education to every corner of Bihar." },
  { name: "Tech Team",     role: "Course Experts", avatar: "TT", color: "#7c3aed", bio: "Industry professionals with 5+ years of experience in software development." },
  { name: "Support Team",  role: "Student Support", avatar: "ST", color: "#059669", bio: "Dedicated to helping every student succeed in their learning journey." },
];

const MILESTONES = [
  { year: "2024", title: "Bihar Skill Hub Founded", desc: "Started with a vision to make tech education accessible to Bihar students." },
  { year: "2024", title: "First 100 Students",      desc: "Reached 100 enrolled students within the first 3 months of launch." },
  { year: "2025", title: "11 Course Categories",    desc: "Expanded to 11 skill categories with 33+ courses across all levels." },
  { year: "2025", title: "500+ Students Trained",   desc: "Crossed 500 students with certificates issued across Bihar." },
];

const VALUES = [
  { icon: "🎯", title: "Accessibility",   desc: "Quality tech education should be available to every student in Bihar, regardless of location." },
  { icon: "💡", title: "Practical Learning", desc: "We focus on real-world skills that employers actually need, not just theory." },
  { icon: "🤝", title: "Student First",   desc: "Every decision we make puts the student's success and growth at the center." },
  { icon: "🚀", title: "Career Impact",   desc: "We measure our success by how many students get jobs and internships after our courses." },
];

export default function AboutUs() {
  const navigate = useNavigate();
  return (
    <div className="about-page">

      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-content">
          <div className="ss-hero-badge">🏆 Bihar's #1 Online Skill Platform</div>
          <h1>About Bihar Skill Hub</h1>
          <p>
            We are on a mission to transform tech education in Bihar.
            Our platform gives every student the tools, knowledge, and
            certificates they need to launch a successful tech career —
            from the comfort of their home.
          </p>
          <div className="about-hero-btns">
            <button className="btn-hero-primary" onClick={() => navigate("/courses")}>
              Explore Courses
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
              target="_blank" rel="noreferrer"
              className="btn-hero-whatsapp"
            >
              💬 Talk to Us
            </a>
          </div>
        </div>
        <div className="about-hero-image">
          <img src={heroImg} alt="Bihar Skill Hub" />
        </div>
      </section>

      {/* Mission */}
      <section className="about-mission">
        <div className="about-mission-inner">
          <div className="mission-card">
            <span className="mission-icon">🎯</span>
            <h3>Our Mission</h3>
            <p>To make world-class tech education accessible to every student in Bihar through affordable, practical, and industry-aligned online courses.</p>
          </div>
          <div className="mission-card">
            <span className="mission-icon">👁️</span>
            <h3>Our Vision</h3>
            <p>To become Bihar's most trusted online skill development platform, creating 10,000+ job-ready tech professionals by 2027.</p>
          </div>
          <div className="mission-card">
            <span className="mission-icon">⭐</span>
            <h3>Our Promise</h3>
            <p>Every student who completes a course receives a verified certificate and offer letter, adding real value to their career journey.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats">
        {[
          { value: "500+", label: "Students Trained",    icon: "🎓" },
          { value: "33+",  label: "Courses Available",   icon: "📚" },
          { value: "11+",  label: "Skill Categories",    icon: "🗂️" },
          { value: "4.8★", label: "Average Rating",      icon: "⭐" },
          { value: "100%", label: "Online Platform",     icon: "💻" },
          { value: "Free", label: "Starter Courses",     icon: "🆓" },
        ].map((s) => (
          <div className="about-stat" key={s.label}>
            <span>{s.icon}</span>
            <strong>{s.value}</strong>
            <p>{s.label}</p>
          </div>
        ))}
      </section>

      {/* Values */}
      <section className="about-values">
        <div className="section-header">
          <h2>Our Core Values</h2>
          <p>The principles that guide everything we do at Bihar Skill Hub</p>
        </div>
        <div className="values-grid">
          {VALUES.map((v) => (
            <div className="value-card" key={v.title}>
              <span className="value-icon">{v.icon}</span>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Journey / Milestones */}
      <section className="about-journey">
        <div className="section-header">
          <h2>Our Journey</h2>
          <p>From a small idea to Bihar's leading skill platform</p>
        </div>
        <div className="timeline">
          {MILESTONES.map((m, i) => (
            <div className={`timeline-item ${i % 2 === 0 ? "left" : "right"}`} key={m.title}>
              <div className="timeline-content">
                <span className="timeline-year">{m.year}</span>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
              </div>
              <div className="timeline-dot" />
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="about-team">
        <div className="section-header">
          <h2>Meet the Team</h2>
          <p>The people behind Bihar Skill Hub</p>
        </div>
        <div className="team-grid">
          {TEAM.map((t) => (
            <div className="team-card" key={t.name}>
              <div className="team-avatar" style={{ background: t.color }}>
                {t.avatar}
              </div>
              <h3>{t.name}</h3>
              <span className="team-role">{t.role}</span>
              <p>{t.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>Ready to Join Bihar Skill Hub?</h2>
          <p>Start your tech career journey today with Bihar's most trusted online platform.</p>
          <div className="cta-buttons">
            <button className="btn-hero-primary" onClick={() => navigate("/courses")}>
              🚀 Explore Courses
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
              target="_blank" rel="noreferrer"
              className="btn-hero-whatsapp"
            >
              💬 Free Counseling
            </a>
          </div>
        </div>
      </section>

      {/* WhatsApp Float */}
      <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`} target="_blank" rel="noreferrer" className="whatsapp-float">
        <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span>Chat with us</span>
      </a>
    </div>
  );
}