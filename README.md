# Academic Planner

A personal academic management application designed to help students organize academic activities, manage tasks, schedule events, and track final project progress in one place.

## Features

- **Dashboard** — Overview of academic activities and progress.
- **Task Management** — Create, view, update, and delete academic tasks.
- **Calendar** — Organize academic schedules and events.
- **TA Progress Tracking** — Track final project milestones and progress.
- **Google Authentication** — Sign in using Google OAuth with email access restrictions.
- **Session Management** — Database-backed sessions with idle timeout validation.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS 4
- **Database:** PostgreSQL
- **ORM:** Prisma 6
- **Authentication:** Auth.js (NextAuth.js v5)
- **Validation:** Zod
- **Deployment:** Vercel

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/fauzanalyridlo-sys/academic-planner.git
cd academic-planner
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="your_postgresql_connection_string"
AUTH_SECRET="your_auth_secret"
AUTH_GOOGLE_ID="your_google_oauth_client_id"
AUTH_GOOGLE_SECRET="your_google_oauth_client_secret"
ALLOWED_EMAIL="your_allowed_email@example.com"
```

Configure Google OAuth credentials in Google Cloud Console. Set the authorized redirect URI to:

```text
http://localhost:3000/api/auth/callback/google
```

Generate an Auth.js secret:

```bash
openssl rand -base64 32
```

Use the generated value for `AUTH_SECRET`.

### 4. Set up the database

Make sure your PostgreSQL database is available, then run:

```bash
npx prisma migrate dev
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Generate Prisma Client and build the application |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Deployment

The application is deployed on Vercel.

**Live Demo:** https://academic-planner-ivory-one.vercel.app/

## Security Notes

- Authentication is handled through Google OAuth.
- Access is restricted using the configured `ALLOWED_EMAIL`.
- Environment variables and credentials must never be committed to the repository.

---

Built as a personal project to support academic planning and final project management.