# Supabase Database Migrations

This directory contains the database schema and migrations for the Reading Tracker application.

## Structure

- `migrations/` - SQL migration files that define the database schema
- `seed.sql` - Initial data to populate the database
- `config.toml` - Supabase configuration file

## Getting Started

### Prerequisites

1. Install the Supabase CLI:
   ```bash
   npm install --save-dev supabase
   ```

2. Make sure you have a Supabase project set up at [supabase.com](https://supabase.com)

### Setting up the Database

1. **Link your project** (if not already done):
   ```bash
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```

2. **Apply migrations**:
   ```bash
   npx supabase db push
   ```

3. **Seed the database** (optional):
   ```bash
   npx supabase db reset
   ```

### Environment Variables

Make sure you have these environment variables set in your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Database Schema

The application uses the following main tables:

### Core Tables
- `profiles` - User profiles and authentication data
- `books` - Book information from Google Books API
- `authors` - Author information
- `genres` - Book genres/categories
- `reviews` - User book reviews and ratings
- `bookshelves` - User reading lists (want to read, currently reading, read)

### Junction Tables
- `books_authors` - Many-to-many relationship between books and authors
- `books_genres` - Many-to-many relationship between books and genres
- `user_follows` - User following relationships

### Views
- `book_ratings_summary` - Aggregated book ratings
- `user_reading_summary` - User reading statistics

## Security

All tables have Row Level Security (RLS) enabled with appropriate policies:
- Users can only manage their own data (reviews, bookshelves, profiles)
- Public read access for books, authors, and genres
- Authenticated users can create new books and relationships

## Development Workflow

### Creating New Migrations

1. Make changes to your local database
2. Generate a new migration:
   ```bash
   npx supabase db diff --schema public -f migration_name
   ```

3. Apply the migration:
   ```bash
   npx supabase db push
   ```

### Resetting the Database

To reset the database and apply all migrations + seed data:
```bash
npx supabase db reset
```

### Viewing Database Schema

To view the current database schema:
```bash
npx supabase db diff --schema public
```

## Deployment

When deploying to production:

1. Ensure your Supabase project is properly configured
2. Run migrations: `npx supabase db push`
3. Optionally seed data: `npx supabase db reset`

## Troubleshooting

### Common Issues

1. **Migration conflicts**: If you have conflicts between local and remote schemas, use `npx supabase db reset` to sync

2. **Permission errors**: Make sure your service role key has the necessary permissions

3. **Connection issues**: Verify your environment variables are correctly set

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Database Schema Reference](https://supabase.com/docs/guides/database) 