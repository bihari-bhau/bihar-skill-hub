# Bihar Skill Hub 🎓

A full-stack online education platform built with **React + Django**.
Students can enroll in courses, watch video lectures, download notes, take quizzes, and receive certificates and offer letters.

---

## Project Structure

```
bihar-skill-hub/
│
├── frontend/                  ← React (Vite) app
│   ├── src/
│   │   ├── pages/             ← Home, Courses, Dashboard, Quiz, Login, Register…
│   │   ├── Components/        ← Navbar, Footer, CourseCard
│   │   └── utils/api.js       ← Central API client (JWT auto-attach)
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   ← Django REST API
│   ├── apps/
│   │   ├── users/             ← Auth (Admin + Student roles)
│   │   ├── courses/           ← Course & category management
│   │   ├── lectures/          ← Video lectures + watch progress
│   │   ├── notes/             ← Study material uploads
│   │   ├── enrollments/       ← Course enrollment
│   │   ├── quizzes/           ← MCQ quizzes + auto-scoring
│   │   └── certificates/      ← PDF certificate & offer letter generation
│   ├── settings.py
│   ├── urls.py
│   ├── manage.py
│   └── requirements.txt
│
├── database/
│   ├── db.sqlite3             ← Auto-created on first migration
│   └── README.md              ← PostgreSQL upgrade guide
│
├── .env.example               ← Copy to backend/.env
├── .gitignore
└── README.md
```

---

## Quick Setup in VS Code

### 1. Open the project
```
File → Open Folder → select bihar-skill-hub/
```

### 2. Setup Backend (Django)

Open **Terminal → New Terminal**, then:

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac / Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy ..\\.env.example .env     # Windows
cp ../.env.example .env        # Mac / Linux

# Run database migrations (creates database/db.sqlite3 automatically)
python manage.py makemigrations users courses lectures notes enrollments quizzes certificates
python manage.py migrate

# Create admin account
python manage.py createsuperuser

# Start Django server
python manage.py runserver
```

Django runs at → **http://localhost:8000**

### 3. Setup Frontend (React)

Open a **second terminal** (`+` button in VS Code terminal panel):

```bash
cd frontend

# Install packages
npm install

# Start React dev server
npm run dev
```

React runs at → **http://localhost:5173**

---

## Important: Add one line to backend/settings.py

Find `INSTALLED_APPS` and add:
```python
'rest_framework_simplejwt.token_blacklist',
```

Then run again:
```bash
python manage.py migrate
```

---

## URLs

| Service | URL |
|---|---|
| 🌐 Website (React) | http://localhost:5173 |
| ⚙️ Django API | http://localhost:8000 |
| 🔑 Admin Panel | http://localhost:8000/admin |
| 📖 API Docs (Swagger) | http://localhost:8000/api/docs |

---

## Features

| Feature | Details |
|---|---|
| 🔐 Auth | JWT login/register for Admin & Students |
| 📚 Courses | Browse, search, enroll with category filter |
| 🎬 Lectures | Upload videos or embed YouTube/Vimeo |
| 📄 Notes | Download PDFs per course |
| 📊 Dashboard | Progress tracking, completion % |
| 📝 Quizzes | MCQ with auto-scoring |
| 🏆 Certificates | Auto-generated PDF on course completion |
| 📋 Offer Letters | Admin-issued branded PDF letters |

---

## VS Code Recommended Extensions

Install these for the best experience:

- **Python** (Microsoft)
- **Pylance** (Microsoft)
- **ES7+ React/Redux/GraphQL** (dsznajder)
- **Tailwind CSS IntelliSense** (Bradlc)
- **Thunder Client** — test your APIs right inside VS Code

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router v7 |
| Backend | Django 4.2, Django REST Framework |
| Auth | JWT (SimpleJWT) |
| Database | SQLite (dev) → PostgreSQL (prod) |
| PDF | ReportLab |
| API Docs | Swagger (drf-yasg) |
