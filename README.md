# DentWise

<p align="center">
  <img src="./public/logo.png" alt="DentWise Logo" width="80" />
</p>

<p align="center">
  AI-first dental care platform for appointments, reminders, care plans, notifications, and voice interactions.
</p>

<p align="center">
  <img src="./public/hero.png" alt="DentWise Hero" width="240"/>
</p>

## Overview

DentWise is a full-stack healthcare product that goes beyond simple appointment booking.  
It combines:
- Smart appointment scheduling with doctor availability rules
- Post-booking lifecycle (email confirmations + reminder pipeline)
- Patient continuity features (timeline, notifications, care plans)
- Admin operations console (doctor management, reminders, availability, analytics)
- Voice AI assistant integration

## Product Showcase

### Landing Experience

| Homepage | How It Works |
|---|---|
| ![Homepage](./public/Homepage.png) | ![How It Works](./public/HowItWorks.png) |

| Pricing | Footer/Brand |
|---|---|
| ![Pricing Plans](./public/PricingPlans.png) | ![Footer](./public/Footer.png) |

### Patient Journey

| Sign In | Sign Up |
|---|---|
| ![Signin](./public/Signin.png) | ![SignUp](./public/SignUp.png) |

| Dashboard | Dashboard Insights |
|---|---|
| ![Dashboard](./public/Dashboard.png) | ![Dashboard 2](./public/Dashboard_2.png) |

| Appointment Step 1 | Appointment Step 2 |
|---|---|
| ![Appointment Step 1](./public/AppointmentPage_1.png) | ![Appointment Step 2](./public/AppointmentPage_2.png) |

| Confirmation Modal | Confirmation Email |
|---|---|
| ![Appointment Confirmation](./public/AppointmentConfirmation.png) | ![Appointment Email](./public/AppointmentConfirmationMail.png) |

| Timeline | Notifications |
|---|---|
| ![Timeline Page](./public/TimelinePage.png) | ![Notification Page](./public/NotificationPage.png) |

| Care Plan | Voice Assistant |
|---|---|
| ![Care Plan](./public/CarePlanPage.png) | ![AI Dental Assistant](./public/AiDentalAssistant.png) |

### Admin Operations

| Admin Main | Add Doctor |
|---|---|
| ![Admin Page](./public/Admin%20Page.png) | ![Add Doctor](./public/AddDoctor.png) |

| Admin Module 1 | Admin Module 2 |
|---|---|
| ![Admin Page 1](./public/AdminPage_1.png) | ![Admin Page 2](./public/AdminPage_2.png) |

| Admin Module 3 | Admin Module 4 |
|---|---|
| ![Admin Page 3](./public/AdminPage_3.png) | ![Admin Page 4](./public/AdminPage_4.png) |

| Admin Module 5 | Recent Appointments |
|---|---|
| ![Admin Page 5](./public/AdminPage_5.png) | ![Recent Appointment](./public/RecentAppointment.png) |

### Support and Legal Pages

| Help Center | Contact |
|---|---|
| ![Help Center](./public/HelpCenter.png) | ![Contact](./public/ContactUs.png) |

| Status | Privacy |
|---|---|
| ![Status](./public/Status.png) | ![Privacy](./public/Privacy.png) |

| Terms | Security |
|---|---|
| ![Terms](./public/Terms.png) | ![Security](./public/Security.png) |

## Feature Set

### Patient Features
- Clerk authentication with route protection
- Dashboard with upcoming appointments and activity
- 3-step appointment booking flow
- Smart slot selection based on doctor availability + existing bookings
- Appointment confirmation modal
- Transactional confirmation email
- Timeline page aggregating appointment/reminder/notification events
- Notification inbox with read state handling
- Care plan and task completion flow
- Voice assistant access path

### Clinical and Engagement Features
- Urgency/triage signals during booking
- Automated reminder scheduling with `BOOKING_CONFIRMATION`
- Automated reminder scheduling with `PRE_VISIT_24H`
- Automated reminder scheduling with `PRE_VISIT_2H`
- Automated reminder scheduling with `FOLLOW_UP_24H`
- Follow-up notification generation
- Email action links (confirm/reschedule intent from email)

### Admin Features
- Doctor CRUD + active/inactive controls
- Doctor availability manager by weekday/time window/slot interval
- Recent appointment monitoring and status updates
- Reminder operations (manual dispatch + health checks)
- Analytics and operations panels

## Technology Stack

### Frontend
- Next.js 15 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui + Radix ecosystem
- TanStack Query
- Recharts

