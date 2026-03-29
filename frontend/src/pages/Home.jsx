import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/hero.jpeg";
import { api } from "../utils/api";

const WHATSAPP_NUMBER = "+91 9801917901"; // Replace with your real number
const WHATSAPP_MSG    = encodeURIComponent("Hi! I want to know more about Bihar Skill Hub courses.");

// Animated counter hook
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
  { value: 500,  suffix: "+", label: "Students Trained",  icon: "🎓" },
  { value: 11,   suffix: "+", label: "Skill Categories",  icon: "📚" },
  { value: 33,   suffix: "+", label: "Courses Available", icon: "🖥️" },
  { value: 4.8,  suffix: "★", label: "Student Rating",    icon: "⭐", decimal: true },
];

function StatCard({ value, suffix, label, icon, decimal }) {
  const count = useCounter(decimal ? value * 10 : value);
  return (
    <div className="stat-box">
      <span className="stat-icon">{icon}</span>
      <h3 className="stat-value">
        {decimal ? (count / 10).toFixed(1) : count}{suffix}
      </h3>
      <p className="stat-label">{label}</p>
    </div>
  );
}

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

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section className="hero-v2">
        <div className="hero-v2-text">
          <div className="hero-badge">🏆 Bihar's #1 Online Skill Platform</div>
          <h1>
            Launch Your Tech Career<br />
            <span className="hero-highlight">From Bihar, For Bihar</span>
          </h1>
          <p className="hero-v2-desc">
            Industry-ready courses with verified certificates, offer letters,
            and career support — designed specifically for Bihar's students.
            Learn from home, earn from anywhere.
          </p>

          {/* USP Pills */}
          <div className="hero-pills">
            <span className="hero-pill">✅ Certificate on Completion</span>
            <span className="hero-pill">✅ Offer Letter Included</span>
            <span className="hero-pill">✅ Learn at Your Own Pace</span>
          </div>

          <div className="hero-v2-buttons">
            <a href="/courses" className="btn-hero-primary">
              🚀 Explore Courses
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
              target="_blank" rel="noreferrer"
              className="btn-hero-whatsapp"
            >
              💬 Free Counseling
            </a>
          </div>
        </div>

        <div className="hero-v2-image">
          <img src={heroImg} alt="Bihar Skill Hub Learning" />
          {/* Floating cards on image */}
          <div className="hero-float-card top">
            <span>🏆</span>
            <div>
              <strong>Certificate Issued</strong>
              <small>On course completion</small>
            </div>
          </div>
          <div className="hero-float-card bottom">
            <span>📄</span>
            <div>
              <strong>Offer Letter</strong>
              <small>For every student</small>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────────────────────────── */}
      <section className="stats-bar">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </section>

      {/* ── Trust Banner ────────────────────────────────────────────────────── */}
      <section className="trust-banner">
        <div className="trust-item">
          <span className="trust-icon">🎓</span>
          <div>
            <h4>Verified Certificates</h4>
            <p>Industry-recognized on completion</p>
          </div>
        </div>
        <div className="trust-divider" />
        <div className="trust-item">
          <span className="trust-icon">📄</span>
          <div>
            <h4>Offer Letters</h4>
            <p>Issued by Bihar Skill Hub</p>
          </div>
        </div>
        <div className="trust-divider" />
        <div className="trust-item">
          <span className="trust-icon">💻</span>
          <div>
            <h4>Learn Online</h4>
            <p>Study from home, anytime</p>
          </div>
        </div>
        <div className="trust-divider" />
        <div className="trust-item">
          <span className="trust-icon">🆓</span>
          <div>
            <h4>Free Courses</h4>
            <p>Start learning for free today</p>
          </div>
        </div>
      </section>

      {/* ── Featured Courses ─────────────────────────────────────────────────── */}
      <section className="section">
        <div className="section-header">
          <h2>Featured Courses</h2>
          <p>Hand-picked courses to kickstart your tech career.</p>
        </div>
        <div className="course-grid">
          {featuredCourses.length > 0 ? featuredCourses.map((course) => (
            <div className="course-card" key={course.id}>
              {course.thumbnail ? (
                <img src={`${apiBase}${course.thumbnail}`} alt={course.title} />
              ) : (
                <div className="card-thumb-placeholder" style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", background: "linear-gradient(135deg,#eff6ff,#dbeafe)" }}>
                  📚
                </div>
              )}
              <div className="course-card-content">
                <h3>{course.title}</h3>
                <p>{course.description?.slice(0, 80)}...</p>
                <div className="course-info">
                  <span>⏱ {course.duration_hours}h</span>
                  <span>{course.is_free ? "🆓 Free" : `₹${course.price}`}</span>
                  <span>⭐ {course.rating}</span>
                </div>
                <button className="card-btn" onClick={() => navigate(`/course/${course.id}`)}>
                  Enroll Now →
                </button>
              </div>
            </div>
          )) : (
            ["Web Development", "Data Science & AI", "Java Full Stack"].map((title) => (
              <div className="course-card" key={title}>
                <div style={{ height: 160, background: "linear-gradient(135deg,#eff6ff,#dbeafe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>📚</div>
                <div className="course-card-content">
                  <h3>{title}</h3>
                  <p>Industry-ready curriculum with certificate.</p>
                  <a href="/courses" className="card-btn">Explore →</a>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a href="/courses" className="view-all-btn">View All 33 Courses →</a>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="features-v2">
        <div className="section-header">
          <h2>Why Bihar Skill Hub?</h2>
          <p>Everything you need to launch your tech career</p>
        </div>
        <div className="features-v2-grid">
          {[
            { icon: "🎓", title: "Verified Certificates", desc: "Get industry-recognized certificates on completing courses and passing quizzes." },
            { icon: "📄", title: "Offer Letters", desc: "Receive official offer letters from Bihar Skill Hub to boost your resume." },
            { icon: "🎬", title: "Video Lectures", desc: "Access high-quality video lectures and study notes anytime, anywhere." },
            { icon: "📝", title: "Quiz Based Learning", desc: "Test your knowledge with quizzes and earn certificates on passing." },
            { icon: "🆓", title: "Free Courses", desc: "Start learning with our free courses — no credit card required." },
            { icon: "📱", title: "Learn from Home", desc: "Bihar's first fully online skill platform — study from your village or city." },
          ].map(({ icon, title, desc }) => (
            <div className="feature-v2-card" key={title}>
              <div className="feature-v2-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="testimonial">
        <h2>What Our Students Say</h2>
        <div className="testimonial-wrapper">
          {[
            { img: "12", name: "Rahul Sharma",  place: "Patna", text: "Bihar Skill Hub helped me learn React and land my first internship. The certificate really helped in interviews!" },
            { img: "32", name: "Priya Verma",   place: "Muzaffarpur", text: "The courses are very practical and easy to follow. I completed the Web Development course in 2 months!" },
            { img: "15", name: "Aman Kumar",    place: "Gaya", text: "Got my offer letter after completing Java Full Stack. It added great value to my resume. Highly recommended!" },
          ].map(({ img, name, place, text }) => (
            <div className="testimonial-box" key={name}>
              <img src={`https://i.pravatar.cc/80?img=${img}`} alt={name} />
              <p>&ldquo;{text}&rdquo;</p>
              <h4>— {name}</h4>
              <small>📍 {place}, Bihar</small>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────────── */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>Ready to Launch Your Tech Career?</h2>
          <p>Join 500+ students from Bihar who are already learning and growing.</p>
          <div className="cta-buttons">
            <a href="/courses" className="btn-hero-primary">Explore Courses</a>
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

      {/* ── Why Choose Us ────────────────────────────────────────────────────── */}
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
                ["Online Platform",          "✅ 100% Online",         "❌ Mostly Offline"],
                ["Certificates",             "✅ Auto Generated PDF",  "⚠️ Manual Process"],
                ["Offer Letters",            "✅ Included",            "❌ Not Available"],
                ["Course Variety",           "✅ 33 Courses, 11 Areas","⚠️ Limited"],
                ["Free Courses",             "✅ Available",           "❌ Paid Only"],
                ["Study from Home",          "✅ Yes, Anytime",        "❌ Visit Required"],
                ["Quiz Based Certification", "✅ Yes",                 "❌ No"],
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

      {/* ── Floating WhatsApp Button ─────────────────────────────────────────── */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
        target="_blank" rel="noreferrer"
        className="whatsapp-float"
        title="Chat with us on WhatsApp"
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