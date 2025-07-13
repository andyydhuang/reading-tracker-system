-- Create initial database schema for Book Catalog application
-- Migration: 20250101000000_initial_schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    email text,
    full_name text,
    username text,
    avatar_url text,
    bio text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create authors table
CREATE TABLE IF NOT EXISTS public.authors (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    bio text,
    photo_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create genres table
CREATE TABLE IF NOT EXISTS public.genres (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create books table
CREATE TABLE IF NOT EXISTS public.books (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    title text NOT NULL,
    authors text[],
    description text,
    cover_image_url text,
    image_small_thumbnail_url text,
    publisher text,
    publication_date text,
    page_count integer,
    language text,
    isbn text,
    preview_link text,
    info_link text,
    average_rating_google numeric,
    ratings_count_google integer,
    google_books_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create books_authors junction table
CREATE TABLE IF NOT EXISTS public.books_authors (
    book_id uuid NOT NULL,
    author_id uuid NOT NULL,
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES public.authors(id) ON DELETE CASCADE
);

-- Create books_genres junction table
CREATE TABLE IF NOT EXISTS public.books_genres (
    book_id uuid NOT NULL,
    genre_id uuid NOT NULL,
    PRIMARY KEY (book_id, genre_id),
    FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES public.genres(id) ON DELETE CASCADE
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    book_id uuid NOT NULL,
    rating integer,
    review_text text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE
);

-- Create bookshelves table
CREATE TABLE IF NOT EXISTS public.bookshelves (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL,
    book_id uuid NOT NULL,
    shelf_type text NOT NULL,
    date_added timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    date_started timestamp with time zone,
    date_finished timestamp with time zone,
    review_id uuid,
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES public.reviews(id) ON DELETE SET NULL
);

-- Create user_follows table
CREATE TABLE IF NOT EXISTS public.user_follows (
    follower_id uuid NOT NULL,
    following_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_google_books_id ON public.books(google_books_id);
CREATE INDEX IF NOT EXISTS idx_books_title ON public.books(title);
CREATE INDEX IF NOT EXISTS idx_books_authors ON public.books USING GIN(authors);
CREATE INDEX IF NOT EXISTS idx_bookshelves_user_id ON public.bookshelves(user_id);
CREATE INDEX IF NOT EXISTS idx_bookshelves_book_id ON public.bookshelves(book_id);
CREATE INDEX IF NOT EXISTS idx_bookshelves_shelf_type ON public.bookshelves(shelf_type);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON public.reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Create views for analytics
CREATE OR REPLACE VIEW public.book_ratings_summary AS
SELECT 
    book_id,
    AVG(rating) as average_rating,
    COUNT(rating) as total_ratings
FROM public.reviews
WHERE rating IS NOT NULL
GROUP BY book_id;

CREATE OR REPLACE VIEW public.user_reading_summary AS
SELECT 
    user_id,
    shelf_type,
    COUNT(*) as book_count
FROM public.bookshelves
GROUP BY user_id, shelf_type;

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookshelves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Books: Everyone can read books
CREATE POLICY "Books are viewable by everyone" ON public.books FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert books" ON public.books FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Authors: Everyone can read authors
CREATE POLICY "Authors are viewable by everyone" ON public.authors FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert authors" ON public.authors FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Genres: Everyone can read genres
CREATE POLICY "Genres are viewable by everyone" ON public.genres FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert genres" ON public.genres FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Reviews: Everyone can read reviews, users can manage their own
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Bookshelves: Users can only see and manage their own bookshelves
CREATE POLICY "Users can view own bookshelves" ON public.bookshelves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookshelves" ON public.bookshelves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookshelves" ON public.bookshelves FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookshelves" ON public.bookshelves FOR DELETE USING (auth.uid() = user_id);

-- User follows: Users can see follows, but only manage their own
CREATE POLICY "User follows are viewable by everyone" ON public.user_follows FOR SELECT USING (true);
CREATE POLICY "Users can insert own follows" ON public.user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete own follows" ON public.user_follows FOR DELETE USING (auth.uid() = follower_id);

-- Junction tables: Everyone can read, authenticated users can manage
CREATE POLICY "Books authors are viewable by everyone" ON public.books_authors FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage books authors" ON public.books_authors FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Books genres are viewable by everyone" ON public.books_genres FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage books genres" ON public.books_genres FOR ALL USING (auth.role() = 'authenticated');

-- Create function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_books_updated_at
    BEFORE UPDATE ON public.books
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 