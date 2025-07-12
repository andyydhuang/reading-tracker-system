import React, { useState } from 'react';
import Link from 'next/link';

interface SearchSectionProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export function SearchSection({ onSearch, initialQuery = '' }: SearchSectionProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<'all' | 'title' | 'author'>('all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="bg-[#eeeeee] border-b border-[#dddddd]">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 py-4">
          <div className="flex-grow max-w-3xl">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search by Book Title, Author, or ISBN"
                className="flex-grow px-4 py-2 border border-[#DCD6CC] rounded focus:outline-none focus:border-[#BBB6AE] bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="px-6 py-2 bg-[#F4F1EA] border border-[#D6D0C4] rounded hover:bg-[#EDE6D6] text-[#333333] font-medium"
              >
                Search
              </button>
            </form>
            <div className="mt-2 flex items-center text-sm text-[#382110]">
              <span className="mr-2">fields to search:</span>
              <label className="flex items-center gap-1 mr-4">
                <input
                  type="radio"
                  name="searchType"
                  checked={searchType === 'all'}
                  onChange={() => setSearchType('all')}
                  className="text-[#382110] focus:ring-[#382110]"
                />
                <span>all</span>
              </label>
              <label className="flex items-center gap-1 mr-4">
                <input
                  type="radio"
                  name="searchType"
                  checked={searchType === 'title'}
                  onChange={() => setSearchType('title')}
                  className="text-[#382110] focus:ring-[#382110]"
                />
                <span>title</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="searchType"
                  checked={searchType === 'author'}
                  onChange={() => setSearchType('author')}
                  className="text-[#382110] focus:ring-[#382110]"
                />
                <span>author</span>
              </label>
            </div>
          </div>
        </div>
        <nav className="flex gap-8 border-b border-[#dddddd]">
          <Link 
            href="#" 
            className="px-4 py-2 text-[#382110] font-medium border-b-2 border-[#382110] -mb-[1px]"
          >
            Books
          </Link>
          <Link 
            href="#" 
            className="px-4 py-2 text-[#382110] hover:text-[#000000]"
          >
            Groups
          </Link>
          <Link 
            href="#" 
            className="px-4 py-2 text-[#382110] hover:text-[#000000]"
          >
            Quotes
          </Link>
          <Link 
            href="#" 
            className="px-4 py-2 text-[#382110] hover:text-[#000000]"
          >
            People
          </Link>
          <Link 
            href="#" 
            className="px-4 py-2 text-[#382110] hover:text-[#000000]"
          >
            Listopia
          </Link>
        </nav>
      </div>
    </div>
  );
} 