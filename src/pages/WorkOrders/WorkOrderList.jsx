import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  User, 
  Trash2,
  Plus,
  Edit2,
  ChevronDown,
  Check
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
import WODetailModal from './WODetailModal';
import WOCreateModal from './WOCreateModal';
import WODeleteModal from './WODeleteModal';

const WorkOrderList = () => {
  const { invoices, workOrders, purchaseOrders, addWorkOrder, addManualWorkOrder, updateWorkOrder, updateWorkOrderStatus, selectedWorkOrderId, setSelectedWorkOrderId, deleteWorkOrder, productionUsers } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedWO, setSelectedWO] = useState(null);
  const [showManualCreate, setShowManualCreate] = useState(false);

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

  const [itemsPerPage, setItemsPerPage] = useState(8);
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
      case 'Invoiced': return 'secondary';
      case 'Paid': return 'success';
      case 'Pending': return 'warning';
      case 'On Hold': return 'danger';
      default: return 'info';
    }
  };

  const getWorkflowStage = (wo) => {
    const linkedInvoices = (invoices || []).filter(inv => inv.linkedWO === wo.id);
    const taxInv = linkedInvoices.find(inv => inv.type === 'Tax');
    const piInv = linkedInvoices.find(inv => inv.type === 'Proforma');

    if (taxInv) {
      if (taxInv.status === 'Completed & Closed') return { label: 'Completed', color: '#059669', bg: '#ecfdf5' };
      if (taxInv.grnStatus === 'Received') return { label: 'GRN Received', color: '#059669', bg: '#ecfdf5' };
      if (taxInv.pendingAmount <= 0) return { label: 'Payment Received', color: '#10b981', bg: '#f0fdf4' };
      return { label: 'Tax Invoiced', color: '#6366f1', bg: '#eef2ff' };
    }
    
    if (piInv) {
      if (piInv.status === 'Converted to Tax Invoice') return { label: 'Tax Pending', color: '#6366f1', bg: '#eef2ff' };
      if (piInv.amountReceived > 0) return { label: 'Advance Paid', color: '#10b981', bg: '#f0fdf4' };
      return { label: 'PI Generated', color: '#818cf8', bg: '#f5f3ff' };
    }

    if (wo.status === 'Completed') return { label: 'Production Done', color: '#10b981', bg: '#f0fdf4' };
    if (wo.status === 'In Progress') return { label: 'In Production', color: '#2563eb', bg: '#eff6ff' };
    
    if (wo.poNumber && wo.poNumber !== 'DIRECT') return { label: 'PO Received', color: '#f59e0b', bg: '#fffbeb' };
    
    return { label: 'Order Queued', color: '#64748b', bg: '#f8fafc' };
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

        <div className="fc-table-container">
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
                <TableHead className="w-[140px] text-center">GRN Status</TableHead>
                <TableHead className="w-[180px] text-center">Progress</TableHead>
                <TableHead className="w-[160px] text-center">Delivery Metrics</TableHead>
                <TableHead className="w-[180px] text-center">Status / Stage</TableHead>
                <TableHead className="w-[100px] text-center">Actions</TableHead>
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
                    className={`cursor-pointer transition-all hover:bg-slate-50/80 ${
                      selectedWO?.id === wo.id ? 'bg-indigo-50/30' : 
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
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="font-mono font-bold text-slate-800 text-sm">
                          ₹{(wo.totalAmount || 0).toLocaleString('en-IN')}
                        </span>
                        {wo.partSubtotal > 0 ? (
                          <span className="text-[9px] font-semibold text-slate-400 leading-tight text-center">
                            ₹{wo.partSubtotal.toLocaleString('en-IN')} + 18% GST
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold text-slate-300">incl. GST</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {(() => {
                        const inv = (invoices || []).find(i => i.linkedWO === wo.id && i.type === 'Tax');
                        if (inv?.grnStatus === 'Received') {
                          return <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-bold"><Check size={10}/> {inv.grnNumber}</div>;
                        }
                        if (inv) {
                          return <span className="text-[10px] font-bold text-slate-400 italic">Expected</span>;
                        }
                        return <span className="text-[10px] font-bold text-slate-300">N/A</span>;
                      })()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center w-full">
                        <div className="w-[120px] space-y-1.5 flex flex-col items-center">
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                wo.status === 'Completed' ? 'bg-emerald-500' : 
                                wo.status === 'In Progress' ? 'bg-blue-500' : 'bg-amber-500'
                              }`} 
                              style={{ width: wo.status === 'Completed' ? '100%' : wo.status === 'In Progress' ? '50%' : '10%' }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 text-center uppercase">
                            {wo.status === 'Completed' ? 'Manuf. Done' : wo.status === 'In Progress' ? 'In Shop' : 'Queued'}
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
                       <div className="flex flex-col items-center gap-2">
                          {(() => {
                            const stage = getWorkflowStage(wo);
                            return (
                              <span 
                                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                                style={{ color: stage.color, backgroundColor: stage.bg, border: `1px solid ${stage.color}20` }}
                              >
                                {stage.label}
                              </span>
                            );
                          })()}
                          <div className="status-select-wrapper scale-90">
                            <select 
                              className="status-dropdown-premium px-2 py-0.5 text-[9px]"
                              style={getStatusStyle(wo.status)}
                              value={wo.status}
                              onChange={(e) => updateWorkOrderStatus(wo.id, e.target.value)}
                            >
                              {statusOptions.filter(o => o !== 'All').map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                            <ChevronDown size={8} className="status-chevron text-slate-400" />
                          </div>
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
          <DataTablePagination 
            currentPage={currentPage}
            totalItems={filteredWorkOrders.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────── */}
      <WODeleteModal
        workOrderId={deleteConfirmId}
        onConfirm={(id) => deleteWorkOrder(id)}
        onClose={() => setDeleteConfirmId(null)}
      />

      {selectedWO && (
        <WODetailModal
          wo={selectedWO}
          productionUsers={productionUsers || []}
          onClose={() => setSelectedWO(null)}
          onUpdate={(id, patch) => updateWorkOrder(id, patch)}
          onUpdateStatus={(id, status) => updateWorkOrderStatus(id, status)}
        />
      )}

      {showManualCreate && (
        <WOCreateModal
          purchaseOrders={purchaseOrders || []}
          productionUsers={productionUsers || []}
          onConfirm={(data) => addWorkOrder(data)}
          onClose={() => setShowManualCreate(false)}
        />
      )}

    </div>
  );
};

export default WorkOrderList;
