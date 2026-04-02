import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DataTablePagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination-wrapper glass">
      <div className="pagination-info">
        Showing <span>{startIdx}</span> to <span>{endIdx}</span> of <span>{totalItems}</span> results
      </div>
      
      <div className="pagination-controls">
        <button 
          className="pagination-btn" 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={18} />
          Previous
        </button>
        
        <div className="pagination-pages">
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i + 1}
              className={`page-num ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => onPageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        
        <button 
          className="pagination-btn" 
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default DataTablePagination;
