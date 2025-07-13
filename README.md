# Reading Tracker System

A web-based book management application built with Next.js, TypeScript, and Supabase. Users can search for books using the Google Books API, manage their personal reading lists, rate books, and leave reviews.

## Features

### **Book Search & Discovery**
- **Google Books API Integration**: Search for books by title, author, or genre
- **Advanced Filtering**: Find books with detailed metadata
- **Real-time Search Results**: Instant search with pagination support

### **User Authentication**
- **Secure Registration**: User signup with email verification
- **Login System**: Email/password authentication via Supabase Auth

### **Personal Book Management**
- **Reading Lists**: Organize books into custom shelves:
  - **Want to Read**: Books you plan to read
  - **Currently Reading**: Books in progress
  - **Read**: Completed books
- **Book Actions**: Add, remove, and move books between shelves
- **Reading Progress**: Track start and finish dates

### **Reviews & Ratings**
- **Personal Ratings**: Rate books from 1-5 stars
- **Review System**: Write detailed book reviews
- **Community Reviews**: View ratings and reviews from other users
- **Review Management**: Edit and delete your own reviews

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **External APIs**: Google Books API
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd my-nextjs-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Set up Supabase Database**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Install Supabase CLI: `npm install --save-dev supabase`
   - Link your project: `npx supabase link --project-ref YOUR_PROJECT_REF`
   - Apply migrations: `npx supabase db push`
   - Seed the database (optional): `npx supabase db reset`
   - See [supabase/README.md](supabase/README.md) for detailed database setup instructions

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses a comprehensive Supabase database with the following structure:

### Core Tables
- **`profiles`**: User profile information and authentication
- **`books`**: Book metadata from Google Books API
- **`authors`**: Author information (future feature)
- **`genres`**: Book categories and genres
- **`bookshelves`**: User's personal book collections (want to read, currently reading, read)
- **`reviews`**: User ratings and reviews
- **`user_follows`**: User following relationships

### Junction Tables
- **`books_authors`**: Many-to-many relationship between books and authors
- **`books_genres`**: Many-to-many relationship between books and genres

### Views
- **`book_ratings_summary`**: Aggregated book ratings and review counts
- **`user_reading_summary`**: User reading statistics by shelf type

### Key Features
- **Row Level Security (RLS)**: All tables have security policies
- **Automatic timestamps**: Created/updated timestamps with triggers
- **Foreign key constraints**: Proper referential integrity
- **Performance indexes**: Optimized for common queries

For detailed database setup instructions, see [supabase/README.md](supabase/README.md).

## Application Structure

### Pages
- **`/`**: Landing page with search and authentication
- **`/home`**: User dashboard with reading statistics
- **`/books/search`**: Book search interface
- **`/apibook/[bookId]`**: Google Books details page
- **`/dbbook/[bookId]`**: Local book details page
- **`/my-books`**: Personal book management
- **`/signin`**: Authentication pages
- **`/signup`**: User registration

### Key Components
- **`Header`**: Navigation and user menu
- **`SearchSection`**: Book search functionality
- **`BookDetailsLayout`**: Book information display
- **`MyBooksTable`**: Personal book management
- **`AuthModal`**: Authentication forms

## Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key

### Google Books API
The application uses the Google Books API for book search:
```
https://www.googleapis.com/books/v1/volumes?q=${query}
```

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The app is configured for standalone output and can be deployed to any Node.js hosting platform.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- [Google Books API](https://developers.google.com/books) for book data
- [Supabase](https://supabase.com) for backend services
- [Next.js](https://nextjs.org) for the React framework
- [Tailwind CSS](https://tailwindcss.com) for styling
---