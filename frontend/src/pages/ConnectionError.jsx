// frontend/src/pages/ConnectionError.jsx
// Connection / backend-unreachable page. Same warm playful family as 404,
// but offers Try-again (not Go-home), pings the backend every few seconds,
// and silently navigates back when the API recovers.

import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:8000/api";

// Try a cheap, unauthenticated endpoint. /courses/ exists and is public on your API.
// If you later add /api/health/, swap it in here.
async function pingBackend() {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`${BASE_URL}/courses/?limit=1`, { signal: ctrl.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export default function ConnectionError() {
  const navigate = useNavigate();
  const location = useLocation();
  const [retrying, setRetrying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5);
  const tickRef = useRef(null);

  // The page we came from, so we can go back to it once the API recovers.
  const cameFrom = location.state?.from || "/";

  const tryNow = async () => {
    if (retrying) return;
    setRetrying(true);
    const ok = await pingBackend();
    setRetrying(false);
    if (ok) {
      navigate(cameFrom, { replace: true });
    } else {
      setSecondsLeft(5);
    }
  };

  // Auto-retry every ~5 seconds
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          tryNow();
          return 5;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFF8EC",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 680, textAlign: "center" }}>
        <svg
          width="100%"
          viewBox="0 0 680 540"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Connection lost"
          style={{ maxWidth: 680, height: "auto", display: "block", margin: "0 auto" }}
        >
          <rect width="680" height="540" fill="#FFF8EC" />

          <circle cx="540" cy="100" r="48" fill="#FCD980" opacity="0.35" />
          <circle cx="540" cy="100" r="28" fill="#FBBF24" opacity="0.5" />

          <g transform="translate(80 120)">
            <circle r="11" fill="#F59E0B" />
            <circle r="7" fill="#FDE68A" />
          </g>
          <g transform="translate(600 470)">
            <circle r="13" fill="#F59E0B" />
            <circle r="8" fill="#FDE68A" />
            <circle r="3" fill="#D97706" />
          </g>

          <g fill="#FFFFFF" opacity="0.6">
            <ellipse cx="120" cy="240" rx="30" ry="9" />
            <ellipse cx="138" cy="248" rx="20" ry="6" />
          </g>

          {/* character (same friend) */}
          <g transform="translate(110 200)">
            <rect x="60" y="110" width="110" height="92" rx="22" fill="#DC2626" />
            <rect x="38" y="118" width="36" height="22" rx="11" fill="#DC2626" />
            <rect x="156" y="118" width="36" height="22" rx="11" fill="#DC2626" />
            <rect x="82" y="200" width="22" height="34" rx="8" fill="#1E3A8A" />
            <rect x="126" y="200" width="22" height="34" rx="8" fill="#1E3A8A" />
            <ellipse cx="93" cy="238" rx="14" ry="5" fill="#1F2937" />
            <ellipse cx="137" cy="238" rx="14" ry="5" fill="#1F2937" />
            <path d="M85 110 L115 130 L145 110 Z" fill="#FBBF24" />
            <circle cx="115" cy="78" r="46" fill="#F2C9A4" />
            <path d="M72 70 Q115 26 158 70 Q142 50 115 48 Q88 50 72 70 Z" fill="#3F2A1A" />
            <circle cx="100" cy="78" r="3.8" fill="#1F2937" />
            <circle cx="130" cy="78" r="3.8" fill="#1F2937" />
            <circle cx="100" cy="76" r="1.1" fill="#fff" />
            <circle cx="130" cy="76" r="1.1" fill="#fff" />
            <circle cx="90" cy="95" r="5" fill="#FCA5A5" opacity="0.7" />
            <circle cx="140" cy="95" r="5" fill="#FCA5A5" opacity="0.7" />
            <ellipse cx="115" cy="103" rx="4" ry="3" fill="#1F2937" />

            <path
              d="M192 140 Q 220 110 240 96"
              stroke="#1F2937"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <g transform="translate(244 92)">
              <path
                d="M0 0 l5 -6 l-2 7 l8 1 l-7 4 l4 8 l-7 -5 l-6 6 l3 -8 l-7 -3 l8 -1 z"
                fill="#FBBF24"
              />
            </g>
          </g>

          {/* dangling broken cable */}
          <g>
            <path
              d="M420 70 Q 440 110 446 138"
              stroke="#1F2937"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="446" cy="142" r="3" fill="#1F2937" />
            <path d="M444 142 l-4 8" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M448 142 l4 8" stroke="#1F2937" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* offline wifi mark */}
          <g transform="translate(390 230)">
            <g fill="none" stroke="#92400E" strokeWidth="4" strokeLinecap="round" opacity="0.9">
              <path d="M0 80 a 80 80 0 0 1 160 0" />
              <path d="M20 80 a 60 60 0 0 1 120 0" strokeDasharray="6 8" />
              <path d="M40 80 a 40 40 0 0 1 80 0" strokeDasharray="4 9" />
            </g>
            <circle cx="80" cy="80" r="8" fill="#92400E" />
            <line x1="-12" y1="-4" x2="172" y2="96" stroke="#DC2626" strokeWidth="6" strokeLinecap="round" />
          </g>

          <text x="340" y="380" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#451A03">
            Looks like the connection slipped.
          </text>
          <text x="340" y="406" textAnchor="middle" fontSize="14" fill="#78350F">
            Something's up on our end — not yours. Hang tight, we'll try again.
          </text>
        </svg>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 8,
          }}
        >
          <button
            onClick={tryNow}
            disabled={retrying}
            style={{
              background: "#B45309",
              color: "white",
              border: "none",
              borderRadius: 23,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: "bold",
              cursor: retrying ? "wait" : "pointer",
              minWidth: 160,
              opacity: retrying ? 0.7 : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 14,
                height: 14,
                border: "2px solid white",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: retrying ? "bsh-spin 0.9s linear infinite" : "none",
              }}
            />
            {retrying ? "Trying…" : "Try again"}
          </button>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "transparent",
              color: "#B45309",
              border: "1.5px solid #B45309",
              borderRadius: 23,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: "bold",
              cursor: "pointer",
              minWidth: 160,
            }}
          >
            Go to homepage
          </button>
        </div>

        <div
          style={{
            marginTop: 16,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: "#78350F",
            fontSize: 12,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#10B981",
              animation: "bsh-pulse 1.4s ease-in-out infinite",
            }}
          />
          Retrying automatically in {secondsLeft}s…
        </div>

        <p style={{ marginTop: 16, fontSize: 12, color: "#92400E", opacity: 0.7 }}>
          If this keeps happening, email{" "}
          <a href="mailto:admin@biharskillhub.co.in" style={{ color: "#92400E" }}>
            admin@biharskillhub.co.in
          </a>
        </p>
      </div>

      <style>{`
        @keyframes bsh-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes bsh-pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
