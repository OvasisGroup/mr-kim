# Authentication Setup Guide

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

### Required Variables

```env
# Database
PRISMA_DATABASE_URL="your-postgres-connection-string"

# Session Management - Generate with: openssl rand -base64 32
SESSION_SECRET="your-generated-secret-here"

# Email (SMTP) - For email OTP verification
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@mrkim.com"

# Twilio (SMS) - For phone OTP login
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_SENDER_ID="your-twilio-sender-id"
```

### Generate SESSION_SECRET

```bash
openssl rand -base64 32
```

## Database Setup

1. Install dependencies:
```bash
pnpm install
```

2. Generate Prisma Client:
```bash
pnpm prisma generate
```

3. Push database schema:
```bash
pnpm prisma db push
```

## Authentication System

### Technology Stack

- **iron-session** - Cookie-based session management
- **bcryptjs** - Password hashing
- **axios** - HTTP client for API calls
- **Twilio** - SMS OTP delivery
- **Nodemailer** - Email OTP delivery

### Authentication Methods

1. **Email/Password**
   - User registers with email + password
   - Email verification via OTP
   - Login with verified email + password

2. **Phone OTP**
   - One-time password sent via SMS
   - Creates account or logs in existing user
   - Marks phone as verified

### Session Management

Sessions are stored in encrypted HTTP-only cookies:
- **Duration**: 7 days
- **Security**: HttpOnly, Secure (production)
- **Data**: userId, email, phone, role, isLoggedIn

### Using Auth in Components

```tsx
'use client';
import { useAuth } from '@/contexts/auth-context';

export default function MyComponent() {
  const { user, isLoading, isLoggedIn, login, logout } = useAuth();

  // Check if user is logged in
  if (!isLoggedIn) {
    return <div>Please log in</div>;
  }

  // Access user data
  return (
    <div>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

### Login Example

```tsx
import { useAuth } from '@/contexts/auth-context';

function LoginForm() {
  const { login } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    try {
      await login(email, password);
      // User is now logged in
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}
```

### Protected Routes

Dashboard pages automatically redirect to login if not authenticated:

```tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function ProtectedPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  return <div>Protected content</div>;
}
```

### API Route Protection

```typescript
import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Access session data
  const userId = session.userId;
  const userRole = session.role;

  // Your protected logic here
  return NextResponse.json({ data: 'success' });
}
```

## User Roles

- **CUSTOMER** - Browse and book services
- **VENDOR** - Manage vendor profile and products
- **SERVICE_PROVIDER** - Manage service provider profile
- **ADMIN** - Manage all users and profiles

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/session` - Get current session

### Email OTP
- `POST /api/auth/email/request` - Request email verification OTP
- `POST /api/auth/email/verify` - Verify email OTP

### Phone OTP
- `POST /api/auth/otp/request` - Request phone OTP
- `POST /api/auth/otp/verify` - Verify phone OTP (login/register)

### Profiles
- `GET/POST /api/vendor/profile` - Vendor profile (requires VENDOR role)
- `GET/POST /api/service-provider/profile` - Service provider profile (requires SERVICE_PROVIDER role)

## Development

Start the development server:

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

## Testing Authentication

1. **Register a new account**
   - Navigate to `/register`
   - Fill in email, password, and select role
   - Check email for verification OTP
   - Verify email at `/verify-email`

2. **Login with email/password**
   - Navigate to `/login`
   - Enter credentials
   - Redirected to role-specific dashboard

3. **Phone OTP Login**
   - Navigate to `/otp-login`
   - Enter phone number (with country code)
   - Receive SMS with OTP
   - Enter OTP to login

## Security Best Practices

1. **Never commit `.env`** - Keep secrets out of version control
2. **Use strong SESSION_SECRET** - Generate with `openssl rand -base64 32`
3. **HTTPS in production** - Secure cookies require HTTPS
4. **Rate limiting** - Consider adding rate limits to auth endpoints
5. **Password strength** - Enforce strong password requirements
6. **OTP expiry** - OTPs expire after 10 minutes

## Troubleshooting

### Session not persisting
- Check that `SESSION_SECRET` is set in `.env`
- Verify cookies are enabled in browser
- Check that app is using HTTPS in production

### Email OTP not sending
- Verify SMTP credentials in `.env`
- Check spam folder
- Enable "Less secure app access" for Gmail (or use App Password)

### Phone OTP not sending
- Verify Twilio credentials
- Check phone number format (include country code)
- Ensure Twilio account has SMS credits

### TypeScript errors
- Run `pnpm prisma generate` after schema changes
- Restart TypeScript server: `Cmd+Shift+P` → "Restart TypeScript Server"
