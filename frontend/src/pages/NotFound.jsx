// frontend/src/pages/NotFound.jsx
// 404 page — playful warm cream + marigold. Shown for any unmatched route.

import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

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
          aria-label="Page not found"
          style={{ maxWidth: 680, height: "auto", display: "block", margin: "0 auto" }}
        >
          <rect width="680" height="540" fill="#FFF8EC" />

          {/* sun */}
          <circle cx="540" cy="100" r="56" fill="#FCD980" opacity="0.45" />
          <circle cx="540" cy="100" r="32" fill="#FBBF24" opacity="0.6" />

          {/* marigolds */}
          <g transform="translate(60 90)">
            <circle r="14" fill="#F59E0B" />
            <circle r="9" fill="#FDE68A" />
            <circle r="3" fill="#D97706" />
          </g>
          <g transform="translate(96 130)">
            <circle r="9" fill="#FB7185" />
            <circle r="4" fill="#FECDD3" />
          </g>
          <g transform="translate(600 470)">
            <circle r="16" fill="#F59E0B" />
            <circle r="10" fill="#FDE68A" />
            <circle r="4" fill="#D97706" />
          </g>
          <g transform="translate(566 488)">
            <circle r="9" fill="#A78BFA" />
            <circle r="4" fill="#EDE9FE" />
          </g>

          {/* cloud */}
          <g fill="#FFFFFF" opacity="0.7">
            <ellipse cx="100" cy="240" rx="34" ry="10" />
            <ellipse cx="124" cy="250" rx="22" ry="7" />
          </g>

          {/* character */}
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
            <circle cx="100" cy="80" r="3.8" fill="#1F2937" />
            <circle cx="130" cy="80" r="3.8" fill="#1F2937" />
            <circle cx="101" cy="78.5" r="1.1" fill="#fff" />
            <circle cx="131" cy="78.5" r="1.1" fill="#fff" />
            <circle cx="90" cy="93" r="5" fill="#FCA5A5" opacity="0.7" />
            <circle cx="140" cy="93" r="5" fill="#FCA5A5" opacity="0.7" />
            <path
              d="M104 100 Q115 110 126 100"
              stroke="#1F2937"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M192 140 Q 230 90 268 56"
              stroke="#92400E"
              strokeWidth="1.2"
              fill="none"
              strokeDasharray="3 5"
            />
          </g>

          {/* kite */}
          <g transform="translate(380 230) rotate(-18)">
            <polygon points="0,-30 24,0 0,30 -24,0" fill="#DC2626" />
            <polygon points="0,-30 24,0 0,0 0,-30" fill="#1E3A8A" />
            <polygon points="0,0 24,0 0,30 0,0" fill="#FBBF24" />
            <line x1="0" y1="-30" x2="0" y2="30" stroke="#1F2937" strokeWidth="0.5" />
            <line x1="-24" y1="0" x2="24" y2="0" stroke="#1F2937" strokeWidth="0.5" />
            <path
              d="M0 30 Q -4 42 3 52 Q -3 64 4 76"
              stroke="#92400E"
              strokeWidth="1.2"
              fill="none"
            />
            <circle cx="1" cy="46" r="2.5" fill="#DC2626" />
            <circle cx="3" cy="70" r="2.5" fill="#FBBF24" />
          </g>

          {/* big 404 with marigold middle 0 */}
          <text
            x="540"
            y="320"
            textAnchor="middle"
            fontSize="220"
            fontWeight="900"
            letterSpacing="-2"
          >
            <tspan fill="none" stroke="#92400E" strokeWidth="3">4</tspan>
            <tspan fill="#FBBF24">0</tspan>
            <tspan fill="none" stroke="#92400E" strokeWidth="3">4</tspan>
          </text>

          <text x="340" y="394" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#451A03">
            This page flew away.
          </text>
          <text x="340" y="420" textAnchor="middle" fontSize="14" fill="#78350F">
            Don't worry — happens to the best of us. Let's bring you back.
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
            onClick={() => navigate("/")}
            style={{
              background: "#B45309",
              color: "white",
              border: "none",
              borderRadius: 23,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: "bold",
              cursor: "pointer",
              minWidth: 160,
            }}
          >
            ← Take me home
          </button>
          <button
            onClick={() => navigate("/courses")}
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
            Browse courses
          </button>
        </div>

        <p style={{ marginTop: 24, fontSize: 12, color: "#92400E", opacity: 0.7 }}>
          Still stuck? Email{" "}
          <a href="mailto:admin@biharskillhub.co.in" style={{ color: "#92400E" }}>
            admin@biharskillhub.co.in
          </a>
        </p>
      </div>
    </div>
  );
}