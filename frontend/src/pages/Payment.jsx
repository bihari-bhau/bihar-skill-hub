import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api, getUser } from "../utils/api";

// ─────────────────────────────────────────────────────────────────────────────
// ⚙️  RAZORPAY KEY ID — Add to Vercel Environment Variables:
//     Variable Name  → VITE_RAZORPAY_KEY_ID
//     Variable Value → rzp_live_XXXXXXXXXX  (your live key id)
//     OR for testing → rzp_test_XXXXXXXXXX  (your test key id)
// ─────────────────────────────────────────────────────────────────────────────
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_REPLACE_ME";
// ─────────────────────────────────────────────────────────────────────────────

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id  = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const Payment = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = getUser();

  const course    = location.state?.course || null;
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (!course) { navigate("/courses"); return; }
    // Preload Razorpay script
    loadRazorpayScript();
  }, []);

  const handlePayment = async () => {
    if (!user) { navigate("/login"); return; }
    setError("");
    setLoading(true);

    try {
      // Step 1 — Create order on backend
      const orderRes  = await api.post("/payments/create-order/", { course_id: course.id });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        setError(orderData.error || "Could not create payment order.");
        return;
      }

      // Free course — redirect directly
      if (orderData.free) {
        navigate("/success", { state: { course } });
        return;
      }

      // Step 2 — Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Failed to load payment gateway. Check your internet connection.");
        return;
      }

      // Step 3 — Open Razorpay Checkout
      const options = {
        // ─────────────────────────────────────────────────────────────
        // ⚙️  key comes from backend response (your RAZORPAY_KEY_ID)
        //     Never hardcode your live key in frontend code!
        // ─────────────────────────────────────────────────────────────
        key:         orderData.key_id,
        amount:      orderData.amount,
        currency:    "INR",
        name:        "Bihar Skill Hub",
        description: `Enrollment: ${orderData.course_name}`,
        image:       "https://biharskillhub.co.in/logo.png",
        order_id:    orderData.order_id,
        prefill: {
          name:  orderData.student_name,
          email: orderData.student_email,
        },
        theme: {
          color: "#1d4ed8",   // Bihar Skill Hub blue
        },
        method: {
          upi:      true,
          card:     true,
          netbanking: true,
          wallet:   true,
        },

        // Step 4 — On successful payment
        handler: async (response) => {
          try {
            const verifyRes  = await api.post("/payments/verify/", {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              navigate("/success", { state: { course, payment_id: response.razorpay_payment_id } });
            } else {
              setError(verifyData.error || "Payment verification failed.");
            }
          } catch {
            setError("Payment verification error. Contact support.");
          }
        },

        // On payment failure
        modal: {
          ondismiss: async () => {
            await api.post("/payments/failed/", {
              razorpay_order_id: orderData.order_id,
            }).catch(() => {});
            setError("Payment was cancelled. Please try again.");
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async (response) => {
        await api.post("/payments/failed/", {
          razorpay_order_id: orderData.order_id,
        }).catch(() => {});
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();

    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!course) return null;

  return (
    <div className="payment-page">
      <div className="payment-card">

        {/* Header */}
        <div className="payment-top">
          <h2>Complete Enrollment</h2>
          <p>Secure payment powered by Razorpay</p>
        </div>

        {/* Course Info */}
        <div className="payment-course-info">
          <h3>Course Selected</h3>
          <div className="payment-course-box">
            <div>
              <strong>{course.title}</strong>
              <small>{course.category_name} · {course.level}</small>
            </div>
            <span className="payment-price">
              {course.is_free ? "FREE" : `₹${Number(course.price).toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* What you get */}
        <div className="payment-benefits">
          <h3>What you get</h3>
          <ul>
            <li>✅ Full course access — video lectures + notes</li>
            <li>✅ Certificate of Completion (PDF)</li>
            <li>✅ Offer Letter from Bihar Skill Hub</li>
            <li>✅ Quiz based assessment</li>
            <li>✅ Lifetime access to course material</li>
          </ul>
        </div>

        {error && <div className="form-error">{error}</div>}

        {/* Payment Methods */}
        <div className="payment-methods">
          <p>Accepted payment methods:</p>
          <div className="payment-icons">
            <span>📱 UPI</span>
            <span>💳 Cards</span>
            <span>🏦 Net Banking</span>
            <span>👛 Wallets</span>
          </div>
        </div>

        {/* Pay Button */}
        <button
          className="pay-now-btn"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? "Processing…" : course.is_free ? "Enroll for Free 🎓" : `Pay ₹${Number(course.price).toLocaleString()} →`}
        </button>

        <p className="payment-secure">
          🔒 100% Secure · Powered by Razorpay
        </p>

        <button className="payment-back-btn" onClick={() => navigate(-1)}>
          ← Back to Course
        </button>

      </div>
    </div>
  );
};

export default Payment;
