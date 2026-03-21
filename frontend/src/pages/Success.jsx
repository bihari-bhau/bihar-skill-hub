import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const course   = location.state?.course || null;

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p>
          {course
            ? `You are now enrolled in "${course.title}". Start learning right away!`
            : "Your course enrollment has been confirmed. You can now start learning."}
        </p>
        <div className="success-buttons">
          <button onClick={() => navigate("/dashboard")}>Go to Dashboard</button>
          <button className="success-home-btn" onClick={() => navigate("/courses")}>
            Browse More Courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
