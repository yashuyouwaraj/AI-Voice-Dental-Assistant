# DentWise
AI-first dental care platform built with Next.js, Clerk, Prisma, Resend, and Vapi.

DentWise combines patient experience, appointment operations, proactive reminders, and voice AI into one full-stack product.

![DentWise Homepage](public/Homepage.png)

## Why DentWise
Most dental apps only solve booking. DentWise solves the full loop:
- Awareness: landing + pricing + FAQ
- Action: appointment booking with doctor slot logic
- Continuity: reminders, notifications, timeline, and care plans
- Intelligence: AI triage + voice assistant
- Operations: admin dashboard for doctors, availability, reminders, and analytics

## What Is New In This Version
- Multi-page footer with live routes (`/help-center`, `/contact`, `/status`, `/privacy`, `/terms`, `/security`)
- Reminder operations APIs and cron pipeline
- Patient timeline, notifications inbox, and care-plan tracking
- Emergency triage card (feature-flag controlled)
- Doctor availability engine with day/time/slot controls
- Email action links and stronger production safety around secrets

## Product Screens
| Landing | Dashboard |
|---|---|
| ![Homepage](public/Homepage.png) | ![Dashboard](public/Dashboard.png) |

| Appointments Step 1 | Appointments Step 2 |
|---|---|
| ![Appointment Step 1](public/AppointmentPage_1.png) | ![Appointment Step 2](public/AppointmentPage_2.png) |

| Voice Assistant | Admin |
|---|---|
| ![AI Dental Assistant](public/AiDentalAssistant.png) | ![Admin Page](public/Admin%20Page.png) |

## Core Features
### Patient Experience
- Clerk authentication and protected routes
- Dashboard with appointment overview
- Multi-step appointment booking
- Confirmation modal and confirmation email
- Timeline of appointment/reminder/notification events
- Notification inbox with mark-read actions
- Care-plan tasks with completion toggles
- Voice assistant access (plan gated)

### Clinical Intelligence
- Symptom-based emergency triage card
- Urgency-aware booking hints
- Follow-up care generation after completed appointments

### Admin + Operations
- Doctor management (create/edit/active status)
- Recent appointment status toggling (`CONFIRMED`/`COMPLETED`)
- Doctor availability manager (day-level configuration)
- Reminder dispatch controls and reminder stats
- Risk alerts and ops analytics panels

### Reminder and Email System
- Transactional appointment confirmation email via Resend
- Scheduled reminders (`BOOKING_CONFIRMATION`, `PRE_VISIT_24H`, `PRE_VISIT_2H`, `FOLLOW_UP_24H`)
- Admin/manual dispatch API and cron dispatch API
- Resend webhook ingestion for delivery events

