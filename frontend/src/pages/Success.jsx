import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const course     = location.state?.course     || null;
  const payment_id = location.state?.payment_id || null;

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>{payment_id ? "Payment Successful! 🎉" : "Enrollment Confirmed! 🎓"}</h1>

        {course && (
          <div className="success-course-info">
            <p><strong>Course:</strong> {course.title}</p>
            {payment_id && <p><strong>Payment ID:</strong> {payment_id}</p>}
          </div>
        )}

        <p>
          You are now enrolled! Start learning right away from your dashboard.
          Your certificate will be issued after completing the course quiz.
        </p>

        <div className="success-buttons">
          <button onClick={() => navigate("/profile")}>
            Go to My Dashboard
          </button>
          <button className="success-home-btn" onClick={() => navigate("/courses")}>
            Browse More Courses
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;
