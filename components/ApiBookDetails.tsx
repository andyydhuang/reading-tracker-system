// components/ApiBookDetails.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { StarIcon, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { GoogleBookDetails } from '@/types/index';

interface ApiBookDetailsProps {
  book: GoogleBookDetails;
  isLoggedIn?: boolean;
}

export function ApiBookDetails({ book, isLoggedIn = false }: ApiBookDetailsProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllGenres, setShowAllGenres] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const genresContainerRef = useRef<HTMLDivElement>(null);

  const { volumeInfo } = book;
  const rating = volumeInfo.averageRating || 0;

  const descriptionTextRef = useRef<HTMLDivElement>(null);
  const [isDescriptionOverflowing, setIsDescriptionOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (genresContainerRef.current) {
        const hasVerticalOverflow = genresContainerRef.current.scrollHeight > genresContainerRef.current.clientHeight;
        setHasOverflow(hasVerticalOverflow);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [volumeInfo.categories]);

  useEffect(() => {
    if (descriptionTextRef.current && volumeInfo.description) {
      const originalClassName = descriptionTextRef.current.className;
      descriptionTextRef.current.className = originalClassName.replace('line-clamp-4', '').trim();

      const fullContentHeight = descriptionTextRef.current.scrollHeight;
      const visibleHeight = descriptionTextRef.current.clientHeight;

      descriptionTextRef.current.className = originalClassName; 

      setIsDescriptionOverflowing(fullContentHeight > visibleHeight);
    }
  }, [volumeInfo.description, showFullDescription]);

  return (
    <div className="min-h-screen">

      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-2 py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left Column */}
            <div className="md:col-span-3 pl-0">
              <div className="sticky top-8 pl-0 flex flex-col items-center">
                <div className="w-[180px]">
                  <img
                    src={volumeInfo.imageLinks?.thumbnail || '/placeholder-book.png'}
                    alt={volumeInfo.title}
                    className="w-full shadow-lg mb-4"
                  />
                  <button className="w-full bg-[#3d8149] text-white py-2 px-4 rounded mb-2 flex items-center justify-center">
                    <span>Want to Read</span>
                    <span className="ml-2">▼</span>
                  </button>
                  <div className="text-center mb-4">
                    <div className="flex justify-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`h-6 w-6 ${
                            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">Rate this book</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-9">
              <div className="mb-6">
                <h1 className="text-[42px] font-bold text-[#382110] leading-tight mb-1">
                  {volumeInfo.title}
                </h1>
                {volumeInfo.subtitle && (
                  <h2 className="text-2xl text-gray-600 mb-2">{volumeInfo.subtitle}</h2>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">by</span>
                  <Link href={`/author/${encodeURIComponent(volumeInfo.authors?.[0] || '')}`} className="text-lg text-[#382110] hover:underline">
                    {volumeInfo.authors?.[0] || 'Unknown Author'}
                  </Link>
                  {volumeInfo.authors?.[0] && (
                    <span className="w-4 h-4 bg-[#382110] text-white rounded-full text-xs flex items-center justify-center" title="Verified author">
                      ✓
                    </span>
                  )}
                </div>
              </div>

              {/* Rating Statistics */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-6 w-6 ${
                          star <= rating ? 'text-[#FA8F3D] fill-[#FA8F3D]' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-[32px] font-bold text-[#333333] ml-2">{rating.toFixed(2)}</div>
                </div>
                <div className="text-[14px] text-gray-600">
                  {volumeInfo.ratingsCount?.toLocaleString() || 0} ratings · {volumeInfo.pageCount || 0} reviews
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Description</h3>
                <div
                  ref={descriptionTextRef}
                  className={`prose max-w-none text-[#333333] ${!showFullDescription ? 'line-clamp-4' : ''}`}
                >
                  {volumeInfo.description ? (
                    <>
                      {/* Use ReactMarkdown */}
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]} // Support GitHub Flavored Markdown
                        rehypePlugins={[rehypeRaw]} // Allow raw HTML inside markdown
                      >
                        {volumeInfo.description}
                      </ReactMarkdown>

                      {isDescriptionOverflowing && (
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="text-[#00635D] hover:underline font-semibold flex items-center mt-2"
                        >
                          {showFullDescription ? 'Show less' : 'Show more'}
                          <ChevronDown
                            className={`ml-1 w-4 h-4 transform transition-transform ${
                              showFullDescription ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      )}
                    </>
                  ) : (
                    'No description available.'
                  )}
                </div>
              </div>

              {/* Genres */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Genres</h3>
                <div className="inline-flex items-center max-w-full">
                  <div
                    ref={genresContainerRef}
                    className={`inline ${!showAllGenres ? 'h-[28px] overflow-hidden' : ''}`}
                  >
                    <div className="flex flex-wrap">
                      {volumeInfo.categories?.map((category, index) => (
                        <span
                          key={index}
                          className="text-[#333333] whitespace-nowrap mr-2"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                  {!showAllGenres && hasOverflow && (
                    <button
                      onClick={() => setShowAllGenres(true)}
                      className="text-[#333333] border-b-2 border-[#3d8149] hover:border-[#2c5d34] whitespace-nowrap inline-block"
                    >
                      ...more
                    </button>
                  )}
                </div>
              </div>

              {/* This edition */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">This edition</h3>
                <div className="grid grid-cols-[100px_1fr] gap-y-3 text-[#333333]">
                  <div>Format</div>
                  <div>{volumeInfo.pageCount} pages, {volumeInfo.printType || 'Paperback'}</div>

                  <div>Published</div>
                  <div>{new Date(volumeInfo.publishedDate || '').toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })} by {volumeInfo.publisher}</div>

                  <div>ISBN</div>
                  <div>
                    {volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier || 'N/A'}
                    {volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10') &&
                      ` (ISBN10: ${volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10')?.identifier})`
                    }
                  </div>

                  <div>ASIN</div>
                  <div>{volumeInfo.industryIdentifiers?.find(id => id.type === 'OTHER')?.identifier || 'N/A'}</div>

                  <div>Language</div>
                  <div>{volumeInfo.language === 'en' ? 'English' : volumeInfo.language}</div>
                </div>
              </div>

              {/* Reading Stats */}
              <div className="border-t border-b border-gray-200 py-6">
                <div className="flex justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <img src="/avatar1.jpg" alt="Reader" className="w-8 h-8 rounded-full border-2 border-white" />
                      <img src="/avatar2.jpg" alt="Reader" className="w-8 h-8 rounded-full border-2 border-white" />
                      <img src="/avatar3.jpg" alt="Reader" className="w-8 h-8 rounded-full border-2 border-white" />
                    </div>
                    <span className="text-[#333333]">1385 people are currently reading</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <img src="/avatar4.jpg" alt="Reader" className="w-8 h-8 rounded-full border-2 border-white" />
                      <img src="/avatar5.jpg" alt="Reader" className="w-8 h-8 rounded-full border-2 border-white" />
                      <img src="/avatar6.jpg" alt="Reader" className="w-8 h-8 rounded-full border-2 border-white" />
                    </div>
                    <span className="text-[#333333]">5832 people want to read</span>
                  </div>
                </div>
              </div>

              {/* Ratings & Reviews */}
              <div className="py-12 border-b border-gray-200">
                <h2 className="text-[32px] font-bold text-[#333333] mb-8">Ratings & Reviews</h2>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-[#F4F1EA] rounded-full mb-4 flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#BBB6AE]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-[28px] mb-8">What do <em className="font-serif not-italic">you</em> think?</h3>
                  <div className="flex items-center gap-8">
                    <div className="flex flex-col items-center">
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            className="text-gray-300 hover:text-[#f5a623]"
                          >
                            <StarIcon className="w-8 h-8" />
                          </button>
                        ))}
                      </div>
                      <p className="text-[15px] text-[#333333]">Rate this book</p>
                    </div>
                    <button className="bg-[#333333] text-white px-8 py-3 rounded-full text-[15px] font-medium hover:bg-[#1a1a1a]">
                      Write a Review
                    </button>
                  </div>
                </div>
              </div>

              {/* Community Reviews */}
              <div className="py-12">
                <h2 className="text-[32px] font-bold text-[#333333] mb-6">Community Reviews</h2>
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((star) => (
                      <StarIcon key={star} className="w-8 h-8 text-[#FA8F3D] fill-[#FA8F3D]" />
                    ))}
                    <StarIcon className="w-8 h-8 text-gray-200 fill-gray-200" />
                  </div>
                  <span className="text-[32px] font-bold text-[#333333]">4.02</span>
                </div>
                <div className="text-[#333333] mb-8">
                  278,633 ratings · 15,902 reviews
                </div>

                <div className="space-y-2 max-w-2xl mb-8">
                  {[
                    { stars: 5, count: 92827, percentage: 33 },
                    { stars: 4, count: 115343, percentage: 41 },
                    { stars: 3, count: 56103, percentage: 20 },
                    { stars: 2, count: 11474, percentage: 4 },
                    { stars: 1, count: 2886, percentage: 1 }
                  ].map((rating) => (
                    <div key={rating.stars} className="flex items-center gap-4">
                      <div className="w-16">
                        <button className="text-[#333333] hover:underline font-medium">
                          {rating.stars} stars
                        </button>
                      </div>
                      <div className="flex-1 h-4 bg-[#F6F7F7] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FA8F3D] rounded-full"
                          style={{ width: `${rating.percentage}%` }}
                        />
                      </div>
                      <div className="w-32 text-[#333333]">
                        {rating.count.toLocaleString()} ({rating.percentage}%)
                      </div>
                    </div>
                  ))}
                </div>

                {/* Search and Filters */}
                <div className="flex gap-4 max-w-2xl">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search review text"
                      className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-gray-400"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <button className="px-6 py-3 rounded-full border border-gray-300 hover:border-gray-400 flex items-center gap-2">
                    <svg className="w-5 h-5 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    Filters
                  </button>
                </div>

                {/* Reviews List */}
                <div className="mt-8">
                  <div className="text-[#333333] mb-6">
                    Displaying 1 - 30 of 15,901 reviews
                  </div>

                  {/* Individual Review */}
                  <div className="border-b border-gray-200 pb-8 mb-8">
                    <div className="flex gap-6">
                      {/* Left Column - User Info */}
                      <div className="w-40">
                        <div className="flex flex-col items-center">
                          <img
                            src="/avatar-anna.jpg"
                            alt="Anna's profile"
                            className="w-16 h-16 rounded-full mb-3"
                          />
                          <h3 className="text-lg font-medium mb-1">Anna</h3>
                          <div className="text-sm text-gray-600 text-center">
                            <div>100 reviews</div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Review Content */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                className="w-6 h-6 text-[#FA8F3D] fill-[#FA8F3D]"
                              />
                            ))}
                          </div>
                          <time className="text-gray-600">December 4, 2013</time>
                        </div>

                        <div className="mb-4">
                          <p className="text-[#333333] mb-4">
                            After finishing the Namesake, my thoughts were drawn to my last roommate in college,
                            an Indian woman studying for her PHD in Psychology. When I first moved in, she had
                            just broken up with her white boyfriend. "It never would have worked out anyway..."
                            she had cried. By the end of that same year she was flying of to Houston to be wed to
                            a man she had only seen once, a marriage arranged by their parents. Many nights my...
                          </p>
                          <button className="text-[#382110] hover:underline font-medium flex items-center">
                            Show more
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </button>
                        </div>

                        {/* Interactions */}
                        <div className="flex flex-col gap-2">
                          <div className="text-gray-600 text-sm">
                            719 likes · 30 comments
                          </div>
                          <div className="flex gap-6">
                            <button className="flex items-center gap-2 text-[#333333] hover:text-[#1a1a1a]">
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              Like
                            </button>
                            <button className="flex items-center gap-2 text-[#333333] hover:text-[#1a1a1a]">
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              Comment
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}