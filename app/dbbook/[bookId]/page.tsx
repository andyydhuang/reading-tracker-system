// app/dbbook/[bookId]/page.tsx
import { createClient } from '@/utils/supabase/server';
import { BookDetailsLayout } from '@/components/BookDetailsLayout';
import { BookDetailFromDB, BookshelfEntryWithReview, BookReview } from '@/types/index';
import Link from 'next/link';

import { getBookReviews } from '@/app/my-books/actions';

interface BookPageProps {
  params: {
    bookId: string;
  };
}

export default async function DbBookPage({ params }: BookPageProps) {
  const { bookId } = params;
  const supabase = createClient();

  let bookData: BookDetailFromDB | null = null;
  let shelfEntry: BookshelfEntryWithReview | null = null;
  let error: string | null = null;
  let allReviews: BookReview[] = [];

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  if (userError) {
    console.error('Error fetching user session in DbBookPage:', userError.message);
  }

  if (user) {
    console.log(`Fetching bookshelf entry for user ${user.id} and book ${bookId}`);
    const { data, error: shelfError } = await supabase
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
            review_text
          )
        `)
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .single();

    if (shelfError && shelfError.code !== 'PGRST116') {
      console.error('Error fetching user bookshelf entry:', shelfError.message);
    } else if (data) {
      const supabaseShelfData: BookshelfEntryWithReview = data as BookshelfEntryWithReview;
      shelfEntry = supabaseShelfData;
      console.log('Shelf entry found:', shelfEntry);
    } else {
      console.log('Book not found on user\'s shelf.');
    }
  }

  try {
    const { data: baseBook, error: baseBookError } = await supabase
      .from('books')
      .select(`
          id,
          title,
          isbn,
          description,
          cover_image_url,
          publisher,
          publication_date,
          page_count,
          language,
          google_books_id,
          average_rating_google,
          ratings_count_google,
          image_small_thumbnail_url,
          preview_link,
          info_link,
          authors,
          created_at,
          updated_at
        `)
      .eq('id', bookId)
      .single();

    if (baseBookError) {
      if (baseBookError.code === 'PGRST116') {
        error = 'Book not found.';
      } else {
        error = `Failed to load book details: ${baseBookError.message}`;
      }
      console.error('Error fetching base book details:', baseBookError.message);
    } else if (baseBook) {
      bookData = {
        id: baseBook.id,
        title: baseBook.title,
        isbn: baseBook.isbn ?? undefined,
        description: baseBook.description ?? undefined,
        cover_image_url: baseBook.cover_image_url ?? undefined,
        publisher: baseBook.publisher ?? undefined,
        publication_date: baseBook.publication_date ?? undefined,
        page_count: baseBook.page_count ?? undefined,
        language: baseBook.language ?? undefined,
        authors: baseBook.authors ?? undefined,
        google_books_id: baseBook.google_books_id ?? '',
        average_rating_google: baseBook.average_rating_google ?? undefined,
        ratings_count_google: baseBook.ratings_count_google ?? undefined,
        image_small_thumbnail_url: baseBook.image_small_thumbnail_url ?? undefined,
        preview_link: baseBook.preview_link ?? undefined,
        info_link: baseBook.info_link ?? undefined,
        created_at: baseBook.created_at,
        updated_at: baseBook.updated_at,
        is_on_shelf: !!shelfEntry,
        bookshelf_id: shelfEntry?.id || null,
        shelf_type: (shelfEntry?.shelf_type || null),
        date_added: shelfEntry?.date_added || null,
        date_started: shelfEntry?.date_started || null,
        date_finished: shelfEntry?.date_finished || null,
        review_id: shelfEntry?.review_id || null,
        rating: shelfEntry?.reviews?.rating || null,
        review_text: shelfEntry?.reviews?.review_text || null,
        subtitle: (baseBook as any).subtitle || null,
      };
      console.log('Transformed bookData:', bookData);

      const { success: reviewsSuccess, reviews, message: reviewsMessage } = await getBookReviews(bookId); //
      if (reviewsSuccess) {
        allReviews = reviews;
        console.log(`[DbBookPage Server] Fetched ${allReviews.length} reviews for book ID: ${bookId}`);
      } else {
        console.error(`[DbBookPage Server] Error fetching all reviews: ${reviewsMessage}`);
      }
    }
  } catch (err: any) {
    error = `An unexpected error occurred: ${err.message}`;
    console.error('Unexpected error:', err.message);
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen-75 bg-gray-100 p-4">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="text-gray-700 mt-2">{error}</p>
        <Link href="/" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Go Home
        </Link>
      </div>
    );
  }

  if (!bookData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen-75 bg-gray-100 p-4">
        <h1 className="text-2xl font-bold text-gray-800">Book Not Found</h1>
        <p className="text-gray-700 mt-2">The book you are looking for does not exist.</p>
        <Link href="/" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Go Home
        </Link>
      </div>
    );
  }

  const currentUserFullReview = allReviews.find(review => review.user_id === user?.id) || null;

  return (
    <BookDetailsLayout
      title={bookData.title}
      subtitle={bookData.subtitle}
      authors={bookData.authors}
      description={bookData.description}
      thumbnail={bookData.cover_image_url || bookData.image_small_thumbnail_url}
      publishedDate={bookData.publication_date}
      pageCount={bookData.page_count}
      publisher={bookData.publisher}
      language={bookData.language}
      averageRating={bookData.average_rating_google}
      ratingsCount={bookData.ratings_count_google}
      googleBooksId={bookData.google_books_id}
      isLoggedIn={isLoggedIn}
      bookId={bookData.id}
      bookshelfEntryId={bookData.is_on_shelf ? bookData.bookshelf_id : null}
      shelfType={bookData.shelf_type}
      dateAdded={bookData.date_added}
      dateStarted={bookData.date_started}
      dateFinished={bookData.date_finished}
      userRating={bookData.rating}
      userReview={currentUserFullReview}
      userId={user?.id || null}
      allReviews={allReviews}
    />
  );
}