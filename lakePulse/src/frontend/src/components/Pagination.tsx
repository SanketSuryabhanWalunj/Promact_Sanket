/**
 * @file Pagination.tsx
 * @description A reusable pagination component that handles page navigation and display
 * of page numbers with ellipsis for large page counts.
 */

import { APP_STRINGS } from '../constants/strings';
import React from 'react';

/**
 * Props interface for Pagination component
 * @interface PaginationProps
 */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Pagination Component
 * @component
 * @param {PaginationProps} props - Component props for pagination control
 * @returns {JSX.Element} Rendered pagination controls
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  /**
   * Generates an array of page numbers to display
   * Includes first page, last page, current page and surrounding pages
   * @returns {(number|string)[]} Array of page numbers and ellipsis
   */
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    // Always show first page
    pages.push(1);

    // Calculate range of pages around current page
    let start = Math.max(2, currentPage - Math.floor(maxPagesToShow / 2));
    const end = Math.min(totalPages - 1, start + maxPagesToShow - 1);

    // Adjust start if end is too close to totalPages
    if (end === totalPages - 1) {
      start = Math.max(2, end - maxPagesToShow + 1);
    }

    // Add ellipsis and pages
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < totalPages - 1) pages.push('...');

    // Always show last page if there is more than one page
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-2 my-4">
      {/* Previous page button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 bg-gray-100`}
      >
       <i className="fa-thin fa-chevron-left"></i>
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`px-3 py-1 rounded border ${
            page === currentPage
              ? 'bg-blue-500 text-white'
              : page === '...'
              ? 'bg-gray-100 text-gray-600 cursor-default'
              : 'hover:bg-gray-100'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next page button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100`}
      >
       <i className="fa-thin fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default Pagination;
