import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const startPages = [1, 2];
    const endPages = [totalPages - 1, totalPages];
    const adjacentPages = [currentPage - 1, currentPage, currentPage + 1];

    const allPages = [...new Set([...startPages, ...adjacentPages, ...endPages])]
      .filter(p => p > 0 && p <= totalPages)
      .sort((a, b) => a - b);
    
    let lastPage = 0;
    for (const page of allPages) {
        if (lastPage) {
            if (page - lastPage > 1) {
                pages.push('...');
            }
        }
        pages.push(page);
        lastPage = page;
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const sharedBtnClasses = "min-w-[38px] h-9 px-3 flex items-center justify-center rounded-md border text-sm font-medium transition-colors";
  const pageBtnClass = `${sharedBtnClasses} border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700`;
  const activePageBtnClass = `${sharedBtnClasses} border-sky-600 bg-sky-600 text-white cursor-default`;
  const prevNextBtnClass = `${sharedBtnClasses} border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed`;
  const dotsSpanClass = "flex items-center justify-center h-9 w-9 text-gray-500 dark:text-gray-400";

  return (
    <nav className="flex justify-center items-center space-x-1 sm:space-x-2 mt-8" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={prevNextBtnClass}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {pageNumbers.map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={currentPage === page ? activePageBtnClass : pageBtnClass}
            aria-current={currentPage === page ? 'page' : undefined}
            disabled={currentPage === page}
          >
            {page}
          </button>
        ) : (
          <span key={index} className={dotsSpanClass}>
            ...
          </span>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={prevNextBtnClass}
        aria-label="Next page"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </nav>
  );
};

export default Pagination;