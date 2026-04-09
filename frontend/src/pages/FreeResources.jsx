import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const WHATSAPP_NUMBER = "919999999999";

const RESOURCES = [
  {
    category: "Web Development",
    icon: "🌐",
    color: "#1d4ed8",
    items: [
      { title: "HTML & CSS Cheat Sheet",        type: "PDF",   size: "2.1 MB", free: true,  link: "#" },
      { title: "JavaScript ES6+ Guide",          type: "PDF",   size: "3.4 MB", free: true,  link: "#" },
      { title: "React Hooks Reference",          type: "PDF",   size: "1.8 MB", free: true,  link: "#" },
      { title: "Full Stack Roadmap 2025",        type: "PDF",   size: "4.2 MB", free: true,  link: "#" },
    ],
  },
  {
    category: "Data Science & AI",
    icon: "🤖",
    color: "#7c3aed",
    items: [
      { title: "Python for Data Science Basics", type: "PDF",  size: "5.1 MB", free: true,  link: "#" },
      { title: "Machine Learning Algorithms",    type: "PDF",  size: "6.3 MB", free: true,  link: "#" },
      { title: "Pandas Quick Reference",         type: "PDF",  size: "2.2 MB", free: true,  link: "#" },
      { title: "AI Career Roadmap 2025",         type: "PDF",  size: "3.1 MB", free: true,  link: "#" },
    ],
  },
  {
    category: "Cybersecurity",
    icon: "🔐",
    color: "#dc2626",
    items: [
      { title: "Cybersecurity Basics Guide",     type: "PDF",  size: "4.5 MB", free: true,  link: "#" },
      { title: "Linux Commands Cheat Sheet",     type: "PDF",  size: "1.9 MB", free: true,  link: "#" },
      { title: "Network Security Fundamentals",  type: "PDF",  size: "3.7 MB", free: true,  link: "#" },
    ],
  },
  {
    category: "Software Testing",
    icon: "🧪",
    color: "#059669",
    items: [
      { title: "Manual Testing Basics",          type: "PDF",  size: "2.8 MB", free: true,  link: "#" },
      { title: "JIRA Quick Start Guide",         type: "PDF",  size: "1.6 MB", free: true,  link: "#" },
      { title: "Selenium WebDriver Guide",       type: "PDF",  size: "4.1 MB", free: true,  link: "#" },
      { title: "Testing Interview Questions",    type: "PDF",  size: "2.3 MB", free: true,  link: "#" },
    ],
  },
  {
    category: "Career & Interview",
    icon: "💼",
    color: "#d97706",
    items: [
      { title: "Resume Writing Guide for Freshers", type: "PDF", size: "2.0 MB", free: true, link: "#" },
      { title: "Top 50 HR Interview Questions",    type: "PDF", size: "1.5 MB", free: true, link: "#" },
      { title: "GitHub Portfolio Guide",           type: "PDF", size: "1.8 MB", free: true, link: "#" },
      { title: "LinkedIn Profile Optimization",    type: "PDF", size: "1.2 MB", free: true, link: "#" },
    ],
  },
  {
    category: "Prompt Engineering",
    icon: "✨",
    color: "#0891b2",
    items: [
      { title: "ChatGPT Prompts for Students",   type: "PDF",  size: "1.4 MB", free: true,  link: "#" },
      { title: "AI Tools for Productivity",      type: "PDF",  size: "2.1 MB", free: true,  link: "#" },
      { title: "Prompt Engineering Basics",      type: "PDF",  size: "1.7 MB", free: true,  link: "#" },
    ],
  },
];

const FREE_COURSES = [
  { title: "HTML & CSS Fundamentals",       category: "Web Development",   students: "3,240", id: 1 },
  { title: "Cybersecurity Essentials",      category: "Cybersecurity",     students: "2,870", id: 4 },
  { title: "Digital Marketing Fundamentals", category: "Digital Marketing", students: "3,980", id: 5 },
  { title: "Graphic Design for Beginners",  category: "Graphic Design",    students: "2,650", id: 6 },
  { title: "Prompt Engineering Basics",     category: "Prompt Engineering", students: "4,200", id: 8 },
  { title: "Software Testing Fundamentals", category: "Manual Testing",    students: "3,100", id: 10 },
];

export default function FreeResources() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = ["All", ...RESOURCES.map((r) => r.category)];

  const filtered = activeCategory === "All"
    ? RESOURCES
    : RESOURCES.filter((r) => r.category === activeCategory);

  return (
    <div className="resources-page">

      {/* Hero */}
      <section className="resources-hero">
        <div className="ss-hero-badge">🆓 100% Free Resources</div>
        <h1>Free Study Materials</h1>
        <p>Download free PDFs, cheat sheets, roadmaps, and guides to boost your learning — no payment required!</p>
        <div className="resources-hero-stats">
          <div><strong>20+</strong><span>Free PDFs</span></div>
          <div><strong>6</strong><span>Categories</span></div>
          <div><strong>6</strong><span>Free Courses</span></div>
        </div>
      </section>

      {/* Free Courses */}
      <section className="resources-section">
        <div className="section-header">
          <h2>🎓 Free Courses</h2>
          <p>Enroll in these courses completely free — no credit card needed!</p>
        </div>
        <div className="free-courses-grid">
          {FREE_COURSES.map((course) => (
            <div className="free-course-card" key={course.id}>
              <div className="free-course-badge">FREE</div>
              <h3>{course.title}</h3>
              <p className="free-course-category">{course.category}</p>
              <p className="free-course-students">👨‍🎓 {course.students} students enrolled</p>
              <button className="free-enroll-btn" onClick={() => navigate(`/course/${course.id}`)}>
                Enroll Free →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Resources */}
      <section className="resources-section" style={{ background: "#f8fafc", padding: "60px 40px" }}>
        <div className="section-header">
          <h2>📄 Free Study Materials</h2>
          <p>Download PDFs, cheat sheets, and roadmaps for your learning journey</p>
        </div>

        {/* Category Filter */}
        <div className="resources-filter">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`level-pill ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Resource Cards */}
        {filtered.map((group) => (
          <div className="resource-group" key={group.category}>
            <div className="resource-group-header" style={{ borderLeftColor: group.color }}>
              <span>{group.icon}</span>
              <h3>{group.category}</h3>
            </div>
            <div className="resource-items">
              {group.items.map((item) => (
                <div className="resource-item" key={item.title}>
                  <div className="resource-item-left">
                    <span className="resource-type-badge">{item.type}</span>
                    <div>
                      <p className="resource-title">{item.title}</p>
                      <small>{item.size}</small>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! I want to download: ${item.title}`)}`}
                    target="_blank" rel="noreferrer"
                    className="resource-download-btn"
                    style={{ background: group.color }}
                  >
                    ⬇ Download Free
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>Want More Resources?</h2>
          <p>Join Bihar Skill Hub and get access to full courses, video lectures, notes, and certificates!</p>
          <div className="cta-buttons">
            <button className="btn-hero-primary" onClick={() => navigate("/courses")}>
              Browse All Courses
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I want more free resources.")}`}
              target="_blank" rel="noreferrer"
              className="btn-hero-whatsapp"
            >
              💬 Request Resource
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