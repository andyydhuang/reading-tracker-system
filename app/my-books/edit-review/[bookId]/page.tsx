// app/my-books/edit-review/[bookId]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef, Suspense } from 'react';
import Image from 'next/image';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { supabase } from '@/utils/supabase/client';
import { updateReviewAction, updateShelfAction } from '@/app/my-books/actions';

interface BookDetails {
    id: string;
    title: string;
    isbn?: string | null;
    description?: string | null;
    cover_image_url?: string | null;
    publisher?: string | null;
    publication_date?: string | null;
    page_count?: number | null;
    language?: string | null;
    created_at: string;
    updated_at: string;
    authors?: string[] | null;
    google_books_id?: string | null;
    average_rating_google?: number | null;
    ratings_count_google?: number | null;
    image_small_thumbnail_url?: string | null;
    preview_link?: string | null;
    info_link?: string | null;
}

interface BookshelfEntry {
    id: string;
    user_id: string;
    book_id: string;
    shelf_type: 'read' | 'currently_reading' | 'want_to_read' | 'to-read';
    date_added: string;
    date_started: string | null;
    date_finished: string | null;
    review_id: string | null;
}

// Loading component for Suspense fallback
function EditReviewPageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#382110] border-t-transparent"></div>
    </div>
  );
}

