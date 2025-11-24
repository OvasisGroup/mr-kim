
# ✅ Authentication & Onboarding System — Next.js App Router + Prisma

This document defines the full implementation for onboarding Customers, Vendors, Service Providers, and Admins using:

- Email + Password + Email OTP verification
- Phone OTP (Twilio Sender ID) registration & login
- Role-based dashboards
- Vendor & Service Provider profile completion

Designed for Next.js App Router, Prisma, and NextAuth.js (Credentials).

---

## 📌 System Roles

Role | Access
--- | ---
CUSTOMER | Customer dashboard
VENDOR | Vendor dashboard + profile
SERVICE_PROVIDER | Service provider dashboard + profile
ADMIN | Admin dashboard

---

## 🚀 High-Level Flows

Email + Password Registration Flow:

User registers with email/password/role
API creates user with emailVerified = false
Email OTP sent
User verifies OTP
Login allowed
Redirect to role dashboard
Vendor/Service Provider completes profile

Phone OTP Registration / Login:

User enters phone + role
OTP sent via Twilio Sender ID
Verify OTP
If phone exists → login
If not → create account
Redirect to dashboard
Vendor/Service Provider completes profile

---

## 🏗️ Tech Stack

- Next.js App Router
- NextAuth.js (JWT)
- Prisma
- Postgres / MySQL
- Twilio SMS (Sender ID)
- Nodemailer for email OTP

---

## 📁 Folder Structure

app/
 api/
   auth/
     register/route.ts
     email/request/route.ts
     email/verify/route.ts
     otp/request/route.ts
     otp/verify/route.ts
   vendor/profile/route.ts
 register/page.tsx
 login/page.tsx
 verify-email/page.tsx
 otp-login/page.tsx
 dashboard/
   customer/page.tsx
   vendor/page.tsx
   service-provider/page.tsx
   admin/page.tsx

---

## 🗄️ Prisma Schema

Includes:

- User model with emailVerified + phoneVerified
- VendorProfile
- ServiceProviderProfile
- OtpCode table for both phone/email

---

## 🔧 Install Dependencies

npm install next-auth @prisma/client prisma bcryptjs twilio nodemailer

Run:

npx prisma migrate dev

---

## 🔑 NextAuth Configuration

Using two credential providers:

- credentials → email/password login (blocked if emailVerified = false)
- phone-otp → phone login after OTP verification

JWT stores role
Session exposes user.id and user.role

---

## 📬 Email OTP Flow

email/request route:

- Generates 6‑digit code
- Hashes and stores in OtpCode
- Sends via Nodemailer

email/verify route:

- Validates code
- Marks consumed
- Sets emailVerified = true

Login now allowed

---

## 📱 Phone OTP Flow

otp/request:

- Generate OTP
- Store hashed
- Send via Twilio

otp/verify:

- Validate
- Create user if doesn't exist
- Mark phoneVerified = true

Client then signs in using NextAuth phone‑otp provider

---

## 🔐 Middleware Role Redirects

middleware.ts:

- Protect /dashboard/*
- Redirect /dashboard to /dashboard/{role}

---

## 🧾 Vendor / Service Provider Profile

Each role updates profile via:

- POST /api/vendor/profile
- POST /api/service-provider/profile

Stored via Prisma upsert

---

## ✅ Final Features

✔ Email/password registration  
✔ Email OTP verification  
✔ Block login until verified  
✔ Phone OTP registration & login  
✔ Role-based dashboard redirects  
✔ Vendor & service-provider onboarding  
✔ Secure route protection  

---

## 🔜 Optional Enhancements

- Resend OTP cooldown
- Auto-expire unused OTPs
- Magic links
- Admin manual verification

---

END OF DOCUMENT ✅
