# Create Admin Superuser

## Method 1: Using API Endpoint (Recommended)

Start your dev server and make a POST request:

```bash
curl -X POST http://localhost:3000/api/setup/create-admin
```

Or visit in browser (will need to use a tool like Postman for POST):
```
POST http://localhost:3000/api/setup/create-admin
```

## Default Admin Credentials

After running the command, use these credentials to login:

```
📧 Email: admin@mrkim.com
🔑 Password: Admin@123456
```

⚠️ **Important**: Change the password immediately after first login!

## Login URL

```
http://localhost:3000/login
```

After login, you'll be redirected to:
```
http://localhost:3000/dashboard/admin
```

## Notes

- The script will check if admin already exists and prevent duplicates
- Admin user is created with `emailVerified: true`
- Role is set to `ADMIN` for full access
- For security, consider deleting `/app/api/setup/create-admin/route.ts` after creating the admin in production
