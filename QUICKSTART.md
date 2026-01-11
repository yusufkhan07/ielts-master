# IELTSMaster - Quick Start

Get your IELTS practice app running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- Supabase account
- OpenAI API key

## Quick Setup

### 1. Set Up Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to SQL Editor and run the schema:
   - Copy contents from `packages/database/schema.sql`
   - Paste and execute in SQL Editor
3. Get your credentials from Project Settings > API:
   - Project URL
   - Anon public key

### 2. Get OpenAI API Key (1 minute)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key in the API section

### 3. Configure App (1 minute)

```bash
# Create environment file
cp apps/web/.env.example apps/web/.env.local

# Edit with your keys
nano apps/web/.env.local
```

Paste your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_key
```

### 4. Start App (1 minute)

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## First Test

1. Click "Sign up" to create an account
2. Verify your email (check spam folder)
3. Log in
4. Choose Academic or General Training
5. Select Task 1 or Task 2
6. Write a test response
7. Get AI feedback!

## What's Next?

- Read [SETUP.md](SETUP.md) for detailed deployment instructions
- Deploy to Vercel (free hosting)
- Configure GitHub Actions for CI/CD
- Customize the app to your needs

## Need Help?

Check the detailed [SETUP.md](SETUP.md) guide for:
- Troubleshooting
- Deployment to Vercel
- GitHub integration
- Cost estimates
- Feature customization

## Project Structure

```
ieltsmaster/
├── apps/
│   └── web/              # Next.js app (frontend + API)
│       ├── app/
│       │   ├── page.tsx           # Homepage
│       │   ├── test/[...]/        # Writing test interface
│       │   ├── results/[id]/      # Results page
│       │   ├── auth/              # Login/signup
│       │   └── api/               # API routes
│       └── lib/                   # Utilities
├── packages/
│   ├── database/         # Supabase schema
│   └── types/            # Shared TypeScript types
└── .github/workflows/    # CI/CD
```

## Key Features

✅ AI-powered question generation
✅ Real-time word counter and timer
✅ Detailed scoring on 4 IELTS criteria
✅ User authentication and history
✅ Both Academic and General Training
✅ Task 1 and Task 2 support
✅ Responsive design
✅ Production-ready deployment

Enjoy building with IELTSMaster!
