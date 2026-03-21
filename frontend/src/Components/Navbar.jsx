import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUser, clearAuth, api } from "../utils/api";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
    // Sync across tabs
    const sync = () => setUser(getUser());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const handleLogout = async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) await api.post("/auth/logout/", { refresh }).catch(() => {});
    clearAuth();
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/"><h2>Bihar Skill Hub</h2></Link>
        </div>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/courses">Courses</Link>

          {user ? (
            <>
              <Link to="/dashboard" className="dashboard-link">
                👤 {user.full_name?.split(" ")[0]}
              </Link>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="login-btn">Login</Link>
              <Link to="/register" className="register-btn">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
