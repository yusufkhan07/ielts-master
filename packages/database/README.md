# @ieltsmaster/database

Database schema and Supabase client configuration for IELTSMaster.

## Setup

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Run the schema:
   - Go to SQL Editor in Supabase Dashboard
   - Copy and paste contents of `schema.sql`
   - Run the query

3. Generate TypeScript types:
```bash
npm run generate
```

This will create `types.ts` with your database schema types.

## Usage

```typescript
import { createSupabaseClient } from '@ieltsmaster/database';

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```