// Main edit review page component that uses useParams
const EditReviewPageContent: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const bookId = params.bookId as string;

    const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
    const [bookshelfEntry, setBookshelfEntry] = useState<BookshelfEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviewText, setReviewText] = useState<string>('');
    const [currentRating, setCurrentRating] = useState<number | null>(null);
    const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showShelfDropdown, setShowShelfDropdown] = useState(false);
    const [selectedShelf, setSelectedShelf] = useState<BookshelfEntry['shelf_type']>('to-read');
    const [userId, setUserId] = useState<string | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowShelfDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    useEffect(() => {
        const fetchUserAndBookData = async () => {
            setLoading(true);
            setError(null);

            const { data: { session }, error: userError } = await supabase.auth.getSession();

            if (userError || !session?.user) {
                console.error('Error fetching user session:', userError?.message || 'User not logged in.');
                setError('You must be logged in to edit reviews.');
                setLoading(false);
                return;
            }
            const currentUserId = session.user.id;
            setUserId(currentUserId);

            if (!bookId || !currentUserId) {
                setError("Book ID or User ID is missing.");
                setLoading(false);
                return;
            }

            try {
                const { data: bookData, error: bookFetchError } = await supabase
                    .from('books')
                    .select('*')
                    .eq('id', bookId)
                    .single();

                if (bookFetchError) {
                    console.error('Error fetching book details:', bookFetchError.message);
                    setError(bookFetchError.message);
                    setLoading(false);
                    return;
                }
                if (bookData) {
                    setBookDetails(bookData as BookDetails);
                } else {
                    console.log('Book details not found for ID:', bookId);
                    setError('Book details not found.');
                    setLoading(false);
                    return;
                }

                const { data: bookshelfEntries, error: bookshelfFetchError } = await supabase
                    .from('bookshelves')
                    .select('*')
                    .eq('book_id', bookId)
                    .eq('user_id', currentUserId);

                if (bookshelfFetchError) {
                    console.error('Error fetching bookshelf entry:', bookshelfFetchError.message);
                    setError(bookshelfFetchError.message);
                    setLoading(false);
                    return;
                }

                let fetchedBookshelfEntry: BookshelfEntry | null = null;
                if (bookshelfEntries && bookshelfEntries.length > 0) {
                    const rawEntry = bookshelfEntries[0];
                    fetchedBookshelfEntry = {
                        ...rawEntry,
                        date_started: rawEntry.date_started ?? null,
                        date_finished: rawEntry.date_finished ?? null,
                        review_id: rawEntry.review_id ?? null,
                    } as BookshelfEntry;

                    setBookshelfEntry(fetchedBookshelfEntry);
                    setSelectedShelf(fetchedBookshelfEntry.shelf_type || 'to-read');

                    if (fetchedBookshelfEntry.review_id) {
                        const { data: reviewData, error: reviewFetchError } = await supabase
                            .from('reviews')
                            .select('id, rating, review_text')
                            .eq('id', fetchedBookshelfEntry.review_id)
                            .single();

                        if (reviewFetchError) {
                            setReviewText('');
                            setCurrentRating(null);
                            setCurrentReviewId(null);
                        } else if (reviewData) {
                            setCurrentReviewId(reviewData.id);
                            setReviewText(reviewData.review_text || '');
                            setCurrentRating(reviewData.rating || null);
                        } else {
                            setReviewText('');
                            setCurrentRating(null);
                            setCurrentReviewId(null);
                        }
                    } else {
                        setReviewText('');
                        setCurrentRating(null);
                        setCurrentReviewId(null);
                    }
                } else {
                    setBookshelfEntry(null);
                    setReviewText('');
                    setCurrentRating(null);
                    setSelectedShelf('to-read');
                    setCurrentReviewId(null);
                }

            } catch (err: any) {
                console.error('Caught unexpected error during data fetch:', err);
                setError('An unexpected error occurred: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserAndBookData();
    }, [bookId]);

    const handleRatingChange = (newRating: number) => {
        setCurrentRating(newRating === currentRating ? null : newRating);
    };

    const handleShelfSelect = async (shelf: BookshelfEntry['shelf_type']) => {
        setShowShelfDropdown(false);
        if (!bookId || !userId) {
            setError("Cannot update shelf: Missing book ID or user ID.");
            return;
        }

        if (shelf === selectedShelf) {
            console.log('Shelf not changed, no DB update needed.');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            let currentBookshelfEntryId = bookshelfEntry?.id;

            if (!currentBookshelfEntryId) {
                console.log('No existing bookshelf entry found. Creating a new one for shelf change.');
                const { data, error: createBookshelfError } = await supabase
                    .from('bookshelves')
                    .insert({
                        user_id: userId,
                        book_id: bookId,
                        shelf_type: shelf,
                        date_added: new Date().toISOString(),
                        date_started: null,
                        date_finished: null,
                        review_id: null,
                    })
                    .select('id')
                    .single();

                if (createBookshelfError) {
                    setError(`Failed to create bookshelf entry for shelf change: ${createBookshelfError.message}`);
                    return;
                }
                currentBookshelfEntryId = data.id;

                setBookshelfEntry({
                    id: data.id,
                    user_id: userId,
                    book_id: bookId,
                    shelf_type: shelf,
                    date_added: new Date().toISOString(),
                    date_started: null,
                    date_finished: null,
                    review_id: null,
                });
            } else {
                const { error: updateBookshelfError } = await supabase
                    .from('bookshelves')
                    .update({ shelf_type: shelf })
                    .eq('id', currentBookshelfEntryId);

                if (updateBookshelfError) {
                    setError(`Failed to update bookshelf entry for shelf change: ${updateBookshelfError.message}`);
                    return;
                }

                setBookshelfEntry(prev => prev ? { ...prev, shelf_type: shelf } : null);
            }

            setSelectedShelf(shelf);
            console.log(`Shelf updated to: ${shelf}`);

        } catch (err: any) {
            console.error('Error during shelf update:', err);
            setError('An unexpected error occurred during shelf update: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        if (!bookId || !userId) {
            setError("Cannot save review: Missing book ID or user ID.");
            setSaving(false);
            return;
        }

        try {
            let currentBookshelfEntryId = bookshelfEntry?.id;

            // If no bookshelf entry exists, create one
            if (!currentBookshelfEntryId) {
                console.log('No existing bookshelf entry found. Creating a new one for review.');
                const { data, error: createBookshelfError } = await supabase
                    .from('bookshelves')
                    .insert({
                        user_id: userId,
                        book_id: bookId,
                        shelf_type: selectedShelf,
                        date_added: new Date().toISOString(),
                        date_started: null,
                        date_finished: null,
                        review_id: null,
                    })
                    .select('id')
                    .single();

                if (createBookshelfError) {
                    setError(`Failed to create bookshelf entry for review: ${createBookshelfError.message}`);
                    return;
                }
                currentBookshelfEntryId = data.id;

                setBookshelfEntry({
                    id: data.id,
                    user_id: userId,
                    book_id: bookId,
                    shelf_type: selectedShelf,
                    date_added: new Date().toISOString(),
                    date_started: null,
                    date_finished: null,
                    review_id: null,
                });
            }

            // Save or update the review
            const result = await updateReviewAction(
                bookId,
                reviewText,
                currentRating,
                currentBookshelfEntryId
            );

            if (result.success) {
                console.log('Review saved successfully:', result.message);
                if (result.reviewId) {
                    setCurrentReviewId(result.reviewId);
                }
                alert('Review saved successfully!');
                router.push('/my-books');
            } else {
                setError(result.message);
            }

        } catch (err: any) {
            console.error('Error during review submission:', err);
            setError('An unexpected error occurred during review submission: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#382110] border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/my-books')}
                        className="px-4 py-2 bg-[#382110] text-white rounded hover:bg-[#58371F]"
                    >
                        Back to My Books
                    </button>
                </div>
            </div>
        );
    }

    if (!bookDetails) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-600 mb-4">Book Not Found</h2>
                    <button
                        onClick={() => router.push('/my-books')}
                        className="px-4 py-2 bg-[#382110] text-white rounded hover:bg-[#58371F]"
                    >
                        Back to My Books
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9f7f1] py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start gap-6 mb-6">
                        <div className="flex-shrink-0">
                            {bookDetails.cover_image_url ? (
                                <Image
                                    src={bookDetails.cover_image_url}
                                    alt={`Cover of ${bookDetails.title}`}
                                    width={120}
                                    height={180}
                                    className="rounded shadow-md"
                                />
                            ) : (
                                <div className="w-[120px] h-[180px] bg-gray-200 flex items-center justify-center text-sm text-gray-500 rounded shadow-md">
                                    No Cover
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-serif text-[#382110] mb-2">{bookDetails.title}</h1>
                            {bookDetails.authors && (
                                <p className="text-gray-600 mb-2">by {bookDetails.authors.join(', ')}</p>
                            )}
                            {bookDetails.publisher && (
                                <p className="text-sm text-gray-500 mb-2">{bookDetails.publisher}</p>
                            )}
                            {bookDetails.publication_date && (
                                <p className="text-sm text-gray-500 mb-4">{new Date(bookDetails.publication_date).getFullYear()}</p>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Shelf Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Shelf
                            </label>
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setShowShelfDropdown(!showShelfDropdown)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#382110]"
                                >
                                    {selectedShelf.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </button>
                                {showShelfDropdown && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                        {(['to-read', 'currently_reading', 'read'] as const).map((shelf) => (
                                            <button
                                                key={shelf}
                                                type="button"
                                                onClick={() => handleShelfSelect(shelf)}
                                                className="w-full px-3 py-2 text-left hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                                            >
                                                {shelf.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rating
                            </label>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleRatingChange(i + 1)}
                                        className="text-2xl text-yellow-500 hover:text-yellow-600"
                                    >
                                        {i < (currentRating || 0) ? <FaStar /> : <FaRegStar />}
                                    </button>
                                ))}
                                {currentRating && (
                                    <span className="ml-2 text-gray-600">({currentRating}/5)</span>
                                )}
                            </div>
                        </div>

                        {/* Review Text */}
                        <div>
                            <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                                Review
                            </label>
                            <textarea
                                id="review"
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#382110]"
                                placeholder="Share your thoughts about this book..."
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-[#382110] text-white rounded-md hover:bg-[#58371F] disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Review'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/my-books')}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Main page component with Suspense boundary
export default function EditReviewPage() {
    return (
        <Suspense fallback={<EditReviewPageLoading />}>
            <EditReviewPageContent />
        </Suspense>
    );
}