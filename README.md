# Bihar Skill Hub 🎓

A full-stack online education platform built with **React + Django**.
Students register with email OTP verification, enroll in courses, watch video lectures,
download notes, take quizzes, earn points, pay for premium courses, and receive
auto-generated certificates and offer letters.

**Live:**
- Frontend (Vercel) — *your Vercel URL*
- Backend API (Railway) — `https://bihar-skill-hub-production.up.railway.app`

---

## Project Structure

```
bihar-skill-hub/
│
├── frontend/                  ← React (Vite) app
│   ├── src/
│   │   ├── pages/             ← Home, Courses, Payment, SuccessStories, Login, Register…
│   │   ├── Components/        ← Navbar, Footer, CourseCard, home/, layout/, ui/
│   │   └── utils/api.js       ← Central API client (JWT auto-attach + refresh)
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json            ← Vercel SPA routing config
│
├── backend/                   ← Django REST API
│   ├── apps/
│   │   ├── users/             ← Auth (Admin + Student), JWT, OTP email verification
│   │   ├── courses/           ← Course & category management
│   │   ├── lectures/          ← Video lectures + watch progress
│   │   ├── notes/             ← Study material uploads
│   │   ├── enrollments/       ← Course enrollment
│   │   ├── quizzes/           ← MCQ quizzes + auto-scoring
│   │   ├── certificates/      ← PDF certificate & offer letter generation (with QR code)
│   │   ├── payments/          ← Razorpay payment integration
│   │   ├── gamification/      ← Points, badges, leaderboard
│   │   └── notifications/     ← User notifications
│   ├── utils/                 ← mailer.py, pdf_generator.py
│   ├── settings.py
│   ├── urls.py
│   ├── manage.py
│   ├── requirements.txt       ← Production dependencies
│   ├── nixpacks.toml          ← Railway build/deploy config
│   └── runtime.txt            ← Python version pin
│
├── database/
│   ├── db.sqlite3             ← Auto-created on first migration (dev only)
│   └── README.md              ← PostgreSQL upgrade guide
│
├── .env.example               ← Copy to backend/.env
├── .gitignore
└── README.md
```

---

## Quick Setup (Local Development)

### 1. Backend (Django)

```bash
cd backend

# Create & activate a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac / Linux

# Install dependencies
pip install -r requirements.txt

# Create your .env file (see Environment Variables below)
copy ..\.env.example .env       # Windows
cp ../.env.example .env         # Mac / Linux

# Run database migrations (creates database/db.sqlite3 automatically)
python manage.py makemigrations
python manage.py migrate

# Create an admin account
python manage.py createsuperuser

# Start the dev server
python manage.py runserver
```

Django runs at → **http://localhost:8000**

### 2. Frontend (React)

In a second terminal:

```bash
cd frontend

npm install
npm run dev
```

React runs at → **http://localhost:5173**

By default the frontend talks to `http://localhost:8000`. To point it elsewhere,
set `VITE_API_URL` in `frontend/.env` (e.g. your Railway URL).

---

## Environment Variables

Copy `.env.example` to `backend/.env` and fill in your values.

| Variable | Purpose | Example |
|---|---|---|
| `SECRET_KEY` | Django secret key (required in production) | long random string |
| `DEBUG` | Debug mode — keep `False` in production | `True` (local) |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Frontend origins allowed to call the API | `http://localhost:5173` |
| `DATABASE_URL` | Postgres connection string (unset = SQLite locally) | `postgres://…` |
| `EMAIL_HOST` | SMTP host for OTP / emails | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_HOST_USER` | SMTP username / sender address | your email |
| `EMAIL_HOST_PASSWORD` | SMTP password / app password | — |
| `EMAIL_USE_TLS` | Use TLS for email | `True` |

On Railway, set these under **Variables**. `DATABASE_URL` is provided automatically
when you attach a PostgreSQL plugin.

---

## URLs

| Service | Local | Production |
|---|---|---|
| 🌐 Website (React) | http://localhost:5173 | your Vercel URL |
| ⚙️ Django API | http://localhost:8000 | Railway URL |
| 🔑 Admin Panel | http://localhost:8000/admin | `…/admin` |
| 📖 API Docs (Swagger) | http://localhost:8000/api/docs | `…/api/docs` |

---

## Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Student registration |
| POST | `/api/auth/login/` | Login (returns JWT) |
| POST | `/api/auth/send-otp/` | Send email OTP |
| POST | `/api/auth/verify-otp/` | Verify email OTP |
| POST | `/api/auth/resend-otp/` | Resend OTP |
| GET | `/api/courses/` | List courses |
| POST | `/api/enrollments/` | Enroll in a course |
| GET | `/api/lectures/` | Lectures + progress |
| POST | `/api/quizzes/…/submit/` | Submit quiz answers |
| GET | `/api/certificates/` | Issued certificates |
| POST | `/api/payments/…` | Razorpay payment flow |
| POST | `/api/token/refresh/` | Refresh access token |

See `/api/docs/` for the full interactive list.

---

## Features

| Feature | Details |
|---|---|
| 🔐 Auth | JWT login/register for Admin & Students, with token blacklist on logout |
| 📧 OTP Verification | Email OTP during registration (10-min expiry, 3 attempts) |
| 📚 Courses | Browse, search, enroll with category filter |
| 🎬 Lectures | Upload videos or embed YouTube/Vimeo, track watch progress |
| 📄 Notes | Download PDFs per course |
| 📊 Dashboard | Progress tracking, completion % |
| 📝 Quizzes | MCQ with auto-scoring |
| 💳 Payments | Razorpay integration for paid courses |
| 🏆 Gamification | Points, badges, leaderboard |
| 🔔 Notifications | In-app user notifications |
| 📜 Certificates | Auto-generated PDF (with QR code) on course completion |
| 📋 Offer Letters | Admin-issued branded PDF letters |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, React Router v7 |
| Backend | Django 4.2, Django REST Framework |
| Auth | JWT (SimpleJWT) with token blacklist |
| Database | SQLite (dev) → PostgreSQL (prod, via dj-database-url) |
| Payments | Razorpay |
| PDF / QR | ReportLab, qrcode |
| Static files | WhiteNoise |
| API Docs | Swagger (drf-yasg) |
| Server | Gunicorn |
| Hosting | Railway (backend), Vercel (frontend) |

---

## Deployment Notes

- **Backend (Railway):** builds via `nixpacks.toml`. Make sure the deploy runs
  `python manage.py migrate` (and ideally `collectstatic`) so the database schema
  and static files are ready.
- **Frontend (Vercel):** set `VITE_API_URL` to your Railway backend URL, and add
  your Vercel domain to the backend's `CORS_ALLOWED_ORIGINS`.
- **Database:** attach a PostgreSQL plugin on Railway; `DATABASE_URL` is detected
  automatically. Without it, the app falls back to SQLite.