// app/my-books/actions.ts
'use server';

import { createClient as supabaseServer } from "@/utils/supabase/server";
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { GoogleBookDetailsForDB, ActionResponse, BookReview } from '@/types/index';

export async function ensureBookExistsInDb(
    googleBookId: string,
    bookDetailsFromGoogle: GoogleBookDetailsForDB
): Promise<{ success: boolean; message: string; internalBookId?: string }> {
    const supabase = supabaseServer();

    try {
        let internalBookId: string | undefined;

        const { data: existingBook, error: fetchError } = await supabase
            .from('books')
            .select('id')
            .eq('google_books_id', googleBookId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('SERVER ACTION: Error checking existing book in DB:', fetchError.message);
            return { success: false, message: `Failed to check book existence: ${fetchError.message}` };
        }

        let formattedPublicationDate: string | null = null;
        if (bookDetailsFromGoogle.publication_date) {
            // Attempt to parse and format the date
            try {
                // If it's a year (e.g., "2004"), append "-01-01"
                if (/^\d{4}$/.test(bookDetailsFromGoogle.publication_date)) {
                    formattedPublicationDate = `${bookDetailsFromGoogle.publication_date}-01-01`;
                }
                // If it's "YYYY-MM", append "-01"
                else if (/^\d{4}-\d{2}$/.test(bookDetailsFromGoogle.publication_date)) {
                    formattedPublicationDate = `${bookDetailsFromGoogle.publication_date}-01`;
                }
                else if (/^\d{4}-\d{2}-\d{2}$/.test(bookDetailsFromGoogle.publication_date)) {
                    formattedPublicationDate = bookDetailsFromGoogle.publication_date;
                }
                else {
                    console.warn('SERVER ACTION: Unrecognized publication_date format for book ${googleBookId}: ${bookDetailsFromGoogle.publication_date}.');
                    formattedPublicationDate = null;
                }
            } catch (dateError) {
                console.error('SERVER ACTION: Error formatting publication_date for book ${googleBookId}: ${dateError}.');
                formattedPublicationDate = null;
            }
        }

        if (existingBook) {
            internalBookId = existingBook.id;
            console.log('SERVER ACTION: Book already exists in DB, returning internal ID:', internalBookId);
        } else {
            const newInternalBookId = uuidv4();
            console.log('SERVER ACTION: Book not found, inserting new entry into "books" table with ID:', newInternalBookId);

            const { error: insertBookError } = await supabase
                .from('books')
                .insert({
                    id: newInternalBookId,
                    google_books_id: bookDetailsFromGoogle.google_books_id,
                    title: bookDetailsFromGoogle.title,
                    authors: bookDetailsFromGoogle.authors || null,
                    description: bookDetailsFromGoogle.description || null,
                    cover_image_url: bookDetailsFromGoogle.cover_image_url || null,
                    image_small_thumbnail_url: bookDetailsFromGoogle.image_small_thumbnail_url || null,
                    publisher: bookDetailsFromGoogle.publisher || null,
                    publication_date: formattedPublicationDate,
                    page_count: bookDetailsFromGoogle.page_count || null,
                    language: bookDetailsFromGoogle.language || null,
                    average_rating_google: bookDetailsFromGoogle.average_rating_google || null,
                    ratings_count_google: bookDetailsFromGoogle.ratings_count_google || null,
                    preview_link: bookDetailsFromGoogle.preview_link || null,
                    info_link: bookDetailsFromGoogle.info_link || null,
                    isbn: bookDetailsFromGoogle.isbn || null,
                });

            if (insertBookError) {
                console.error('SERVER ACTION: Error inserting new book into "books" table:', insertBookError.message);
                return { success: false, message: 'Failed to add book details to database: ${insertBookError.message}'};
            }
            internalBookId = newInternalBookId;
        }

        if (internalBookId && bookDetailsFromGoogle.categories && bookDetailsFromGoogle.categories.length > 0) {
            const genresToInsert: { book_id: string; genre_id: string }[] = [];

            for (const categoryName of bookDetailsFromGoogle.categories) {
                const normalizedCategoryName = categoryName.trim().replace(/\/+$/, '');

                if (!normalizedCategoryName) continue;

                const { data: existingGenre, error: fetchGenreError } = await supabase
                    .from('genres')
                    .select('id')
                    .eq('name', normalizedCategoryName)
                    .single();

                if (fetchGenreError && fetchGenreError.code !== 'PGRST116') {
                    console.error('SERVER ACTION: Error checking genre "${normalizedCategoryName}":', fetchGenreError.message);
                    continue;
                }

                let genreId: string;
                if (existingGenre) {
                    genreId = existingGenre.id;
                    console.log('SERVER ACTION: Found existing genre "${normalizedCategoryName}" with ID: ${genreId}');
                } else {
                    genreId = uuidv4();
                    console.log('SERVER ACTION: Inserting new genre "${normalizedCategoryName}" with ID: ${genreId}');
                    const { error: insertGenreError } = await supabase
                        .from('genres')
                        .insert({
                            id: genreId,
                            name: normalizedCategoryName,
                        });

                    if (insertGenreError) {
                        console.error('SERVER ACTION: Error inserting new genre "${normalizedCategoryName}":', insertGenreError.message);
                        continue;
                    }
                }

                const { data: existingBookGenre, error: fetchBookGenreError } = await supabase
                    .from('books_genres')
                    .select('book_id, genre_id')
                    .eq('book_id', internalBookId)
                    .eq('genre_id', genreId)
                    .single();

                if (fetchBookGenreError && fetchBookGenreError.code !== 'PGRST116') {
                    console.error('SERVER ACTION: Error checking existing book_genre link for book ${internalBookId} and genre ${genreId}:', fetchBookGenreError.message);
                    continue;
                }

                if (!existingBookGenre) {
                    genresToInsert.push({ book_id: internalBookId, genre_id: genreId });
                } else {
                    console.log('SERVER ACTION: Book-genre link already exists for book ${internalBookId} and genre ${genreId}. Skipping.');
                }
            }

            if (genresToInsert.length > 0) {
                const { error: insertBookGenresError } = await supabase
                    .from('books_genres')
                    .insert(genresToInsert);

                if (insertBookGenresError) {
                    console.error('SERVER ACTION: Error inserting book_genres:', insertBookGenresError.message);
                } else {
                    console.log('SERVER ACTION: Book-genres links successfully inserted.');
                }
            } else {
                console.log('SERVER ACTION: No new book-genre links to insert.');
            }
        }

        return { success: true, message: 'Book and genres processed successfully.', internalBookId: internalBookId };

    } catch (err: any) {
        console.error('SERVER ACTION: Unexpected error in ensureBookExistsInDb:', err.message);
        return { success: false, message: 'An unexpected error occurred: ${err.message}'};
    }
}

