import React from 'react';

interface PaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, hasNextPage, onPageChange }: PaginationProps) {
  return (
    <div className="flex justify-center items-center gap-1 mt-8 text-sm">
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="text-[#00635d] hover:underline mr-2"
        >
          « Previous
        </button>
      )}

      <span className="px-1 text-[#333333] font-bold">
        {currentPage}
      </span>

      {hasNextPage && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="text-[#00635d] hover:underline ml-2"
        >
          Next »
        </button>
      )}
    </div>
  );
}