## Tech Stack
### Frontend
- Next.js 15 (App Router + Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- TanStack Query
- Lucide icons

### Backend
- Next.js Route Handlers + Server Actions
- Prisma ORM + PostgreSQL (`@prisma/adapter-pg`)
- Clerk (auth + role checks)
- Resend (emails)
- Vapi (voice AI)

### Tooling
- Biome (format + lint)
- Prisma CLI
- Vercel cron integration

## Architecture Overview
```text
Browser (Patient/Admin)
  -> Next.js App Router
    -> Server Components + Client Components
    -> Server Actions (users, doctors, appointments, engagement)
    -> API Routes (email, reminders, cron, webhooks)
      -> Prisma + PostgreSQL
      -> Clerk
      -> Resend
      -> Vapi
```

## Data Model (High-Level)
Main models in `prisma/schema.prisma`:
- `User`
- `Doctor`
- `Appointment`
- `AppointmentReminder`
- `ReminderDeliveryEvent`
- `AppointmentActionToken`
- `DoctorAvailability`
- `Notification`
- `CarePlan`
- `CareTask`

Key enums include:
- `AppointmentStatus`: `CONFIRMED`, `COMPLETED`
- `ReminderType`, `ReminderStatus`, `ReminderChannel`
- `NotificationType`

## Environment Variables
Copy `.env.example` to `.env` and fill all required values.

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_or_pk_live
CLERK_SECRET_KEY=sk_test_or_sk_live
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=require"

NEXT_PUBLIC_VAPI_ASSISTANT_ID=your-vapi-assistant-id
NEXT_PUBLIC_VAPI_API_KEY=your-vapi-public-api-key

ADMIN_EMAIL=admin@example.com

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM="DentWise <no-reply@your-domain.com>"
NEXT_PUBLIC_APP_URL=https://your-domain.com

NEXT_PUBLIC_ENABLE_TRIAGE=true
ENABLE_REMINDER_APIS=true
ENABLE_RESEND_WEBHOOK=false

REMINDER_API_SECRET=set-a-strong-random-secret
RESEND_WEBHOOK_SECRET=set-a-strong-random-secret
CRON_SECRET=set-a-strong-random-secret
```

## Local Setup
1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

3. Sync schema and generate client:
```bash
npx prisma db push
npx prisma generate
```

4. Run development server:
```bash
npm run dev
```

5. Open app:
```text
http://localhost:3000
```

Optional DB UI:
```bash
npx prisma studio
```

## Scripts
- `npm run dev`: start local dev server
- `npm run build`: production build (`prisma generate && next build --turbopack`)
- `npm run start`: run production server
- `npm run lint`: Biome checks
- `npm run format`: Biome auto-format

## Important Routes
### App Routes
- `/` landing
- `/dashboard` patient dashboard
- `/appointments` booking flow
- `/voice` voice assistant
- `/pro` plan/upgrade page
- `/admin` admin panel
- `/timeline` patient timeline
- `/notifications` patient inbox
- `/care-plan` patient care tasks

### Footer + Info Routes
- `/help-center`
- `/contact`
- `/status`
- `/privacy`
- `/terms`
- `/security`

### API Routes
- `POST /api/send-appointment-email`
- `GET /api/appointments/respond`
- `POST /api/reminders/appointment`
- `POST /api/admin/reminders/dispatch`
- `GET /api/cron/reminders/dispatch`
- `POST /api/webhooks/resend`

## Reminder and Cron Operations
- `vercel.json` schedules cron every 15 minutes:
  - `GET /api/cron/reminders/dispatch`
- In production, set `CRON_SECRET` and send:
  - `Authorization: Bearer <CRON_SECRET>`
- If reminder APIs are enabled, secure them with:
  - `REMINDER_API_SECRET`
- If webhook is enabled, secure it with:
  - `RESEND_WEBHOOK_SECRET`

## Deployment (Vercel)
1. Import repo into Vercel.
2. Add all env variables from `.env.example`.
3. Set `NEXT_PUBLIC_APP_URL` to deployed HTTPS domain.
4. Use verified sender domain in `EMAIL_FROM` for Resend.
5. Ensure database is reachable from Vercel region.
6. Deploy.

## API Quick Examples
### Send appointment email
```bash
curl -X POST http://localhost:3000/api/send-appointment-email \
  -H "Content-Type: application/json" \
  -d '{
    "userEmail": "patient@example.com",
    "doctorName": "Dr. Jane Doe",
    "appointmentDate": "Friday, March 20, 2026",
    "appointmentTime": "10:30",
    "appointmentType": "Regular Checkup",
    "duration": "60 min",
    "price": "$120"
  }'
```

### Dispatch due reminders manually (admin endpoint)
```bash
curl -X POST http://localhost:3000/api/admin/reminders/dispatch \
  -H "Content-Type: application/json" \
  -d '{"limit": 50, "backfill": true}'
```

## Troubleshooting
### `Internal server error` while sending emails
- Verify `RESEND_API_KEY`
- Verify `EMAIL_FROM` is valid/verified for production
- Check API response `providerError` details (non-OK response)

### No reminder dispatch happening
- Ensure `ENABLE_REMINDER_APIS=true`
- Ensure due reminders exist (`scheduledFor <= now` and `status=PENDING`)
- Verify auth header/secret for reminder endpoints

### App builds locally but fails on deploy
- Re-check environment variables in Vercel dashboard
- Confirm `NEXT_PUBLIC_APP_URL` is correct
- Confirm DB credentials and network access

### Booking issues due to slot availability
- Validate doctor availability entries in admin panel
- Confirm selected date/time are valid and not already booked

## Quality Gates
Current baseline:
- `npm run lint` passing
- `npx tsc --noEmit` passing
- `npm run build` passing

## Roadmap Suggestions
- Add e2e tests for booking + reminder lifecycle
- Add audit logs for admin actions
- Add SMS reminder channel
- Add patient-facing appointment reschedule UI from email token actions
- Add observability (Sentry/OpenTelemetry)

## License
No license file is currently included.
Add a `LICENSE` file before public distribution.
