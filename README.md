# DentWise
Full-stack AI dental assistant platform with voice consultations, appointment orchestration, transactional email, and role-based operations tooling.

![DentWise Homepage](public/dentwise_images/Homepage.png)

## Table of Contents
1. [What This Project Is](#what-this-project-is)
2. [Product Tour](#product-tour)
3. [Feature Matrix](#feature-matrix)
4. [Tech Stack](#tech-stack)
5. [System Architecture](#system-architecture)
6. [Data Model](#data-model)
7. [Environment Variables](#environment-variables)
8. [Local Setup](#local-setup)
9. [Key Runtime Flows](#key-runtime-flows)
10. [API Contract](#api-contract)
11. [Project Structure](#project-structure)
12. [Scripts](#scripts)
13. [Deployment Notes](#deployment-notes)
14. [Quality and Roadmap](#quality-and-roadmap)

## What This Project Is
DentWise is built as a complete patient-care product, not just a UI demo.

It combines:
- A marketing site for acquisition.
- A protected patient dashboard for personalized care tracking.
- Multi-step appointment booking with slot management.
- A voice AI consultation experience (plan-gated).
- Admin operations panel for doctors and appointments.
- Appointment confirmation email pipeline.

## Product Tour
### Landing + Positioning
| Homepage | Footer |
|---|---|
| ![Homepage](public/dentwise_images/Homepage.png) | ![Footer](public/dentwise_images/Footer.png) |

### Patient Experience
| Dashboard | Appointments Step 1 |
|---|---|
| ![Dashboard](public/dentwise_images/Dashboard.png) | ![Appointment Step 1](public/dentwise_images/AppointmentPage_1.png) |

| Appointments Step 2 | Confirmation Modal |
|---|---|
| ![Appointment Step 2](public/dentwise_images/AppointmentPage_2.png) | ![Appointment Confirmation](public/dentwise_images/AppointmentConfirmation.png) |

### Voice + Subscription
| AI Dental Assistant | Payment/Upgrade |
|---|---|
| ![AI Dental Assistant](public/dentwise_images/AiDentalAssistant.png) | ![Payment Page](public/dentwise_images/PaymentPage.png) |

### Admin Operations
| Admin Dashboard | Add Doctor |
|---|---|
| ![Admin Page](public/dentwise_images/Admin%20Page.png) | ![Add Doctor](public/dentwise_images/AddDoctor.png) |

| Recent Appointment Management |
|---|
| ![Recent Appointment](public/dentwise_images/RecentAppointment.png) |

## Feature Matrix
| Capability | Patients | Admin |
|---|---|---|
| Clerk authentication | Yes | Yes |
| Role-based entry routing | Yes | Yes |
| AI voice assistant (Vapi) | Yes (plan-gated) | Yes (if entitled) |
| Appointment booking flow | Yes | View/manage all |
| Doctor directory browsing | Yes | Full CRUD |
| Appointment status update | No | Yes |
| Transactional email notifications | Yes | System-driven |
| Subscription upgrade screen | Yes | Yes |

## Tech Stack
### Frontend
- Next.js 15 App Router + Turbopack
- React 19 + TypeScript
- Tailwind CSS v4
- shadcn/ui + Lucide icons + Base UI
- TanStack React Query

### Backend / Services
- Server Actions + Route Handlers
- Prisma ORM + PostgreSQL (`@prisma/adapter-pg`)
- Clerk (Auth, user session, pricing table, plans)
- Resend + React Email for notifications
- Vapi Web SDK for voice AI

### Tooling
- Biome for linting and formatting
- Prisma CLI for schema/client workflows
- Vercel-ready build pipeline

## System Architecture
```text
[User Browser]
   |
   v
[Next.js App Router]
   |-- Server Components
   |-- Client Components
   |-- Server Actions (users/doctors/appointments)
   |-- API Route: /api/send-appointment-email
   |
   +--> [Clerk] session/auth/plan checks
   +--> [Prisma + PostgreSQL] users, doctors, appointments
   +--> [Resend] appointment confirmation emails
   +--> [Vapi] real-time voice calls + transcript events
```

## Data Model
Defined in `prisma/schema.prisma`:
- `User`: `id`, `clerkId`, `email`, `firstName`, `lastName`, timestamps.
- `Doctor`: profile info, `isActive`, image, gender, relations.
- `Appointment`: date/time, status, reason, foreign keys to user and doctor.

Enums:
- `AppointmentStatus`: `CONFIRMED`, `COMPLETED`
- `Gender`: `MALE`, `FEMALE`

## Environment Variables
Create `.env` at repository root:

```env
# PostgreSQL
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
ADMIN_EMAIL=admin@example.com

# Vapi
NEXT_PUBLIC_VAPI_API_KEY=...
NEXT_PUBLIC_VAPI_ASSISTANT_ID=...

# Resend
RESEND_API_KEY=...

# Public app URL for email links
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Local Setup
1. Install dependencies:
```bash
npm install
```
2. Add `.env` values.
3. Sync schema to DB:
```bash
npx prisma db push
```
4. Start app:
```bash
npm run dev
```
5. Visit:
```text
http://localhost:3000
```

Optional:
```bash
npx prisma studio
```

## Key Runtime Flows
### 1. Login and Role Redirect
- `/` checks Clerk user server-side.
- If signed in and email equals `ADMIN_EMAIL`, redirect to `/admin`.
- Otherwise redirect to `/dashboard`.

### 2. User Sync
- On homepage visit, `syncUser()` creates local DB user if missing.
- User is matched by `clerkId`.

### 3. Appointment Booking
- User picks doctor, date, time, and appointment type.
- Server action creates appointment with status `CONFIRMED`.
- UI triggers email API route for confirmation.
- Success modal displays booking summary.

### 4. Voice Session
- `/voice` checks Clerk plan entitlements (`ai_basic`, `ai_pro`).
- If authorized, Vapi call starts and transcript events stream into UI.
- If not authorized, user sees upgrade gate.

### 5. Admin Operations
- Admin dashboard aggregates doctors and appointments.
- Admin can add/edit doctor profiles.
- Admin can toggle appointment status in recent appointments table.

## API Contract
### `POST /api/send-appointment-email`
Sends appointment confirmation mail via Resend using React Email template.

Request body:
```json
{
  "userEmail": "patient@example.com",
  "doctorName": "Dr. Jane Doe",
  "appointmentDate": "Friday, March 20, 2026",
  "appointmentTime": "10:30",
  "appointmentType": "Regular Checkup",
  "duration": "60 min",
  "price": "$120"
}
```

Success response:
```json
{
  "message": "Email sent successfully",
  "emailId": "resend_message_id"
}
```

## Project Structure
```text
src/
  app/
    admin/                    # Admin routes and shell
    appointments/             # Booking page
    dashboard/                # Patient dashboard
    pro/                      # Pricing / upgrade
    voice/                    # Voice assistant page
    api/send-appointment-email/route.ts
  components/
    admin/                    # Doctor + appointment management UI
    appointments/             # Multi-step booking flow
    dashboard/                # Dashboard widgets
    emails/                   # React Email templates
    landing/                  # Marketing sections
    voice/                    # Voice UX and gating
  hooks/                      # React Query hooks
  lib/
    actions/                  # Server actions
    prisma.ts                 # Prisma singleton
    resend.ts                 # Resend client
    vapi.ts                   # Vapi client
prisma/
  schema.prisma
public/
  dentwise_images/            # README visuals
```

## Scripts
- `npm run dev` - run dev server with Turbopack.
- `npm run build` - Prisma generate + production build.
- `npm run start` - run production build.
- `npm run lint` - Biome checks.
- `npm run format` - Biome format write.

## Deployment Notes
- Target platform: Vercel.
- Configure all environment variables in project settings.
- Use production Clerk keys and configure plans (`ai_basic`, `ai_pro`).
- Set `NEXT_PUBLIC_APP_URL` to deployed HTTPS domain for correct email links/images.
- Ensure production `DATABASE_URL` is reachable from Vercel region.

## Quality and Roadmap
Current strengths:
- End-to-end product flow across patient + admin + AI voice.
- Solid service integration breadth (Auth, DB, Email, Voice).
- Typed full-stack codebase with clear domain modules.

Recommended next upgrades:
- Add automated tests (unit + integration + e2e).
- Introduce Prisma migrations workflow for production evolution.
- Add structured logging and error monitoring.
- Add rate limiting for public/API surfaces.
- Add RBAC abstraction if admin roles expand beyond single `ADMIN_EMAIL`.

## License
No explicit license file yet. Add `LICENSE` if this repo will be distributed publicly.
