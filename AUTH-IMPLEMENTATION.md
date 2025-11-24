# Authentication System Implementation

This project implements a complete authentication and onboarding system as specified in `AUTH-FLOW.md`.

## ✅ Implemented Features

- **Email + Password Registration** with email OTP verification
- **Phone OTP Registration & Login** via Twilio
- **Role-based access control** (Customer, Vendor, Service Provider, Admin)
- **Protected routes** with automatic role-based redirects
- **Profile completion** for Vendors and Service Providers
- **NextAuth.js v5** with JWT sessions
- **Prisma ORM** with PostgreSQL

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Generate with `openssl rand -base64 32`
- SMTP settings for email OTP
- Twilio credentials for phone OTP

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 4. Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

## 📁 Project Structure

```
app/
├── api/
│   ├── auth/
│   │   ├── register/route.ts
│   │   ├── email/
│   │   │   ├── request/route.ts
│   │   │   └── verify/route.ts
│   │   ├── otp/
│   │   │   ├── request/route.ts
│   │   │   └── verify/route.ts
│   │   └── [...nextauth]/route.ts
│   ├── vendor/profile/route.ts
│   └── service-provider/profile/route.ts
├── register/page.tsx
├── login/page.tsx
├── verify-email/page.tsx
├── otp-login/page.tsx
└── dashboard/
    ├── customer/page.tsx
    ├── vendor/page.tsx
    ├── service-provider/page.tsx
    └── admin/page.tsx

lib/
├── prisma.ts          # Prisma client singleton
├── otp.ts             # OTP generation & verification
├── email.ts           # Email sending via Nodemailer
└── sms.ts             # SMS sending via Twilio

prisma/
├── schema.prisma      # Database schema
└── prisma.config.ts   # Prisma configuration

auth.ts                # NextAuth configuration
middleware.ts          # Route protection & redirects
```

## 🔐 Authentication Flows

### Email + Password Flow

1. User registers at `/register` with email, password, and role
2. System creates user with `emailVerified = false`
3. Email OTP is sent automatically
4. User verifies OTP at `/verify-email`
5. Email is marked as verified
6. User can now login at `/login`
7. Redirected to role-based dashboard

### Phone OTP Flow

1. User enters phone number and role at `/otp-login`
2. System sends OTP via Twilio
3. User verifies OTP
4. If user exists → login
5. If new user → account created with `phoneVerified = true`
6. User is authenticated and redirected to dashboard

## 🎯 Role-Based Access

| Role | Dashboard Route | Features |
|------|----------------|----------|
| CUSTOMER | `/dashboard/customer` | Browse vendors/services |
| VENDOR | `/dashboard/vendor` | Manage vendor profile |
| SERVICE_PROVIDER | `/dashboard/service-provider` | Manage service profile |
| ADMIN | `/dashboard/admin` | Manage all users |

## 🔧 API Routes

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/email/request` - Request email OTP
- `POST /api/auth/email/verify` - Verify email OTP
- `POST /api/auth/otp/request` - Request phone OTP
- `POST /api/auth/otp/verify` - Verify phone OTP

### Profiles

- `GET/POST /api/vendor/profile` - Vendor profile management
- `GET/POST /api/service-provider/profile` - Service provider profile management

## 🛡️ Security Features

- Passwords hashed with bcryptjs
- OTP codes hashed before storage
- OTPs expire after 10 minutes
- Email verification required for email/password login
- Phone verification required for phone login
- JWT-based sessions
- Protected routes via middleware
- Role-based access control

## 📝 Database Schema

### User Model
- Email or phone authentication
- Role assignment
- Email/phone verification status

### VendorProfile Model
- Business name, address, description
- Verification status

### ServiceProviderProfile Model
- Service name, type, description
- Verification status

### OtpCode Model
- Hashed OTP storage
- Type (EMAIL or PHONE)
- Expiration tracking
- Consumption status

## 🎨 UI Components

Uses shadcn/ui components:
- Button
- Toast notifications (Sonner)

## 🔜 Future Enhancements

- Resend OTP cooldown
- Auto-expire unused OTPs
- Magic link authentication
- Admin manual verification
- Two-factor authentication
- Social login providers

## 📚 Tech Stack

- **Next.js 16** (App Router)
- **NextAuth.js 5** (beta)
- **Prisma 7**
- **PostgreSQL**
- **Twilio** (SMS)
- **Nodemailer** (Email)
- **bcryptjs** (Password hashing)
- **shadcn/ui** (UI components)
- **TailwindCSS** (Styling)

---

✅ Implementation complete as per AUTH-FLOW.md
