# 🚀 Quick Setup Guide

Follow these steps to get your authentication system running:

## 1️⃣ Environment Setup

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Then edit `.env` and add your credentials:

```env
# Database - Use your PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/mrkim"

# NextAuth - Generate a secret
AUTH_SECRET="$(openssl rand -base64 32)"
AUTH_URL="http://localhost:3000"

# Email (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
SMTP_FROM="noreply@mrkim.com"

# Twilio
TWILIO_ACCOUNT_SID="your-account-sid"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_SENDER_ID="your-sender-id"
```

### 📧 Gmail Setup (for email OTP)

1. Enable 2-Factor Authentication in your Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an "App Password" for "Mail"
4. Use this password in `SMTP_PASS`

### 📱 Twilio Setup (for phone OTP)

1. Sign up at https://www.twilio.com/
2. Get your Account SID and Auth Token from the dashboard
3. Set up a Sender ID (phone number or alphanumeric sender)
4. Add these to your `.env` file

## 2️⃣ Database Setup

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm db:generate

# Create and run migrations
pnpm db:migrate

# (Optional) Open Prisma Studio to view database
pnpm db:studio
```

## 3️⃣ Run Development Server

```bash
pnpm dev
```

Visit http://localhost:3000 - you'll be redirected to `/register`

## 🎯 Test the System

### Test Email Flow:
1. Visit http://localhost:3000/register
2. Fill in email, password, and select a role
3. Click "Sign Up"
4. Check your email for the OTP code
5. Enter the code at `/verify-email`
6. Login at `/login`
7. You'll be redirected to your role-based dashboard

### Test Phone Flow:
1. Visit http://localhost:3000/otp-login
2. Enter phone number with country code (e.g., +1234567890)
3. Select a role
4. Click "Send Verification Code"
5. Check your phone for the SMS with OTP
6. Enter the code and click "Verify & Login"
7. You'll be redirected to your dashboard

## 🔐 Test User Roles

The system has 4 roles with different dashboards:

| Role | Route | Features |
|------|-------|----------|
| Customer | `/dashboard/customer` | Browse marketplace |
| Vendor | `/dashboard/vendor` | Complete vendor profile |
| Service Provider | `/dashboard/service-provider` | Complete service profile |
| Admin | `/dashboard/admin` | Manage users |

## 🐛 Troubleshooting

### Database Issues
```bash
# Reset database
pnpm db:migrate reset

# View database content
pnpm db:studio
```

### Email Not Sending
- Check Gmail App Password is correct
- Ensure 2FA is enabled on your Google account
- Check SMTP settings match your email provider

### SMS Not Sending
- Verify Twilio credentials
- Check phone number format (must include country code)
- Ensure Twilio account has credits

### TypeScript Errors
```bash
# Regenerate Prisma Client
pnpm db:generate
```

## 📝 Default Test Credentials

After registration, you can create test users with these roles:
- `customer@test.com` → Customer role
- `vendor@test.com` → Vendor role
- `provider@test.com` → Service Provider role
- `admin@test.com` → Admin role

Password: `password123` (or your choice)

Remember to verify email with OTP before logging in!

## ✅ Next Steps

1. Customize the dashboard pages for each role
2. Add business logic for vendors and service providers
3. Implement admin user management
4. Add profile image uploads
5. Customize email templates
6. Add SMS template customization
7. Implement forgot password flow
8. Add social login providers

---

🎉 **You're all set!** Start building your application.
