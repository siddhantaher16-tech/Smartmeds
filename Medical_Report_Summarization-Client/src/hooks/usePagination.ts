import { useState } from 'react';

export interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  itemsPerPage?: number;
}

export function usePagination({
  totalItems,
  initialPage = 1,
  itemsPerPage = 10,
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Ensure current page is within bounds when totalItems changes
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (page: number) => setCurrentPage(Math.min(Math.max(1, page), totalPages));

  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return {
    currentPage: validCurrentPage,
    totalPages,
    startIndex,
    endIndex,
    nextPage,
    prevPage,
    goToPage,
  };
}
