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
  FileText,
  CheckCircle
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
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [prepQuote, setPrepQuote] = useState(null); // Preparatory Quote Modal
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [viewEnquiry, setViewEnquiry] = useState(null);
  
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

      <div className="fc-table-container">
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
                  className={`cursor-pointer transition-all hover:bg-slate-50/80 ${
                    enq.status === 'New' ? 'bg-blue-50/10' : 
                    enq.status === 'Quoted' ? 'bg-green-50/10' : 
                    enq.status === 'Archived' ? 'opacity-60 grayscale-[0.5]' : ''
                  }`}
                  onClick={() => setViewEnquiry(enq)}
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
                    <div className="flex items-center justify-center gap-1">
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
                      <button 
                        className="relative group inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(enq);
                        }}
                      >
                        <Edit2 size={18} />
                        <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block px-2 py-1 bg-indigo-600 text-white text-[10px] font-medium whitespace-nowrap rounded shadow-sm z-50 pointer-events-none">Edit Record</span>
                      </button>
                      
                      <button 
                        className="relative group inline-flex h-8 w-8 items-center justify-center text-rose-300 hover:text-rose-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(enq.id);
                        }}
                      >
                        <Trash2 size={18} />
                        <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block px-2 py-1 bg-rose-600 text-white text-[10px] font-medium whitespace-nowrap rounded shadow-sm z-50 pointer-events-none">Delete Record</span>
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
          totalItems={filteredEnquiries.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

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
        <div className="modal-overlay" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-content glass" style={{ maxWidth: '640px', padding: '2.5rem' }}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{isEditing ? 'Edit Enquiry' : 'New Project Enquiry'}</h2>
                <p className="text-sm text-slate-500 mt-1">Capture customer requirements to begin the project lifecycle.</p>
              </div>
              <button className="close-panel-btn" onClick={() => { setShowForm(false); setIsEditing(false); }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Customer Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. John Wick"
                    className="form-input"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Company</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Continental Hotels"
                    className="form-input"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Contact</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="john@hotel.com"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Phone Number</label>
                  <input 
                    required 
                    type="tel" 
                    placeholder="+91-1234567890"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Requirement Description</label>
                <textarea 
                  rows="4"
                  required
                  placeholder="Detail the technical specifications, quantity, and urgency..."
                  className="form-input bg-slate-50"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Initial Item Count</label>
                  <input 
                    type="number" 
                    min="1"
                    className="form-input"
                    value={formData.partsCount}
                    onChange={(e) => setFormData({...formData, partsCount: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" className="btn-outline flex-1 py-3" onClick={() => { setShowForm(false); setIsEditing(false); }}>Discard</button>
                <button type="submit" className="btn btn-primary flex-1 py-3 font-black tracking-tight">{isEditing ? 'Update Enquiry' : 'Save Enquiry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enquiry Detail View Modal - Standardized Premium Visiting Card V9 */}
      {viewEnquiry && (
        <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)' }}>
          <div className="modal-content bg-white shadow-2xl animate-in fade-in zoom-in duration-300" style={{ maxWidth: '420px', padding: '2.5rem', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
            
            {/* Top Close Button */}
            <button 
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all z-20" 
              onClick={() => setViewEnquiry(null)}
            >
              <X size={18} />
            </button>

            {/* Visiting Card Header Section */}
            <div className="mb-10 text-start">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight mb-1">
                {viewEnquiry.customerName}
              </h2>
              <p className="text-indigo-600 font-bold uppercase tracking-widest text-[10px]">{viewEnquiry.company}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">{viewEnquiry.id}</span>
              </div>
            </div>

            {/* Section-wise Information Layout */}
            <div className="space-y-8 mb-10">
              
              {/* Section 1: Contact Identity */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Contact Identity</p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Mail size={14} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">{viewEnquiry.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Smartphone size={14} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">{viewEnquiry.phone}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Project Timeline */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Project Timeline</p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Submitted On</span>
                    <span className="text-sm font-bold text-slate-700">{formatDate(viewEnquiry.date)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getStatusStyle(viewEnquiry.status).color }}></div>
                      <span className="text-sm font-black uppercase tracking-widest" style={{ color: getStatusStyle(viewEnquiry.status).color }}>{viewEnquiry.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Technical Briefing (No border design) */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Technical Briefing</p>
                <div className="border-t border-slate-50 pt-2">
                  <p className="text-sm text-slate-600 italic leading-relaxed">
                    "{viewEnquiry.description || "No specific technical requirements documented."}"
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-slate-400">
                    <Layers size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{viewEnquiry.partsCount} Item Scope</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Action Section - Compact Buttons V9 */}
            <div className="pt-6 border-t border-slate-50 space-y-3">
              {viewEnquiry.status !== 'Quoted' ? (
                <button 
                  className="w-full h-11 text-white rounded-lg font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-3"
                  style={{ backgroundColor: '#0f172a' }}
                  onClick={() => {
                    setPrepQuote(viewEnquiry);
                    setViewEnquiry(null);
                  }}
                >
                  Confirm & Continue
                </button>
              ) : (
                <button 
                  className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center"
                  onClick={() => setViewEnquiry(null)}
                >
                  Close Inquiry
                </button>
              )}
              
              <button 
                className="w-full py-3 bg-transparent text-slate-500 hover:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-start gap-4"
                onClick={() => {
                  handleEdit(viewEnquiry);
                  setViewEnquiry(null);
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                  <Edit2 size={14} />
                </div>
                <span>Refine details</span>
              </button>
            </div>

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
