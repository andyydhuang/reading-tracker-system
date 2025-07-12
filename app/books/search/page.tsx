// app/books/search/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchResults } from '@/components/SearchResults';
import { supabase } from '@/utils/supabase/client';
import { ApiBook, GoogleBooksApiResponse, ShelfType } from '@/types/index';

// Loading component for Suspense fallback
function SearchPageLoading() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#382110] border-t-transparent"></div>
        </div>
      </div>
    </div>
  );
}

// Main search page component that uses useSearchParams
function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<ApiBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchSearchResults = async (query: string, page: number = 1) => {
    if (!query.trim()) {
      setSearchResults([]);
      setTotalItems(0);
      setSearchTime(0);
      return;
    }

    setIsLoading(true);
    const startTime = performance.now();

    try {
      const startIndex = (page - 1) * 10;

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&startIndex=${startIndex}`
      );
      const data: GoogleBooksApiResponse = await response.json();
      setSearchResults(data.items as any || []);
      setTotalItems(data.totalItems || 0);
      setSearchTime((performance.now() - startTime) / 1000);
    } catch (error) {
      console.error('Error searching books:', error);
      setSearchResults([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchSearchResults(initialQuery);
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchFromResultsPage = async (page?: number, query?: string, isSubjectSearch?: boolean) => {
    if (query) {
      setSearchQuery(query);
      await fetchSearchResults(query, page || 1);
    }
  };

  const handleAddToShelf = async (bookItem: ApiBook, shelfType: ShelfType) => {
    if (!isLoggedIn) {
      console.error('User not logged in. Cannot add to shelf.');
      return;
    }

    try {
      const { data: { user } = { user: null } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No active user session found.');
        return;
      }

      const { volumeInfo, id: google_books_id } = bookItem;

      const { data: existingBook, error: fetchError } = await supabase
        .from('books')
        .select('id')
        .eq('google_books_id', google_books_id)
        .single();

      let bookId: string;

      if (fetchError && fetchError.code === 'PGRST116') {
        const { data: insertedBookData, error: insertError } = await supabase
          .from('books')
          .insert({
            google_books_id: google_books_id,
            title: volumeInfo.title,
            authors: volumeInfo.authors || null,
            description: volumeInfo.description || null,
            cover_image_url: volumeInfo.imageLinks?.thumbnail || null,
            image_small_thumbnail_url: volumeInfo.imageLinks?.smallThumbnail || null,
            publisher: volumeInfo.publisher || null,
            publication_date: volumeInfo.publishedDate || null,
            page_count: volumeInfo.pageCount || null,
            language: volumeInfo.language || null,
            average_rating_google: volumeInfo.averageRating || null,
            ratings_count_google: volumeInfo.ratingsCount || null,
            isbn: volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
                  volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier || null,
            preview_link: volumeInfo.previewLink || null,
            info_link: volumeInfo.infoLink || null,
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Error inserting new book:', insertError.message);
          alert('Failed to add book to your collection: ' + insertError.message);
          return;
        }
        bookId = insertedBookData.id;

        // --- Handle Categories (genres) via book_genres table ---
        if (volumeInfo.categories && volumeInfo.categories.length > 0) {
          for (const categoryName of volumeInfo.categories) {
            let { data: existingGenre, error: genreFetchError } = await supabase
              .from('genres')
              .select('id')
              .eq('name', categoryName)
              .single();

            let genreId: string;

            if (existingGenre) {
              genreId = existingGenre.id;
            } else if (genreFetchError && genreFetchError.code === 'PGRST116') {
              const { data: newGenreData, error: insertGenreError } = await supabase
                .from('genres')
                .insert({ name: categoryName })
                .select('id')
                .single();
              if (insertGenreError) {
                console.error('Error inserting new genre:', insertGenreError.message);
                continue;
              }
              genreId = newGenreData.id;
            } else {
              console.error('Error checking existing genre:', genreFetchError?.message || 'Unknown error');
              continue;
            }

            const { error: bookGenreError } = await supabase
              .from('books_genres')
              .insert({ book_id: bookId, genre_id: genreId });

            if (bookGenreError) {
              console.error(`Error linking book to genre "${categoryName}":`, bookGenreError.message);
            }
          }
        }

        // --- Handle Authors via authors and books_authors tables ---
        if (volumeInfo.authors && volumeInfo.authors.length > 0) {
            for (const authorName of volumeInfo.authors) {
                let { data: existingAuthor, error: authorFetchError } = await supabase
                    .from('authors')
                    .select('id')
                    .eq('name', authorName)
                    .single();

                let authorId: string;

                if (existingAuthor) {
                    authorId = existingAuthor.id;
                } else if (authorFetchError && authorFetchError.code === 'PGRST116') {
                    const { data: newAuthorData, error: insertAuthorError } = await supabase
                        .from('authors')
                        .insert({ name: authorName })
                        .select('id')
                        .single();
                    if (insertAuthorError) {
                        console.error('Error inserting new author:', insertAuthorError.message);
                        continue;
                    }
                    authorId = newAuthorData.id;
                } else {
                    console.error('Error checking existing author:', authorFetchError?.message || 'Unknown error');
                    continue;
                }

                const { error: bookAuthorError } = await supabase
                    .from('books_authors')
                    .insert({ book_id: bookId, author_id: authorId });

                if (bookAuthorError) {
                    console.error(`Error linking book to author "${authorName}":`, bookAuthorError.message);
                }
            }
        }

      } else if (fetchError) {
        console.error('Error checking existing book:', fetchError);
        alert('Failed to check book status: ' + fetchError.message);
        return;
      } else if (existingBook) {
        bookId = existingBook.id;
      } else {
        console.error('Unexpected state: Existing book data is null with no error.');
        alert('An unexpected issue occurred while checking book status.');
        return;
      }

      // Add or update the entry in the 'bookshelves' table
      const { error: bookshelfError } = await supabase
        .from('bookshelves')
        .upsert(
          {
            user_id: user.id,
            book_id: bookId,
            shelf_type: shelfType,
          },
          { onConflict: 'user_id,book_id', ignoreDuplicates: false }
        );

      if (bookshelfError) {
        console.error('Error adding book to shelf:', bookshelfError.message);
        alert('Failed to add book to your shelf: ' + bookshelfError.message);
      } else {
        alert(`Book added to "${shelfType.replace(/_/g, ' ')}" shelf!`);
      }

    } catch (error: any) {
      console.error('An unexpected error occurred:', error.message);
      alert('An unexpected error occurred while adding the book.');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#382110] border-t-transparent"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <SearchResults
            results={searchResults}
            isLoggedIn={isLoggedIn}
            onSearch={handleSearchFromResultsPage}
            currentQuery={searchQuery}
            searchTime={searchTime}
            onAddToShelf={handleAddToShelf}
            currentPage={1}
            hasNextPage={false}
            isLoading={false}
          />
        ) : (
          <div className="text-center py-8 text-gray-600">
            {initialQuery ? `No books found for "${initialQuery}"` : "Search for books using the bar in the navigation."}
          </div>
        )}
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchPageContent />
    </Suspense>
  );
}