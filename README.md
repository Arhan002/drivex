# DriveX

**Automotive discovery, test-drive booking, and AI-assisted sales lead management.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ecf8e?logo=supabase)](https://supabase.com/)

DriveX is a full-stack automotive web application that brings customer vehicle discovery and dealership sales workflows together. Customers can browse new and pre-owned vehicles, review estimated on-road pricing, submit enquiries, and request test drives. Dealership staff can manage leads and follow-ups and use AI-assisted tools to understand buyer requirements and draft first responses.

**Repository:** https://github.com/Arhan002/drivex

---

## Features

### Customer experience
- Browse the new-car catalogue and filter vehicles by body type.
- Explore vehicle variants, specifications, and available pricing.
- View itemised estimated on-road pricing for Lucknow.
- Browse available pre-owned vehicles.
- Submit a vehicle enquiry with contact details and buyer preferences.
- Request a test drive by selecting an active showroom, available demo vehicle, and future date/time.
- Provide explicit consent before submitting a booking request.

### Dealership workspace
- Staff sign-in with role-based access for administrators and consultants.
- Dashboard overview of leads and sales pipeline stages.
- Lead inbox with buyer details and preferences.
- Lead status tracking and follow-up management.
- AI Buyer Intelligence to summarise buyer requirements, intent, confidence, recommended action, and missing information.
- AI First-Response Draft to generate an editable customer message that staff can review and approve.

AI-generated messages are drafts for staff review; they are not automatically sent to customers.

---

## Technology stack

| Area | Technologies |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Backend | Next.js server-side route handlers |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Supabase integration | `@supabase/ssr`, `@supabase/supabase-js` |
| AI | Google Gemini via `@google/genai` |
| Form handling | React Hook Form, Zod |

---

## Architecture

The application follows a simple three-layer structure:

```text
Customer website / Staff dashboard
              |
              v
       Next.js application
   Pages, server components,
   API routes, validation,
   authentication and role checks
          /       \
         v         v
     Supabase    Google Gemini
   Auth +        Buyer summaries
   PostgreSQL    First-response drafts
```

- **Next.js** serves the customer website and staff workspace and handles server-side API requests.
- **Supabase** provides authentication and PostgreSQL data storage. Row Level Security (RLS) policies provide database-level access controls.
- **Google Gemini** powers the buyer-summary and first-response assistance features through server-side API routes.

### Key API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/booking-options` | Retrieves active showrooms and available demo vehicles. |
| POST | `/api/bookings` | Validates and submits a guest test-drive request. |
| POST | `/api/ai/buyer-summary` | Generates and stores buyer intelligence. |
| POST | `/api/ai/first-response` | Generates a staff-editable first-response draft. |

---

## Getting started

### Prerequisites
- Node.js (use a current LTS release).
- npm.
- A Supabase project with the DriveX database schema and required RLS policies configured.
- A Google Gemini API key.

### 1. Clone the repository

```bash
git clone https://github.com/Arhan002/drivex.git
cd drivex
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a file named `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_SECRET_KEY=your_supabase_secret_key
```

Use the values from your own Supabase and Google AI projects. Never commit `.env.local` or expose secret keys in browser-side code. Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser; keep Gemini and Supabase secret keys server-side.

### 4. Configure Supabase

Set up the database tables, relationships, Row Level Security policies, and the `create_guest_test_drive_booking` database function required by the application. Add the showroom, vehicle, pricing, and staff profile data needed to use the application.

The repository should be treated as requiring a separately configured Supabase project; do not assume that a fresh database is populated automatically.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the local development server. |
| `npm run build` | Creates a production build. |
| `npm run start` | Starts the production server after a build. |
| `npm run lint` | Runs ESLint. |

---

## Security notes

- Staff-only operations verify the authenticated user and staff role.
- Row Level Security policies restrict access to lead and AI-assistance records based on administrator privileges or consultant assignments.
- Guest test-drive requests validate customer details, consent, showroom availability, demo-vehicle availability, and the requested future time.
- Gemini and Supabase secret credentials must remain on the server.
- AI-generated customer messages require staff review and approval before use.

Before production use, review the database function permissions and add database-level concurrency protection for test-drive slot reservations.

---

## Project documentation

See the accompanying **Technical Design Document** for the system architecture, database overview, key workflows, security design, and application screenshots.

See **DEPLOYMENT.md** for environment configuration and deployment preparation notes.

## Project status

The project is prepared for local development. A production deployment URL has not been provided or verified. The repository's available npm scripts include development, build, start, and lint commands; an automated test script is not currently defined in `package.json`.

---

## License

No license has been specified for this repository.
