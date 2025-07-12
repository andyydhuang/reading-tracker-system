// components/BookDetailsLayout.tsx
'use client';

import Image from 'next/image';
import { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { StarIcon, ChevronDown, Save, Edit, Trash2 } from 'lucide-react';
import { FaStar, FaRegStar } from 'react-icons/fa';

import {
  updateShelfAction,
  updateReviewAction,
} from '@/app/my-books/actions';

import { BookReview } from '@/types/index';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { LoginCard } from './LoginCard';


interface CommonBookDisplayProps {
  title: string;
  subtitle?: string | null;
  authors?: string[] | null;
  description?: string | null;
  thumbnail?: string | null;
  publishedDate?: string | null;
  pageCount?: number | null;
  categories?: string[];
  publisher?: string | null;
  language?: string | null;
  averageRating?: number | null;
  ratingsCount?: number | null;
  industryIdentifiers?: Array<{ type: string; identifier: string }>;
  printType?: string;
  googleBooksId: string | null;
}

interface BookDetailsLayoutProps extends CommonBookDisplayProps {
  isLoggedIn?: boolean;
  bookId: string;
  bookshelfEntryId: string | null;
  shelfType: 'read' | 'currently_reading' | 'want_to_read' | 'to-read' | null;
  dateAdded: string | null;
  dateStarted: string | null;
  dateFinished: string | null;
  userRating: number | null;
  userReview: BookReview | null;
  userId: string | null;
  additionalDetails?: ReactNode;
  allReviews: BookReview[];
}

export function BookDetailsLayout({
  title,
  subtitle,
  authors,
  description,
  thumbnail,
  publishedDate,
  pageCount,
  categories,
  publisher,
  language,
  averageRating,
  ratingsCount,
  industryIdentifiers,
  printType,
  googleBooksId,
  isLoggedIn,
  bookId,
  bookshelfEntryId: initialBookshelfEntryId,
  shelfType: initialShelfType,
  dateAdded: initialDateAdded,
  dateStarted: initialDateStarted,
  dateFinished: initialDateFinished,
  userRating: initialUserRating,
  userReview: initialUserReview,
  userId,
  additionalDetails,
  allReviews,
}: BookDetailsLayoutProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const [showReadMore, setShowReadMore] = useState(false);

  const [bookshelfEntryId, setBookshelfEntryId] = useState<string | null>(initialBookshelfEntryId);
  const [currentShelfType, setCurrentShelfType] = useState<
    'read' | 'currently_reading' | 'want_to_read' | 'to-read' | null
  >(initialShelfType);
  const [currentDateAdded, setCurrentDateAdded] = useState<string | null>(initialDateAdded);
  const [currentDateStarted, setCurrentDateStarted] = useState<string | null>(initialDateStarted);
  const [currentDateFinished, setCurrentDateFinished] = useState<string | null>(initialDateFinished);
  const [currentUserRating, setCurrentUserRating] = useState<number | null>(initialUserRating);
  const [currentUserReview, setCurrentUserReview] = useState<BookReview | null>(initialUserReview);

  const isBookOnShelf = !!bookshelfEntryId;

  const [isEditingReview, setIsEditingReview] = useState(false);
  const [editingReviewText, setEditingReviewText] = useState(initialUserReview?.review_text || '');
  const [editingRating, setEditingRating] = useState<number | null>(initialUserRating);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShelfUpdating, setIsShelfUpdating] = useState(false);

  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const MAX_REVIEW_LENGTH = 150;

  const [hoverRating, setHoverRating] = useState<number>(0);

  useEffect(() => {
    setBookshelfEntryId(initialBookshelfEntryId);
    setCurrentShelfType(initialShelfType);
    setCurrentDateAdded(initialDateAdded);
    setCurrentDateStarted(initialDateStarted);
    setCurrentDateFinished(initialDateFinished);
    setCurrentUserRating(initialUserRating);
    setCurrentUserReview(initialUserReview);
    setEditingReviewText(initialUserReview?.review_text || '');
    setEditingRating(initialUserRating);
    setHoverRating(0);
    setExpandedReviews(new Set());
  }, [
    initialBookshelfEntryId,
    initialShelfType,
    initialDateAdded,
    initialDateStarted,
    initialDateFinished,
    initialUserRating,
    initialUserReview,
  ]);

  useEffect(() => {
    if (descriptionRef.current) {
      const { scrollHeight, clientHeight } = descriptionRef.current;
      setShowReadMore(scrollHeight > clientHeight);
    }
  }, [description]);

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const formattedPublishedDate = publishedDate
    ? new Date(publishedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  const bookDetailsForAction = {
    google_books_id: googleBooksId || '',
    title: title,
    authors: authors,
    description: description,
    cover_image_url: thumbnail,
    image_small_thumbnail_url: thumbnail,
    publisher: publisher,
    publication_date: publishedDate,
    page_count: pageCount,
    language: language,
    average_rating_google: averageRating,
    ratings_count_google: ratingsCount,
    isbn: industryIdentifiers?.find(id => id.type === 'ISBN_13' || id.type === 'ISBN_10')?.identifier || null,
    categories: categories,
    preview_link: null,
    info_link: null,
  };

  const handleUpdateOrAddToShelf = async (newShelfType: 'read' | 'currently_reading' | 'want_to_read' | 'removed') => {
    if (!userId) {
      alert('You must be logged in to modify your shelf.');
      return;
    }

    if (!googleBooksId && newShelfType !== 'removed' && !isBookOnShelf) {
        alert('Cannot add book without a Google Books ID.');
        setIsShelfUpdating(false);
        return;
    }

    setIsShelfUpdating(true);
    const result = await updateShelfAction(bookshelfEntryId, newShelfType, bookId, bookDetailsForAction);
    setIsShelfUpdating(false);

    if (result.success) {
      alert(result.message);
      if (newShelfType === 'removed') {
        setBookshelfEntryId(null);
        setCurrentShelfType(null);
        setCurrentDateAdded(null);
        setCurrentDateStarted(null);
        setCurrentDateFinished(null);
        setCurrentUserRating(null);
        setCurrentUserReview(null);
        setEditingReviewText('');
        setEditingRating(null);
        setIsEditingReview(false);
      } else {
        setBookshelfEntryId(result.bookshelfEntryId || null);
        setCurrentShelfType(newShelfType);
        if (!bookshelfEntryId) {
            setCurrentDateAdded(new Date().toISOString());
        }
      }
    } else {
      alert(`Error: ${result.message}`);
    }
  };

  const handleRemoveFromShelf = async () => {
    if (!bookshelfEntryId) return;
    if (confirm('Are you sure you want to remove this book from your shelves?')) {
      await handleUpdateOrAddToShelf('removed');
    }
  };

  const handleRatingChange = async (newRating: number) => {
    if (!isLoggedIn) {
      alert('You must be logged in to rate this book.');
      return;
    }
    if (isSubmitting) return; // Prevent multiple submissions

    setEditingRating(newRating);
    setCurrentUserRating(newRating);

    setIsSubmitting(true);
    const result = await updateReviewAction(
      bookId,
      editingReviewText,
      newRating,
      bookshelfEntryId,
      bookDetailsForAction
    );
    setIsSubmitting(false);

    if (result.success) {
      if (!bookshelfEntryId && result.bookshelfEntryId) {
        setBookshelfEntryId(result.bookshelfEntryId);
        setCurrentShelfType(currentShelfType || 'read');
        setCurrentDateAdded(new Date().toISOString());
      }
      setCurrentUserRating(newRating);

      const newReviewId = result.reviewId || currentUserReview?.id;

      setCurrentUserReview(prevReview => {
        const now = new Date().toISOString();
        if (prevReview) {
          return {
            ...prevReview,
            rating: newRating,
            review_text: editingReviewText,
            updated_at: now,
            id: newReviewId || prevReview.id,
          };
        } else if (newReviewId && userId && bookId) {
          return {
            id: newReviewId,
            user_id: userId,
            book_id: bookId,
            rating: newRating,
            review_text: editingReviewText,
            created_at: now,
            updated_at: now,
            user_name: 'You',
          };
        }
        return null;
      });
      setEditingReviewText(editingReviewText);
    } else {
      alert(`Error saving rating: ${result.message}`);
      setCurrentUserRating(initialUserRating);
      setEditingRating(initialUserRating);
      setEditingReviewText(initialUserReview?.review_text || '');
    }
  };

  const handleSaveReview = async () => {
    if (!userId) {
      alert('User ID is missing. Cannot save review.');
      return;
    }

    if (!googleBooksId && !bookshelfEntryId) {
        alert('Cannot save review without a Google Books ID for new entries.');
        setIsSubmitting(false);
        return;
    }

    setIsSubmitting(true);
    const result = await updateReviewAction(
      bookId,
      editingReviewText,
      editingRating,
      bookshelfEntryId,
      bookDetailsForAction
    );
    setIsSubmitting(false);

    if (result.success) {
      alert('Review saved successfully!');
      setIsEditingReview(false);
      setCurrentUserRating(editingRating);

      const newReviewId = result.reviewId || currentUserReview?.id;

      setCurrentUserReview(prevReview => {
        const now = new Date().toISOString();
        if (prevReview) {
          return {
            ...prevReview,
            rating: editingRating,
            review_text: editingReviewText,
            updated_at: now,
            id: newReviewId || prevReview.id,
          };
        } else if (newReviewId && userId && bookId) {
          return {
            id: newReviewId,
            user_id: userId,
            book_id: bookId,
            rating: editingRating,
            review_text: editingReviewText,
            created_at: now,
            updated_at: now,
            user_name: 'You',
          };
        }
        return null;
      });

      if (!bookshelfEntryId && result.bookshelfEntryId) {
          setBookshelfEntryId(result.bookshelfEntryId);
          setCurrentShelfType(currentShelfType || 'read');
          setCurrentDateAdded(new Date().toISOString());
      }
    } else {
      alert(`Error saving review: ${result.message}`);
    }
  };

  const displayRating = hoverRating > 0
    ? hoverRating
    : (isEditingReview ? (editingRating || 0) : (currentUserRating || 0));

  const otherReviews = allReviews.filter(review => review.user_id !== userId);

  const REVIEW_TRUNCATE_LENGTH = 150;

  const currentUserReviewId = currentUserReview?.id;
  const isCurrentUserReviewExpanded = currentUserReviewId ? expandedReviews.has(currentUserReviewId) : false;
  const needsReadMoreCurrentUserReview = currentUserReview?.review_text && currentUserReview.review_text.length > REVIEW_TRUNCATE_LENGTH;
  const displayedCurrentUserReviewText = isCurrentUserReviewExpanded || !needsReadMoreCurrentUserReview
    ? currentUserReview?.review_text
    : currentUserReview?.review_text?.substring(0, REVIEW_TRUNCATE_LENGTH) + '...';


  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left Column: Book Cover, Shelf Actions */}
        <div className="md:w-1/3 p-4 flex flex-col items-start bg-gray-50">
          <div className="flex justify-center items-center mb-4">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={title}
                width={250}
                height={375}
                className="rounded-lg shadow-md"
                priority
              />
            ) : (
              <div className="w-[250px] h-[375px] bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-center p-4">
                No Cover Image Available
              </div>
            )}
          </div>

          <div className="w-full max-w-[250px] px-2 mb-4">
            {isLoggedIn ? (
              isBookOnShelf ? (
                <div className="bg-[#f9f7f1] p-4 rounded-lg shadow-sm border text-center">
                  <h3 className="text-md font-semibold text-[#382110] mb-2">On Your Shelf:</h3>
                  <p className="text-md font-semibold text-[#382110] mb-3 capitalize">
                    {currentShelfType?.replace(/_/g, ' ')}
                  </p>
                  <select
                    value={currentShelfType || ''}
                    onChange={(e) => handleUpdateOrAddToShelf(e.target.value as any)}
                    className="p-2 border rounded-md shadow-sm bg-white w-full mb-2 text-sm"
                    disabled={isShelfUpdating}
                  >
                    <option value="" disabled>Change Shelf</option>
                    <option value="read">Move to Read</option>
                    <option value="currently_reading">Move to Currently Reading</option>
                    <option value="want_to_read">Move to Want to Read</option>
                  </select>
                  <button
                    onClick={handleRemoveFromShelf}
                    className="bg-gray-150 hover:bg-white text-[#00635d] py-2 px-3 rounded transition duration-200 w-full text-sm flex items-center justify-center"
                    disabled={isShelfUpdating}
                  >
                    {isShelfUpdating ? 'Removing...' : <><Trash2 className="mr-2 h-4 w-4" /> Remove</>}
                  </button>
                </div>
              ) : (
                <div className="bg-[#f9f7f1] p-4 rounded-lg shadow-sm border border-blue-200 text-center">
                  <h3 className="text-md font-semibold text-[#382110] mb-2">Not on Your Shelf</h3>
                  <select
                    value={currentShelfType || ''}
                    onChange={(e) => handleUpdateOrAddToShelf(e.target.value as any)}
                    className="p-2 border rounded-md shadow-sm bg-white w-full mb-2 text-sm"
                    disabled={isShelfUpdating}
                  >
                    <option value="" disabled>Add to Shelf</option>
                    <option value="read">Read</option>
                    <option value="currently_reading">Currently Reading</option>
                    <option value="want_to_read">Want to Read</option>
                  </select>
                </div>
              )
            ) : (
              <div className="w-full">
                <div className="bg-[#f9f7f1] p-4 rounded-lg shadow-sm border text-center w-full mb-4"> {/* Added mb-4 for spacing */}
                  <p className="text-[#00635d] text-sm">
                    Sign in to add to your shelves and rate this book.
                  </p>
                </div>
                <LoginCard />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Book Details and All Reviews */}
        <div className="md:w-2/3 p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{title}</h1>
          {subtitle && <h2 className="text-xl md:text-2xl text-gray-700 mb-3">{subtitle}</h2>}
          {authors && authors.length > 0 && (
            <p className="text-gray-600 text-lg mb-4">
              by <span className="font-semibold">{authors.join(', ')}</span>
            </p>
          )}

          {(averageRating !== undefined && averageRating !== null) && (
            <div className="flex items-center text-gray-700 mb-4">
              <span className="font-semibold text-xl mr-2">{averageRating.toFixed(1)}</span>
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                    } ${i < averageRating && i >= Math.floor(averageRating) ? 'fill-yellow-400' : ''}`}
                    fill={i < Math.floor(averageRating) ? 'currentColor' : 'none'}
                    stroke={i < averageRating && i >= Math.floor(averageRating) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              {ratingsCount && <span className="ml-2 text-sm">({ratingsCount} ratings)</span>}
            </div>
          )}

          {description && (
            <div className="mb-6">
              <div
                ref={descriptionRef}
                className={`text-gray-700 leading-relaxed ${!isDescriptionExpanded ? 'line-clamp-4' : ''}`}
              >
                {description ? (
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {description}
                  </ReactMarkdown>
                ) : (
                  'No description available.'
                )}
              </div>
              {showReadMore && (
                <button
                  onClick={toggleDescription}
                  className="text-[#00635d] hover:underline mt-2 flex items-center"
                >
                  {isDescriptionExpanded ? 'Show Less' : 'Read More'}
                  <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${isDescriptionExpanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-gray-700 text-sm mb-6">
            <p>
              <strong>Publisher:</strong> {publisher || 'N/A'}
            </p>
            <p>
              <strong>Published:</strong> {formattedPublishedDate}
            </p>
            <p>
              <strong>Pages:</strong> {pageCount || 'N/A'}
            </p>
            <p>
              <strong>Language:</strong> {language ? language.toUpperCase() : 'N/A'}
            </p>
          </div>

          {isLoggedIn && (
            <div className="w-full border-t pt-4 mt-8">
              <h2 className="font-bold text-2xl mb-4 text-gray-900">Your Review</h2>
              
              <div className="flex items-center justify-center mb-3">
                <h4 className="font-semibold text-base text-gray-800 mr-2">Your Rating</h4>
                <div
                  className="flex items-center gap-1"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      onClick={() => isLoggedIn && handleRatingChange(i + 1)}
                      onMouseEnter={() => isLoggedIn && setHoverRating(i + 1)}
                      className={`cursor-pointer text-2xl ${isLoggedIn ? 'text-yellow-500' : 'text-gray-400'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {i < displayRating ? <FaStar /> : <FaRegStar />}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                {isEditingReview ? (
                  <div>
                    <textarea
                      value={editingReviewText}
                      onChange={(e) => setEditingReviewText(e.target.value)}
                      placeholder="Write your review here..."
                      className="w-full p-2 border rounded-md mb-2 text-sm"
                      rows={3}
                      disabled={isSubmitting}
                    ></textarea>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={handleSaveReview}
                        className="bg-[#f9f7f1] hover:bg-white text-[#00635d] py-1 px-3 rounded transition duration-200 flex items-center text-sm"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Saving...' : <><Save className="mr-1 h-4 w-4" /> Save</>}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingReview(false);
                          setEditingReviewText(currentUserReview?.review_text || '');
                          setEditingRating(currentUserRating);
                          setHoverRating(0);
                        }}
                        className="bg-[#f9f7f1]  hover:bg-white text-[#00635d] py-1 px-3 rounded transition duration-200 text-sm"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 italic text-sm mb-2">
                      {currentUserReview?.review_text ? (
                        <>
                          {displayedCurrentUserReviewText}
                          {needsReadMoreCurrentUserReview && (
                            <button
                              onClick={() => toggleReviewExpansion(currentUserReviewId!)}
                              className="text-[#00635d] hover:underline ml-1 text-xs"
                            >
                              {isCurrentUserReviewExpanded ? 'Show Less' : 'Read More'}
                            </button>
                          )}
                        </>
                      ) : (
                        currentUserRating ? 'No review text.' : 'Rate this book!'
                      )}
                    </p>
                    <button
                      onClick={() => setIsEditingReview(true)}
                      className="text-[#00635d] hover:underline flex items-center justify-center w-full text-sm"
                    >
                      <Edit className="mr-1 h-4 w-4" /> {currentUserReview?.review_text ? 'Edit Review' : 'Add Review'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ALL REVIEWS SECTION */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Other Reviews</h2>
            {otherReviews.length > 0 ? (
              <div className="space-y-6">
                {otherReviews.map((review) => {
                  const isReviewExpanded = expandedReviews.has(review.id);
                  const displayReviewText = review.review_text;
                  const needsReadMore = displayReviewText && displayReviewText.length > MAX_REVIEW_LENGTH;
                  const truncatedReviewText = needsReadMore && !isReviewExpanded
                    ? `${displayReviewText.substring(0, MAX_REVIEW_LENGTH)}...`
                    : displayReviewText;

                  return (
                    <div key={review.id} className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center mb-2">
                        <span className="font-semibold text-gray-800 mr-2">{review.user_name}</span>
                        {review.rating !== null && (
                          <div className="flex items-center">
                            {Array.from({ length: 5 }, (_, i) => (
                              <FaStar
                                key={i}
                                className={`h-4 w-4 ${i < review.rating! ? 'text-yellow-500' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="ml-1 text-sm text-gray-600">({review.rating}/5)</span>
                          </div>
                        )}
                      </div>
                      {truncatedReviewText && (
                        <p className="text-gray-700 text-sm">
                          {truncatedReviewText}
                          {needsReadMore && (
                            <button
                              onClick={() => toggleReviewExpansion(review.id)}
                              className="text-[#00635d] hover:underline ml-1 text-xs"
                            >
                              {isReviewExpanded ? 'Show Less' : 'Read More'}
                            </button>
                          )}
                        </p>
                      )}
                       <p className="text-xs text-gray-500 mt-2">
                            Created on: {new Date(review.created_at).toISOString().split('T')[0]}
                            {review.updated_at && review.created_at !== review.updated_at &&
                                ` (Edited: ${new Date(review.updated_at).toISOString().split('T')[0]})`
                            }
                        </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                  <p>No other reviews for this book yet. Be the first to add one!</p>
              </div>
            )}
          </div>

          {additionalDetails && (
            <div className="mt-8 border-t pt-6">
              {additionalDetails}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}