import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const DataTablePagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange   // optional callback — (newLimit) => void
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIdx = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx   = Math.min(currentPage * itemsPerPage, totalItems);

  // Show up to 5 page numbers centred around current page
  const getPages = () => {
    if (totalPages <= 1) return [1];
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end   = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // ── Shared button styles ─────────────────────────────
  const btn = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    height: '2rem', minWidth: '2rem', borderRadius: '0.4rem',
    fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
    border: '1px solid #e2e8f0', background: '#fff', color: '#475569',
    transition: 'all 0.12s ease', padding: '0 0.5rem', gap: '0.2rem',
    whiteSpace: 'nowrap', lineHeight: 1
  };
  const btnActive = {
    ...btn, background: '#0f172a', color: '#fff',
    border: '1px solid #0f172a', fontWeight: 800
  };
  const btnOff = { ...btn, opacity: 0.3, cursor: 'not-allowed', pointerEvents: 'none' };

  const pages = getPages();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.625rem 1rem',
      background: '#f8fafc',
      borderTop: '1px solid #e8ecf0',
      flexWrap: 'wrap', gap: '0.5rem',
      flexShrink: 0
    }}>

      {/* ── Left: record info + rows-per-page ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Record info */}
        <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, fontWeight: 500, whiteSpace: 'nowrap' }}>
          {totalItems === 0
            ? 'No records found'
            : <>Showing <strong style={{ color: '#0f172a' }}>{startIdx}–{endIdx}</strong> of{' '}
               <strong style={{ color: '#0f172a' }}>{totalItems}</strong> records</>
          }
        </p>

        {/* Rows per page selector */}
        {onItemsPerPageChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
              Rows per page:
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1); // reset to first page
              }}
              style={{
                height: '2rem', padding: '0 0.5rem',
                border: '1px solid #e2e8f0', borderRadius: '0.4rem',
                background: '#fff', fontSize: '0.72rem', fontWeight: 700,
                color: '#0f172a', outline: 'none', cursor: 'pointer'
              }}
            >
              {[5, 8, 10, 15, 25, 50].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Right: navigation controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        {/* First */}
        <button style={currentPage <= 1 ? btnOff : btn}
          onClick={() => onPageChange(1)} title="First page">
          <ChevronsLeft size={13} />
        </button>
        {/* Prev */}
        <button style={currentPage <= 1 ? btnOff : btn}
          onClick={() => onPageChange(currentPage - 1)}>
          <ChevronLeft size={13} /> Prev
        </button>

        {/* Page numbers */}
        {pages.map(p => (
          <button key={p}
            style={p === currentPage ? btnActive : btn}
            onClick={() => onPageChange(p)}>
            {p}
          </button>
        ))}

        {/* Next */}
        <button style={currentPage >= totalPages ? btnOff : btn}
          onClick={() => onPageChange(currentPage + 1)}>
          Next <ChevronRight size={13} />
        </button>
        {/* Last */}
        <button style={currentPage >= totalPages ? btnOff : btn}
          onClick={() => onPageChange(totalPages)} title="Last page">
          <ChevronsRight size={13} />
        </button>
      </div>
    </div>
  );
};

export default DataTablePagination;
