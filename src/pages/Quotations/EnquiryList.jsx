import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Mail, 
  Smartphone,
  Layers,
  ChevronDown,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Eye,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTablePagination from '../../components/common/DataTablePagination';
import './Enquiries.css';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';

const EnquiryList = ({ onNavigate }) => {
  const { enquiries, addEnquiry, convertToQuotation, updateEnquiryStatus, archiveEnquiry, deleteEnquiry, updateEnquiry } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [prepQuote, setPrepQuote] = useState(null); // Preparatory Quote Modal
  const [activeMenuId, setActiveMenuId] = useState(null);
  
  const [formData, setFormData] = useState({
    customerName: '',
    company: '',
    email: '',
    phone: '',
    description: '',
    partsCount: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateEnquiry(editId, formData);
    } else {
      addEnquiry(formData);
    }
    setShowForm(false);
    setIsEditing(false);
    setEditId(null);
    setFormData({
      customerName: '',
      company: '',
      email: '',
      phone: '',
      description: '',
      partsCount: 1
    });
  };

  const handleEdit = (enq) => {
    setFormData({
      customerName: enq.customerName,
      company: enq.company,
      email: enq.email,
      phone: enq.phone,
      description: enq.description,
      partsCount: enq.partsCount
    });
    setEditId(enq.id);
    setIsEditing(true);
    setShowForm(true);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const statusOptions = ['All', 'New', 'Under Analysis', 'Quoted'];

  const getStatusClass = (status) => {
    switch (status) {
      case 'New': return 'row-status-new';
      case 'Under Analysis': return 'row-status-analysis';
      case 'Quoted': return 'row-status-quoted';
      case 'Archived': return 'row-status-archived';
      default: return '';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'New': return { color: '#2563eb', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' };
      case 'Under Analysis': return { color: '#d97706', backgroundColor: '#fffbeb', borderColor: '#fef3c7' };
      case 'Quoted': return { color: '#059669', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' };
      case 'Archived': return { color: '#4b5563', backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' };
      default: return {};
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredEnquiries = (enquiries || []).filter(enq => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      (enq.customerName || '').toLowerCase().includes(term) ||
      (enq.company || '').toLowerCase().includes(term) ||
      (enq.description || '').toLowerCase().includes(term)
    );
    const matchesStatus = statusFilter === 'All' || enq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedEnquiries = filteredEnquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleConfirmCreateQuote = () => {
    if (!prepQuote) return;
    const newQuote = convertToQuotation(prepQuote.id);
    setPrepQuote(null);
    // Stay on current page but show success note
    // user explicitly asked "not directly move into the Quotations table"
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="header-info">
          <h1>Customer Enquiries</h1>
          <p>Track and manage new project requirements.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          New Enquiry
        </button>
      </div>

      <div className="module-actions glass">
        <div className="search-box">
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search by customer or company..." 
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

      <div className="flex-1 w-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in">
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">SN</TableHead>
              <TableHead className="w-[200px]">Customer / Company</TableHead>
              <TableHead className="w-[220px]">Contact Info</TableHead>
              <TableHead className="w-[300px]">Requirement Details</TableHead>
              <TableHead className="w-[100px] text-center">Parts</TableHead>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead className="w-[180px]">Status</TableHead>
              <TableHead className="w-[120px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEnquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground italic">
                  No enquiries found matching the current filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEnquiries.map((enq, index) => (
                <TableRow 
                  key={enq.id} 
                  className={`transition-all ${
                    enq.status === 'New' ? 'bg-blue-50/10' : 
                    enq.status === 'Quoted' ? 'bg-green-50/10' : 
                    enq.status === 'Archived' ? 'opacity-60 grayscale-[0.5]' : ''
                  }`}
                >
                  <TableCell className="text-center font-medium text-muted-foreground">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center justify-center text-center gap-0.5">
                      <span className="font-bold text-slate-900">{enq.customerName}</span>
                      <span className="text-xs font-semibold text-primary/80 uppercase tracking-tight">{enq.company}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-center justify-center text-center gap-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center justify-center gap-1.5"><Mail size={12} className="text-primary/60" /> {enq.email}</div>
                      <div className="flex items-center justify-center gap-1.5"><Smartphone size={12} className="text-primary/60" /> {enq.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs leading-relaxed text-slate-600 break-words whitespace-normal" title={enq.description}>
                      {enq.description}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md text-xs font-bold text-slate-700">
                      <Layers size={12} /> {enq.partsCount}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                    {formatDate(enq.date)}
                  </TableCell>
                  <TableCell>
                    <div className="status-select-wrapper" onClick={(e) => e.stopPropagation()}>
                      <select 
                        className="status-dropdown-premium px-3 py-1 text-[10px]"
                        style={getStatusStyle(enq.status)}
                        value={enq.status}
                        onChange={(e) => updateEnquiryStatus(enq.id, e.target.value)}
                      >
                        {statusOptions.filter(o => o !== 'All').map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="Archived">Archived</option>
                      </select>
                      <ChevronDown size={10} className="status-chevron text-slate-400" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {enq.status === 'Quoted' ? (
                        <button 
                          className="relative group inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                          onClick={(e) => { e.stopPropagation(); onNavigate('Quotations'); }}
                        >
                          <Eye size={18} />
                          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-[10px] font-medium whitespace-nowrap rounded shadow-sm z-50 pointer-events-none">View Quote</span>
                        </button>
                      ) : (
                        <button 
                          className="relative group inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors" 
                          onClick={(e) => { e.stopPropagation(); setPrepQuote(enq); }}
                        >
                          <FileText size={18} />
                          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block px-2 py-1 bg-emerald-600 text-white text-[10px] font-medium whitespace-nowrap rounded shadow-sm z-50 pointer-events-none">Create Quotation</span>
                        </button>
                      )}
                      
                      <div className="relative ml-1">
                        <button 
                          className="relative group inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === enq.id ? null : enq.id);
                          }}
                        >
                          <MoreVertical size={18} />
                          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-[10px] font-medium whitespace-nowrap rounded shadow-sm z-50 pointer-events-none">Options</span>
                        </button>
                        
                        {activeMenuId === enq.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-1 flex flex-col items-stretch text-left overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <button 
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(enq);
                              }}
                            >
                              <Edit2 size={14} className="text-slate-400" /> Edit Details
                            </button>
                            {enq.status !== 'Archived' && (
                              <button 
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 transition-colors w-full text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateEnquiryStatus(enq.id, 'Under Analysis');
                                  setActiveMenuId(null);
                                }}
                              >
                                <AlertTriangle size={14} className="text-amber-500" /> Mark for Analysis
                              </button>
                            )}
                            {enq.status !== 'Archived' ? (
                              <button 
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  archiveEnquiry(enq.id);
                                  setActiveMenuId(null);
                                }}
                              >
                                <Layers size={14} className="text-slate-400" /> Archive Enquiry
                              </button>
                            ) : (
                              <button 
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors w-full text-left"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(enq.id);
                                  setActiveMenuId(null);
                                }}
                              >
                                <Trash2 size={14} className="text-rose-500" /> Delete Permanent
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination 
        currentPage={currentPage}
        totalItems={filteredEnquiries.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      {/* Preparatory Quote Modal */}
      {prepQuote && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '500px' }}>
            <h2>Drafting Quotation</h2>
            <div className="p-4 bg-white rounded-lg border mb-4">
              <p className="text-sm text-muted mb-2">Creating record for:</p>
              <h3 className="font-bold text-lg mb-1">{prepQuote.customerName}</h3>
              <p className="text-sm font-semibold text-primary">{prepQuote.company}</p>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs uppercase font-bold text-muted">Initial Parts Context</p>
                <p className="text-sm mt-1">{prepQuote.description}</p>
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-bold">
                  <Layers size={14} /> {prepQuote.partsCount} Parts Expected
                </div>
              </div>
            </div>
            <div className="form-info mb-6">
              <p className="text-sm text-muted">A new quotation record will be generated with a starting cost of <strong>₹0</strong>. Access the Quotations module to refine pricing.</p>
            </div>
            <div className="form-actions">
              <button className="btn-outline" onClick={() => setPrepQuote(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirmCreateQuote}>Confirm & Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content glass">
            <h2>{isEditing ? 'Edit Enquiry' : 'Add New Enquiry'}</h2>
            <form onSubmit={handleSubmit} className="enquiry-form">
              <div className="form-group">
                <label>Customer Name</label>
                <input 
                  required 
                  type="text" 
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input 
                  required 
                  type="text" 
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    required 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input 
                    required 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Parts Count</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.partsCount}
                  onChange={(e) => setFormData({...formData, partsCount: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label>Requirement Description</label>
                <textarea 
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={() => { setShowForm(false); setIsEditing(false); setEditId(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{isEditing ? 'Update Enquiry' : 'Save Enquiry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal-content glass confirmation-modal">
            <div className="confirmation-icon"><AlertTriangle size={32} /></div>
            <h2>Confirm Deletion</h2>
            <p className="text-muted mb-6">Are you sure you want to delete enquiry <strong>{deleteConfirmId}</strong>? This action will permanently purge the record from FlowChain.</p>
            <div className="form-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-outline" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ backgroundColor: '#ef4444', color: 'white' }} onClick={() => {
                deleteEnquiry(deleteConfirmId);
                setDeleteConfirmId(null);
              }}>Yes, Delete Record</button>
            </div>
          </div>
        </div>
      )}
      {/* Global Click Handler for Dropdowns */}
      {activeMenuId && (
        <div className="dropdown-overlay" onClick={() => setActiveMenuId(null)}></div>
      )}
    </div>
  );
};

export default EnquiryList;
