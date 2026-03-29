import React from "react";

const Footer = () => {
  return (
    <div className="site-footer">

      <div className="footer-inner">

        <div className="footer-col">
          <h3>Bihar Skill Hub</h3>
          <p>
            Learn modern tech skills with practical courses and
            improve your career opportunities.
          </p>
        </div>

        <div className="footer-col">
          <h4>Links</h4>
          <a href="/">Home</a>
          <a href="/courses">Courses</a>
          <a href="/login">Login</a>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <p>Email: admin@biharskillhub.com</p>
          <p>Phone: +91 9801917901</p>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 Bihar Skill Hub. All rights reserved.
      </div>

    </div>
  );
};

export default Footer;