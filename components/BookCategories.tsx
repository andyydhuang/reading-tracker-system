// components/BookCategories.tsx
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { SearchIcon } from 'lucide-react';
import { SearchResults } from './SearchResults';
import { Pagination } from './Pagination';

interface BookCategoriesProps {
  isLoggedIn?: boolean;
}

import { GoogleBooksApiResponse } from '@/types/index';

type SearchField = 'all' | 'title' | 'author' | 'isbn';

export function BookCategories({ isLoggedIn = false }: BookCategoriesProps) {
  const categories = useMemo(() => ['Art', 'Biography', 'Business', "Children's", 'Christian', 'Classics', 'Comics', 'Cookbooks', 'Ebooks', 'Fantasy', 'Fiction', 'Graphic Novels', 'Historical Fiction', 'History', 'Horror', 'Memoir', 'Music', 'Mystery', 'Nonfiction', 'Poetry', 'Psychology', 'Romance', 'Science', 'Science Fiction', 'Self Help', 'Sports', 'Thriller', 'Travel', 'Young Adult'], []);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoogleBooksApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchField, setSearchField] = useState<SearchField>('all');

  const searchResultsRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 10;

  const getFormattedSearchTerm = useCallback((query: string, field: SearchField) => {
    switch (field) {
      case 'title':
        return `intitle:${query}`;
      case 'author':
        return `inauthor:${query}`;
      case 'isbn':
        return `isbn:${query}`;
      case 'all':
      default:
        return query;
    }
  }, []);

  const handleSearch = useCallback(async (page = 1, query = searchQuery, isSubjectSearch = false) => {
    if (!query.trim()) {
      setHasSearched(false);
      setSearchResults(null);
      setSelectedCategory(null);
      setHasNextPage(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    if (!isSubjectSearch) {
      setSelectedCategory(null);
    } else {
      setSearchField('all');
    }

    try {
      const startIndex = (page - 1) * itemsPerPage;
      let finalSearchTerm = '';

      if (isSubjectSearch) {
        finalSearchTerm = `subject:${query.toLowerCase()}`;
      } else {
        finalSearchTerm = getFormattedSearchTerm(query, searchField);
      }

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(finalSearchTerm)}&maxResults=${itemsPerPage}&startIndex=${startIndex}`
      );
      const data: GoogleBooksApiResponse = await response.json();

      setSearchResults(data);
      setCurrentPage(page);
      setHasNextPage((data.items?.length || 0) === itemsPerPage);

    } catch (error) {
      console.error('Error searching books:', error);
      setSearchResults(null);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, itemsPerPage, searchField, getFormattedSearchTerm]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(1, searchQuery, false);
    }
  }, [handleSearch, searchQuery]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
  }, []);

  const handleSearchFieldChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchField(e.target.value as SearchField);
    if (searchQuery.trim()) {
        handleSearch(1, searchQuery, false);
    }
  }, [searchQuery, handleSearch]);

  const handlePageChange = (page: number) => {
    if (selectedCategory) {
      handleSearch(page, selectedCategory, true);
    } else {
      handleSearch(page, searchQuery, false);
    }

    if (searchResultsRef.current) {
        searchResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCategoryClick = (category: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedCategory(category);
    setSearchQuery('');
    setSearchField('all');
    handleSearch(1, category, true);
  };

  useEffect(() => {
    if (hasSearched && searchResults?.items && !isLoading && searchResultsRef.current) {
      searchResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [searchResults, hasSearched, isLoading]);

  const renderSearchInput = useMemo(() => (
    <div className="max-w-lg mx-auto relative mb-4">
      <input
        type="text"
        placeholder="Search books..."
        className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#382110]"
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <button
        onClick={() => handleSearch(1, searchQuery, false)}
        className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
        disabled={isLoading}
      >
        <SearchIcon className="h-5 w-5" />
      </button>
    </div>
  ), [searchQuery, handleInputChange, handleKeyDown, handleSearch, isLoading]);

  const renderSearchOptions = useMemo(() => (
    <div className="max-w-lg mx-auto flex justify-center space-x-4 mb-10 text-gray-700">
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="radio"
          name="searchField"
          value="all"
          checked={searchField === 'all'}
          onChange={handleSearchFieldChange}
          className="form-radio text-[#382110] h-4 w-4"
        />
        <span>All</span>
      </label>
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="radio"
          name="searchField"
          value="title"
          checked={searchField === 'title'}
          onChange={handleSearchFieldChange}
          className="form-radio text-[#382110] h-4 w-4"
        />
        <span>Title</span>
      </label>
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="radio"
          name="searchField"
          value="author"
          checked={searchField === 'author'}
          onChange={handleSearchFieldChange}
          className="form-radio text-[#382110] h-4 w-4"
        />
        <span>Author</span>
      </label>
      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="radio"
          name="searchField"
          value="isbn"
          checked={searchField === 'isbn'}
          onChange={handleSearchFieldChange}
          className="form-radio text-[#382110] h-4 w-4"
        />
        <span>ISBN</span>
      </label>
    </div>
  ), [searchField, handleSearchFieldChange]);


  const CategoriesGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {categories.map(category => (
        <a
          key={category}
          href="#"
          onClick={handleCategoryClick(category)}
          className={`text-[#0E7C7B] hover:underline font-medium ${
            selectedCategory === category ? 'underline font-bold' : ''
          }`}
        >
          {category}
        </a>
      ))}
      <a href="#" className="text-[#0E7C7B] hover:underline font-medium">
        More genres
      </a>
    </div>
  );

  return (
    <>
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#382110] mb-8">
            Search and browse books
          </h2>
          {renderSearchInput}
          {renderSearchOptions}
          {!isLoggedIn && <CategoriesGrid />}
        </div>
      </section>

      {isLoading && (
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#382110] border-t-transparent"></div>
        </div>
      )}

      <div ref={searchResultsRef}>
        {!isLoading && (searchResults?.items || hasSearched) && (
          <>
            {searchResults?.items && searchResults.items.length > 0 ? (
              <>
                {selectedCategory && !searchQuery && (
                  <div className="container mx-auto px-4 mt-4">
                    <h2 className="text-2xl font-bold text-[#382110]">
                      {selectedCategory} Books
                    </h2>
                  </div>
                )}
                <SearchResults
                  results={searchResults.items as any}
                  isLoggedIn={isLoggedIn}
                  onSearch={handleSearch}
                  currentQuery={searchQuery || selectedCategory || ''}
                  currentPage={currentPage}
                  hasNextPage={hasNextPage}
                  isLoading={isLoading}
                  onAddToShelf={() => { }}
                />
                <Pagination
                  currentPage={currentPage}
                  hasNextPage={hasNextPage}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              hasSearched && (
                <div className="container mx-auto px-4">
                  <div className="text-center text-gray-600 mb-8">
                    No books found {selectedCategory ? `in ${selectedCategory}` : `for "${searchQuery}"`}
                  </div>
                  <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-xl font-semibold text-[#382110] mb-6 text-center">
                      Browse these categories instead
                    </h3>
                    {!isLoggedIn && <CategoriesGrid />}
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </>
  );
}