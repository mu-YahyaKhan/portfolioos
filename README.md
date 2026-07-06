# PortfolioOS — Complete Portfolio Management System (Week 4)
MERN Stack Content Management System for managing and publishing your developer portfolio — fully integrated frontend & backend.

## What's new in Week 4
- **Change Password** — secure password change flow (current password verification + bcrypt re-hash) under Profile → Security
- **Notifications** — bell icon in the header with unread badge, dropdown panel, mark-one-read / mark-all-read, auto-refreshes every 30s
- **Auth hardening** — a global response interceptor now auto-logs-out and redirects to `/login` the moment any API call returns 401 (expired/invalid token), so users are never stuck on a broken dashboard page
- **Performance** — dashboard pages are now code-split with `React.lazy` + `Suspense`, so the login/register screen loads a much smaller bundle and dashboard pages load on demand
- **Skills search** — added a name search box on top of the existing category filters
- Color palette and toast notifications aligned to the same professional indigo/teal theme used everywhere else

## What's new in Week 3
- **Dashboard Analytics** — total projects, total skills, total categories, featured count, profile completion %, member-since, and a live "Recent Activity" feed
- **Image Uploads** — upload a profile avatar *and* upload cover images for individual projects (stored on the server, served from `/uploads`)
- **Category Management** — create, edit (with auto-rename of linked projects), and delete categories, each with a color tag; deletion is blocked while projects still use the category
- **Live Portfolio Preview** — `/dashboard/preview` always re-fetches fresh data so dashboard edits show up immediately, plus a public shareable link at `/portfolio/:userId` (no login required) that renders the same live data
- **Search & Filtering** — search projects by title/description/tech stack, filter by category and status; filter skills by category
- **Responsive Dashboard** — collapsible sidebar + slide-in mobile nav, responsive analytics grid, responsive forms/cards for mobile, tablet and desktop
- New light, professional **indigo & teal** color theme (distinct from the Week 2 monochrome admin theme)

## Features (full list)
- Auth (Register / Login / JWT)
- Dashboard Analytics (Projects, Skills, Categories, Featured, Activity Feed, User Stats)
- Profile Management (Personal Info, About, Contact, Profile Image Upload)
- Skills Management (Add / Edit / Delete, category + proficiency, category filters)
- Project Management (Add / Edit / Delete / Categorize, cover image upload, search & filters)
- Category Management (Create / Edit / Delete, color-coded, linked-project counts)
- Live Portfolio Preview (in-dashboard + public shareable page)
- Fully responsive on mobile, tablet and desktop

## Setup

### Step 1 — Backend
```bash
cd backend
npm install
cp .env.example .env   # edit JWT_SECRET
npm run dev
```

### Step 2 — Frontend (new terminal)
```bash
cd frontend
npm install
npm start
```

### Step 3 — Open
http://localhost:3000

> Tip: after logging in, create at least one Category before adding Projects — the Project form's category dropdown is populated from your Categories.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| PUT | /api/auth/change-password | Change password |
| GET | /api/notifications | List notifications + unread count |
| PUT | /api/notifications/:id/read | Mark one notification read |
| PUT | /api/notifications/read-all | Mark all notifications read |
| GET | /api/portfolio | Get portfolio |
| PUT | /api/portfolio | Update portfolio |
| POST | /api/portfolio/avatar | Upload profile image |
| GET | /api/skills | Get skills |
| POST | /api/skills | Add skill |
| PUT | /api/skills/:id | Update skill |
| DELETE | /api/skills/:id | Delete skill |
| GET | /api/projects | Get projects (search/filter) |
| GET | /api/projects/stats | Project stats |
| POST | /api/projects/upload-image | Upload a project cover image |
| POST | /api/projects | Add project |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project |
| GET | /api/categories | List categories (with project counts) |
| POST | /api/categories | Create category |
| PUT | /api/categories/:id | Update category (renames linked projects) |
| DELETE | /api/categories/:id | Delete category (blocked if in use) |
| GET | /api/activities | Recent activity feed |
| GET | /api/dashboard/stats | Aggregated dashboard analytics |
| GET | /api/public/:userId | Public, unauthenticated portfolio data (for live preview / sharing) |

## Tech Stack
MongoDB · Express · React · Node.js (MERN), JWT auth, Multer for uploads.