### Backend
- Next.js Route Handlers + Server Actions
- Prisma ORM + PostgreSQL
- Clerk for auth and identity
- Resend for transactional email
- Vapi for voice integration

### Tooling
- Biome for lint/format
- Prisma CLI for schema/client workflows
- Vercel deployment + cron

## Architecture

```text
Client (Patient/Admin UI)
  -> Next.js App Router
    -> Server Components + Client Components
    -> Hooks (TanStack Query)
    -> Server Actions / API Routes
      -> Prisma -> PostgreSQL
      -> Clerk auth context
      -> Resend email delivery
      -> Vapi voice services
```

## Data Model (High-Level)

Main entities in `prisma/schema.prisma`:
- `User`
- `Doctor`
- `Appointment`
- `DoctorAvailability`
- `AppointmentReminder`
- `ReminderDeliveryEvent`
- `AppointmentActionToken`
- `Notification`
- `CarePlan`
- `CareTask`

Important enums:
- `AppointmentStatus`: `CONFIRMED`, `COMPLETED`
- `ReminderType`, `ReminderStatus`, `ReminderChannel`
- `NotificationType`

## Routes

### App Pages
- `/`
- `/dashboard`
- `/appointments`
- `/voice`
- `/pro`
- `/admin`
- `/timeline`
- `/notifications`
- `/care-plan`

### Info/Support Pages
- `/help-center`
- `/contact`
- `/status`
- `/privacy`
- `/terms`
- `/security`

### API Endpoints
- `POST /api/send-appointment-email`
- `GET /api/appointments/respond`
- `POST /api/reminders/appointment`
- `POST /api/admin/reminders/dispatch`
- `GET /api/cron/reminders/dispatch`
- `POST /api/webhooks/resend`

## Environment Variables

Copy `.env.example` into `.env`, then update real values.

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_or_pk_live
CLERK_SECRET_KEY=sk_test_or_sk_live

DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?sslmode=require"

NEXT_PUBLIC_VAPI_ASSISTANT_ID=your-vapi-assistant-id
NEXT_PUBLIC_VAPI_API_KEY=your-vapi-public-api-key

ADMIN_EMAIL=admin@example.com

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM="DentWise <onboarding@resend.dev>"
EMAIL_LOGO_URL=https://i.ibb.co/your-image-id/logo.png
NEXT_PUBLIC_APP_URL=https://your-domain.com

NEXT_PUBLIC_ENABLE_TRIAGE=true
ENABLE_REMINDER_APIS=true
ENABLE_RESEND_WEBHOOK=false

REMINDER_API_SECRET=set-a-strong-random-secret
RESEND_WEBHOOK_SECRET=set-a-strong-random-secret
CRON_SECRET=set-a-strong-random-secret
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create env file:
```bash
cp .env.example .env
```

PowerShell alternative:
```powershell
Copy-Item .env.example .env
```

3. Sync Prisma + generate client:
```bash
npx prisma db push
npx prisma generate
```

4. Run app:
```bash
npm run dev
```

5. Open:
```text
http://localhost:3000
```

## Scripts

- `npm run dev` -> start dev server
- `npm run build` -> `prisma generate && next build --turbopack`
- `npm run start` -> run production build
- `npm run lint` -> biome checks
- `npm run format` -> biome format write

## Reminder, Cron, and Webhook Notes

- Cron route: `GET /api/cron/reminders/dispatch`
- `vercel.json` is set for Hobby-safe daily schedule.
- For protected cron/reminder endpoints, pass `Authorization: Bearer <CRON_SECRET>` or reminder secret where required.
- For Resend webhook, set `ENABLE_RESEND_WEBHOOK=true`.
- For Resend webhook, set `RESEND_WEBHOOK_SECRET=<your_secret>`.

## Deployment (Vercel)

1. Import repository to Vercel.
2. Add all env vars from `.env.example`.
3. Set `NEXT_PUBLIC_APP_URL` to deployed HTTPS domain.
4. Use `EMAIL_FROM="DentWise <onboarding@resend.dev>"` for initial testing.
5. Use a verified domain sender in `EMAIL_FROM` for production scale.
6. Deploy.

## Why This Project Stands Out

- Covers complete dental operations lifecycle, not only booking
- Strong full-stack integration across auth, data, email, and AI voice
- Built with production-minded patterns (secrets, cron, webhook, admin controls)
- Real user continuity via timeline + care plan + reminders
- Extensible architecture for SMS, analytics, and workflow automation

## License

No `LICENSE` file is currently present.  
Add one before open-source/public distribution.
