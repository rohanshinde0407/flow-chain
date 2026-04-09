import React, { useState } from 'react';
import { Search, Filter, Plus, FileText, ArrowRight, ChevronDown, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTablePagination from '../../components/common/DataTablePagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import './Enquiries.css';
const QuotationList = ({ onSelect }) => {
  const { quotations, updateQuotationStatus, deleteQuotation } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const statusOptions = ['All', 'Draft', 'PO Received', 'Work Order Created', 'Rejected'];

  const getStatusClass = (status) => {
    if (status.includes('PO')) return 'row-status-success';
    if (status.includes('Work Order')) return 'row-status-approved';
    if (status.includes('Rejected')) return 'row-status-rejected';
    return 'row-status-analysis';
  };

  const getStatusStyle = (status) => {
    if (status.includes('PO')) return { color: '#065f46', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' };
    if (status.includes('Work Order')) return { color: '#1e40af', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' };
    if (status.includes('Rejected')) return { color: '#991b1b', backgroundColor: '#fef2f2', borderColor: '#fecaca' };
    return { color: '#92400e', backgroundColor: '#fffbeb', borderColor: '#fef3c7' };
  };

  // Global Search & Filter Logic
  const filteredQuotations = (quotations || []).filter(q => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      (q.id || '').toLowerCase().includes(term) ||
      (q.customerName || '').toLowerCase().includes(term) ||
      (q.company || '').toLowerCase().includes(term) ||
      (q.status || '').toLowerCase().includes(term)
    );
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedQuotations = filteredQuotations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="header-info">
          <h1>Quotations</h1>
          <p>Manage pricing, revisions, and customer approvals.</p>
        </div>
      </div>

      <div className="module-actions glass">
        <div className="search-box">
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Global search by ID, customer, or status..." 
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="filter-group">
          <Filter size={16} color="var(--text-muted)" />
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            {statusOptions.map(opt => <option key={opt} value={opt}>{opt} Status</option>)}
          </select>
        </div>
      </div>

      <div className="fc-table-container">
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">SN</TableHead>
              <TableHead className="w-[200px]">Quote # / Version</TableHead>
              <TableHead className="w-[250px]">Customer</TableHead>
              <TableHead className="w-[160px] pr-4">Total Amount</TableHead>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead className="w-[180px]">Status</TableHead>
              <TableHead className="w-[120px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedQuotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                  No quotations found. Start by converting an enquiry.
                </TableCell>
              </TableRow>
            ) : (
              paginatedQuotations.map((q, index) => (
                <TableRow
                  key={q.id}
                  className={`cursor-pointer transition-all hover:bg-slate-50/80 ${
                    q.status.includes('PO') ? 'bg-green-50/20' :
                    q.status.includes('Work Order') ? 'bg-blue-50/20' :
                    q.status.includes('Rejected') ? 'bg-rose-50/10' : ''
                  }`}
                  onClick={() => onSelect(q.id)}
                >
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="flex items-center justify-center gap-1.5 font-bold text-primary">
                        <FileText size={16} />
                        {q.id}
                      </div>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded w-fit text-center">
                        v{q.version || 1}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="font-bold text-slate-900 text-center">{q.customerName}</span>
                      <span className="text-xs font-semibold text-muted-foreground uppercase text-center">{q.company}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-right pr-4">
                    ₹{(Number(q.totalAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs font-medium text-muted-foreground text-center">
                    {formatDate(q.date)}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="status-select-wrapper">
                      <select
                        className="status-dropdown-premium px-3 py-1 text-[10px]"
                        style={getStatusStyle(q.status)}
                        value={q.status}
                        onChange={(e) => updateQuotationStatus(q.id, e.target.value)}
                      >
                        {statusOptions.filter(o => o !== 'All').map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown size={10} className="status-chevron text-slate-400" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="relative group inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                        onClick={() => onSelect(q.id)}
                      >
                        <Edit2 size={18} />
                        <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-[10px] font-medium whitespace-nowrap rounded shadow-sm z-50 pointer-events-none">Edit Quote</span>
                      </button>
                      <button
                        className="relative group inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-rose-600 transition-colors"
                        onClick={() => setDeleteConfirmId(q.id)}
                      >
                        <Trash2 size={18} />
                        <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block px-2 py-1 bg-rose-600 text-white text-[10px] font-medium whitespace-nowrap rounded shadow-sm z-50 pointer-events-none">Delete</span>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <DataTablePagination 
          currentPage={currentPage}
          totalItems={filteredQuotations.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal-content glass confirmation-modal">
            <div className="confirmation-icon"><AlertTriangle size={32} /></div>
            <h2>Confirm Deletion</h2>
            <p className="text-muted mb-6">Are you sure you want to delete quotation <strong>{deleteConfirmId}</strong>? This action will reset the linked enquiry to 'New'.</p>
            <div className="form-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-outline" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ backgroundColor: '#ef4444', color: 'white' }} onClick={() => {
                deleteQuotation(deleteConfirmId);
                setDeleteConfirmId(null);
              }}>Yes, Delete Quote</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationList;
