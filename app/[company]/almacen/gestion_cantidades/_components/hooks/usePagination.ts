import { useState, useRef, useEffect } from 'react';

interface UseBackendPaginationProps {
  initialPage?: number;
  initialPerPage?: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  from: number;
  to: number;
}

interface PaginationActions {
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  changeItemsPerPage: (newItemsPerPage: number) => void;
}

export const useBackendPagination = ({ 
  initialPage = 1, 
  initialPerPage = 25 
}: UseBackendPaginationProps = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialPerPage);
  const scrollTargetRef = useRef<HTMLDivElement>(null);

  // Scroll al tope cuando cambia de página (solo para páginas > 1)
  useEffect(() => {
    if (currentPage > 1 && scrollTargetRef.current) {
      scrollTargetRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [currentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const changeItemsPerPage = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset a la primera página cuando cambia items per page
  };

  // Función para crear paginationInfo desde datos del backend de Laravel
  const createPaginationInfo = (backendData?: {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
    from: number;
    to: number;
  }): PaginationInfo => {
    if (backendData) {
      return {
        currentPage: backendData.current_page,
        totalPages: backendData.last_page,
        totalItems: backendData.total,
        itemsPerPage: backendData.per_page,
        from: backendData.from,
        to: backendData.to,
      };
    }
    
    // Fallback cuando no hay datos del backend
    return {
      currentPage,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage,
      from: 0,
      to: 0,
    };
  };

  // Crear función goToNextPage que usa la información actual
  const createPaginationActions = (totalPages: number): PaginationActions => ({
    goToPage,
    goToNextPage: () => {
      if (currentPage < totalPages) {
        setCurrentPage(prev => prev + 1);
      }
    },
    goToPreviousPage,
    changeItemsPerPage,
  });

  return {
    // State
    currentPage,
    itemsPerPage,
    
    // Utility to create pagination info from backend data
    createPaginationInfo,
    
    // Utility to create pagination actions with current totalPages
    createPaginationActions,
    
    // Ref for scrolling
    scrollTargetRef,
  };
};
