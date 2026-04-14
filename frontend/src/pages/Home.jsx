import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/hero.jpeg";
import { api } from "../utils/api";

const WHATSAPP_NUMBER = "919999999999";
const WHATSAPP_MSG    = encodeURIComponent("Hi! I want to know more about Bihar Skill Hub courses.");

// Animated counter
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

const STATS = [
  { value: 500,  suffix: "+", label: "Students",    icon: "🎓", decimal: false },
  { value: 11,   suffix: "+", label: "Categories",  icon: "📚", decimal: false },
  { value: 33,   suffix: "+", label: "Courses",     icon: "🖥️", decimal: false },
  { value: 4.8,  suffix: "★", label: "Rating",      icon: "⭐", decimal: true  },
];

function StatCard({ value, suffix, label, icon, decimal }) {
  const count = useCounter(decimal ? value * 10 : value);
  return (
    <div className="glass-stat-card">
      <span className="glass-stat-icon">{icon}</span>
      <h3 className="glass-stat-value">
        {decimal ? (count / 10).toFixed(1) : count}{suffix}
      </h3>
      <p className="glass-stat-label">{label}</p>
    </div>
  );
}

// Floating isolator blobs for hero background
function HeroIsolators() {
  return (
    <div className="hero-isolators" aria-hidden="true">
      <div className="isolator iso-1">🎓</div>
      <div className="isolator iso-2">💻</div>
      <div className="isolator iso-3">🏆</div>
      <div className="isolator iso-4">📱</div>
      <div className="isolator iso-5">🚀</div>
      <div className="isolator iso-6">⭐</div>
      <div className="isolator iso-7">📄</div>
      <div className="isolator iso-8">🎯</div>
    </div>
  );
}

const CATEGORY_ICONS = {
  "Web Development":        { icon: "🌐", color: "#1d4ed8", bg: "#eff6ff" },
  "Data Science & AI":      { icon: "🤖", color: "#7c3aed", bg: "#f5f3ff" },
  "Mobile App Development": { icon: "📱", color: "#0891b2", bg: "#ecfeff" },
  "Cybersecurity":          { icon: "🔐", color: "#dc2626", bg: "#fff1f2" },
  "Digital Marketing":      { icon: "📣", color: "#d97706", bg: "#fffbeb" },
  "Graphic Design":         { icon: "🎨", color: "#ec4899", bg: "#fdf2f8" },
  "Internet of Things":     { icon: "💡", color: "#059669", bg: "#ecfdf5" },
  "Prompt Engineering":     { icon: "✨", color: "#6366f1", bg: "#eef2ff" },
  "Java Full Stack":        { icon: "☕", color: "#b45309", bg: "#fffbeb" },
  "Manual Testing":         { icon: "🧪", color: "#0f766e", bg: "#f0fdfa" },
  "Automation Testing":     { icon: "⚙️", color: "#475569", bg: "#f8fafc" },
};

