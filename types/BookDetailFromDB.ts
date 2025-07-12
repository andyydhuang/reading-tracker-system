// types/BookDetailFromDB.ts - Re-export types from centralized index

// Re-export types from the centralized types file
export type {
  BookDetailFromDB,
  BookshelfEntry,
  BookshelfEntryWithReview,
  ShelfType
} from './index';

// Legacy exports for backward compatibility
// These can be removed once all components are updated to use the centralized types
export type { BookDetailFromDB as BookDetailFromDBLegacy } from './index';
export type { BookshelfEntry as SupabaseShelfEntry } from './index';
export type { BookshelfEntryWithReview as ShelfEntry } from './index';