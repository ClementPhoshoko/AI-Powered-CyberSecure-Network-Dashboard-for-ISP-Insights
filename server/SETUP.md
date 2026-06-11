# Supabase & PostgreSQL Setup Guide

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account if you don't have one.
2. Click "New Project" and fill in the details:
   - Name your project
   - Choose a strong database password (save this!)
   - Select a region close to you
3. Wait for your project to initialize (this takes a few minutes).

## Step 2: Get Your API Keys

Once your project is ready:

1. Go to your project dashboard → **Settings** → **API**
2. Copy these values:
   - `Project URL`: This is your `SUPABASE_URL`
   - `anon public`: This is your `SUPABASE_ANON_KEY`
   - `service_role secret`: This is your `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Step 3: Update Your .env File

Open `server/src/.env` and replace the placeholder values with your actual keys:

```env
PORT=5000
NODE_ENV=development

# Supabase Configuration (REPLACE THESE!)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# PostgreSQL Direct Connection (Optional)
DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres

# JWT Secret (CHANGE THIS TO A RANDOM STRING!)
JWT_SECRET=your-very-secure-jwt-secret-key-change-this
```

## Step 4: Run the SQL Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire content from `server/src/docs/schema.sql`
4. Click "Run" to execute the SQL and create your tables!

## Step 5: Test the Connection

1. Start your server:
   ```bash
   cd server
   npm run dev
   ```
2. Open your browser and visit: `http://localhost:5000/api/health/db`

You should see a success message if everything is connected!

## Step 6: Done! 🚀

Your backend is now connected to Supabase/PostgreSQL!
