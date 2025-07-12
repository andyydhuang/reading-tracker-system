// app/apibook/[bookId]/page.tsx
import { BookDetailsLayout } from '@/components/BookDetailsLayout';
import { createClient } from '@/utils/supabase/server';
import { getBookReviews, ensureBookExistsInDb } from '@/app/my-books/actions';
import { GoogleBookDetails, BookshelfEntryWithReview, BookReview } from '@/types/index';

interface BookPageProps {
  params: {
    bookId: string;
  };
}

async function getGoogleBookDetails(bookId: string): Promise<GoogleBookDetails | null> {
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
    if (!response.ok) {
      console.error(`Failed to fetch Google Book details for ID: ${bookId}, status: ${response.status}`);
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Google Book details:', error);
    return null;
  }
}

export default async function ApiBookPage({ params }: BookPageProps) {
  const googleBookId = params.bookId;

  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const isLoggedIn = !!user;
  const userId = user?.id || null;

  if (userError) {
    console.error('[ApiBookPage Server] Error fetching user session:', userError.message);
  }

  const book = await getGoogleBookDetails(googleBookId);

  console.log(`[ApiBookPage Server] Fetched Google Book for ID ${googleBookId}:`, book ? 'Success' : 'Failed');
  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-600">
        Book not found or failed to load from Google Books. Please check the ID.
      </div>
    );
  }

  let bookshelfEntryId: string | null = null;
  let shelfType: 'read' | 'currently_reading' | 'want_to_read' | 'to-read' | null = null;
  let dateAdded: string | null = null;
  let dateStarted: string | null = null;
  let dateFinished: string | null = null;
  let userRating: number | null = null;
  let userReview: BookReview | null = null;

  let allReviews: BookReview[] = [];
  let internalBookId: string | null = null;

  const { success: ensureBookSuccess, internalBookId: fetchedInternalId, message: ensureBookMessage } = await ensureBookExistsInDb(
    googleBookId,
    {
      google_books_id: googleBookId,
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors,
      description: book.volumeInfo.description,
      cover_image_url: book.volumeInfo.imageLinks?.thumbnail,
      image_small_thumbnail_url: book.volumeInfo.imageLinks?.smallThumbnail,
      publisher: book.volumeInfo.publisher,
      publication_date: book.volumeInfo.publishedDate,
      page_count: book.volumeInfo.pageCount,
      language: book.volumeInfo.language,
      average_rating_google: book.volumeInfo.averageRating,
      ratings_count_google: book.volumeInfo.ratingsCount,
      preview_link: book.volumeInfo.previewLink,
      info_link: book.volumeInfo.infoLink,
      isbn: book.volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10')?.identifier,
      categories: book.volumeInfo.categories,
    }
  );

  if (ensureBookSuccess && fetchedInternalId) {
    internalBookId = fetchedInternalId;
    console.log(`[ApiBookPage Server] Resolved internal book ID: ${internalBookId}`);

    // Fetch all reviews for this internal book ID
    const { success: reviewsSuccess, reviews, message: reviewsMessage } = await getBookReviews(internalBookId);
    if (reviewsSuccess) {
      allReviews = reviews;
      console.log(`[ApiBookPage Server] Fetched ${allReviews.length} reviews for internal book ID: ${internalBookId}`);
    } else {
      console.error(`[ApiBookPage Server] Error fetching all reviews: ${reviewsMessage}`);
    }

  } else {
    console.error(`[ApiBookPage Server] Failed to ensure book exists in DB or get internal ID: ${ensureBookMessage}`);
  }


  if (isLoggedIn && userId && internalBookId) {
    const { data: shelfData, error: shelfError } = await supabase
      .from('bookshelves')
      .select(`
          id,
          user_id,
          book_id,
          shelf_type,
          date_added,
          date_started,
          date_finished,
          review_id,
          reviews!fk_review (
            id,
            rating,
            review_text,
            created_at,
            updated_at
          )
        `)
      .eq('user_id', userId)
      .eq('book_id', internalBookId)
      .single();

    if (shelfError && shelfError.code !== 'PGRST116') {
      console.error('[ApiBookPage Server] Error fetching user bookshelf entry from DB:', shelfError.message);
    } else if (shelfData) {
      const dbShelfEntry: BookshelfEntryWithReview = shelfData as BookshelfEntryWithReview;
      bookshelfEntryId = dbShelfEntry.id;
      shelfType = dbShelfEntry.shelf_type;
      dateAdded = dbShelfEntry.date_added;
      dateStarted = dbShelfEntry.date_started;
      dateFinished = dbShelfEntry.date_finished;

      if (dbShelfEntry.reviews) {
        userRating = dbShelfEntry.reviews.rating;
        userReview = {
          id: dbShelfEntry.reviews.id,
          user_id: userId,
          book_id: internalBookId,
          user_name: user?.user_metadata?.full_name || 'You',
          rating: dbShelfEntry.reviews.rating,
          review_text: dbShelfEntry.reviews.review_text,
          created_at: new Date().toISOString(), // Default value since it's not in the type
          updated_at: new Date().toISOString(), // Default value since it's not in the type
        };
      } else {
        userRating = null;
        userReview = null;
      }
      console.log('[ApiBookPage Server] Shelf entry found:', dbShelfEntry);

    } else {
      console.log('[ApiBookPage Server] Book not found on user shelf.');
    }
  }

  /*
  console.log(`[ApiBookPage Server] User Logged In: ${isLoggedIn}`);
  console.log(`[ApiBookPage Server] User ID: ${userId}`);
  console.log(`[ApiBookPage Server] Bookshelf Entry ID: ${bookshelfEntryId}`);
  console.log(`[ApiBookPage Server] Shelf Type: ${shelfType}`);
  console.log(`[ApiBookPage Server] User Rating: ${userRating}`);
  console.log(`[ApiBookPage Server] User Review (object):`, userReview); 
  */

  const otherReviewsFiltered = allReviews.filter(review => review.user_id !== userId);

  const commonBookProps = {
    title: book.volumeInfo.title,
    subtitle: book.volumeInfo.subtitle,
    authors: book.volumeInfo.authors,
    description: book.volumeInfo.description,
    thumbnail: book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail,
    publishedDate: book.volumeInfo.publishedDate,
    pageCount: book.volumeInfo.pageCount,
    categories: book.volumeInfo.categories,
    publisher: book.volumeInfo.publisher,
    language: book.volumeInfo.language,
    averageRating: book.volumeInfo.averageRating,
    ratingsCount: book.volumeInfo.ratingsCount,
    industryIdentifiers: book.volumeInfo.industryIdentifiers,
    printType: book.volumeInfo.printType,
  };

  return (
    <BookDetailsLayout
      {...commonBookProps}
      googleBooksId={googleBookId}
      isLoggedIn={isLoggedIn}
      bookId={googleBookId}
      bookshelfEntryId={bookshelfEntryId}
      shelfType={shelfType}
      dateAdded={dateAdded}
      dateStarted={dateStarted}
      dateFinished={dateFinished}
      userRating={userRating}
      userReview={userReview}
      userId={userId}
      allReviews={otherReviewsFiltered}
      additionalDetails={
        <div className="space-y-4">
          {book.volumeInfo.industryIdentifiers && book.volumeInfo.industryIdentifiers.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800">Identifiers:</h4>
              <ul className="list-disc list-inside text-sm">
                {book.volumeInfo.industryIdentifiers.map((id, index) => (
                  <li key={index}>{id.type}: {id.identifier}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      }
    />
  );
}