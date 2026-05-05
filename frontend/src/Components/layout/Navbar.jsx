import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, clearAuth, api } from "../../utils/api";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUser(getUser());
    const sync = () => setUser(getUser());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const handleLogout = async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) await api.post("/auth/logout/", { refresh }).catch(() => {});
    clearAuth(); setUser(null); navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/"><h2>Bihar Skill Hub</h2></Link>
        </div>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          <Link to="/"                onClick={() => setOpen(false)}>Home</Link>
          <Link to="/courses"         onClick={() => setOpen(false)}>Courses</Link>
          <Link to="/internships"     onClick={() => setOpen(false)}>Internships</Link>
          <Link to="/free-resources"  onClick={() => setOpen(false)}>Free Resources</Link>
          <Link to="/success-stories" onClick={() => setOpen(false)}>Success Stories</Link>
          <Link to="/about"           onClick={() => setOpen(false)}>About</Link>
          <Link to="/contact"         onClick={() => setOpen(false)}>Contact</Link>
          <Link to="/verify">Verify Certificate</Link>
          {user ? (
            <>
              {user.role === "admin" && (
                <Link to="/admin" className="admin-nav-link" onClick={() => setOpen(false)}>
                  ⚙️ Admin
                </Link>
              )}
              <Link to="/profile" className="profile-nav-link" onClick={() => setOpen(false)}>
                <span className="nav-avatar">
                  {user.full_name?.charAt(0).toUpperCase()}
                </span>
                {user.full_name?.split(" ")[0]}
              </Link>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="login-btn"    onClick={() => setOpen(false)}>Login</Link>
              <Link to="/register" className="register-btn" onClick={() => setOpen(false)}>Register</Link>
            </>
          )}
        </nav>

        <button className="hamburger" onClick={() => setOpen(!open)}>
          {open ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
};

export default Navbar;