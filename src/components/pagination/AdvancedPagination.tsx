import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  MoreHorizontal
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// #47 - Pagination Avançada

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  className
}: PaginationProps) {
  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  };

  const paginationRange = React.useMemo(() => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, 'dots', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [1, 'dots', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, 'dots', ...middleRange, 'dots', totalPages];
    }

    return range(1, totalPages);
  }, [currentPage, totalPages, siblingCount]);

  if (totalPages <= 1) return null;

  return (
    <nav className={cn('flex items-center gap-1', className)}>
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-9 w-9"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {paginationRange.map((page, index) => {
        if (page === 'dots') {
          return (
            <span key={`dots-${index}`} className="px-2">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </span>
          );
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="icon"
            onClick={() => onPageChange(page as number)}
            className="h-9 w-9"
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-9 w-9"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}
    </nav>
  );
}

// Pagination with page size selector
export function PaginationWithSize({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={cn('flex items-center justify-between gap-4 flex-wrap', className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Mostrando</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map(size => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>de {totalItems} itens</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {startItem}-{endItem} de {totalItems}
        </span>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          siblingCount={1}
        />
      </div>
    </div>
  );
}

// Simple pagination
export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Anterior
      </Button>
      
      <span className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </span>

      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Próximo
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

// Pagination with input
export function PaginationWithInput({
  currentPage,
  totalPages,
  onPageChange,
  className
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  const [inputValue, setInputValue] = useState(String(currentPage));

  useEffect(() => {
    setInputValue(String(currentPage));
  }, [currentPage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(inputValue, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    } else {
      setInputValue(String(currentPage));
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Página</span>
        <Input
          type="number"
          min={1}
          max={totalPages}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-16 h-9 text-center"
        />
        <span className="text-sm text-muted-foreground">de {totalPages}</span>
      </form>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Hook for pagination state
export function usePaginationState({
  totalItems,
  initialPageSize = 20,
  initialPage = 1
}: {
  totalItems: number;
  initialPageSize?: number;
  initialPage?: number;
}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(totalItems / pageSize);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  // Reset to page 1 when total changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return {
    currentPage,
    pageSize,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    startIndex: (currentPage - 1) * pageSize,
    endIndex: Math.min(currentPage * pageSize, totalItems)
  };
}
