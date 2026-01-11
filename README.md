# IELTSMaster

AI-powered IELTS preparation platform with personalized feedback and scoring.

## Features

- **Writing Module**: Practice IELTS Academic and General Training writing tasks
- **AI Feedback**: Get detailed scoring on all 4 IELTS criteria
- **Progress Tracking**: Track your improvement over time
- **Authentication**: Secure user accounts with Supabase Auth

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT API
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## Project Structure

```
ieltsmaster/
├── apps/
│   └── web/          # Next.js application
├── packages/
│   ├── database/     # Supabase schema and types
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared configurations
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account
- OpenAI API key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Add your Supabase and OpenAI credentials

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Deployment

Automatically deployed to Vercel on push to main branch via GitHub Actions.

## License

MIT
