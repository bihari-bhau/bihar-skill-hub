import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LEVELS = ["All", "beginner", "intermediate", "advanced"];
const LANGUAGES = ["All", "hindi", "english", "hinglish"];
const SORT_OPTIONS = [
  { label: "Newest",       value: "newest" },
  { label: "Price: Low",   value: "price_asc" },
  { label: "Price: High",  value: "price_desc" },
  { label: "Duration",     value: "duration" },
  { label: "Top Rated",    value: "rating" },
  { label: "Most Popular", value: "students" },
];

const LEVEL_COLORS = {
  beginner:     { bg: "#d1fae5", color: "#065f46" },
  intermediate: { bg: "#dbeafe", color: "#1e40af" },
  advanced:     { bg: "#ede9fe", color: "#5b21b6" },
};

const LANG_ICONS = { hindi: "🇮🇳", english: "🇬🇧", hinglish: "🤝" };
const LANG_LABELS = { hindi: "Hindi", english: "English", hinglish: "Hinglish" };

function StarRating({ rating }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="stars">
      {"★".repeat(full)}{half ? "½" : ""}{"☆".repeat(empty)}
      <span className="rating-num">{Number(rating).toFixed(1)}</span>
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getCategoryIcon(category) {
  const icons = {
    "Web Development":        "🌐",
    "Data Science & AI":      "🤖",
    "Mobile App Development": "📱",
    "Cybersecurity":          "🔐",
    "Digital Marketing":      "📣",
    "Graphic Design":         "🎨",
    "Internet of Things":     "💡",
    "Prompt Engineering":     "✨",
    "Java Full Stack":        "☕",
    "Manual Testing":         "🧪",
    "Automation Testing":     "⚙️",
  };
  return icons[category] || "📚";
}

export default function Courses() {
  const navigate = useNavigate();
  const [courses,     setCourses]     = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [search,      setSearch]      = useState("");
  const [activeTab,   setActiveTab]   = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [langFilter,  setLangFilter]  = useState("All");
  const [sortBy,      setSortBy]      = useState("newest");
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const [cRes, catRes] = await Promise.all([
          fetch(`${apiBase}/api/courses/`),
          fetch(`${apiBase}/api/courses/categories/`),
        ]);
        const cData   = await cRes.json();
        const catData = await catRes.json();
        const courseList   = Array.isArray(cData)          ? cData          : Array.isArray(cData.results)   ? cData.results   : [];
        const categoryList = Array.isArray(catData)         ? catData         : Array.isArray(catData.results)  ? catData.results  : [];
        setCourses(courseList);
        setCategories(categoryList);
      } catch {
        setError("Could not load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter
  let filtered = (Array.isArray(courses) ? courses : []).filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                        (c.category_name || "").toLowerCase().includes(search.toLowerCase()) ||
                        (c.description || "").toLowerCase().includes(search.toLowerCase()) ||
                        (c.eligibility || "").toLowerCase().includes(search.toLowerCase());
    const matchCat    = activeTab    === "All" || c.category_name === activeTab;
    const matchLevel  = levelFilter  === "All" || c.level         === levelFilter;
    const matchLang   = langFilter   === "All" || c.language      === langFilter;
    return matchSearch && matchCat && matchLevel && matchLang;
  });

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "price_asc")  return (a.is_free ? 0 : +a.price) - (b.is_free ? 0 : +b.price);
    if (sortBy === "price_desc") return (b.is_free ? 0 : +b.price) - (a.is_free ? 0 : +a.price);
    if (sortBy === "duration")   return b.duration_hours - a.duration_hours;
    if (sortBy === "rating")     return b.rating - a.rating;
    if (sortBy === "students")   return b.students_count - a.students_count;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const categoryTabs = ["All", ...categories.map((c) => c.name)];

  return (
    <div className="courses-page">

      {/* Hero */}
      <div className="courses-hero">
        <h1>Explore Courses</h1>
        <p>
          {courses.length}+ courses across {categories.length} skill areas.
          Find the perfect course and start learning today.
        </p>
        <div className="courses-search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by course name, category, eligibility…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button className="search-clear" onClick={() => setSearch("")}>✕</button>}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs-wrap">
        <div className="category-tabs">
          {categoryTabs.map((tab) => (
            <button
              key={tab}
              className={`cat-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab !== "All" && <span>{getCategoryIcon(tab)}</span>}
              {tab}
              {tab !== "All" && (
                <span className="cat-count">
                  {courses.filter((c) => c.category_name === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="filter-sort-bar">
        <div className="filter-left">
          <span className="filter-label">Level:</span>
          {LEVELS.map((lv) => (
            <button
              key={lv}
              className={`level-pill ${levelFilter === lv ? "active" : ""}`}
              onClick={() => setLevelFilter(lv)}
            >
              {lv === "All" ? "All Levels" : lv.charAt(0).toUpperCase() + lv.slice(1)}
            </button>
          ))}
          <span className="filter-label" style={{ marginLeft: 12 }}>Language:</span>
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              className={`level-pill ${langFilter === lang ? "active" : ""}`}
              onClick={() => setLangFilter(lang)}
            >
              {lang === "All" ? "All" : `${LANG_ICONS[lang]} ${LANG_LABELS[lang]}`}
            </button>
          ))}
        </div>
        <div className="filter-right">
          <span className="filter-label">Sort:</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="results-count">{filtered.length} course{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {error && <p className="form-error" style={{ textAlign: "center", margin: 20 }}>{error}</p>}

      {/* Loading Skeletons */}
      {loading && (
        <div className="courses-loading">
          {[...Array(6)].map((_, i) => (
            <div className="course-skeleton" key={i}>
              <div className="skeleton-img" />
              <div className="skeleton-body">
                <div className="skeleton-line w60" />
                <div className="skeleton-line w90" />
                <div className="skeleton-line w40" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Grid */}
      {!loading && (
        <div className="courses-grid">
          {filtered.length > 0 ? filtered.map((course) => (
            <div className="course-card-v2" key={course.id}>

              {/* Thumbnail */}
              <div className="card-thumb">
                {course.thumbnail ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}${course.thumbnail}`}
                    alt={course.title}
                  />
                ) : (
                  <div className="card-thumb-placeholder">
                    {getCategoryIcon(course.category_name)}
                  </div>
                )}
                {course.is_free && <span className="free-badge">FREE</span>}
                {course.language && (
                  <span className="lang-badge">
                    {LANG_ICONS[course.language]} {LANG_LABELS[course.language]}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="card-body">
                <div className="card-top-row">
                  <span className="card-category">{course.category_name}</span>
                  <span className="card-level" style={LEVEL_COLORS[course.level] || {}}>
                    {course.level}
                  </span>
                </div>

                <h3 className="card-title">{course.title}</h3>
                <p className="card-desc">{course.description}</p>

                {/* Rating & Students */}
                <div className="card-stats">
                  <StarRating rating={course.rating || 4.5} />
                  <span className="stat-divider">·</span>
                  <span className="students-count">
                    👨‍🎓 {Number(course.students_count || 0).toLocaleString()}
                  </span>
                </div>

                {/* New info row — eligibility, batch, duration */}
                <div className="card-info-grid">
                  <div className="card-info-item">
                    <span className="info-icon">⏱</span>
                    <span>{course.duration_hours}h</span>
                  </div>
                  {course.eligibility && (
                    <div className="card-info-item">
                      <span className="info-icon">🎓</span>
                      <span>{course.eligibility}</span>
                    </div>
                  )}
                  {course.next_batch_date && (
                    <div className="card-info-item batch-date">
                      <span className="info-icon">📅</span>
                      <span>Batch: {formatDate(course.next_batch_date)}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="card-footer">
                  <div className="card-price">
                    {course.is_free
                      ? <span className="price-free">Free</span>
                      : <span className="price-paid">₹{Number(course.price).toLocaleString()}</span>
                    }
                  </div>
                  <button
                    className="card-enroll-btn"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    {course.is_free ? "Enroll Free" : "View Details"}
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="no-courses-found">
              <p>😕 No courses found for your filters.</p>
              <button onClick={() => {
                setSearch(""); setActiveTab("All");
                setLevelFilter("All"); setLangFilter("All");
              }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}