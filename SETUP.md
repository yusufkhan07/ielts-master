# IELTSMaster Setup Guide

Complete guide to set up and deploy your IELTSMaster application.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Supabase account (free tier available)
- OpenAI API account

## 1. Supabase Setup

### Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if you don't have one)
4. Create a new project:
   - Choose a project name (e.g., "ieltsmaster")
   - Set a strong database password (save this!)
   - Select a region close to your users
   - Click "Create new project"

### Run Database Schema

1. Wait for your project to be created (takes ~2 minutes)
2. Go to the SQL Editor in your Supabase dashboard
3. Click "New query"
4. Copy the entire contents of `packages/database/schema.sql`
5. Paste into the SQL Editor
6. Click "Run" to execute the schema

### Get Your API Keys

1. Go to Project Settings > API
2. Copy these values:
   - `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. OpenAI API Setup

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to API Keys section
4. Click "Create new secret key"
5. Give it a name (e.g., "ieltsmaster")
6. Copy the key (you won't see it again!) → This is your `OPENAI_API_KEY`

**Note:** OpenAI API is paid, but new accounts get free credits. GPT-4 is recommended for best results.

## 3. Local Development Setup

### Install Dependencies

```bash
cd ieltsmaster
npm install
```

### Configure Environment Variables

```bash
# Copy the example env file
cp apps/web/.env.example apps/web/.env.local

# Edit the file with your actual values
nano apps/web/.env.local  # or use your preferred editor
```

Add your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
OPENAI_API_KEY=sk-your_openai_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 4. Testing the Application

### Create a Test Account

1. Go to http://localhost:3000
2. You'll be redirected to `/auth/login`
3. Click "Sign up"
4. Enter email and password
5. Check your email for verification link (from Supabase)
6. Click the verification link

### Test a Writing Task

1. Log in to the application
2. Select Academic or General Training
3. Choose Task 1 or Task 2
4. Click "Start Writing"
5. Write a sample response
6. Click "Submit"
7. View your AI-generated scores and feedback

## 5. GitHub Setup

### Initialize Git Repository

```bash
cd ieltsmaster
git init
git add .
git commit -m "Initial commit: IELTSMaster setup"
```

### Create GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. Create a new repository named "ieltsmaster"
3. Don't initialize with README (we already have one)
4. Copy the remote URL

### Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/ieltsmaster.git
git branch -M main
git push -u origin main
```

## 6. Vercel Deployment

### Create Vercel Account

1. Go to [https://vercel.com/signup](https://vercel.com/signup)
2. Sign up with your GitHub account

### Import Project

1. Click "Add New Project"
2. Import your `ieltsmaster` repository
3. Configure the project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

### Add Environment Variables

In Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=sk-your_openai_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Visit your live site!

## 7. Configure GitHub Actions

### Add GitHub Secrets

1. Go to your GitHub repository
2. Settings > Secrets and variables > Actions
3. Add these secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `VERCEL_TOKEN` (get from Vercel Account Settings > Tokens)
   - `VERCEL_ORG_ID` (get from Vercel project settings)
   - `VERCEL_PROJECT_ID` (get from Vercel project settings)

### Get Vercel IDs

In your Vercel project:
1. Settings > General
2. Scroll to "Project ID" and copy it
3. Go to your Vercel Account Settings
4. Click on your profile > Tokens
5. Create a new token for GitHub Actions

Now pushes to `main` will automatically deploy!

## 8. Supabase Production Configuration

### Enable Email Confirmations (Optional)

1. Go to Authentication > Settings in Supabase
2. Configure email templates if desired
3. Set up custom SMTP (optional, Supabase provides default)

### Row Level Security

RLS is already enabled in the schema. Your data is secure!

### Database Backups

Supabase automatically backs up your database daily.

## Common Issues

### "Unauthorized" errors
- Check that your Supabase URL and keys are correct
- Verify email is confirmed in Supabase dashboard
- Clear browser cookies and try logging in again

### OpenAI API errors
- Check your API key is valid
- Ensure you have credits/billing set up
- Check API usage limits

### Build failures
- Run `npm run type-check` to find TypeScript errors
- Run `npm run lint` to find linting issues
- Check environment variables are set in Vercel

## Next Steps

### Add More Features
- User profile page with test history
- Progress tracking and analytics
- Additional IELTS modules (Reading, Listening, Speaking)
- Export results as PDF

### Customize
- Update branding and colors in Tailwind config
- Modify AI prompts for different feedback styles
- Add more detailed scoring breakdowns

### Monitor
- Set up Vercel Analytics
- Monitor OpenAI API usage
- Check Supabase dashboard for user growth

## Support

For issues or questions:
- Check the README.md
- Review Supabase documentation
- Review OpenAI API documentation
- Create an issue in your repository

## Cost Estimates

**Free Tier:**
- Supabase: Free (up to 500MB database, 50K monthly active users)
- Vercel: Free (hobby plan, 100GB bandwidth)
- OpenAI: Pay-as-you-go (~$0.01-0.03 per test with GPT-4)

**Expected Monthly Cost (100 active users, ~10 tests each):**
- Supabase: $0 (within free tier)
- Vercel: $0 (within free tier)
- OpenAI: ~$10-30 (1,000 tests × $0.01-0.03)

**Total:** ~$10-30/month for 100 users