const Home = () => {
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    api.get("/courses/")
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : Array.isArray(d.results) ? d.results : [];
        setFeaturedCourses(list.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="home-page">

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="hero-v3">
        <HeroIsolators />
        <div className="hero-v3-content">
          <div className="hero-v3-text">
            <div className="hero-badge">🏆 Bihar's #1 Online Skill Platform</div>
            <h1>
              Launch Your Tech Career
              <span className="hero-highlight"> From Bihar</span>
            </h1>
            <p className="hero-v3-desc">
              Industry-ready courses with verified certificates, offer letters,
              and career support — learn from home, earn from anywhere.
            </p>
            <div className="hero-pills">
              <span className="hero-pill">✅ Certificate on Completion</span>
              <span className="hero-pill">✅ Offer Letter Included</span>
              <span className="hero-pill">✅ Learn at Your Own Pace</span>
            </div>
            <div className="hero-v3-btns">
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

          <div className="hero-v3-image">
            <div className="hero-image-glow" />
            <img src={heroImg} alt="Bihar Skill Hub" />
            {/* Glass float cards */}
            <div className="glass-float-card top-left">
              <span>🏆</span>
              <div>
                <strong>Certificate</strong>
                <small>Auto Generated</small>
              </div>
            </div>
            <div className="glass-float-card bottom-right">
              <span>📄</span>
              <div>
                <strong>Offer Letter</strong>
                <small>For Every Student</small>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar inside hero */}
        <div className="hero-v3-stats">
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      {/* ── CATEGORY ISOLATORS ──────────────────────────────────────────── */}
      <section className="category-isolators-section">
        <div className="section-header">
          <h2>Explore Skill Categories</h2>
          <p>11 in-demand categories to launch your tech career</p>
        </div>
        <div className="category-isolators-grid">
          {Object.entries(CATEGORY_ICONS).map(([name, { icon, color, bg }]) => (
            <button
              key={name}
              className="category-isolator-btn"
              onClick={() => navigate(`/courses?category=${encodeURIComponent(name)}`)}
              style={{ "--cat-color": color, "--cat-bg": bg }}
            >
              <div className="cat-iso-icon" style={{ background: bg, color }}>
                {icon}
              </div>
              <span>{name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── FEATURED COURSES ────────────────────────────────────────────── */}
      <section className="section featured-courses-section">
        <div className="section-header">
          <h2>Featured Courses</h2>
          <p>Hand-picked courses to kickstart your tech career</p>
        </div>
        <div className="glass-course-grid">
          {featuredCourses.length > 0 ? featuredCourses.map((course) => {
            const catInfo = CATEGORY_ICONS[course.category_name] || { icon: "📚", color: "#1d4ed8", bg: "#eff6ff" };
            return (
              <div className="glass-course-card" key={course.id} onClick={() => navigate(`/course/${course.id}`)}>
                <div className="glass-course-thumb" style={{ background: `linear-gradient(135deg, ${catInfo.bg}, #fff)` }}>
                  <span className="glass-course-icon">{catInfo.icon}</span>
                  {course.is_free && <span className="free-badge">FREE</span>}
                </div>
                <div className="glass-course-body">
                  <span className="card-category" style={{ color: catInfo.color }}>{course.category_name}</span>
                  <h3 className="card-title">{course.title}</h3>
                  <p className="card-desc">{course.description?.slice(0, 90)}...</p>
                  <div className="glass-course-meta">
                    <span>⏱ {course.duration_hours}h</span>
                    <span>⭐ {course.rating}</span>
                    <span>👨‍🎓 {Number(course.students_count || 0).toLocaleString()}</span>
                  </div>
                  <div className="glass-course-footer">
                    <span className={course.is_free ? "price-free" : "price-paid"}>
                      {course.is_free ? "Free" : `₹${Number(course.price).toLocaleString()}`}
                    </span>
                    <button className="card-enroll-btn" style={{ background: catInfo.color }}>
                      Enroll Now →
                    </button>
                  </div>
                </div>
              </div>
            );
          }) : [
            { title: "Web Development", cat: "Web Development" },
            { title: "Data Science & AI", cat: "Data Science & AI" },
            { title: "Prompt Engineering", cat: "Prompt Engineering" },
          ].map(({ title, cat }) => {
            const catInfo = CATEGORY_ICONS[cat] || { icon: "📚", color: "#1d4ed8", bg: "#eff6ff" };
            return (
              <div className="glass-course-card" key={title} onClick={() => navigate("/courses")}>
                <div className="glass-course-thumb" style={{ background: `linear-gradient(135deg, ${catInfo.bg}, #fff)` }}>
                  <span className="glass-course-icon">{catInfo.icon}</span>
                </div>
                <div className="glass-course-body">
                  <h3 className="card-title">{title}</h3>
                  <p className="card-desc">Industry-ready curriculum with verified certificate.</p>
                  <button className="card-enroll-btn" style={{ background: catInfo.color }}>Explore →</button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button className="view-all-btn" onClick={() => navigate("/courses")}>
            View All 33 Courses →
          </button>
        </div>
      </section>

      {/* ── GLASS FEATURES ──────────────────────────────────────────────── */}
      <section className="glass-features-section">
        <div className="glass-features-bg">
          {/* Background isolators */}
          <div className="feat-iso feat-iso-1">🎓</div>
          <div className="feat-iso feat-iso-2">💻</div>
          <div className="feat-iso feat-iso-3">🏆</div>
        </div>
        <div className="section-header" style={{ color: "#fff" }}>
          <h2 style={{ color: "#fff" }}>Why Bihar Skill Hub?</h2>
          <p style={{ color: "#bfdbfe" }}>Everything you need to launch your tech career</p>
        </div>
        <div className="glass-features-grid">
          {[
            { icon: "🎓", title: "Verified Certificates",   desc: "Auto-generated PDF certificates on completing courses and passing quizzes." },
            { icon: "📄", title: "Offer Letters",           desc: "Official offer letters from Bihar Skill Hub to boost your resume." },
            { icon: "🎬", title: "Video Lectures",          desc: "High-quality video lectures and study notes accessible anytime." },
            { icon: "📝", title: "Quiz Based Learning",     desc: "Test your knowledge with MCQ quizzes and earn certificates on passing." },
            { icon: "🆓", title: "Free Courses Available",  desc: "Start with free courses — no credit card, no commitment." },
            { icon: "📱", title: "Learn from Home",         desc: "Bihar's first fully online platform — study from village or city." },
          ].map(({ icon, title, desc }) => (
            <div className="glass-feature-card" key={title}>
              <div className="glass-feature-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section className="testimonial">
        <h2>What Our Students Say</h2>
        <div className="testimonial-wrapper">
          {[
            { img: "12", name: "Rahul Sharma",  place: "Patna",       text: "Bihar Skill Hub helped me learn React and land my first internship. The certificate really helped in interviews!" },
            { img: "32", name: "Priya Verma",   place: "Muzaffarpur", text: "The courses are very practical and easy to follow. Completed Web Development in 2 months from home!" },
            { img: "15", name: "Aman Kumar",    place: "Gaya",        text: "Got my offer letter after completing Java Full Stack. It added great value to my resume. Highly recommended!" },
          ].map(({ img, name, place, text }) => (
            <div className="glass-testimonial-card" key={name}>
              <div className="glass-testi-quote">"</div>
              <img src={`https://i.pravatar.cc/80?img=${img}`} alt={name} />
              <p>{text}</p>
              <h4>— {name}</h4>
              <small>📍 {place}, Bihar</small>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUST BANNER ────────────────────────────────────────────────── */}
      <section className="trust-banner">
        {[
          { icon: "🎓", title: "Verified Certificates", desc: "Industry-recognized" },
          { icon: "📄", title: "Offer Letters",         desc: "Issued by Bihar Skill Hub" },
          { icon: "💻", title: "Learn Online",          desc: "Study from home, anytime" },
          { icon: "🆓", title: "Free Courses",          desc: "Start learning for free" },
        ].map((t, i) => (
          <React.Fragment key={t.title}>
            <div className="trust-item">
              <span className="trust-icon">{t.icon}</span>
              <div><h4>{t.title}</h4><p>{t.desc}</p></div>
            </div>
            {i < 3 && <div className="trust-divider" />}
          </React.Fragment>
        ))}
      </section>

      {/* ── COMPARE TABLE ───────────────────────────────────────────────── */}
      <section className="why-section">
        <div className="section-header">
          <h2>Bihar Skill Hub vs Others</h2>
          <p>See why we are the smarter choice for Bihar students</p>
        </div>
        <div className="compare-table">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th className="us-col">🏆 Bihar Skill Hub</th>
                <th>Others</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Online Platform",          "✅ 100% Online",        "❌ Mostly Offline"],
                ["Certificates",             "✅ Auto Generated PDF", "⚠️ Manual Process"],
                ["Offer Letters",            "✅ Included",           "❌ Not Available"],
                ["Course Variety",           "✅ 33 Courses, 11 Areas","⚠️ Limited"],
                ["Free Courses",             "✅ Available",          "❌ Paid Only"],
                ["Study from Home",          "✅ Yes, Anytime",       "❌ Visit Required"],
                ["Quiz Based Certification", "✅ Yes",                "❌ No"],
              ].map(([feature, us, other]) => (
                <tr key={feature}>
                  <td>{feature}</td>
                  <td className="us-col">{us}</td>
                  <td>{other}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>Ready to Launch Your Tech Career?</h2>
          <p>Join 500+ students from Bihar who are already learning and growing.</p>
          <div className="cta-buttons">
            <button className="btn-hero-primary" onClick={() => navigate("/courses")}>
              Explore Courses
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
              target="_blank" rel="noreferrer"
              className="btn-hero-whatsapp"
            >
              💬 Talk to Us on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── FLOATING WHATSAPP ────────────────────────────────────────────── */}
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
};

export default Home;