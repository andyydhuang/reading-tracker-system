// types/index.ts - Centralized type definitions for the Book Catalog application

// Import database types
import { Database } from './supabase';

// ============================================================================
// CORE BOOK TYPES
// ============================================================================

/**
 * Base book interface with common properties
 */
export interface BaseBook {
  id: string;
  title: string;
  authors?: string[];
  description?: string;
  cover_image_url?: string;
  image_small_thumbnail_url?: string;
  publisher?: string;
  publication_date?: string;
  page_count?: number;
  language?: string;
  categories?: string[];
  isbn?: string;
  preview_link?: string;
  info_link?: string;
}

/**
 * Google Books API response structure
 */
export interface GoogleBooksApiResponse {
  items: Array<{
    id: string;
    volumeInfo: {
      title: string;
      subtitle?: string;
      authors?: string[];
      description?: string;
      imageLinks?: {
        thumbnail?: string;
        smallThumbnail?: string;
      };
      publishedDate?: string;
      pageCount?: number;
      categories?: string[];
      industryIdentifiers?: Array<{
        type: string;
        identifier: string;
      }>;
      averageRating?: number;
      ratingsCount?: number;
      publisher?: string;
      language?: string;
      printType?: string;
      previewLink?: string;
      infoLink?: string;
    };
    saleInfo?: {
      buyLink?: string;
    };
  }>;
  totalItems: number;
}

/**
 * Book data from Google Books API (transformed)
 */
export interface ApiBook extends BaseBook {
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    averageRating?: number;
    ratingsCount?: number;
    publisher?: string;
    language?: string;
    printType?: string;
    previewLink?: string;
    infoLink?: string;
  };
}

/**
 * Detailed book information from Google Books API
 */
export interface GoogleBookDetails extends BaseBook {
  volumeInfo: {
    title: string;
    subtitle?: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail: string;
      smallThumbnail?: string;
    };
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    publisher?: string;
    language?: string;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    printType?: string;
    previewLink?: string;
    infoLink?: string;
  };
  saleInfo?: {
    buyLink?: string;
  };
}

/**
 * Book data stored in our database
 */
export interface DbBook extends BaseBook {
  google_books_id: string;
  average_rating_google?: number;
  ratings_count_google?: number;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// BOOKSHELF TYPES
// ============================================================================

export type ShelfType = 'want_to_read' | 'currently_reading' | 'read' | 'to-read';

/**
 * Bookshelf entry from database
 */
export interface BookshelfEntry {
  id: string;
  user_id: string;
  book_id: string;
  shelf_type: ShelfType;
  date_added: string;
  date_started: string | null;
  date_finished: string | null;
  review_id: string | null;
}

/**
 * Bookshelf entry with joined review data
 */
export interface BookshelfEntryWithReview extends BookshelfEntry {
  reviews: {
    id: string;
    rating: number | null;
    review_text: string | null;
  } | null;
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

/**
 * Book review data
 */
export interface BookReview {
  id: string;
  user_id: string;
  book_id: string;
  rating: number | null;
  review_text: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

// ============================================================================
// COMPOSITE TYPES
// ============================================================================

/**
 * Complete book details with bookshelf and review information
 */
export interface BookDetailFromDB extends DbBook {
  is_on_shelf: boolean;
  bookshelf_id: string | null;
  shelf_type: ShelfType | null;
  date_added: string | null;
  date_started: string | null;
  date_finished: string | null;
  review_id: string | null;
  rating: number | null;
  review_text: string | null;
  subtitle?: string;
}

/**
 * Book data for Google Books details (used in actions)
 */
export interface GoogleBookDetailsForDB {
  google_books_id: string;
  title: string;
  authors?: string[] | null;
  description?: string | null;
  cover_image_url?: string | null;
  image_small_thumbnail_url?: string | null;
  publisher?: string | null;
  publication_date?: string | null;
  page_count?: number | null;
  language?: string | null;
  average_rating_google?: number | null;
  ratings_count_google?: number | null;
  preview_link?: string | null;
  info_link?: string | null;
  isbn?: string | null;
  categories?: string[] | null;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard API response structure
 */
export interface ActionResponse {
  success: boolean;
  message: string;
  reviewId?: string | null;
  bookshelfEntryId?: string | null;
  internalBookId?: string;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * Props for SearchResults component
 */
export interface SearchResultsProps {
  results: ApiBook[];
  isLoggedIn?: boolean;
  onSearch: (page?: number, query?: string, isSubjectSearch?: boolean) => Promise<void>;
  currentQuery: string;
  searchTime?: number;
  onAddToShelf: (
    bookItem: ApiBook,
    shelfType: ShelfType
  ) => void;
  currentPage: number;
  hasNextPage: boolean;
  isLoading: boolean;
}

/**
 * Props for book details components
 */
export interface BookDetailsProps {
  book: GoogleBookDetails | DbBook;
  isLoggedIn?: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Type for database table names
 */
export type TableName = keyof Database['public']['Tables'];

/**
 * Type for database row data
 */
export type DatabaseRow<T extends TableName> = Database['public']['Tables'][T]['Row'];

/**
 * Type for database insert data
 */
export type DatabaseInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];

/**
 * Type for database update data
 */
export type DatabaseUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

// Re-export database types for convenience
export type { Database } from './supabase';