// components/MyBooksTable.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { ShelfBook } from '@/app/my-books/page';

import { GoogleBookDetailsForDB, ActionResponse } from '@/types/index';

interface MyBooksTableProps {
    books: ShelfBook[];
    onUpdateShelf: (
        bookshelfEntryId: string | null,
        newShelfType: string,
        bookIdentifier: string | null,
        bookDetails?: GoogleBookDetailsForDB
    ) => Promise<ActionResponse>;
    onUpdateRating: (bookId: string, reviewText: string | null, rating: number | null, bookshelfEntryId: string) => Promise<ActionResponse>;
}

const MyBooksTable: React.FC<MyBooksTableProps> = ({ books, onUpdateShelf, onUpdateRating }) => {
    const [editingShelfId, setEditingShelfId] = useState<string | null>(null);
    const [selectedShelfType, setSelectedShelfType] = useState<string>('');
    const [updatingRatingId, setUpdatingRatingId] = useState<string | null>(null);
    const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

    const MAX_REVIEW_LENGTH = 100;

    const handleShelfChange = async (bookshelfEntryId: string, newShelfType: string) => {
        if (newShelfType) {
            console.log('CLIENT: Attempting to update shelf for ${bookshelfEntryId} to ${newShelfType}');
            const result = await onUpdateShelf(bookshelfEntryId, newShelfType, null, undefined);
            if (result.success) {
                //console.log('CLIENT: Shelf updated successfully:', result.message);
                setEditingShelfId(null);
            } else {
                console.error('CLIENT: Failed to update shelf:', result.message);
            }
        }
    };

    const handleRemoveClick = async (bookshelfEntryId: string) => {
        if (confirm('Are you sure you want to remove this book from your shelves?')) {
            //console.log('CLIENT: Attempting to remove book with bookshelfEntryId: ${bookshelfEntryId}');
            const result = await onUpdateShelf(bookshelfEntryId, 'removed', null, undefined);
            if (result.success) {
                console.log('CLIENT: Book removed successfully:', result.message);
            } else {
                console.error('CLIENT: Failed to remove book:', result.message);
            }
        }
    };

    const handleRatingChange = async (
        bookId: string,
        bookshelfEntryId: string,
        currentReviewId: string | null,
        newRating: number | null,
        newReviewText: string | null = null,
    ) => {
        setUpdatingRatingId(bookshelfEntryId);
        console.log('CLIENT: Attempting to update review for book ${bookId}, bookshelf entry ${bookshelfEntryId}. New rating: ${newRating}, New text: ${newReviewText}');

        const result = await onUpdateRating(
            bookId,
            newReviewText,
            newRating,
            bookshelfEntryId,
        );

        if (result.success) {
            console.log('CLIENT: Review updated successfully:', result.message);
        } else {
            console.error('CLIENT: Failed to update review:', result.message);
        }
        setUpdatingRatingId(null);
    };

    const toggleReviewExpansion = (id: string) => {
        setExpandedReviews(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        <th className="py-2 px-3 text-left">Cover</th>
                        <th className="py-2 px-3 text-left">Title</th>
                        <th className="py-2 px-3 text-left">Author(s)</th>
                        <th className="py-2 px-3 text-left">Shelf</th>
                        <th className="py-2 px-3 text-left">Your Review & Rating</th>
                        <th className="py-2 px-3 text-left hidden lg:table-cell">Date Added</th>
                        <th className="py-2 px-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map((book) => {
                        const isReviewExpanded = expandedReviews.has(book.id);
                        const displayReviewText = book.review_data?.review_text;
                        const truncatedReviewText = displayReviewText && displayReviewText.length > MAX_REVIEW_LENGTH && !isReviewExpanded
                            ? `${displayReviewText.substring(0, MAX_REVIEW_LENGTH)}...`
                            : displayReviewText;

                        return (
                            <tr key={book.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="py-2 px-3">
                                    <Link href={`/dbbook/${book.book_id}`} className="hover:underline">
                                        {book.volumeInfo.imageLinks?.smallThumbnail || book.volumeInfo.imageLinks?.thumbnail ? (
                                            <Image
                                                src={book.volumeInfo.imageLinks?.smallThumbnail || book.volumeInfo.imageLinks?.thumbnail || '/path/to/placeholder.png'}
                                                alt={`Cover of ${book.volumeInfo.title}`}
                                                width={60}
                                                height={90}
                                                className="object-cover rounded shadow-md"
                                            />
                                        ) : (
                                            <div className="w-[60px] h-[90px] bg-gray-200 flex items-center justify-center text-xs text-gray-500 rounded shadow-md">
                                                No Cover
                                            </div>
                                        )}
                                    </Link>
                                </td>
                                <td className="py-2 px-3 font-medium text-gray-800">
                                    <Link href={`/dbbook/${book.book_id}`} className="hover:underline">
                                        {book.volumeInfo.title}
                                    </Link>
                                </td>
                                <td className="py-2 px-3 text-gray-600">
                                    {book.volumeInfo.authors?.join(', ') || 'N/A'}
                                </td>
                                <td className="py-2 px-3">
                                    {editingShelfId === book.id ? (
                                        <select
                                            value={selectedShelfType || book.shelf_type}
                                            onChange={(e) => setSelectedShelfType(e.target.value)}
                                            onBlur={() => handleShelfChange(book.id, selectedShelfType || book.shelf_type)}
                                            className="p-1 border rounded"
                                        >
                                            <option value="read">Read</option>
                                            <option value="currently_reading">Currently Reading</option>
                                            <option value="want_to_read">Want to Read</option>
                                        </select>
                                    ) : (
                                        <span onClick={() => {
                                            setEditingShelfId(book.id);
                                            setSelectedShelfType(book.shelf_type);
                                        }} className="cursor-pointer hover:underline">
                                            {book.shelf_type.replace(/_/g, ' ')}
                                        </span>
                                    )}
                                </td>
                                <td className="py-2 px-3">
                                    {book.review_id ? (
                                        <div>
                                            <div className="flex items-center gap-1 mb-1">
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <span
                                                        key={i}
                                                        onClick={() => handleRatingChange(book.book_id, book.id, book.review_data?.id || null, i + 1, book.review_data?.review_text)}
                                                        className="cursor-pointer text-yellow-500"
                                                    >
                                                        {i < (book.review_data?.rating || 0) ? <FaStar /> : <FaRegStar />}
                                                    </span>
                                                ))}
                                                {book.review_data?.rating !== null && (
                                                    <span className="text-gray-600 ml-1">({book.review_data?.rating}/5)</span>
                                                )}
                                            </div>
                                            {displayReviewText && (
                                                <p className="text-sm text-gray-700">
                                                    {truncatedReviewText}
                                                    {displayReviewText.length > MAX_REVIEW_LENGTH && (
                                                        <button
                                                            onClick={() => toggleReviewExpansion(book.id)}
                                                            className="text-blue-500 hover:underline ml-1"
                                                        >
                                                            {isReviewExpanded ? 'Show Less' : 'Read More'}
                                                        </button>
                                                    )}
                                                </p>
                                            )}
                                            <Link
                                                href={`/my-books/edit-review/${book.book_id}?bookshelfEntryId=${book.id}`}
                                                className="text-[#00635d] hover:underline text-sm"
                                            >
                                                Edit review
                                            </Link>
                                        </div>
                                    ) : (
                                        <Link
                                            href={`/my-books/edit-review/${book.book_id}?bookshelfEntryId=${book.id}`}
                                            className="text-[#00635d] hover:underline text-sm"
                                        >
                                            Add review
                                        </Link>
                                    )}
                                </td>
                                <td className="py-2 px-3 hidden lg:table-cell">{new Date(book.date_added).toLocaleDateString()}</td>
                                <td className="py-2 px-3">
                                    <button
                                        onClick={() => handleRemoveClick(book.id)}
                                        className="text-[#00635d] hover:underline text-sm"
                                    >
                                        X
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {books.length === 0 && (
                <p className="text-center text-gray-500 mt-4">No books found on your shelves.</p>
            )}
        </div>
    );
};

export default MyBooksTable;