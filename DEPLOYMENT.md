# DriveX Deployment Guide

**Repository:** https://github.com/Arhan002/drivex

This guide explains how to configure DriveX locally and prepare it for hosting. It is written for a first-time setup.

> **Deployment status:** A production website URL has not been provided or verified. These steps explain how to prepare and deploy the project; they do not mean that it is already live.

## 1. What you need

- A computer with internet access.
- [Node.js](https://nodejs.org/) and npm.
- A [Supabase](https://supabase.com/) account and project.
- A [Google AI Studio](https://aistudio.google.com/) API key for Gemini.
- A Gmail account with an App Password if you want test-drive email notifications.

## 2. Download DriveX

Open a terminal (Command Prompt, PowerShell, or Terminal) and run:

```bash
git clone https://github.com/Arhan002/drivex.git
cd drivex
npm install
```

The `npm install` command downloads the packages listed in the project.

## 3. Configure environment variables

Create a file named `.env.local` in the main `drivex` project folder. You can copy `.env.example` and replace its placeholders.

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

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### What each variable does

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL of your Supabase project. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public/anon key used by the Supabase browser and server clients. |
| `SUPABASE_SECRET_KEY` | Privileged Supabase key used by server-side administrative operations. Keep it secret. |
| `GEMINI_API_KEY` | API key used for Google Gemini AI assistance. |
| `GMAIL_USER` | Gmail account used to send test-drive email notifications. |
| `GMAIL_APP_PASSWORD` | Gmail App Password used by Nodemailer. Keep it secret. |
| `SMTP_HOST` | SMTP host. The mailer defaults to `smtp.gmail.com`. |
| `SMTP_PORT` | SMTP port. The mailer defaults to `465`. |
| `SMTP_SECURE` | Secure SMTP setting. Secure mode is enabled unless the value is `false`. |
| `NEXT_PUBLIC_SITE_URL` | Optional site origin used for consultant invitation redirects. It defaults to `http://localhost:3000`; set it to your deployed site origin in production. |

**Important security reminders**

- Values beginning with `NEXT_PUBLIC_` are exposed to the browser. Do not put secret credentials in these variables.
- Keep `GEMINI_API_KEY`, `SUPABASE_SECRET_KEY`, and `GMAIL_APP_PASSWORD` on the server.
- Never commit `.env.local` or share real credentials in screenshots, documents, or public issues.
- The repository's `.gitignore` excludes local environment files.

## 4. Prepare Supabase

DriveX uses Supabase for authentication and PostgreSQL data. A new Supabase project is not ready to use just by adding the project URL and keys.

Before using a fresh Supabase project:

1. Provision the database tables, columns, relationships, and constraints expected by the application. The repository does not currently contain a complete SQL migration or one-command database bootstrap.
2. Configure the database functions used by guest and signed-in buyer test-drive booking, enquiry submission, and booking-status updates.
3. Enable and verify Row Level Security (RLS) policies for the relevant tables.
4. Create staff accounts in Supabase Authentication and matching rows in the `profiles` table with the correct `admin` or `consultant` role.
5. Add the required showroom, car model, variant, pricing, and demo-vehicle data.
6. Test with sample accounts and sample records before using real customer information.

### Database functions used by the application

- `public.create_guest_test_drive_booking` — creates a guest test-drive booking.
- `create_buyer_test_drive_booking` — creates a test-drive booking for a signed-in buyer.
- `update_test_drive_booking_status` — updates a booking status.

Review function owners, permissions, grants, and security settings before production use. The duplicate-slot check must be protected at the database level so two simultaneous requests cannot reserve the same slot.

The detailed column definitions and relationships for `used_cars` and `used_car_sales` should be verified against the actual database before provisioning a completely new database. Do not guess missing schema details.

## 5. Run DriveX locally

After setting up `.env.local` and preparing Supabase, run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To stop the server, return to the terminal and press `Ctrl + C`.

## 6. Useful project commands

Run these commands from the project folder:

| Command | What it does |
|---|---|
| `npm install` | Installs project dependencies. |
| `npm run dev` | Starts the development server. |
| `npm run lint` | Runs ESLint. |
| `npm run build` | Creates a production build. |
| `npm run start` | Starts the production build locally. |

There is no dedicated automated test script in the current `package.json`.

Before preparing a release, run:

```bash
npm run lint
npm run build
```

## 7. Prepare for online deployment

1. Choose a hosting provider that supports Next.js.
2. Connect the DriveX GitHub repository to the hosting provider.
3. Add the required environment variables using the provider's private environment-variable settings. Do not upload `.env.local`.
4. Set `NEXT_PUBLIC_SITE_URL` to the deployed website's origin.
5. Prepare the production Supabase project, including its schema, database functions, RLS policies, staff profiles, showroom data, and vehicle data.
6. Configure the Supabase Authentication redirect URLs for the deployed domain, including the `/auth/callback` route used by consultant invitations.
7. Deploy a preview first and complete the checks in Section 8.

Only add the hosting provider and production URL to this document after deployment has actually been completed and tested.

## 8. Final setup and deployment checklist

Use test data while checking the application.

- [ ] The homepage and new-car catalogue open.
- [ ] New-car models, variants, and prices display correctly.
- [ ] The on-road estimate equals ex-showroom price + road tax + insurance + accessories.
- [ ] Available pre-owned cars appear in the used-car listing.
- [ ] Booking options show active showrooms and available demo vehicles.
- [ ] A guest cannot submit a test-drive booking without consent or with invalid required details.
- [ ] A successful guest or buyer booking creates the expected lead and linked booking records.
- [ ] Buyer accounts can access only their own buyer information.
- [ ] Admin and consultant accounts can access only the records allowed for their roles.
- [ ] English/Hindi switching works and the selected language remains after refresh.
- [ ] AI buyer summaries and first-response drafts work, including fallback behaviour when Gemini is unavailable.
- [ ] Staff can review and edit AI-generated drafts before using them.
- [ ] Test-drive booking and confirmation emails are delivered when SMTP is configured.
- [ ] Pages and forms work on a mobile-sized screen.
- [ ] Test-drive slot concurrency and database function permissions have been reviewed.

Do not use real customer information until the production database, access policies, and operational checks have been completed.
