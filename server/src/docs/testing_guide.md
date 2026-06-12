# Backend Endpoint Testing Guide
How to test secured backend endpoints without building the frontend yet!

## Prerequisites
1. A Supabase project set up with phase-one schema
2. A test user created in Supabase Authentication → Users
3. Your backend server running (`npm run dev`)

---

## Option 1: Use the Dev-Only Auth Endpoint (Easiest!)
We have a development-only `/dev/auth/login` endpoint that lets you get a JWT directly from our backend Swagger UI!

### How to Use:
1. Start your server: `npm run dev`
2. Open Swagger UI: `http://localhost:5000/api-docs`
3. Find the "Dev Auth" section and use `POST /dev/auth/login`
4. Enter your test user's email/password
5. Execute and copy the `access_token`!

---

## Option 2: Get JWT Directly via Supabase Auth API
Use any HTTP client (Postman, Thunder Client, curl, etc.)

### HTTP Request
```http
POST https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/token?grant_type=password
Headers:
  apikey: <YOUR_SUPABASE_ANON_KEY>
  Content-Type: application/json

Body (JSON):
{
  "email": "test@example.com",
  "password": "your_test_password"
}
```

### Example Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "abcdef123456...",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    ...
  }
}
```

✅ Copy the `access_token` value! That's your JWT!

---

## Step 2: Test Endpoints with Swagger UI
1. Start your server: `npm run dev`
2. Open Swagger UI: `http://localhost:5000/api-docs`
3. Click 🔒 **Authorize** in the top right
4. Paste your `access_token` into the box (no "Bearer" prefix needed!)
5. Click **Authorize** then **Close**
6. Now you can call all your secured backend endpoints!

---

## Bonus: Using curl
If you prefer command-line, use this curl command:
```bash
curl -X POST 'https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/token?grant_type=password' \
-H 'apikey: <YOUR_SUPABASE_ANON_KEY>' \
-H 'Content-Type: application/json' \
-d '{"email":"test@example.com","password":"your_test_password"}'
```