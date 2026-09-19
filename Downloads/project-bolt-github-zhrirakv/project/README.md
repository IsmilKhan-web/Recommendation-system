# University Students Supervisor Recommendation System Using Directory Websites

A full-stack MERN application where students select research interests, faculty list their research areas and supervision slots in a directory, and a matching algorithm recommends the best supervisors.

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS + Vite
- **Backend:** Node.js + Express + JWT authentication
- **Database:** MongoDB + Mongoose

## Project Structure

```
project/
├── backend/                # Express + MongoDB API server
│   ├── models/             # Mongoose models (User, ResearchArea, FacultyResearchArea, etc.)
│   ├── routes/             # API routes (auth, faculty, interests, slots, recommendations)
│   ├── middleware/         # JWT auth middleware
│   ├── seed.js             # Seeds 20 research areas + 6 sample faculty
│   ├── index.js            # Express server entry point
│   └── .env.example        # Copy to .env and configure
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Navbar, ResearchAreaSelector
│   │   ├── context/        # AuthContext (JWT token-based)
│   │   ├── lib/            # API client, utilities
│   │   ├── pages/          # Login, Signup, StudentDashboard, FacultyDashboard, FacultyList, Recommendations
│   │   └── types/          # TypeScript interfaces
│   ├── .env                # VITE_API_URL pointing to backend
│   └── package.json
└── package.json            # Root convenience scripts
```

## Setup & Run

### Option A — From the root (convenience scripts)

```bash
npm run install:all
npm run seed          # loads 20 research areas + 6 sample faculty
npm run dev:backend   # terminal 1 — starts API on port 5000
npm run dev:frontend  # terminal 2 — starts UI on port 5173
```

### Option B — Manually

#### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET
npm run seed     # loads 20 research areas + 6 sample faculty
npm run dev      # starts on http://localhost:5000
```

#### 2. Frontend

```bash
cd frontend
npm install
npm run dev      # starts on http://localhost:5173
```

The frontend reads `VITE_API_URL` from `.env` (defaults to `http://localhost:5000/api`).

## Features

- **JWT Authentication:** Signup/login with two roles — Student and Faculty. Passwords are hashed with bcrypt; JWT tokens stored in localStorage.
- **Student Dashboard:** Browse a directory of 20 research areas, select interests, and weight each by priority (1-5).
- **Faculty Dashboard:** Set your research areas + expertise weights, manage supervision slot counts, edit your bio and department.
- **Faculty Directory Listing:** Search and filter faculty by research topic and availability. Each card shows research tags and live "open / total" slot counters.
- **Recommendation Engine:** Server-side algorithm scores each faculty by weighted research-area overlap plus an availability bonus, returns a ranked list with circular match-score gauges and matched-area breakdowns.
- **Error Handling:** All API calls have clean error states — network failures show user-friendly messages, not crashes.

## Sample Faculty Login

After running `npm run seed`:

- Email: `sarah.chen@university.edu`
- Password: `DemoFaculty2026!`

All 6 sample faculty use the same password. Create your own student account via the signup page to get personalized recommendations.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/signup` | Register as student or faculty |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/me` | Update bio/department |
| GET | `/api/research-areas` | List all research areas |
| GET | `/api/faculty` | List all faculty with research areas + slots |
| GET | `/api/student-interests/:id` | Get a student's interests |
| PUT | `/api/student-interests` | Replace student's interests |
| GET | `/api/faculty-slots/:id` | Get a faculty's slot info |
| PUT | `/api/faculty-slots` | Update faculty's own slots |
| PUT | `/api/faculty-slots/research-areas` | Replace faculty's research areas |
| GET | `/api/recommendations` | Get ranked supervisor matches (students only) |
