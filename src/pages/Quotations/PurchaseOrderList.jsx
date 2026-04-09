import React, { useState } from 'react';
import { 
  Plus,
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
  Calendar,
  DollarSign,
  Link,
  Hash
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
  const { purchaseOrders, quotations, workOrders, updatePurchaseOrderStatus, productionUsers, addWorkOrder, onNavigate, setSelectedWorkOrderId, deletePurchaseOrder, addPurchaseOrder } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
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
  const [showPOForm, setShowPOForm] = useState(false);
  const [poFormData, setPoFormData] = useState({
    customerName: '',
    quoteId: '',
    amount: '',
    poNumber: '',
    date: new Date().toISOString().split('T')[0]
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
          <button className="btn btn-primary" onClick={() => setShowPOForm(true)}>
            <Plus size={18} />
            New Purchase Order
          </button>
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

        <div className="fc-table-container">
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
                    className={`cursor-pointer transition-all hover:bg-slate-50/80 ${
                      selectedPO?.id === po.id ? 'bg-indigo-50/30' :
                      po.status === 'Completed' ? 'bg-green-50/20' :
                      po.status === 'Work Order Created' ? 'bg-blue-50/20' : ''
                    }`}
                    onClick={() => setSelectedPO(po)}
                  >
                    <TableCell className="text-center font-medium text-muted-foreground">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-bold">
                        {po.poNumber || `PO-${po.id}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <span className="font-bold text-slate-900 text-center">{po.customerName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs font-medium text-muted-foreground text-center">
                      {formatDate(po.date)}
                    </TableCell>
                    <TableCell className="font-bold text-right pr-4">
                      ₹{Number(po.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                        <span className="font-bold opacity-50">#</span>
                        {po.quoteId || '—'}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${
                        po.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        po.status === 'Work Order Created' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {po.status}
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
                          <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block px-2 py-1 bg-rose-600 text-white text-[10px] font-medium whitespace-nowrap rounded shadow-sm z-50 pointer-events-none">Delete PO</span>
                        </button>
                        {po.status !== 'Completed' && (
                          <button
                            className="relative group inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
                            onClick={() => { setSelectedPO(null); setWoCreationPO({ ...po }); }}
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
          <DataTablePagination 
            currentPage={currentPage}
            totalItems={filteredPOs.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>


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

      {/* PO Detail Side Drawer */}
      {selectedPO && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '420px', zIndex: 9999,
          background: '#fff',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
            padding: '1.5rem', flexShrink: 0
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  Purchase Order
                </p>
                <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 900, margin: '0.3rem 0 0.2rem', letterSpacing: '-0.01em' }}>
                  {selectedPO.customerName || 'Unknown Customer'}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', margin: 0 }}>
                  {selectedPO.id} &nbsp;&#183;&nbsp; {formatDate(selectedPO.date)}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6rem',
                  fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                  background: selectedPO.status === 'Completed' ? '#dcfce7' : selectedPO.status === 'Work Order Created' ? '#dbeafe' : '#fef3c7',
                  color: selectedPO.status === 'Completed' ? '#166534' : selectedPO.status === 'Work Order Created' ? '#1d4ed8' : '#92400e'
                }}>
                  {selectedPO.status || 'Received'}
                </span>
                <button onClick={() => setSelectedPO(null)} style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                  width: '2rem', height: '2rem', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', flexShrink: 0
                }}>
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.875rem', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>Customer</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{selectedPO.customerName || 'N/A'}</p>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.875rem', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>Date Received</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{formatDate(selectedPO.date)}</p>
                </div>
                <div style={{ background: '#0f172a', borderRadius: '0.75rem', padding: '0.875rem' }}>
                  <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>Agreement Value</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 900, color: '#fff', margin: 0 }}>{selectedPO.amount || '0'}</p>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.875rem', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>Quote Reference</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6366f1', margin: 0 }}>{selectedPO.quoteId || 'Not Linked'}</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Line Items</p>
                <span style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #e0e7ff', borderRadius: '9999px', fontSize: '0.6rem', fontWeight: 800, padding: '0.15rem 0.5rem' }}>
                  {((quotations || []).find(q => q.id === selectedPO.quoteId)?.parts || []).length} items
                </span>
              </div>
              {((quotations || []).find(q => q.id === selectedPO.quoteId)?.parts || []).length > 0 ? (
                <div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        <th style={{ padding: '0.6rem 0.875rem', fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Part</th>
                        <th style={{ padding: '0.6rem 0.5rem', fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>Qty</th>
                        <th style={{ padding: '0.6rem 0.875rem', fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {((quotations || []).find(q => q.id === selectedPO.quoteId)?.parts || []).map((part, idx, arr) => (
                        <tr key={idx} style={{ borderBottom: idx < arr.length - 1 ? '1px solid #f1f5f9' : 'none', background: '#fff' }}>
                          <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>{part?.name || 'Unknown'}</td>
                          <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                            <span style={{ background: '#f1f5f9', color: '#475569', borderRadius: '0.375rem', padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>
                              {part?.qty || 0} {part?.unit || 'pcs'}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>
                            &#8377;{Number(part?.price || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>No linked quote items</p>
                </div>
              )}
            </div>

            <div style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Linked Work Orders</p>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 0 3px rgba(16,185,129,0.15)' }} />
              </div>

              {(workOrders || []).filter(wo => wo && (wo.poInternalId === selectedPO.id || wo.poId === selectedPO.id || wo.poNumber === selectedPO.poNumber)).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {(workOrders || []).filter(wo => wo && (wo.poInternalId === selectedPO.id || wo.poId === selectedPO.id || wo.poNumber === selectedPO.poNumber)).map(wo => (
                    <div key={wo.id}
                      onClick={() => { if (setSelectedWorkOrderId && onNavigate) { setSelectedWorkOrderId(wo.id); onNavigate('Work Orders'); } }}
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.875rem', padding: '0.875rem 1rem', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <ClipboardCheck size={13} color="#6366f1" />
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase' }}>{wo.id}</span>
                        </div>
                        <span style={{
                          padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.6rem', fontWeight: 800,
                          background: wo.status === 'Completed' ? '#dcfce7' : wo.status === 'In Progress' ? '#dbeafe' : '#fef3c7',
                          color: wo.status === 'Completed' ? '#166534' : wo.status === 'In Progress' ? '#1d4ed8' : '#92400e'
                        }}>{wo.status || 'Pending'}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{wo.partName || 'Production Order'}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '0.5rem', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.65rem', color: '#6366f1', fontWeight: 700 }}>View Order</span>
                        <ArrowRight size={11} color="#6366f1" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.875rem', padding: '1.25rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 1rem' }}>No work orders initiated yet.</p>
                  {selectedPO.status !== 'Completed' && (
                    <button
                      onClick={() => { setWoCreationPO({ ...selectedPO }); setTimeout(() => setSelectedPO(null), 10); }}
                      style={{
                        width: '100%', height: '2.5rem', border: 'none', borderRadius: '0.625rem',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                        color: '#fff', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em',
                        boxShadow: '0 4px 12px rgba(15,23,42,0.25)'
                      }}
                    >
                      <FilePlus size={15} /> Initiate New Work Order
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual PO Creation Form Modal */}
      {showPOForm && (
        <div className="modal-overlay" style={{ background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(10px)' }}>
          <div className="modal-content bg-white shadow-2xl animate-in fade-in zoom-in duration-300" style={{ maxWidth: '640px', padding: '3rem', borderRadius: '2rem', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-tight">Log Manual Purchase Order</h2>
                <p className="text-sm text-slate-500 mt-1">Directly record an incoming project order for execution tracking.</p>
              </div>
              <button 
                className="p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all" 
                onClick={() => setShowPOForm(false)}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const poData = {
                ...poFormData,
                poNumber: poFormData.poNumber || `MPO-${Math.floor(Math.random() * 10000)}`,
                amount: `₹${Number(poFormData.amount).toLocaleString('en-IN')}`,
                status: 'Received'
              };
              
              addPurchaseOrder(poData);
              setShowPOForm(false);
              setPoFormData({
                customerName: '',
                quoteId: '',
                amount: '',
                poNumber: '',
                date: new Date().toISOString().split('T')[0]
              });
            }} className="space-y-8">
              
              <div className="grid grid-cols-2 gap-8">
                <div className="form-group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2.5">
                    <User size={14} className="text-indigo-400" /> Customer Identity
                  </label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Reliance Industrial"
                    className="form-input h-12"
                    value={poFormData.customerName}
                    onChange={(e) => setPoFormData({...poFormData, customerName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2.5">
                    <Hash size={14} className="text-indigo-400" /> PO Number (Optional)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. PO-88772"
                    className="form-input h-12"
                    value={poFormData.poNumber}
                    onChange={(e) => setPoFormData({...poFormData, poNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="form-group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2.5">
                    <Link size={14} className="text-indigo-400" /> Linked Quotation Ref
                  </label>
                  <select 
                    className="form-input h-12"
                    value={poFormData.quoteId}
                    onChange={(e) => {
                      const selectedQuote = quotations.find(q => q.id === e.target.value);
                      setPoFormData({
                        ...poFormData, 
                        quoteId: e.target.value,
                        customerName: selectedQuote ? selectedQuote.customerName : poFormData.customerName,
                        amount: selectedQuote ? selectedQuote.totalAmount : poFormData.amount
                      });
                    }}
                  >
                    <option value="">-- No Link (Generic PO) --</option>
                    {(quotations || []).map(q => (
                      <option key={q.id} value={q.id}>{q.id} - {q.customerName} (₹{Number(q.totalAmount).toLocaleString('en-IN')})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2.5">
                    <Calendar size={14} className="text-indigo-400" /> Agreement Date
                  </label>
                  <input 
                    type="date" 
                    required
                    className="form-input h-12"
                    value={poFormData.date}
                    onChange={(e) => setPoFormData({...poFormData, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2.5">
                  <DollarSign size={14} className="text-indigo-400" /> Total Contract Value (₹)
                </label>
                <div className="relative group">
                   <div className="absolute left-0 top-0 h-full w-14 flex items-center justify-center bg-slate-50 border-r border-slate-200 rounded-l-lg transition-colors group-focus-within:bg-indigo-50 group-focus-within:border-indigo-200">
                     <span className="text-lg font-black text-slate-900">₹</span>
                   </div>
                   <input 
                    required 
                    type="number" 
                    placeholder="e.g. 125000"
                    className="form-input pl-18 text-xl font-black tracking-tight h-16 shadow-inner"
                    value={poFormData.amount}
                    onChange={(e) => setPoFormData({...poFormData, amount: e.target.value})}
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest px-1">Amount will be processed in Indian Rupees (INR)</p>
              </div>

              <div className="pt-8 flex gap-4">
                <button type="button" className="btn-outline flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all" onClick={() => setShowPOForm(false)}>Discard Draft</button>
                <button type="submit" className="btn btn-primary flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-slate-900/20">
                  <FilePlus size={18} /> Log Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Work Order Creation Modal - ROOT LEVEL */}
      {woCreationPO && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10001,
          background: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            width: '100%', maxWidth: '560px',
            background: '#fff',
            borderRadius: '1.5rem',
            boxShadow: '0 32px 64px -12px rgba(0,0,0,0.25)',
            overflow: 'hidden',
            animation: 'fadeIn 0.25s ease-out'
          }}>
            {/* Header Strip */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
              padding: '1.5rem 2rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>
                  Production Initiation
                </p>
                <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
                  Create Work Order
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '0.25rem', margin: 0 }}>
                  Against PO: <span style={{ color: '#818cf8', fontWeight: 700 }}>{woCreationPO?.poNumber || '—'}</span>
                  &nbsp;·&nbsp; {woCreationPO?.customerName || '—'}
                </p>
              </div>
              <button
                onClick={() => setWoCreationPO(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                  width: '2.25rem', height: '2.25rem', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addWorkOrder({
                  ...workOrderData,
                  poNumber: woCreationPO?.poNumber,
                  poInternalId: woCreationPO?.id,
                  quoteId: woCreationPO?.quoteId,
                  customer: woCreationPO?.customerName,
                  status: 'Pending'
                });
                setWoCreationPO(null);
                setWorkOrderData({
                  partName: '',
                  assignedUser: '',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: '',
                  deliveryDate: ''
                });
              }}
              style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
            >

              {/* Item Selection */}
              <div>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: '#64748b', marginBottom: '0.5rem'
                }}>
                  <Link size={12} color="#6366f1" /> Production Item
                </label>
                {woCreationPO?.quoteId ? (
                  <select
                    required
                    value={workOrderData.partName}
                    onChange={(e) => setWorkOrderData({ ...workOrderData, partName: e.target.value })}
                    style={{
                      width: '100%', height: '2.75rem', padding: '0 0.875rem',
                      border: '1px solid #e2e8f0', borderRadius: '0.625rem',
                      fontSize: '0.875rem', fontWeight: 600, color: '#0f172a',
                      background: '#f8fafc', outline: 'none', cursor: 'pointer',
                      appearance: 'auto'
                    }}
                  >
                    <option value="">— Select item from Purchase Order —</option>
                    {((quotations || []).find(q => q.id === woCreationPO.quoteId)?.parts || []).map((part, idx) => (
                      <option key={idx} value={part?.name || ''}>
                        {part?.qty || 0} {part?.unit || 'pcs'} — {part?.name || 'Unknown'} (₹{Number(part?.price || 0).toLocaleString('en-IN')} each)
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    type="text"
                    placeholder="e.g. Custom Fabrication Part, Service Item…"
                    value={workOrderData.partName}
                    onChange={(e) => setWorkOrderData({ ...workOrderData, partName: e.target.value })}
                    style={{
                      width: '100%', height: '2.75rem', padding: '0 0.875rem',
                      border: '1px solid #e2e8f0', borderRadius: '0.625rem',
                      fontSize: '0.875rem', fontWeight: 600, color: '#0f172a',
                      background: '#f8fafc', outline: 'none'
                    }}
                  />
                )}
              </div>

              {/* Assigned To + Start Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: '#64748b', marginBottom: '0.5rem'
                  }}>
                    <User size={12} color="#6366f1" /> Assign Technician
                  </label>
                  <select
                    required
                    value={workOrderData.assignedUser}
                    onChange={(e) => setWorkOrderData({ ...workOrderData, assignedUser: e.target.value })}
                    style={{
                      width: '100%', height: '2.75rem', padding: '0 0.875rem',
                      border: '1px solid #e2e8f0', borderRadius: '0.625rem',
                      fontSize: '0.875rem', color: '#0f172a',
                      background: '#f8fafc', outline: 'none', cursor: 'pointer'
                    }}
                  >
                    <option value="">— Select —</option>
                    {(productionUsers || []).map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: '#64748b', marginBottom: '0.5rem'
                  }}>
                    <Calendar size={12} color="#6366f1" /> Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={workOrderData.startDate}
                    onChange={(e) => setWorkOrderData({ ...workOrderData, startDate: e.target.value })}
                    style={{
                      width: '100%', height: '2.75rem', padding: '0 0.875rem',
                      border: '1px solid #e2e8f0', borderRadius: '0.625rem',
                      fontSize: '0.875rem', color: '#0f172a',
                      background: '#f8fafc', outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Target + Dispatch Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: '#64748b', marginBottom: '0.5rem'
                  }}>
                    <Calendar size={12} color="#6366f1" /> Target Completion
                  </label>
                  <input
                    type="date"
                    required
                    value={workOrderData.endDate}
                    onChange={(e) => setWorkOrderData({ ...workOrderData, endDate: e.target.value })}
                    style={{
                      width: '100%', height: '2.75rem', padding: '0 0.875rem',
                      border: '1px solid #e2e8f0', borderRadius: '0.625rem',
                      fontSize: '0.875rem', color: '#0f172a',
                      background: '#f8fafc', outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: '#64748b', marginBottom: '0.5rem'
                  }}>
                    <Calendar size={12} color="#6366f1" /> Dispatch Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={workOrderData.deliveryDate}
                    onChange={(e) => setWorkOrderData({ ...workOrderData, deliveryDate: e.target.value })}
                    style={{
                      width: '100%', height: '2.75rem', padding: '0 0.875rem',
                      border: '1px solid #e2e8f0', borderRadius: '0.625rem',
                      fontSize: '0.875rem', color: '#0f172a',
                      background: '#f8fafc', outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '0.25rem' }} />

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setWoCreationPO(null)}
                  style={{
                    flex: 1, height: '2.75rem', border: '1px solid #e2e8f0',
                    borderRadius: '0.625rem', background: '#fff', color: '#475569',
                    fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                    textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2, height: '2.75rem', border: 'none',
                    borderRadius: '0.625rem',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                    color: '#fff', fontSize: '0.8rem', fontWeight: 800,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '0.5rem',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.3)'
                  }}
                >
                  <ClipboardCheck size={16} /> Confirm Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
};

export default PurchaseOrderList;
