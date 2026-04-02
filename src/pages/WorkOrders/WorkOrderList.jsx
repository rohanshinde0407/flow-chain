import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  User, 
  ArrowRight,
  MoreVertical,
  Download,
  ChevronDown,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Wallet,
  IndianRupee
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTablePagination from '../../components/common/DataTablePagination';
import './WorkOrders.css';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';

const WorkOrderList = () => {
  const { workOrders, purchaseOrders, addManualWorkOrder, updateWorkOrder, updateWorkOrderStatus, selectedWorkOrderId, setSelectedWorkOrderId, deleteWorkOrder, productionUsers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedWO, setSelectedWO] = useState(null);
  const [showManualCreate, setShowManualCreate] = useState(false);
  const [newWO, setNewWO] = useState({
    customer: '',
    partName: '',
    poId: '',
    poNumber: '',
    assignedUser: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    deliveryDate: ''
  });

  // Auto-select and scroll to WO from external deep links
  React.useEffect(() => {
    if (selectedWorkOrderId) {
      const wo = workOrders.find(w => w.id === selectedWorkOrderId);
      if (wo) {
        setSelectedWO(wo);
        setSearchTerm(''); // Clear search to ensure it's visible
        // Optional: Reset it so it doesn't trigger again on re-nav
        setSelectedWorkOrderId(null);
      }
    }
  }, [selectedWorkOrderId, workOrders, setSelectedWorkOrderId]);

  const itemsPerPage = 10;
  const statusOptions = ['All', 'Pending', 'In Progress', 'On Hold', 'Completed'];

  const filteredWorkOrders = (workOrders || []).filter(wo => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      (wo.id || '').toLowerCase().includes(term) ||
      (wo.partName || '').toLowerCase().includes(term) ||
      (wo.customer || '').toLowerCase().includes(term) ||
      (wo.traceability?.quoteId || '').toLowerCase().includes(term) ||
      (wo.traceability?.poId || '').toLowerCase().includes(term)
    );
    const matchesStatus = statusFilter === 'All' || wo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedWorkOrders = filteredWorkOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'row-status-approved';
      case 'In Progress': return 'row-status-analysis';
      case 'Pending': return 'row-status-new';
      case 'On Hold': return 'row-status-rejected';
      default: return '';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return { color: '#059669', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' };
      case 'In Progress': return { color: '#2563eb', backgroundColor: '#eff6ff', borderColor: '#bfdbfe' };
      case 'Pending': return { color: '#d97706', backgroundColor: '#fffbeb', borderColor: '#fef3c7' };
      case 'On Hold': return { color: '#991b1b', backgroundColor: '#fef2f2', borderColor: '#fecaca' };
      default: return {};
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'Pending': return 'warning';
      case 'On Hold': return 'danger';
      default: return 'info';
    }
  };

  return (
    <div className="module-container-wrapper">
      <div className="module-container animate-in">
        <div className="module-header">
          <div className="header-info">
            <h1>Work Orders</h1>
            <p>Monitor production progress for individual parts.</p>
          </div>
          <div className="header-stats">
            <div className="mini-stat">
              <span>{(workOrders || []).filter(w => w.status === 'Pending').length} Pending</span>
            </div>
            <div className="mini-stat">
              <span>{(workOrders || []).filter(w => w.status === 'In Progress').length} In Progress</span>
            </div>
            <button className="btn btn-primary" onClick={() => setShowManualCreate(true)}>
              <ClipboardCheck size={18} /> Manual Create Order
            </button>
          </div>
        </div>

        <div className="module-actions glass">
          <div className="search-box">
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by WO#, Part Name, or Customer..." 
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
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px] text-center">SN</TableHead>
                <TableHead className="w-[140px] text-center">Work Order ID</TableHead>
                <TableHead className="w-[140px] text-center">PO Number</TableHead>
                <TableHead className="w-[200px] text-center">Work Order Name</TableHead>
                <TableHead className="w-[180px] text-center">Customer</TableHead>
                <TableHead className="w-[180px] text-center">Assigned To</TableHead>
                <TableHead className="w-[140px] text-center">Total Value</TableHead>
                <TableHead className="w-[200px] text-center">Progress</TableHead>
                <TableHead className="w-[160px] text-center">Delivery Metrics</TableHead>
                <TableHead className="w-[160px] text-center">Status</TableHead>
                <TableHead className="w-[120px] text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWorkOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-muted-foreground italic">
                    No production orders match the current search filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedWorkOrders.map((wo, index) => (
                  <TableRow 
                    key={wo.id} 
                    className={`transition-all ${
                      selectedWO?.id === wo.id ? 'bg-primary-light/40 border-l-4 border-l-primary' : 
                      wo.status === 'Completed' ? 'bg-green-50/10' : 
                      wo.status === 'On Hold' ? 'bg-rose-50/20' : ''
                    }`}
                    onClick={() => setSelectedWO(wo)}
                  >
                    <TableCell className="text-center font-medium text-muted-foreground">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 uppercase tracking-wider">{wo.id}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-600 shadow-sm">
                        {wo.poNumber || 'DIRECT'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-bold text-slate-900 text-sm">{wo.partName}</TableCell>
                    <TableCell className="text-center font-semibold text-slate-900">{wo.customer}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-xs font-medium text-center">{wo.assignedUser || wo.assignedTo || 'Unassigned'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono font-medium text-slate-700">
                      ₹{(wo.totalAmount || 0).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center w-full">
                        <div className="w-[140px] space-y-1.5 flex flex-col items-center">
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                wo.status === 'Completed' ? 'bg-emerald-500' : 
                                wo.status === 'In Progress' ? 'bg-blue-500' : 'bg-amber-500'
                              }`} 
                              style={{ width: wo.status === 'Completed' ? '100%' : wo.status === 'In Progress' ? '50%' : '10%' }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 text-center">
                            {wo.status === 'Completed' ? 'TASK DONE' : wo.status === 'In Progress' ? 'PRODUCTION ONGOING' : 'QUEUED'}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
                          <Clock size={12} className="text-primary/60" />
                          {wo.deliveryDate ? new Date(wo.deliveryDate).toLocaleDateString('en-IN') : 'TBD'}
                        </div>
                        <span className="text-[10px] text-muted-foreground text-center">Target: {wo.endDate ? new Date(wo.endDate).toLocaleDateString('en-IN') : 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                       <div className="status-select-wrapper">
                        <select 
                          className="status-dropdown-premium px-3 py-1 text-[10px]"
                          style={getStatusStyle(wo.status)}
                          value={wo.status}
                          onChange={(e) => updateWorkOrderStatus(wo.id, e.target.value)}
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
                          onClick={() => setSelectedWO(wo)} 
                        >
                          <Edit2 size={18} />
                          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-[10px] font-medium whitespace-nowrap rounded shadow-sm z-50 pointer-events-none">Edit Order</span>
                        </button>
                        <button 
                          className="relative group inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-rose-600 transition-colors" 
                          onClick={() => setDeleteConfirmId(wo.id)} 
                        >
                          <Trash2 size={18} />
                          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-[10px] font-medium whitespace-nowrap rounded shadow-sm z-50 pointer-events-none">Delete</span>
                        </button>
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
          totalItems={filteredWorkOrders.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal-content glass confirmation-modal">
            <div className="confirmation-icon"><AlertTriangle size={32} /></div>
            <h2>Confirm WO Deletion</h2>
            <p className="text-muted mb-6">Are you sure you want to delete Work Order <strong>{deleteConfirmId}</strong>? This will remove production tracking for this part.</p>
            <div className="form-actions" style={{ justifyContent: 'center' }}>
              <button className="btn-outline" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="btn btn-danger" style={{ backgroundColor: '#ef4444', color: 'white' }} onClick={() => {
                deleteWorkOrder(deleteConfirmId);
                setDeleteConfirmId(null);
              }}>Yes, Delete Record</button>
            </div>
          </div>
        </div>
      )}

      {/* WO Detail / Project Management Sidebar - MOVED OUTSIDE ANIMATED CONTAINER */}
      {selectedWO && (
        <div className="side-panel show glass">
          <div className="panel-header">
            <h3>Management: {selectedWO.id}</h3>
            <button className="icon-btn" onClick={() => setSelectedWO(null)}><X size={20} /></button>
          </div>
          
          <div className="panel-content">
            <div className="grid grid-cols-2 gap-3 mb-4">
               <div className="bg-slate-50 p-2 rounded border border-slate-200 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase mb-0.5"><IndianRupee size={10} className="inline mr-1"/>Total Value</span>
                  <span className="text-sm font-mono font-bold text-slate-800">₹{(selectedWO.totalAmount || 0).toLocaleString('en-IN')}</span>
               </div>
               <div className="bg-emerald-50 p-2 rounded border border-emerald-200 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase mb-0.5"><Wallet size={10} className="inline mr-1"/>Credited</span>
                  <span className="text-sm font-mono font-bold text-emerald-700">₹{(selectedWO.amountReceived || 0).toLocaleString('en-IN')}</span>
               </div>
            </div>

            <div className="panel-section">
              <label>Production Assignment</label>
              <select 
                className="form-input"
                value={selectedWO.assignedUser || selectedWO.assignedTo || ''} 
                onChange={(e) => {
                  updateWorkOrder(selectedWO.id, { assignedUser: e.target.value });
                  setSelectedWO({...selectedWO, assignedUser: e.target.value});
                }}
              >
                <option value="">-- Unassigned --</option>
                {productionUsers.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div className="panel-section">
              <label>Work Order Status</label>
              <select 
                className="form-input"
                value={selectedWO.status} 
                onChange={(e) => {
                  updateWorkOrder(selectedWO.id, { status: e.target.value });
                  setSelectedWO({...selectedWO, status: e.target.value});
                }}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="panel-section-grid">
               <div className="form-group">
                 <label>Start Date</label>
                 <input 
                   type="date" 
                   className="form-input" 
                   value={selectedWO.startDate || ''}
                   onChange={(e) => {
                     updateWorkOrder(selectedWO.id, { startDate: e.target.value });
                     setSelectedWO({...selectedWO, startDate: e.target.value});
                   }}
                 />
               </div>
               <div className="form-group">
                 <label>Delivery Target</label>
                 <input 
                   type="date" 
                   className="form-input" 
                   value={selectedWO.deliveryDate || selectedWO.expectedCompletionDate || ''}
                   onChange={(e) => {
                     updateWorkOrder(selectedWO.id, { deliveryDate: e.target.value });
                     setSelectedWO({...selectedWO, deliveryDate: e.target.value});
                   }}
                 />
               </div>
            </div>

            <div className="panel-section">
              <label>Remarks / Notes</label>
              <textarea 
                className="panel-textarea"
                rows="4"
                placeholder="Add admin remarks here..."
                value={selectedWO.remarks || ''}
                onChange={(e) => {
                  updateWorkOrder(selectedWO.id, { remarks: e.target.value });
                  setSelectedWO({...selectedWO, remarks: e.target.value});
                }}
              ></textarea>
            </div>

            <div className="panel-section">
              <label>Process Tracking</label>
              <div className="process-checklist">
                {(selectedWO.process || []).map((step, idx) => (
                  <div key={idx} className="process-item">
                    <input 
                      type="checkbox" 
                      checked={step.status === 'Completed'}
                      onChange={() => {
                        const newProcess = [...selectedWO.process];
                        newProcess[idx].status = newProcess[idx].status === 'Completed' ? 'Pending' : 'Completed';
                        newProcess[idx].time = new Date().toISOString();
                        updateWorkOrder(selectedWO.id, { process: newProcess });
                        setSelectedWO({...selectedWO, process: newProcess});
                      }}
                    />
                    <span className={step.status === 'Completed' ? 'done' : ''}>{step.label}</span>
                    {step.time && <span className="step-time">{new Date(step.time).toLocaleTimeString()}</span>}
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-full mt-4" onClick={() => alert('Work Order report generated!')}>
              <Download size={18} /> Download Report
            </button>
          </div>
        </div>
      )}

      {/* Manual Create Modal */}
      {showManualCreate && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '600px' }}>
            <div className="flex justify-between items-center mb-4">
              <h2>Manual Work Order Create</h2>
              <button className="icon-btn" onClick={() => setShowManualCreate(false)}><X size={20} /></button>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label>Customer Name</label>
                <input 
                  type="text" 
                  required
                  className="form-input" 
                  value={newWO.customer}
                  onChange={(e) => setNewWO({...newWO, customer: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Part Name</label>
                <input 
                  type="text" 
                  required
                  className="form-input"
                  value={newWO.partName}
                  onChange={(e) => setNewWO({...newWO, partName: e.target.value})}
                />
              </div>
            </div>
            
            <div className="form-group mt-3">
              <label>Link to Purchase Order (Optional)</label>
              <div className="flex gap-2">
                <select 
                  className="form-input"
                  value={newWO.poId}
                  onChange={(e) => {
                    const po = purchaseOrders.find(p => p.id === e.target.value);
                    setNewWO({...newWO, poId: e.target.value, poNumber: po?.poNumber || ''});
                  }}
                >
                  <option value="">No PO Link (Direct Order)</option>
                  {purchaseOrders.map(po => <option key={po.id} value={po.id}>{po.poNumber || po.id} - {po.customerName}</option>)}
                </select>
                {newWO.poNumber && <span className="badge-pill info">{newWO.poNumber}</span>}
              </div>
            </div>

            <div className="form-grid-2 mt-3">
              <div className="form-group">
                <label>Assign Technician</label>
                <select 
                  className="form-input"
                  value={newWO.assignedUser}
                  onChange={(e) => setNewWO({...newWO, assignedUser: e.target.value})}
                >
                  <option value="">-- Assign To --</option>
                  {productionUsers.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={newWO.startDate}
                  onChange={(e) => setNewWO({...newWO, startDate: e.target.value})}
                />
              </div>
            </div>

            <div className="form-grid-2 mt-3">
              <div className="form-group">
                <label>Target End Date</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={newWO.endDate}
                  onChange={(e) => setNewWO({...newWO, endDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Committed Delivery</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={newWO.deliveryDate}
                  onChange={(e) => setNewWO({...newWO, deliveryDate: e.target.value})}
                />
              </div>
            </div>

            <div className="form-actions mt-6">
              <button className="btn-outline" onClick={() => setShowManualCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                addManualWorkOrder({
                  ...newWO,
                  status: 'Pending',
                  date: new Date().toISOString()
                });
                setShowManualCreate(false);
                // Reset form
                setNewWO({
                  customer: '',
                  partName: '',
                  poId: '',
                  poNumber: '',
                  assignedUser: '',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: '',
                  deliveryDate: ''
                });
              }}>
                <ClipboardCheck size={18} /> Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderList;
