// components/Header.tsx

import React, { useState, useEffect } from 'react';
import { SearchIcon, HomeIcon } from 'lucide-react';
import { SearchResults } from './SearchResults';
import { SearchSection } from './SearchSection';
import Link from 'next/link';
import { ProfileMenu } from './ProfileMenu';
import { ApiBook, GoogleBooksApiResponse, ShelfType } from '@/types/index';

interface HeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
  onSignOut?: () => void;
  currentPath?: string;
  onAddToShelf: (bookItem: ApiBook, shelfType: ShelfType) => void;
}


export function Header({
  isLoggedIn = false,
  userName = '',
  onSignOut,
  currentPath,
  onAddToShelf,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoogleBooksApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchSection, setShowSearchSection] = useState(false);
  const [searchTime, setSearchTime] = useState(0);

  const pathsToHideElements: string[] = [];
  const hideHeaderElements = pathsToHideElements.includes(currentPath || '');

  useEffect(() => {
    console.log('Header - Current path (from prop):', currentPath);
  }, [currentPath]);


  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    setSearchQuery(query);
    setShowSearchSection(true);
    setIsLoading(true);
    const startTime = performance.now();

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`
      );
      const data: GoogleBooksApiResponse = await response.json();
      setSearchResults(data);
      setSearchTime((performance.now() - startTime) / 1000);
    } catch (error) {
      console.error('Error searching books:', error);
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  return (
    <>
      <header className="bg-[#f9f7f1] border-b border-gray-200 py-1">
        <div className="container mx-auto flex items-center justify-between px-4">
          {!hideHeaderElements ? (
            <>
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="text-[#382110] font-serif text-3xl mr-4 flex items-center"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults(null);
                    setShowSearchSection(false);
                  }}
                >
                  <HomeIcon className="mr-2 h-7 w-7" />
                  YH Reading Tracker
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                {isLoggedIn && (
                  <ProfileMenu userName={userName} onSignOut={onSignOut || (() => {})} />
                )}
              </div>
            </>
          ) : (
            <div className="h-10 w-full"></div>
          )}
        </div>
      </header>

      {showSearchSection && (
        <SearchSection onSearch={handleSearch} initialQuery={searchQuery} />
      )}

      {isLoading && (
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#382110] border-t-transparent"></div>
        </div>
      )}

      {!isLoading && searchResults?.items && searchResults.items.length > 0 && (
        <SearchResults
          results={searchResults.items as any}
          isLoggedIn={isLoggedIn}
          onSearch={async (page?: number, query?: string, isSubjectSearch?: boolean) => {
            if (query) {
              await handleSearch(query);
            }
          }}
          currentQuery={searchQuery}
          searchTime={searchTime}
          onAddToShelf={onAddToShelf}
          currentPage={1}
          hasNextPage={false}
          isLoading={false}
        />
      )}

      {!isLoading && searchResults?.items && searchResults.items.length === 0 && (
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          No books found for "{searchQuery}"
        </div>
      )}
    </>
  );
}