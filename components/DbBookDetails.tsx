// components/DbBookDetails.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { BookDetailFromDB } from '@/types/index';

interface DbBookDetailsProps {
  book: BookDetailFromDB;
}

export const DbBookDetails: React.FC<DbBookDetailsProps> = ({ book }) => {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-[#382110]">{book.title || 'Untitled Book'}</h1>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {book.cover_image_url ? (
          <div className="flex-shrink-0">
            <Image
              src={book.cover_image_url}
              alt={`Cover of ${book.title}`}
              width={200}
              height={300}
              className="rounded shadow-lg"
            />
          </div>
        ) : (
          <div
            className="flex-shrink-0 w-[200px] h-[300px] bg-gray-200 flex items-center justify-center text-gray-500 rounded shadow-lg text-sm"
          >
            No Cover Available
          </div>
        )}
        <div className="flex-grow">
          <p className="text-gray-700 mb-2">
            <span className="font-semibold text-gray-800">Author(s):</span> {book.authors?.join(', ') || 'N/A'}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold text-gray-800">Publisher:</span> {book.publisher || 'N/A'}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold text-gray-800">Publication Date:</span> {book.publication_date || 'N/A'}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold text-gray-800">Pages:</span> {book.page_count || 'N/A'}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold text-gray-800">ISBN:</span> {book.isbn || 'N/A'}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold text-gray-800">Language:</span> {book.language?.toUpperCase() || 'N/A'}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold text-gray-800">Google Average Rating:</span> {book.average_rating_google?.toFixed(2) || 'N/A'}
          </p>
          <p className="text-gray-700 mb-4">
            <span className="font-semibold text-gray-800">Google Ratings Count:</span> {book.ratings_count_google || 'N/A'}
          </p>

          {book.is_on_shelf && (
            <>
              <h2 className="text-xl font-semibold mb-2 text-[#382110]">My Shelf Details</h2>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold text-gray-800">My Rating:</span> {book.rating ? `${book.rating} / 5` : 'Not rated'}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold text-gray-800">Shelf:</span> {book.shelf_type?.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'N/A'}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold text-gray-800">Date Added to Shelf:</span> {book.date_added ? new Date(book.date_added).toLocaleDateString() : 'N/A'}
              </p>
              {book.date_started && (
                 <p className="text-gray-700 mb-2">
                   <span className="font-semibold text-gray-800">Date Started:</span> {new Date(book.date_started).toLocaleDateString()}
                 </p>
              )}
              {book.date_finished && (
                 <p className="text-gray-700 mb-2">
                   <span className="font-semibold text-gray-800">Date Finished:</span> {new Date(book.date_finished).toLocaleDateString()}
                 </p>
              )}
              {book.review_text && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-1 text-[#382110]">My Review</h3>
                  <p className="text-gray-800 leading-relaxed">{book.review_text}</p>
                </div>
              )}
            </>
          )}

          {/* General book description */}
          {book.description && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2 text-[#382110]">Description</h2>
              <div
                className="text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: book.description }}
              />
            </div>
          )}

          {/* External Links */}
          {(book.preview_link || book.info_link) && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2 text-[#382110]">External Links</h2>
              {book.preview_link && (
                <p className="mb-1">
                  <a href={book.preview_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Google Books Preview
                  </a>
                </p>
              )}
              {book.info_link && (
                <p>
                  <a href={book.info_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Google Books Info Page
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};