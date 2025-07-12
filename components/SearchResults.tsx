// components/SearchResults.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Star, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ApiBook, SearchResultsProps, ShelfType } from '@/types/index';

export function SearchResults({
  results: initialResults,
  isLoggedIn = false,
  onSearch,
  currentQuery,
  searchTime: initialSearchTime = 0.1,
  onAddToShelf,
  currentPage,
  hasNextPage,
  isLoading,
}: SearchResultsProps) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [results, setResults] = useState<ApiBook[]>(initialResults);
  const [searchTime, setSearchTime] = useState(initialSearchTime);

  const router = useRouter();
  const pathname = usePathname();

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setResults(initialResults);
    setSearchTime(initialSearchTime);
  }, [initialResults, initialSearchTime]);

  const handleShelfSelect = (
    bookItem: ApiBook,
    shelf: ShelfType
  ) => {
    if (!isLoggedIn) {
      router.push('/signin');
      return;
    }

    onAddToShelf(bookItem, shelf);
    setOpenDropdownId(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#382110] border-t-transparent"></div>
        </div>
      ) : (
        <>
          {results.length > 0 ? (
            <>
              <div className="text-sm text-[#382110] mb-6">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                {((currentPage - 1) * ITEMS_PER_PAGE) + results.length} results ({searchTime.toFixed(2)} seconds)
              </div>

              <div className="space-y-6">
                {results.map((item) => {
                  const book = item.volumeInfo;
                  const authors = book.authors ? book.authors.join(', ') : 'Unknown';
                  const thumbnail =
                    book.imageLinks?.thumbnail ||
                    book.imageLinks?.smallThumbnail ||
                    'https://via.placeholder.com/128x180?text=No+Image';
                  const publishedDate = book.publishedDate
                    ? book.publishedDate.substring(0, 4)
                    : 'Unknown';
                  const rating = book.averageRating || 0;
                  const ratingsCount = book.ratingsCount || 0;

                  return (
                    <div key={item.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <Link
                          href={`/apibook/${item.id}`}
                          onClick={() =>
                            console.log('Navigating to:', `/apibook/${item.id}`, 'Book ID:', item.id)
                          }
                        >
                          <img
                            src={thumbnail}
                            alt={book.title}
                            className="w-[98px] h-[148px] object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          />
                        </Link>
                      </div>
                      <div className="flex-grow">
                        <Link
                          href={`/apibook/${item.id}`}
                          onClick={() =>
                            console.log('Navigating to:', `/apibook/${item.id}`, 'Book ID:', item.id)
                          }
                        >
                          <h3 className="text-lg font-bold text-[#382110] hover:underline cursor-pointer">
                            {book.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">by {authors}</p>

                        <div className="flex items-center mt-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= rating
                                    ? 'fill-[#f5a623] text-[#f5a623]'
                                    : 'fill-gray-200 text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-[#999999]">
                            {rating.toFixed(2)} avg rating — {ratingsCount.toLocaleString()} ratings —
                            published {publishedDate} — {book.pageCount || 0} pages
                          </span>
                        </div>

                        <div className="mt-4">
                          <div className="relative inline-block">
                            <button
                              className={`bg-[#409D69] text-white px-4 py-2 rounded flex items-center gap-2 min-w-[140px] hover:bg-[#318456] ${
                                openDropdownId === item.id ? 'rounded-b-none' : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                              }}
                            >
                              Want to Read
                              <ChevronDown className="w-4 h-4 ml-auto" />
                            </button>

                            {openDropdownId === item.id && (
                              <div className="absolute z-10 w-full bg-white shadow-md rounded-b">
                                <div role="menu" aria-orientation="vertical">
                                  {['want_to_read', 'currently_reading', 'read'].map((shelf) => (
                                    <button
                                      key={shelf}
                                      className="block w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleShelfSelect(
                                          item,
                                          shelf as ShelfType
                                        );
                                      }}
                                    >
                                      {shelf
                                        .replace(/_/g, ' ')
                                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-600">
              No books found for "{currentQuery}"
            </div>
          )}
        </>
      )}
    </div>
  );
}