export async function updateShelfAction(
    bookshelfEntryId: string | null,
    newShelfType: string,
    bookIdentifier: string | null,
    bookDetails?: GoogleBookDetailsForDB
): Promise<ActionResponse> {
    const supabase = supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('SERVER ACTION: User not authenticated for updateShelfAction.');
        return { success: false, message: 'User not authenticated.' };
    }

    let internalBookId: string;

    // Use regex to check if the bookIdentifier looks like a UUID
    const isUuid = bookIdentifier && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(bookIdentifier);

    if (isUuid && bookIdentifier) {
        internalBookId = bookIdentifier;
    } else if (bookIdentifier && bookDetails) { 
        const { success, message, internalBookId: fetchedInternalId } = await ensureBookExistsInDb(
            bookIdentifier,
            bookDetails
        );

        if (!success || !fetchedInternalId) {
            console.error('SERVER ACTION: updateShelfAction - Failed to ensure book exists in DB:', message);
            return { success: false, message: `Failed to add book to shelf: ${message}` };
        }
        internalBookId = fetchedInternalId;
    } else {
        if (!bookshelfEntryId) {
            return { success: false, message: 'Cannot perform shelf action without a book identifier or existing bookshelf entry.' };
        }
        const { data: existingShelfEntry, error: fetchEntryError } = await supabase
            .from('bookshelves')
            .select('book_id')
            .eq('id', bookshelfEntryId)
            .single();

        if (fetchEntryError || !existingShelfEntry) {
            console.error('SERVER ACTION: 🔴 Could not find existing bookshelf entry to get book_id:', fetchEntryError?.message);
            return { success: false, message: 'Could not find associated book for shelf action.' };
        }
        internalBookId = existingShelfEntry.book_id;
    }

    try {
        if (newShelfType === 'removed') {
            if (bookshelfEntryId) {
                const { error: deleteError } = await supabase.from('bookshelves')
                    .delete()
                    .eq('id', bookshelfEntryId)
                    .eq('user_id', user.id);

                if (deleteError) {
                    console.error('SERVER ACTION: Error removing book from shelf:', deleteError.message);
                    return { success: false, message: 'Failed to remove book from shelf: ${deleteError.message}'};
                }
                console.log('SERVER ACTION: Book successfully removed from shelf.');
                revalidatePath('/my-books');
                revalidatePath(`/dbbook/${internalBookId}`);
                return { success: true, message: 'Book removed from shelf successfully.' };
            } else {
                return { success: false, message: 'Book is not on your shelf to remove.' };
            }
        } else if (bookshelfEntryId) {
            const { error } = await supabase.from('bookshelves')
                .update({ shelf_type: newShelfType, date_added: new Date().toISOString() })
                .eq('id', bookshelfEntryId)
                .eq('user_id', user.id);

            if (error) {
                console.error('SERVER ACTION: Error updating shelf type:', error.message);
                return { success: false, message: 'Failed to update shelf: ${error.message}'};
            }
            console.log('SERVER ACTION: Shelf type updated successfully.');
            revalidatePath('/my-books');
            revalidatePath(`/dbbook/${internalBookId}`);
            return { success: true, message: 'Shelf updated successfully.', bookshelfEntryId };
        } else {
            const newBookshelfEntryId = uuidv4();
            const { data, error: insertError } = await supabase.from('bookshelves')
                .insert({
                    id: newBookshelfEntryId,
                    user_id: user.id,
                    book_id: internalBookId,
                    shelf_type: newShelfType,
                    date_added: new Date().toISOString(),
                })
                .select()
                .single();

            if (insertError) {
                console.error('SERVER ACTION: Error adding book to shelf:', insertError.message);
                return { success: false, message: 'Failed to add book to shelf: ${insertError.message}'};
            }
            console.log('SERVER ACTION: Book added to shelf successfully.');
            revalidatePath('/my-books');
            revalidatePath(`/dbbook/${internalBookId}`);
            return { success: true, message: 'Book added to shelf successfully.', bookshelfEntryId: newBookshelfEntryId, internalBookId };
        }
    } catch (err: any) {
        console.error('SERVER ACTION: Unexpected error in updateShelfAction:', err.message);
        return { success: false, message: 'An unexpected error occurred: ${err.message}'};
    }
}

