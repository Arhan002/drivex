# DriveX

**Automotive discovery, test-drive booking, and AI-assisted dealership management.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ecf8e?logo=supabase)](https://supabase.com/)

DriveX is a full-stack automotive dealership application. Customers can discover new and pre-owned vehicles, compare variants, review estimated on-road pricing, submit enquiries, and request test drives. Dealership staff can manage leads, follow-ups, vehicle inventory, pricing, used-car listings, consultants, and test-drive bookings. AI-assisted buyer summaries and first-response drafts help staff understand enquiries and prepare customer communication.

**GitHub repository:** https://github.com/Arhan002/drivex

---

## Features

### Customer experience

- Browse new cars and filter the catalogue by body type.
- View model details, variants, specifications, and available pricing.
- Review an itemised estimated on-road price, including ex-showroom price, road tax, insurance, and accessories.
- Browse pre-owned cars and view vehicle details such as year, kilometres driven, fuel type, and asking price.
- Submit an enquiry with contact information and vehicle preferences.
- Request a test drive by choosing an active showroom, an available demo vehicle, and a date/time.
- Book as a guest or as a signed-in buyer.
- Use the customer-facing experience in English or Hindi.

### Buyer account

- Register and sign in through Supabase Authentication.
- Access a buyer dashboard.
- View and manage the buyer-facing account experience.

### Dealership workspace

- Role-based staff access for administrators and consultants.
- Dashboard views for leads and the sales pipeline.
- Lead details, status tracking, and follow-up notes/scheduling.
- Test-drive booking management, including pending, confirmed, and cancelled statuses.
- Admin tools for car models, variants, pricing, pre-owned inventory, and consultant invitations.
- Consultant invitations are sent through Supabase Auth.

### AI assistance

- **Buyer Intelligence:** generates a summary of recorded buyer requirements, buying intent, confidence, missing information, and a recommended next action.
- **First-response draft:** prepares a personalised customer message based on the details recorded for a lead.
- Rule-based/template fallbacks are available when Gemini cannot provide a response.

AI-generated customer messages are drafts. Staff should review and edit them before sending; the application does not automatically send the AI first-response draft.

### Email notifications

- Test-drive booking requests trigger an attempt to send a booking email through Gmail SMTP.
- When staff change a booking to confirmed, the application attempts to send a confirmation email.
- A saved booking is not rolled back if its email notification fails.

---

## Technology stack

| Area | Technologies |
|---|---|
| Frontend and routing | Next.js 16, React 19, TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Backend | Next.js App Router and server-side route handlers |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth, `@supabase/ssr`, `@supabase/supabase-js` |
| AI | Google Gemini through `@google/genai` |
| Forms and validation | React Hook Form, Zod |
| Email | Nodemailer with Gmail SMTP |

---

## Application architecture

The Next.js application serves the customer pages and staff dashboards, and exposes server-side API routes. Those routes use Supabase for authentication and data access, Google Gemini for AI assistance, and Gmail SMTP for test-drive email notifications.

```text
Customer website                     Staff dashboard
       |                                     |
       +-----------------+-------------------+
                         |
                         v
                  Next.js application
              Pages, validation, API routes,
               authentication and role checks
                    /       |       \
                   v        v        v
              Supabase   Gemini   Gmail SMTP
              Auth +     AI buyer  Test-drive
              PostgreSQL summaries emails
                         and drafts
```

### Main application areas

| Area | Location |
|---|---|
| Customer homepage and catalogue | `src/app/page.tsx`, `src/app/cars/` |
| Pre-owned vehicle pages | `src/app/used-cars/` |
| Test-drive booking | `src/app/book-test-drive/` |
| Buyer authentication and dashboard | `src/app/buyer/` |
| Staff dashboard pages | `src/app/dashboard/` |
| Reusable UI and management components | `src/components/` |
| Supabase and service helpers | `src/lib/` |
| API route handlers | `src/app/api/` |

---

## API reference

The following table reflects the route handlers currently present in the repository.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/booking-options` | Returns active showrooms and available demo vehicles. |
| POST | `/api/bookings` | Validates and creates a guest or signed-in buyer test-drive booking; then attempts to send a booking email. |
| PATCH | `/api/bookings/[id]/status` | Allows authorised staff to update a booking to pending, confirmed, or cancelled; confirmation triggers an email attempt. |
| POST | `/api/enquiries` | Validates and submits a customer enquiry. |
| POST, PATCH | `/api/admin/inventory` | Admin-only creation and updates for car models and variants, including model activation status. |
| POST, PATCH | `/api/admin/prices` | Admin-only creation and updates for vehicle pricing records. |
| POST, PATCH | `/api/admin/used-cars` | Admin-only creation and updates for pre-owned vehicle records. |
| POST | `/api/admin/consultants` | Admin-only consultant invitation and profile creation. |
| GET, POST | `/api/ai/buyer-summary` | Retrieves or generates and saves AI-assisted buyer summaries for authorised staff. |
| POST | `/api/ai/first-response` | Generates a customer first-response draft for authorised staff. |

---

## Getting started

### Prerequisites

- Node.js and npm.
- A Supabase project with the database schema, functions, and access policies required by DriveX.
- A Google AI Studio API key for Gemini.
- Gmail SMTP credentials if you want test-drive email notifications to work.

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

Copy `.env.example` to `.env.local` in the project root and replace the placeholders with your own credentials.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_SECRET_KEY=your_supabase_secret_key

GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
```

The variables are used as follows:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public/anon key used by the application client. |
| `SUPABASE_SECRET_KEY` | Privileged Supabase key used by server-side admin operations. Keep it private. |
| `GEMINI_API_KEY` | Google Gemini API key used for AI assistance. |
| `GMAIL_USER` | Gmail account used to send test-drive emails. |
| `GMAIL_APP_PASSWORD` | Gmail App Password used by Nodemailer. Keep it private. |
| `SMTP_HOST` | SMTP server hostname; defaults to `smtp.gmail.com` in the mailer. |
| `SMTP_PORT` | SMTP port; defaults to `465` in the mailer. |
| `SMTP_SECURE` | Whether secure SMTP is used; defaults to enabled unless set to `false`. |

The consultant invitation route also reads `NEXT_PUBLIC_SITE_URL` to build the Supabase Auth redirect URL. It defaults to `http://localhost:3000` when unset. Set it to the deployed site's origin when configuring a production deployment.

**Security:** values prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put Gemini keys, Supabase secret keys, Gmail App Passwords, or other credentials in client-side code or commit real credentials to Git. The repository's `.gitignore` excludes local environment files.

### 4. Configure Supabase

DriveX expects a Supabase database with the tables, relationships, database functions, and Row Level Security (RLS) policies used by the application. The current repository does not include a complete SQL migration or one-command database bootstrap, so a new Supabase project is not ready to use simply by adding its URL and keys.

Before using a fresh project:

1. Provision and verify the database schema expected by the application. Do not guess missing columns or relationships.
2. Configure the database functions used by guest and buyer test-drive booking, enquiry submission, and booking-status updates.
3. Enable and verify RLS policies for the relevant tables.
4. Create the required staff profiles and assign the correct `admin` or `consultant` role.
5. Add the showroom, vehicle, variant, pricing, and demo-vehicle records needed by the customer flows.
6. Test with sample accounts and sample records before using real customer information.

The guest booking flow calls `public.create_guest_test_drive_booking`; the signed-in buyer flow calls `create_buyer_test_drive_booking`. Review the functions' permissions and transaction behaviour before production use. In particular, protect test-drive slot availability at the database level so simultaneous requests cannot reserve the same slot.

The used-car setup guide also notes that the detailed `used_cars` and `used_car_sales` schema should be verified against the actual database before provisioning a completely new database.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server. |
| `npm run lint` | Runs ESLint. |
| `npm run build` | Creates a production build. |
| `npm run start` | Starts the production server after a successful build. |

There is currently no `npm test` script defined in `package.json`.

Before preparing a release, run:

```bash
npm run lint
npm run build
```

---

## Security and operational notes

- Staff API operations verify authentication and the relevant staff role before performing privileged actions.
- Server-side admin operations use `SUPABASE_SECRET_KEY`; it must never be exposed in browser code.
- Database access also depends on correctly configured Supabase RLS policies and database function permissions.
- Booking and enquiry inputs are validated by the API routes, including required contact details and booking consent.
- Test-drive email failures are logged and do not undo a successfully saved booking.
- AI assistance uses recorded lead information and includes fallback behaviour if Gemini is unavailable. Staff remain responsible for reviewing customer-facing drafts.
- Before production, test RLS policies, database function permissions, slot concurrency, authentication redirect URLs, email delivery, and role access with separate admin, consultant, buyer, and guest accounts.

---

## Project documentation

- [Beginner-friendly setup and deployment guide](DEPLOYMENT.md)
- [GitHub repository](https://github.com/Arhan002/drivex)

The Technical Design Document is provided separately as part of the project submission.

## Project status

The repository contains the application source and local setup documentation. A live production deployment URL has not been provided or verified. Configure Supabase and the external service credentials before running the full application.

---

## License

No license has been specified for this repository.
