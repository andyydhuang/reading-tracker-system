import React, { useState } from 'react';

interface CurrentlyReadingProps {
  onSearch: (query: string) => void;
}

export function CurrentlyReading({ onSearch }: CurrentlyReadingProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">CURRENTLY READING</h2>
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 flex items-center justify-center">
            <img
              src="https://s.gr-assets.com/assets/react_components/shelf_display/icn_default_wtr_leftrail-62c079d4573e5db15651d273fc72d1d2.svg"
              alt="Book icon"
              className="w-12 h-12"
            />
          </div>
          <p className="text-lg">What are you reading?</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search books"
            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-gray-600"
            onClick={handleSearch}
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}