export async function updateReviewAction(
    bookIdentifier: string,
    reviewText: string | null,
    rating: number | null,
    bookshelfEntryId: string | null,
    bookDetails?: GoogleBookDetailsForDB
): Promise<ActionResponse> {
    const supabase = supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('SERVER ACTION: User not authenticated for updateReviewAction.');
        return { success: false, message: 'User not authenticated.' };
    }

    let internalBookId: string;
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(bookIdentifier);

    if (isUuid) {
        internalBookId = bookIdentifier;
        console.log('SERVER ACTION: updateReviewAction - bookIdentifier is internal UUID: ${internalBookId}');
    } else {
        if (!bookDetails) {
            console.error('SERVER ACTION: updateReviewAction - Google Book ID provided without bookDetails for review insertion.');
            return { success: false, message: 'Missing book details for new book review.' };
        }
        const { success, message, internalBookId: fetchedInternalId } = await ensureBookExistsInDb(
            bookIdentifier,
            bookDetails
        );

        if (!success || !fetchedInternalId) {
            console.error('SERVER ACTION: updateReviewAction - Failed to ensure book exists in DB for review:', message);
            return { success: false, message: 'Failed to process book for review: ${message}'};
        }
        internalBookId = fetchedInternalId;
    }

    let currentBookshelfEntryId = bookshelfEntryId;
    let currentReviewId: string | null = null;

    try {
        if (!currentBookshelfEntryId) {
            const { data: existingShelf, error: fetchShelfError } = await supabase
                .from('bookshelves')
                .select('id, review_id')
                .eq('user_id', user.id)
                .eq('book_id', internalBookId)
                .single();

            if (fetchShelfError && fetchShelfError.code !== 'PGRST116') {
                console.error('SERVER ACTION: Error fetching existing bookshelf entry:', fetchShelfError.message);
                return { success: false, message: 'Failed to check shelf status: ${fetchShelfError.message}'};
            }

            if (existingShelf) {
                currentBookshelfEntryId = existingShelf.id;
                currentReviewId = existingShelf.review_id;
                console.log('SERVER ACTION: Found existing bookshelf entry:', currentBookshelfEntryId);
            } else {
                const newShelfId = uuidv4();
                console.log('SERVER ACTION: No existing bookshelf entry, creating new one:', newShelfId);
                const { data: newShelfData, error: createShelfError } = await supabase.from('bookshelves')
                    .insert({
                        id: newShelfId,
                        user_id: user.id,
                        book_id: internalBookId,
                        shelf_type: 'read',
                        date_added: new Date().toISOString(),
                    })
                    .select('id')
                    .single();

                if (createShelfError) {
                    console.error('SERVER ACTION: Error creating new bookshelf entry:', createShelfError.message);
                    return { success: false, message: 'Failed to create shelf for review: ${createShelfError.message}'};
                }
                currentBookshelfEntryId = newShelfData.id;
                console.log('SERVER ACTION: New bookshelf entry created:', currentBookshelfEntryId);
            }
        } else {
            const { data: shelfData, error: fetchReviewIdError } = await supabase
                .from('bookshelves')
                .select('review_id')
                .eq('id', currentBookshelfEntryId)
                .eq('user_id', user.id)
                .single();

            if (fetchReviewIdError) {
                console.error('SERVER ACTION: Error fetching review_id from bookshelf entry:', fetchReviewIdError.message);
                return { success: false, message: 'Failed to retrieve review data: ${fetchReviewIdError.message}'};
            }
            currentReviewId = shelfData?.review_id || null;
            console.log('SERVER ACTION: Found existing review_id on shelf:', currentReviewId);
        }

        let upsertedReviewId: string | null = currentReviewId;

        const hasContent = rating !== null || (reviewText && reviewText.trim() !== '');

        if (hasContent) {
            const reviewDataToUpsert: { rating: number | null; review_text: string | null; book_id: string; user_id: string; updated_at?: string; } = {
                rating: rating,
                review_text: reviewText,
                book_id: internalBookId,
                user_id: user.id,
                updated_at: new Date().toISOString(),
            };

            if (currentReviewId) {
                console.log('SERVER ACTION: Updating existing review ${currentReviewId}');
                const { error: updateReviewError } = await supabase
                    .from('reviews')
                    .update(reviewDataToUpsert)
                    .eq('id', currentReviewId)
                    .eq('user_id', user.id);

                if (updateReviewError) {
                    console.error('SERVER ACTION: Error updating review:', updateReviewError.message);
                    return { success: false, message: `Failed to update review: ${updateReviewError.message}` };
                }
                upsertedReviewId = currentReviewId;
            } else {
                const newReviewId = uuidv4();
                console.log('SERVER ACTION: Inserting new review:', newReviewId);
                const { data: newReview, error: insertReviewError } = await supabase
                    .from('reviews')
                    .insert({
                        id: newReviewId,
                        ...reviewDataToUpsert,
                        created_at: new Date().toISOString(),
                    })
                    .select('id')
                    .single();

                if (insertReviewError) {
                    console.error('SERVER ACTION: Error inserting new review:', insertReviewError.message);
                    return { success: false, message: 'Failed to add review: ${insertReviewError.message}'};
                }
                console.log('SERVER ACTION: New review inserted successfully:', newReview.id);
                upsertedReviewId = newReview.id;
            }
        } else if (currentReviewId) {
            console.log('SERVER ACTION: Deleting review ${currentReviewId} as no content provided.');
            const { error: deleteReviewError } = await supabase
                .from('reviews')
                .delete()
                .eq('id', currentReviewId)
                .eq('user_id', user.id);

            if (deleteReviewError) {
                console.error('SERVER ACTION: Error deleting review:', deleteReviewError.message);
                return { success: false, message: 'Failed to delete review: ${deleteReviewError.message}'};
            }
            console.log('SERVER ACTION: Review deleted successfully.');
            upsertedReviewId = null;
        }

        if (currentBookshelfEntryId) {
            console.log(`SERVER ACTION: Updating bookshelves entry ${currentBookshelfEntryId} with review_id: ${upsertedReviewId}`);
            const { error: updateBookshelfError } = await supabase
                .from('bookshelves')
                .update({ review_id: upsertedReviewId })
                .eq('id', currentBookshelfEntryId)
                .eq('user_id', user.id);

            if (updateBookshelfError) {
                console.error('SERVER ACTION: Error updating bookshelf with review_id:', updateBookshelfError.message);
                return { success: false, message: 'Failed to link review to bookshelf: ${updateBookshelfError.message}'};
            }
            console.log('SERVER ACTION: Bookshelf entry updated successfully with review_id.');
        } else {
            console.warn('SERVER ACTION: No bookshelf entry ID to link review, but review was processed.');
        }

        revalidatePath('/my-books');
        revalidatePath(`/dbbook/${internalBookId}`);

        return { success: true, message: 'Review and shelf updated successfully.', reviewId: upsertedReviewId, bookshelfEntryId: currentBookshelfEntryId, internalBookId };
    } catch (err: any) {
        console.error('SERVER ACTION: Unexpected error in updateReviewAction:', err.message);
        return { success: false, message: 'An unexpected error occurred: ${err.message}'};
    }
}

export async function getBookReviews(bookId: string): Promise<{ success: boolean; message: string; reviews: BookReview[] }> {
  const supabase = supabaseServer();

  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id,
        user_id,
        rating,
        review_text,
        created_at,
        updated_at,
        profiles(full_name)
      `)
      .eq('book_id', bookId)
      .not('review_text', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews from Supabase:', error.message);
      return { success: false, message: error.message, reviews: [] };
    }

    const formattedReviews: BookReview[] = reviews.map((review: any) => {
      return {
        id: review.id,
        user_id: review.user_id,
        book_id: bookId,
        user_name: review.profiles?.full_name || 'Anonymous',
        rating: review.rating,
        review_text: review.review_text,
        created_at: review.created_at,
        updated_at: review.updated_at,
      };
    });
    return { success: true, message: 'Reviews fetched successfully.', reviews: formattedReviews };

  } catch (error: any) {
    return { success: false, message: 'An unexpected error occurred.', reviews: [] };
  }
}