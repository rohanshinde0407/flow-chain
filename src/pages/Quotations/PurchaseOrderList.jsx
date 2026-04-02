import React, { useState } from 'react';
import { 
  FilePlus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ArrowRight,
  ClipboardCheck,
  X,
  Edit2,
  Trash2,
  AlertTriangle,
  User,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTablePagination from '../../components/common/DataTablePagination';
import './Quotations.css';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';

const PurchaseOrderList = () => {
  const { purchaseOrders, quotations, workOrders, updatePurchaseOrderStatus, productionUsers, addWorkOrder, onNavigate, setSelectedWorkOrderId, deletePurchaseOrder } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedPO, setSelectedPO] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [woCreationPO, setWoCreationPO] = useState(null);
  const [workOrderData, setWorkOrderData] = useState({
    partName: '',
    assignedUser: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    deliveryDate: ''
  });

  const statusOptions = ['All', 'Received', 'Work Order Created', 'Completed'];
  
  const filteredPOs = (purchaseOrders || []).filter(po => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      (po.id || '').toLowerCase().includes(term) ||
      (po.customerName || '').toLowerCase().includes(term) ||
      (po.quoteId || '').toLowerCase().includes(term)
    );
    const matchesStatus = statusFilter === 'All' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedPOs = filteredPOs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      });
    } catch (e) {
      console.warn("Date formatting error:", e);
      return 'N/A';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Received': return 'badge-info';
      case 'Work Order Created': return 'badge-success';
      default: return 'badge-warning';
    }
  };

  return (
    <div className="module-container-wrapper">
      <div className="module-container animate-in">
        <div className="module-header">
          <div className="header-info">
            <h1>Purchase Orders</h1>
            <p>Track incoming POs and convert them to execution work orders.</p>
          </div>
        </div>

        <div className="module-actions glass">
          <div className="search-box">
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by PO # or Customer..." 
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
          <div className="action-btns">
            <button className="btn-outline">
              <Download size={18} />
              Export All
            </button>
          </div>
        </div>

        <div className="flex-1 w-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">SN</TableHead>
                <TableHead className="w-[200px]">PO #</TableHead>
                <TableHead className="w-[200px]">Customer Name</TableHead>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[160px] pr-4">Amount</TableHead>
                <TableHead className="w-[180px]">Quote Reference</TableHead>
                <TableHead className="w-[200px]">Status</TableHead>
                <TableHead className="w-[160px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPOs.length > 0 ? (
                paginatedPOs.map((po, index) => (
                  <TableRow 
                    key={po.id} 
                    className={`cursor-pointer transition-all ${
                      selectedPO?.id === po.id ? 'bg-primary-light/40 border-l-4 border-l-primary' : 
                      po.status === 'Completed' ? 'bg-green-50/30' : 
                      po.status === 'Work Order Created' ? 'bg-blue-50/20' : ''
                    }`}
                    onClick={() => setSelectedPO(po)}
                  >
                    <TableCell className="text-center font-medium text-muted-foreground">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-slate-100/80 border border-slate-200 text-slate-700 font-mono text-xs font-bold shadow-sm">
                        SN-PO-{po.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-900 inline-block text-center">{po.customerName}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(po.date)}</TableCell>
                    <TableCell className="font-bold amount-inr pr-4">{po.amount}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1.5 text-primary-hover font-medium whitespace-nowrap">
                        <span className="font-bold opacity-60">#</span>
                        {po.quoteId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`badge whitespace-nowrap ${getStatusBadge(po.status)}`}>
                        {po.status.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="relative group inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-slate-700 transition-colors" 
                          onClick={() => setSelectedPO(po)} 
                        >
                          <Eye size={18} />
                          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-[10px] font-medium whitespace-nowrap rounded shadow-sm z-50 pointer-events-none">View Details</span>
                        </button>
                        <button 
                          className="relative group inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-rose-600 transition-colors" 
                          onClick={() => setDeleteConfirmId(po.id)} 
                        >
                          <Trash2 size={18} />
                          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-[10px] font-medium whitespace-nowrap rounded shadow-sm z-50 pointer-events-none">Delete PO</span>
                        </button>
                        {po.status !== 'Completed' && (
                          <button 
                            className="relative group inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                            onClick={() => setWoCreationPO(po)}
                          >
                            <ClipboardCheck size={18} />
                            <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block px-2 py-1 bg-indigo-600 text-white text-[10px] font-medium whitespace-nowrap rounded shadow-sm z-50 pointer-events-none">Create Work Order</span>
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground italic">
                    No Purchase Orders found matching the criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination 
          currentPage={currentPage}
          totalItems={filteredPOs.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Work Order Creation Modal */}
      {woCreationPO && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '600px' }}>
            <div className="flex justify-between items-center mb-4">
              <h2>Create Work Order for {woCreationPO.poNumber}</h2>
              <button className="icon-btn" onClick={() => setWoCreationPO(null)}><X size={20} /></button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              addWorkOrder({
                ...workOrderData,
                poNumber: woCreationPO.poNumber,
                poInternalId: woCreationPO.id,
                quoteId: woCreationPO.quoteId,
                customer: woCreationPO.customerName,
                status: 'Pending'
              });
              setWoCreationPO(null);
              // Reset form
              setWorkOrderData({
                partName: '',
                assignedUser: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: '',
                deliveryDate: ''
              });
            }} className="enquiry-form">
              
              <div className="form-group">
                <label>Select Part / Item from PO</label>
                <select 
                  required
                  className="form-input"
                  value={workOrderData.partName}
                  onChange={(e) => setWorkOrderData({...workOrderData, partName: e.target.value})}
                >
                  <option value="">-- Select a Part --</option>
                  {(quotations.find(q => q.id === woCreationPO.quoteId)?.parts || []).map((part, idx) => (
                    <option key={idx} value={part.name}>{part.name} ({part.qty} {part.unit})</option>
                  ))}
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Assign Technician / User</label>
                  <select 
                    required
                    className="form-input"
                    value={workOrderData.assignedUser}
                    onChange={(e) => setWorkOrderData({...workOrderData, assignedUser: e.target.value})}
                  >
                    <option value="">-- Assign To --</option>
                    {productionUsers.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    required
                    className="form-input"
                    value={workOrderData.startDate}
                    onChange={(e) => setWorkOrderData({...workOrderData, startDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-grid-2 mt-3">
                <div className="form-group">
                  <label>Expected End Date</label>
                  <input 
                    type="date" 
                    required
                    className="form-input"
                    value={workOrderData.endDate}
                    onChange={(e) => setWorkOrderData({...workOrderData, endDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Committed Delivery Date</label>
                  <input 
                    type="date" 
                    required
                    className="form-input"
                    value={workOrderData.deliveryDate}
                    onChange={(e) => setWorkOrderData({...workOrderData, deliveryDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="card info-card-small mt-4">
                <p className="text-xs text-muted">Traceability: Linked to Quote <strong>{woCreationPO.quoteId}</strong> and Customer <strong>{woCreationPO.customerName}</strong></p>
              </div>

              <div className="form-actions mt-6">
                <button type="button" className="btn-outline" onClick={() => setWoCreationPO(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <ClipboardCheck size={18} /> Initiate Work Order
                </button>
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
            <h2>Confirm PO Deletion</h2>
            <p className="text-muted mb-6">Are you sure you want to delete Purchase Order <strong>{deleteConfirmId}</strong>? This will remove all production linkage for this record.</p>
            <div className="form-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-outline" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ backgroundColor: '#ef4444', color: 'white' }} onClick={() => {
                deletePurchaseOrder(deleteConfirmId);
                setDeleteConfirmId(null);
              }}>Yes, Delete PO</button>
            </div>
          </div>
        </div>
      )}

      {/* PO Detail Selection Sidebar - MOVED OUTSIDE ANIMATED CONTAINER FOR FULL-HEIGHT DOCKING */}
      {/* PO Detail Selection Sidebar - Defensive Rendering Check */}
      {selectedPO && (
        <div className="side-panel show glass" style={{ zIndex: 9999 }}>
          <div className="panel-header">
            <div className="panel-title-group">
              <label>Purchase Order Details</label>
              <div className="title-badge-row">
                <h3>{selectedPO.id || 'PO-NEW'}</h3>
                <span className={`badge-pill ${(getStatusBadge(selectedPO.status || '') || 'badge-warning').replace('badge-', '')}`}>
                  <span className="status-indicator"></span>
                  {selectedPO.status || 'Received'}
                </span>
              </div>
            </div>
            <div className="panel-header-actions">
              <button className="close-panel-btn" onClick={() => setSelectedPO(null)}><X size={20} /></button>
            </div>
          </div>
          
          <div className="panel-content custom-scrollbar">
            <div className="panel-section no-border pt-0">
              <div className="panel-summary-grid-v2">
                <div className="summary-card">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={14} className="text-muted" />
                    <label>Customer Name</label>
                  </div>
                  <span>{selectedPO.customerName || 'N/A'}</span>
                </div>
                <div className="summary-card">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} className="text-muted" />
                    <label>Date Received</label>
                  </div>
                  <span>{formatDate(selectedPO.date)}</span>
                </div>
                <div className="summary-card">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-muted opacity-80">₹</span>
                    <label>Price Agreement</label>
                  </div>
                  <span className="amount-inr">{selectedPO.amount || '0'}</span>
                </div>
                <div className="summary-card">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-muted opacity-80">#</span>
                    <label>Quote Reference</label>
                  </div>
                  <span className="text-primary font-bold">{selectedPO.quoteId || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="panel-section">
              <div className="section-header">
                <label>Verified Line Items</label>
                <span className="count-pill">
                  {((quotations || []).find(q => q.id === selectedPO.quoteId)?.parts || []).length}
                </span>
              </div>
              <div className="panel-table-wrapper-v2 glass">
                <table className="panel-table-v2">
                  <thead>
                    <tr>
                      <th>Part Description</th>
                      <th>Qty</th>
                      <th className="text-right">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {((quotations || []).find(q => q.id === selectedPO.quoteId)?.parts || []).map((part, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="part-info">
                            <span className="part-name-text">{part?.name || 'Unknown Part'}</span>
                          </div>
                        </td>
                        <td><span className="qty-tag">{part?.qty || 0}</span></td>
                        <td className="amount text-right">₹{Number(part?.price || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="panel-section">
              <div className="section-header">
                <label>Linked Work Orders</label>
                <div className="pulse-indicator"></div>
              </div>
              <div className="panel-wo-scroll-container">
                <div className="panel-wo-grid">
                  {(workOrders || []).filter(wo => wo && (wo.poInternalId === selectedPO.id || wo.poId === selectedPO.id || wo.poNumber === selectedPO.poNumber)).length > 0 ? (
                    (workOrders || []).filter(wo => wo && (wo.poInternalId === selectedPO.id || wo.poId === selectedPO.id || wo.poNumber === selectedPO.poNumber)).map(wo => (
                      <div 
                        key={wo.id} 
                        className="premium-wo-card" 
                        onClick={() => {
                          if (setSelectedWorkOrderId && onNavigate) {
                            setSelectedWorkOrderId(wo.id);
                            onNavigate('Work Orders');
                          }
                        }}
                      >
                        <div className="wo-card-header">
                          <div className="wo-badge">
                            <ClipboardCheck size={12} />
                            <span>{wo.id}</span>
                          </div>
                          <span className={`status-dot ${wo.status === 'Completed' ? 'success' : 'pending'}`}></span>
                        </div>
                        <h4 className="wo-card-title">{wo.partName || 'Production Order'}</h4>
                        <div className="wo-card-footer">
                          <span className={`status-text ${(wo.status || 'Pending').toLowerCase().replace('', '-')}`}>{wo.status || 'Pending'}</span>
                          <div className="go-btn">
                            View Order <ArrowRight size={14} />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-panel-msg-v2 glass">
                      <p>No production orders have been initiated for this PO yet.</p>
                      {selectedPO.status !== 'Completed' && (
                        <button 
                          className="btn btn-primary btn-sm mt-4 w-full"
                          onClick={() => setWoCreationPO(selectedPO)}
                        >
                          <FilePlus size={18} /> Initiate New Work Order
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderList;
