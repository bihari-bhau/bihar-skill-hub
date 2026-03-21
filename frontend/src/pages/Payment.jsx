import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api, getUser } from "../utils/api";

const Payment = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = getUser();

  // Course info can be passed via navigate state: navigate("/payment", { state: { course } })
  const course    = location.state?.course || null;

  const [formData, setFormData] = useState({ name: "", cardNumber: "", expiry: "", cvv: "" });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name || !formData.cardNumber || !formData.expiry || !formData.cvv) {
      setError("Please fill all payment details.");
      return;
    }

    if (!user) { navigate("/login"); return; }

    try {
      setLoading(true);

      // If course provided, enroll after "payment"
      if (course?.id) {
        const res = await api.post("/enrollments/enroll/", { course_id: course.id });
        if (!res.ok) {
          const d = await res.json();
          setError(d.error || "Enrollment failed after payment.");
          return;
        }
      }

      navigate("/success", { state: { course } });
    } catch {
      setError("Something went wrong while processing payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-card">
        <div className="payment-top">
          <h2>Complete Your Payment</h2>
          <p>Secure your course access by completing the payment below.</p>
        </div>

        {course && (
          <div className="payment-course-info">
            <h3>Selected Course</h3>
            <div className="payment-course-box">
              <span>{course.title}</span>
              <strong>{course.is_free ? "Free" : `₹${course.price}`}</strong>
            </div>
          </div>
        )}

        {error && <div className="form-error">{error}</div>}

        <form className="payment-form" onSubmit={handleSubmit}>
          <input type="text"     name="name"       placeholder="Card Holder Name" value={formData.name}       onChange={handleChange} />
          <input type="text"     name="cardNumber" placeholder="Card Number"      value={formData.cardNumber} onChange={handleChange} />
          <div className="payment-row">
            <input type="text"     name="expiry" placeholder="MM/YY" value={formData.expiry} onChange={handleChange} />
            <input type="password" name="cvv"    placeholder="CVV"   value={formData.cvv}    onChange={handleChange} />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Processing…" : "Pay Now"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;
