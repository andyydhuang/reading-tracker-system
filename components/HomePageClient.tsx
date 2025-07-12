// components/HomePageClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CurrentlyReading } from './CurrentlyReading';
import { Bookshelves } from './Bookshelves';
import { SearchResults } from './SearchResults';
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '../context/AuthContext';
import { BookCategories } from "./BookCategories";

interface ShelfItem {
  name: string;
  count: number;
  type: string;
}

import { GoogleBooksApiResponse } from '@/types/index';

interface HomePageClientProps {
    shelfCounts: ShelfItem[];
}

export default function HomePageClient({ shelfCounts }: HomePageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<GoogleBooksApiResponse | null>(null);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTime, setSearchTime] = useState<number>(0);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleAddToShelf = async (bookData: any, shelfType: string) => {
    setIsActionLoading(true);
    console.log('Adding book ${bookData.title} to shelf ${shelfType}');
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsActionLoading(false);
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <p className="ml-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f7f1]">
      <div className="container mx-auto px-4 py-6">
        {isLoading || isActionLoading ? (
          <div className="flex justify-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#382110] border-t-transparent"></div>
          </div>
        ) : (
          showSearchResults && searchResults && searchResults.items ? (
            <SearchResults
              results={searchResults.items as any}
              isLoggedIn={!!user}
              onSearch={async () => { }}
              currentQuery={currentQuery}
              searchTime={searchTime}
              onAddToShelf={handleAddToShelf}
              currentPage={1}
              hasNextPage={false}
              isLoading={false}
            />
          ) : (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-3">
                <div className="mt-6">
                  <Bookshelves shelves={shelfCounts} />
                </div>
              </div>
              <div className="col-span-9">
                <BookCategories isLoggedIn={!!user} />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}