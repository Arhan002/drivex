# DriveX --- Beginner-Friendly Setup and Deployment Guide

**GitHub repository:** https://github.com/Arhan002/drivex

## 1. Before you start

This guide explains how to download DriveX, configure the services it
uses, and run it on your computer.

**Deployment status:** DriveX has been tested as a local development
build. A live production website URL has not been provided or verified.
These instructions explain how to prepare the project; they do not mean
that it is already live.

You will need: - A computer with internet access -
[Node.js](https://nodejs.org/) and npm - A
[Supabase](https://supabase.com/) account and project - A [Google AI
Studio](https://aistudio.google.com/) API key for Gemini

## 2. Download the project

1.  Open the [DriveX GitHub
    repository](https://github.com/Arhan002/drivex).
2.  Select **Code**, then copy the HTTPS repository address.
3.  Open a terminal (Command Prompt, PowerShell, or Terminal).
4.  Run:

``` bash
git clone https://github.com/Arhan002/drivex
cd drivex
npm install
```

`npm install` downloads the packages the project needs. Wait for it to
finish.

## 3. Set up environment variables

Environment variables are settings the application uses to connect to
services such as Supabase and Gemini.

1.  In the main `drivex` folder, create a file named `.env.local`.
2.  Add these variable names:

``` env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
SUPABASE_SECRET_KEY=
```

3.  Get the values from your own Supabase project and Google AI Studio
    account. Do not use someone else's keys.

  -----------------------------------------------------------------------
  Variable                            Purpose
  ----------------------------------- -----------------------------------
  `NEXT_PUBLIC_SUPABASE_URL`          Your Supabase project URL

  `NEXT_PUBLIC_SUPABASE_ANON_KEY`     Your Supabase public/anon key

  `GEMINI_API_KEY`                    Your Gemini API key

  `SUPABASE_SECRET_KEY`               A privileged Supabase key, if the
                                      server-side code requires it
  -----------------------------------------------------------------------



 4. Prepare Supabase

DriveX uses Supabase for its database and user sign-in. A new Supabase
project needs the database structure and access rules expected by the
application.

Before using a new Supabase project:

1.  Apply the database schema and SQL migrations supplied with the
    project. If the repository does not contain the complete schema and
    migrations, do not guess the missing database structure.
2.  Create staff accounts in Supabase Authentication.
3.  Add a matching row in the `profiles` table for each staff account,
    with the correct role: `admin` or `consultant`.
4.  Add the required showroom, car model, variant, pricing and
    test-drive vehicle data.
5.  Check that Row Level Security (RLS) is enabled and that its policies
    give each role access only to the records it should see.
6.  Test with sample accounts and sample records before using real
    customer information.

DriveX uses a database function named
`public.create_guest_test_drive_booking` for guest test-drive bookings.
Review its permissions and security settings before production use. The
current duplicate-slot check may not prevent two requests from booking
the same slot at the same time. Add database-level protection and test
it before a live launch.

The detailed columns and relationships for `used_cars` and
`used_car_sales` still need to be checked against the database before
setting up a completely new database.

## 5. Run DriveX on your computer

After setting up `.env.local` and Supabase:

1.  Open a terminal in the `drivex` project folder.
2.  Run:

``` bash
npm run dev
```

3.  Open your browser and visit **http://localhost:3000**.

DriveX should now open on your computer. To stop the development server,
return to the terminal and press `Ctrl + C`.

## 6. Useful project commands

Run these commands from the project folder:

  Command           What it does
  ----------------- -------------------------------------
  `npm install`     Installs the project's packages
  `npm run dev`     Starts the local development server
  `npm run lint`    Checks the code for linting issues
  `npm run build`   Creates a production build
  `npm run start`   Starts the production build locally

Before preparing a release, run:

``` bash
npm run lint
npm run build
```

## 7. Preparing for online deployment

A live production website URL has not been provided or verified. To
deploy DriveX:

1.  Choose a hosting service that supports Next.js.
2.  Connect the DriveX GitHub repository to that service.
3.  Add the environment variables from Section 3 in the host's private
    environment-variable settings.
4.  Prepare the production Supabase project, including its database
    tables, access rules, staff accounts and vehicle data.
5.  Configure the Supabase authentication redirect URLs for the deployed
    website.
6.  Deploy a preview version first.
7.  Complete the checks in Section 8 before making the site publicly
    available.

Add the hosting provider and live website URL to this guide only after
deployment has actually been completed and tested.

## 8. After setup or deployment: quick checks

Use this checklist to check the main parts of DriveX:

-   [ ] The homepage and car catalogue open.
-   [ ] New-car models, variants and prices display correctly.
-   [ ] The on-road price equals ex-showroom price + road tax +
    insurance + accessories.
-   [ ] Only available used cars appear in the used-car listing.
-   [ ] Booking options show active showrooms and available test-drive
    vehicles.
-   [ ] A guest cannot submit a booking without consent or with invalid
    details.
-   [ ] A successful test-drive booking creates a lead and a linked
    booking record.
-   [ ] Admin and consultant accounts can access only the records
    allowed for their roles.
-   [ ] English and Hindi switching works, and the selected language
    remains after refresh.
-   [ ] AI buyer summaries and reply drafts work.
-   [ ] Staff can review and edit AI-generated reply drafts.
-   [ ] Pages and forms work on a mobile-sized screen.

Use test data while checking the application. Do not use real customer
information until the system has been properly prepared.

