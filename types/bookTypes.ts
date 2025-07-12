// types/bookTypes.ts - Re-export types from centralized index

// Re-export all types from the centralized types file
export type {
  GoogleBookDetails,
  GoogleBookDetailsForDB,
  ActionResponse,
  BookReview,
  ShelfType
} from './index';

// Legacy exports for backward compatibility
// These can be removed once all components are updated to use the centralized types
export type { GoogleBookDetails as GoogleBookDetailsLegacy } from './index';
export type { ActionResponse as ActionResponseLegacy } from './index';
export type { BookReview as BookReviewLegacy } from './index';