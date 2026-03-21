import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/hero.jpeg";
import { api } from "../utils/api";

const Home = () => {
  const navigate = useNavigate();
  const [featuredCourses, setFeaturedCourses] = useState([]);

  useEffect(() => {
    api.get("/courses/?page_size=3")
      .then((r) => r.json())
      .then((d) => setFeaturedCourses((d.results ?? d).slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div className="home-page">

      {/* Hero */}
      <section className="hero">
        <div className="hero-text">
          <p className="hero-tag">Learn Smart. Build Skills. Grow Fast.</p>
          <h1>Learn Skills Online</h1>
          <p className="hero-desc">
            Join thousands of students learning programming, web development and
            modern technologies.
          </p>
          <div className="hero-buttons">
            <a href="/courses" className="btn primary-btn">Explore Courses</a>
            <a href="/register" className="btn secondary-btn">Get Started</a>
          </div>
        </div>
        <div className="hero-image">
          <img src={heroImg} alt="Learning" />
        </div>
      </section>

      {/* Featured Courses — loaded live from Django */}
      <section className="section">
        <div className="section-header">
          <h2>Featured Courses</h2>
          <p>Choose from our most popular courses.</p>
        </div>
        <div className="course-grid">
          {featuredCourses.length > 0 ? featuredCourses.map((course) => (
            <div className="course-card" key={course.id}>
              {course.thumbnail && (
                <img src={`http://localhost:8000${course.thumbnail}`} alt={course.title} />
              )}
              <div className="course-card-content">
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div className="course-info">
                  <span>⏱ {course.duration_hours}h</span>
                  <span>{course.is_free ? "Free" : `₹${course.price}`}</span>
                </div>
                <button className="card-btn" onClick={() => navigate(`/course/${course.id}`)}>
                  Enroll Now
                </button>
              </div>
            </div>
          )) : (
            // Fallback placeholder cards while loading or if no courses yet
            ["React Development", "JavaScript Mastery", "Node.js Backend"].map((title) => (
              <div className="course-card" key={title}>
                <div className="course-card-content">
                  <h3>{title}</h3>
                  <p>Enroll and start your journey.</p>
                  <a href="/courses" className="card-btn">Explore</a>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature-card"><h3>Expert Instructors</h3><p>Learn from experienced developers and industry experts.</p></div>
        <div className="feature-card"><h3>Real Projects</h3><p>Work on practical projects to strengthen your skills.</p></div>
        <div className="feature-card"><h3>Lifetime Access</h3><p>Get unlimited access to course materials anytime.</p></div>
        <div className="feature-card"><h3>Career Support</h3><p>Guidance for building your portfolio and getting jobs.</p></div>
      </section>

      {/* Testimonials */}
      <section className="testimonial">
        <h2>What Our Students Say</h2>
        <div className="testimonial-wrapper">
          {[
            { img: "12", name: "Rahul Sharma", text: "This platform helped me understand React and build real projects. Highly recommended for beginners!" },
            { img: "32", name: "Priya Verma",  text: "The courses are simple, practical, and very easy to follow. I really liked the clean design." },
            { img: "15", name: "Aman Kumar",   text: "I improved my frontend skills and understood JavaScript concepts much better with this platform." },
          ].map(({ img, name, text }) => (
            <div className="testimonial-box" key={name}>
              <img src={`https://i.pravatar.cc/80?img=${img}`} alt={name} />
              <p>&ldquo;{text}&rdquo;</p>
              <h4>— {name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-section">
        <div className="section-header">
          <h2>Why Choose Us</h2>
          <p>We make learning simple, practical, and career-focused.</p>
        </div>
        <div className="why-grid">
          {[
            { icon: "🎯", title: "Practical Learning", desc: "Learn with real examples and project-based content." },
            { icon: "👨‍🏫", title: "Expert Guidance",   desc: "Understand concepts easily with structured lessons." },
            { icon: "🚀", title: "Career Focused",    desc: "Courses designed for internships and jobs." },
          ].map(({ icon, title, desc }) => (
            <div className="why-card" key={title}>
              <div className="why-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
