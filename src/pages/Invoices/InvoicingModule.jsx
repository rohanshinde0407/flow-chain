import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  Upload,
  AlertCircle,
  Trash2,
  AlertTriangle,
  X,
  ArrowRight,
  Wallet,
  FilePlus,
  CreditCard,
  Truck,
  Check,
  DollarSign,
  Clock,
  Link2,
  ShieldCheck,
  Zap,
  Download,
  Edit2,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTablePagination from '../../components/common/DataTablePagination';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../../components/ui/table';
import './Invoices.css';

const InvoicingModule = () => {
  const { invoices, workOrders, purchaseOrders, addInvoice, deleteInvoice, convertToTaxInvoice, addPaymentEntry, updateInvoiceGRN, sendPI, sendInvoice, onNavigate } = useApp();
  const [activeTab, setActiveTab] = useState('Proforma');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [paymentModalData, setPaymentModalData] = useState(null);
  const [grnModalData, setGrnModalData] = useState(null);
  const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState(null);
  const [isEditingGRN, setIsEditingGRN] = useState(false);
  const [isDocumentView, setIsDocumentView] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [createForm, setCreateForm] = useState({
    type: 'Proforma',
    poId: '',
    customerName: '',
    items: [], // [{ woId, partName, amount }]
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    isPreview: false
  });

  const resetCreateForm = () => {
    setCreateForm({
      type: 'Proforma',
      poId: '',
      customerName: '',
      items: [],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      isPreview: false
    });
    setShowCreateModal(false);
  };

  const handleCreateSubmit = (data) => {
    // Use partSubtotal-based calculation (ex-GST) as true subtotal
    const exGSTSubtotal = data.items.reduce((sum, item) => sum + (item.partSubtotal || Math.round((Number(item.amount) || 0) / 1.18)), 0);
    const gstAmount = data.items.reduce((sum, item) => sum + (item.partGST || Math.round(((Number(item.amount) || 0) / 1.18) * 0.18)), 0);
    const grand = exGSTSubtotal + gstAmount;
    const isPI = data.type === 'Proforma';

    addInvoice({
      type: data.type,
      customerName: data.customerName,
      linkedPO: data.poId,
      items: data.items,
      totalAmount: grand,
      subtotalAmount: exGSTSubtotal,
      taxAmount: gstAmount,
      cgst: Math.round(gstAmount / 2),
      sgst: Math.round(gstAmount / 2),
      advanceAmount: isPI ? Math.round(grand * 0.5) : 0,
      balanceAmount: isPI ? Math.round(grand * 0.5) : grand,
      amountReceived: data.items.reduce((s, i) => s + (i.amountReceived || 0), 0),
      pendingAmount: grand - data.items.reduce((s, i) => s + (i.amountReceived || 0), 0),
      dueDate: data.dueDate,
      status: isPI ? 'Pending' : 'Unpaid'
    });

    setActiveTab(isPI ? 'Proforma' : 'Tax');
    resetCreateForm();
  };

  const getInvoiceStatusClass = (status) => {
    switch (status) {
      case 'Completed & Closed': return 'success';
      case 'Paid': return 'success';
      case 'GRN Pending': return 'warning';
      case 'On Hold': return 'danger';
      case 'Sent': return 'info';
      case 'Partial': return 'info';
      case 'Unpaid': return 'warning';
      case 'Pending': return 'warning';
      case 'Converted to Tax Invoice': return 'secondary';
      default: return 'info';
    }
  };

  const filteredInvoices = (invoices || [])
    .filter(inv => activeTab === 'Proforma' ? inv.type === 'Proforma' : inv.type === 'Tax')
    .filter(inv => {
      const term = searchTerm.toLowerCase();
      return (
        (inv.id || '').toLowerCase().includes(term) ||
        (inv.customerName || '').toLowerCase().includes(term) ||
        (inv.linkedWO || '').toLowerCase().includes(term) ||
        (inv.linkedPI || '').toLowerCase().includes(term)
      );
    });

  const paginatedData = filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    addPaymentEntry(paymentModalData.id, {
      amount: Number(formData.get('amount')),
      method: formData.get('method'),
      date: formData.get('date'),
      reference: formData.get('reference')
    });
    setPaymentModalData(null);
  };

  const handleGRNSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const grnNumber = formData.get('grnNumber');
    const invId = grnModalData ? grnModalData.id : selectedInvoiceDetail.id;

    updateInvoiceGRN(invId, grnNumber);
    setGrnModalData(null);
    setIsEditingGRN(false);

    if (selectedInvoiceDetail) {
      const updatedInvoices = invoices || [];
      const updatedInv = updatedInvoices.find(i => i.id === invId);
      setSelectedInvoiceDetail({
        ...selectedInvoiceDetail,
        grnStatus: 'Received',
        grnNumber,
        status: updatedInv?.pendingAmount <= 0 ? 'Completed & Closed' : 'Paid'
      });
    }
  };

  const EmptyState = ({ tab }) => {
    const config = {
      Proforma: {
        icon: Receipt,
        title: 'No Proforma Invoices Found',
        desc: 'All pending quotations that await advance collection or initial billing will be tracked here.'
      },
      Tax: {
        icon: FileText,
        title: 'Tax Ledger is Empty',
        desc: 'Completed transactions that are officially certified for tax compliance will appear in this repository.'
      }
    }[tab];

    return (
      <div className="premium-empty-state">
        <div className="empty-icon-ring">
          <config.icon size={32} strokeWidth={1.5} />
        </div>
        <h3 className="empty-title">{config.title}</h3>
        <p className="empty-desc">{config.desc}</p>
        <button
          className="empty-action-btn"
          onClick={() => onNavigate('Work Orders')}
        >
          <ArrowRight size={16} />
          Manage Work Orders
        </button>
      </div>
    );
  };

  return (
    <div className="module-container-wrapper">
      <div className="module-container">
        <div className="module-header-standard">
          <div className="header-primary-content">
            <h1 className="header-title">Invoicing &amp; Ledger</h1>
            <p className="header-subtitle">Generate Proforma &amp; Tax Invoices from Purchase Orders and Work Orders.</p>
          </div>
          <div className="header-secondary-actions">
            <button
              className="btn-billing-premium"
              onClick={() => setShowCreateModal(true)}
            >
              <FilePlus size={18} />
              Generate {activeTab === 'Tax' ? 'Tax Invoice' : 'Proforma Invoice'}
            </button>
          </div>
        </div>

        <div className="invoicing-action-bar">
          <div className="action-tabs-row">
            <div className="tabs-pill-container">
              <button className={`tab-pill-btn ${activeTab === 'Proforma' ? 'active' : ''}`} onClick={() => setActiveTab('Proforma')}>
                Proforma (PI)
              </button>
              <button className={`tab-pill-btn ${activeTab === 'Tax' ? 'active' : ''}`} onClick={() => setActiveTab('Tax')}>
                Tax Invoices
              </button>
            </div>
          </div>
          <div className="action-controls-row">
            <div className="search-box-standard">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder={`Search across ${activeTab.toLowerCase()}...`} value={searchTerm} onChange={handleSearch} />
            </div>
            <button className="filter-btn-standard"><Filter size={18} /><span>Filters</span></button>
          </div>
        </div>

        <div className="module-card">
          {paginatedData.length === 0 ? (
            <EmptyState tab={activeTab} />
          ) : (
            <div className="fc-table-container">
              <Table className="min-w-[1100px]">
                <TableHeader>
                  {activeTab === 'Proforma' && (
                    <TableRow>
                      <TableHead className="w-[60px] text-center">SN</TableHead>
                      <TableHead className="w-[160px]">PI Number</TableHead>
                      <TableHead className="w-[140px]">Linked WO</TableHead>
                      <TableHead className="w-[180px]">Client Name</TableHead>
                      <TableHead className="w-[130px] text-right">Total (₹)</TableHead>
                      <TableHead className="w-[130px] text-right">Adv. Req. (₹)</TableHead>
                      <TableHead className="w-[130px] text-right">Unpaid (₹)</TableHead>
                      <TableHead className="w-[120px] text-center">Due On</TableHead>
                      <TableHead className="w-[140px] text-center">Status</TableHead>
                      <TableHead className="w-[200px] text-right px-6">Actions</TableHead>
                    </TableRow>
                  )}
                  {activeTab === 'Tax' && (
                    <TableRow>
                      <TableHead className="w-[60px] text-center">SN</TableHead>
                      <TableHead className="w-[160px]">Invoice ID</TableHead>
                      <TableHead className="w-[140px]">Reference</TableHead>
                      <TableHead className="w-[180px]">Client Name</TableHead>
                      <TableHead className="w-[130px] text-right">Certified (₹)</TableHead>
                      <TableHead className="w-[130px] text-right">Settled (₹)</TableHead>
                      <TableHead className="w-[130px] text-right">Due (₹)</TableHead>
                      <TableHead className="w-[130px] text-center">GRN Ref</TableHead>
                      <TableHead className="w-[140px] text-center">Status</TableHead>
                      <TableHead className="w-[200px] text-right px-6">Actions</TableHead>
                    </TableRow>
                  )}
                </TableHeader>
                <TableBody>
                  {activeTab === 'Proforma' && paginatedData.map((inv, idx) => (
                    <TableRow
                      key={inv.id}
                      className={`transition-all ${inv.status === 'Converted to Tax Invoice' ? 'opacity-40' : 'cursor-pointer hover:bg-slate-50/80'
                        }`}
                    >
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-indigo-600 text-xs bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 uppercase tracking-wider">
                          {inv.id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {inv.linkedWO}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-slate-700">{inv.customerName}</TableCell>
                      <TableCell className="text-right font-mono font-bold">₹{(inv.totalAmount || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-indigo-600">₹{(inv.advanceAmount || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-rose-500">₹{(inv.balanceAmount || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-center text-slate-500 font-medium text-xs">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border badge-${getInvoiceStatusClass(inv.status)}`}>
                          {inv.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right px-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          {inv.status !== 'Converted to Tax Invoice' && (
                            <>
                              <button
                                className="btn btn-sm bg-emerald-500 text-green-500 hover:bg-emerald-600 h-8 px-3 font-black text-[10px] border-none flex items-center gap-1.5 shadow-md shadow-emerald-100 ring-1 ring-emerald-400/20"
                                onClick={() => sendInvoice(inv.id)}
                              >
                                <Send size={12} /> SEND
                              </button>
                              <button
                                className={`btn btn-sm h-8 px-3 font-black text-[10px] border-none ${inv.balanceAmount <= 0 ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  }`}
                                onClick={() => inv.balanceAmount <= 0 && convertToTaxInvoice(inv.id)}
                                title={inv.balanceAmount > 0 ? 'Full settlement required to bill' : 'Generate Tax Invoice'}
                              >
                                BILL
                              </button>
                            </>
                          )}
                          <button
                            className="relative group inline-flex h-8 w-8 items-center justify-center text-rose-400 hover:text-rose-600 transition-colors"
                            onClick={() => setDeleteConfirmId(inv.id)}
                          >
                            <Trash2 size={16} />
                            <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block px-2 py-1 bg-rose-600 text-white text-[10px] font-medium whitespace-nowrap rounded shadow-sm z-50 pointer-events-none">Delete</span>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {activeTab === 'Tax' && paginatedData.map((inv, idx) => (
                    <TableRow
                      key={inv.id}
                      className={`cursor-pointer transition-all hover:bg-slate-50/80 ${inv.status === 'GRN Pending' ? 'bg-amber-50/20' : ''
                        }`}
                      onClick={() => { setSelectedInvoiceDetail(inv); setIsEditingGRN(false); setIsDocumentView(false); }}
                    >
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-emerald-700 text-xs bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 uppercase tracking-wider">
                          {inv.id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          {inv.linkedWO || inv.linkedPI}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-slate-700">{inv.customerName}</TableCell>
                      <TableCell className="text-right font-mono font-bold">₹{(inv.totalAmount || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-emerald-600">₹{(inv.amountReceived || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-rose-600">₹{(inv.pendingAmount || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                        {inv.grnStatus === 'Received'
                          ? <div className="grn-badge"><Check size={12} /> {inv.grnNumber}</div>
                          : <button
                            className={`text-[10px] font-black ${inv.pendingAmount <= 0 ? 'text-rose-600' : 'text-indigo-600'
                              } hover:underline`}
                            onClick={(e) => { e.stopPropagation(); setGrnModalData(inv); }}
                          >
                            {inv.pendingAmount <= 0 ? 'Urgent: ADD GRN' : 'RECORD GRN'}
                          </button>
                        }
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border badge-${getInvoiceStatusClass(inv.status)}`}>
                          {inv.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right px-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          <button
                            className="btn btn-sm bg-emerald-500 text-green-500 hover:bg-emerald-600 h-8 px-3 font-black text-[10px] border-none flex items-center gap-1.5 shadow-md shadow-emerald-100 ring-1 ring-emerald-400/20"
                            onClick={() => sendInvoice(inv.id)}
                          >
                            <Send size={12} /> SEND
                          </button>
                          <button
                            className="btn btn-sm btn-outline h-8 px-3 font-black text-[10px]"
                            onClick={() => setPaymentModalData(inv)}
                            disabled={inv.pendingAmount <= 0}
                          >
                            PAY
                          </button>
                          <button className="relative group inline-flex h-8 w-8 items-center justify-center text-slate-400 hover:text-indigo-600 rounded-lg transition-colors">
                            <Download size={16} />
                            <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-[10px] font-medium whitespace-nowrap rounded shadow-sm z-50 pointer-events-none">Download</span>
                          </button>
                          <button
                            className="relative group inline-flex h-8 w-8 items-center justify-center text-rose-400 hover:text-rose-600 transition-colors"
                            onClick={() => setDeleteConfirmId(inv.id)}
                          >
                            <Trash2 size={16} />
                            <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block px-2 py-1 bg-rose-600 text-white text-[10px] font-medium whitespace-nowrap rounded shadow-sm z-50 pointer-events-none">Delete</span>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <DataTablePagination
                currentPage={currentPage}
                totalItems={filteredInvoices.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </div>

        {/* Modals handled conditionally below */}
        {paymentModalData && (
          <div className="dialog-overlay">
            <div className="dialog-content" style={{ maxWidth: '450px' }}>
              <div className="dialog-header">
                <div className="flex justify-between items-center">
                  <h2 className="dialog-title text-indigo-700">Financial Settlement</h2>
                  <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full" onClick={() => setPaymentModalData(null)}><X size={20} /></button>
                </div>
              </div>
              <form onSubmit={handlePaymentSubmit}>
                <div className="dialog-body space-y-6">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Balance to Settle</label>
                    <span className="text-3xl font-black text-rose-600 font-mono">₹{paymentModalData.pendingAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Collected Amount (₹)</label>
                      <input type="number" name="amount" className="form-input font-bold" required max={paymentModalData.pendingAmount} defaultValue={paymentModalData.pendingAmount} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Channel</label>
                      <select name="method" className="form-input font-bold" required>
                        <option value="UPI">UPI / GPay</option>
                        <option value="Bank Transfer">NEFT/RTGS</option>
                        <option value="Cheque">Physical Cheque</option>
                        <option value="Cash">Cash Ledger</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">UTR / Transaction Ref</label>
                    <input type="text" name="reference" className="form-input" placeholder="e.g. 1928374615" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">Value Date</label>
                    <input type="date" name="date" className="form-input font-bold" required defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <div className="dialog-footer">
                  <button type="button" className="h-10 px-6 font-bold text-xs" onClick={() => setPaymentModalData(null)}>CANCEL</button>
                  <button type="submit" className="btn btn-primary h-11 px-8 font-black text-xs shadow-lg shadow-indigo-100">RECORD TRANSACTION</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedInvoiceDetail && (() => {
          const isPaid = (selectedInvoiceDetail.pendingAmount || 0) <= 0;
          const isGRN = selectedInvoiceDetail.grnStatus === 'Received';
          const isFinal = selectedInvoiceDetail.status === 'Completed & Closed';
          const showGRNForm = !isGRN || isEditingGRN;

          let currentStep = 1;
          if (isPaid) currentStep = 2;
          if (isGRN) currentStep = 3;
          if (isFinal) currentStep = 4;

          return (
            <div className="dialog-overlay">
              <div className="dialog-content" style={{ maxWidth: '900px', borderRadius: '1.5rem' }}>
                <div className="dialog-header">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100"><Receipt size={24} /></div>
                      <div>
                        <h2 className="dialog-title">{isDocumentView ? 'Standard Tax Invoice' : 'Invoice Intelligence Hub'}</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs font-black text-indigo-600">{selectedInvoiceDetail.id}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedInvoiceDetail.customerName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="tabs-list" style={{ height: '2.25rem' }}>
                        <button className={`tabs-trigger ${!isDocumentView ? 'active' : ''}`} style={{ padding: '0 1rem' }} onClick={() => setIsDocumentView(false)}>Operational</button>
                        <button className={`tabs-trigger ${isDocumentView ? 'active' : ''}`} style={{ padding: '0 1rem' }} onClick={() => setIsDocumentView(true)}>Document</button>
                      </div>
                      <button className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl" onClick={() => setSelectedInvoiceDetail(null)}><X size={22} /></button>
                    </div>
                  </div>
                </div>

                <div className="dialog-body pt-8">
                  {isDocumentView ? (
                    <div className="invoice-paper">
                      <div className="invoice-paper-header">
                        <div className="company-brand">
                          <h2>FLOWCHAIN OPERATIONS</h2>
                          <p>Industrial Zone, Phase II, Maharashtra, India</p>
                          <p>GSTIN: 27AAACF9123Q1Z5</p>
                        </div>
                        <div className="invoice-meta">
                          <h1>TAX INVOICE</h1>
                          <div className="invoice-meta-grid">
                            <label>Invoice No:</label>
                            <span>{selectedInvoiceDetail.id}</span>
                            <label>Date:</label>
                            <span>{selectedInvoiceDetail.date ? new Date(selectedInvoiceDetail.date).toLocaleDateString('en-GB') : 'N/A'}</span>
                            <label>Linked Ref:</label>
                            <span>{selectedInvoiceDetail.linkedWO || selectedInvoiceDetail.linkedPO}</span>
                          </div>
                        </div>
                      </div>

                      <div className="billing-info-grid">
                        <div className="bill-to">
                          <h3>BILL TO</h3>
                          <div className="customer-name">{selectedInvoiceDetail.customerName}</div>
                          <div className="customer-details">
                            Corporate Office, Block B, Tech Hub<br />
                            GSTIN: 27BBBCS4567M2Z1
                          </div>
                        </div>
                        <div className="ship-to">
                          <h3>SHIP TO</h3>
                          <div className="customer-name">{selectedInvoiceDetail.customerName}</div>
                          <div className="customer-details">
                            Factory Plant 1, Warehouse Section A<br />
                            (Same as Billing Address)
                          </div>
                        </div>
                      </div>

                      <table className="document-table">
                        <thead>
                          <tr>
                            <th>Description</th>
                            <th className="text-right">Qty</th>
                            <th className="text-right">Unit Price</th>
                            <th className="text-right">Total (₹)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedInvoiceDetail.items || []).map((it, i) => (
                            <tr key={i}>
                              <td className="font-bold">{it.partName}</td>
                              <td className="text-right">{it.partQty || 1}</td>
                              <td className="text-right">₹{((it.amount || 0) / 1.18).toFixed(2)}</td>
                              <td className="text-right">₹{(it.amount || 0).toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                          {(!selectedInvoiceDetail.items || selectedInvoiceDetail.items.length === 0) && (
                            <tr>
                              <td className="font-bold">Operational Settlement for {selectedInvoiceDetail.linkedWO || selectedInvoiceDetail.linkedPO}</td>
                              <td className="text-right">1.00</td>
                              <td className="text-right">₹{(selectedInvoiceDetail.totalAmount / 1.18).toFixed(2)}</td>
                              <td className="text-right">₹{selectedInvoiceDetail.totalAmount?.toLocaleString('en-IN')}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      <div className="invoice-summary">
                        <div className="summary-rows">
                          <div className="summary-row">
                            <label className="font-bold text-slate-400">Subtotal</label>
                            <span className="font-mono">₹{(selectedInvoiceDetail.totalAmount / 1.18).toFixed(2)}</span>
                          </div>
                          <div className="summary-row">
                            <label className="font-bold text-slate-400">GST (18%)</label>
                            <span className="font-mono">₹{(selectedInvoiceDetail.totalAmount - (selectedInvoiceDetail.totalAmount / 1.18)).toFixed(2)}</span>
                          </div>
                          <div className="summary-row total">
                            <label>Grand Total</label>
                            <span className="font-mono">₹{selectedInvoiceDetail.totalAmount?.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      {isGRN && (
                        <div className="grn-verification-stamp">
                          <div className="stamp-icon"><ShieldCheck size={28} /></div>
                          <div className="stamp-text">
                            <p>Digitally Authenticated Delivery Proof</p>
                            <h4>GRN REF: {selectedInvoiceDetail.grnNumber}</h4>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="status-stepper mb-10">
                        <div className="stepper-line"></div>
                        <div className="stepper-progress" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
                        {[
                          { label: 'Created', icon: FilePlus, step: 1 },
                          { label: 'Settled', icon: CreditCard, step: 2 },
                          { label: 'Verified', icon: Truck, step: 3 },
                          { label: 'Closed', icon: ShieldCheck, step: 4 }
                        ].map(s => (
                          <div key={s.label} className={`step-item ${currentStep >= s.step ? 'completed' : ''} ${currentStep === s.step ? 'active' : ''}`}>
                            <div className="step-dot">{currentStep > s.step ? <Check size={18} /> : <s.icon size={18} />}</div>
                            <span className="step-label">{s.label}</span>
                          </div>
                        ))}
                      </div>

                      <div className="metric-card-grid mb-10">
                        <div className="premium-card">
                          <label>Fulfillment State</label>
                          <div className="flex items-center gap-2">
                            <span className="value">{selectedInvoiceDetail.status}</span>
                            {isFinal && <CheckCircle2 size={16} className="text-emerald-500" />}
                          </div>
                        </div>
                        <div className="premium-card">
                          <label>Total Certified</label>
                          <span className="value">₹{selectedInvoiceDetail.totalAmount?.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="premium-card">
                          <label>Exposure / Due</label>
                          <span className="value text-rose-600">₹{selectedInvoiceDetail.pendingAmount?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Traceability Matrix</h4>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-xs font-bold text-slate-500">Operation Link</span>
                              <span className="font-mono text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{selectedInvoiceDetail.linkedWO || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <span className="text-xs font-bold text-slate-500">Billing Anchor</span>
                              <span className="font-mono text-sm font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">{selectedInvoiceDetail.linkedPO || selectedInvoiceDetail.linkedPI}</span>
                            </div>
                          </div>
                        </div>

                        <div className="auth-hub-card">
                          <div className="auth-hub-header">
                            <h4>Order Authentication Hub</h4>
                            {selectedInvoiceDetail.type === 'Tax' && isGRN && !isEditingGRN && (
                              <button className="text-[10px] font-black text-indigo-600 flex items-center gap-1 hover:underline" onClick={() => setIsEditingGRN(true)}><Edit2 size={12} /> UPDATE</button>
                            )}
                          </div>
                          <div className="auth-hub-body">
                            {selectedInvoiceDetail.type === 'Tax' ? (
                              <>
                                {showGRNForm ? (
                                  <div className="space-y-4">
                                    <p className="text-[11px] text-slate-500 font-medium italic">Enter customer GRN reference to finalize order closure.</p>
                                    <form onSubmit={handleGRNSubmit} className="flex gap-2">
                                      <input type="text" name="grnNumber" className="form-input font-bold" placeholder="Registry GRN Number..." required defaultValue={selectedInvoiceDetail.grnNumber || ''} />
                                      <button type="submit" className="btn btn-primary h-10 px-6 font-black text-[10px]">VERIFY</button>
                                    </form>
                                    {isEditingGRN && (
                                      <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600" onClick={() => setIsEditingGRN(false)}>Cancel Edit</button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="status-badge-verified">
                                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-100"><ShieldCheck size={20} /></div>
                                    <div>
                                      <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-0.5">Verified GRN Reference</p>
                                      <p className="text-lg font-black font-mono tracking-tight">{selectedInvoiceDetail.grnNumber}</p>
                                    </div>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                                <Truck size={24} className="text-slate-300 mb-2" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authentication Locked</p>
                                <p className="text-[11px] text-slate-500 mt-1">Settle payment and generate Tax Invoice to enable GRN verification.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="dialog-footer">
                  <button className="btn btn-outline h-12 px-6 text-xs font-black uppercase flex items-center gap-2 rounded-xl" onClick={() => window.print()}>
                    <Download size={18} /> Generate {isDocumentView ? 'PDF' : 'Voucher'}
                  </button>
                  {!isFinal && !isDocumentView && (
                    <button
                      className="btn btn-primary h-12 px-8 text-xs font-black uppercase flex items-center gap-2 rounded-xl shadow-lg shadow-indigo-200"
                      onClick={() => setPaymentModalData(selectedInvoiceDetail)}
                      disabled={isPaid}
                    >
                      <Wallet size={18} /> {isPaid ? 'Settled' : 'Settlement Pay'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {deleteConfirmId && (
          <div className="dialog-overlay">
            <div className="dialog-content" style={{ maxWidth: '400px' }}>
              <div className="dialog-header">
                <h2 className="dialog-title text-rose-600">Permanently Erase Record?</h2>
              </div>
              <div className="dialog-body py-8 flex flex-col items-center">
                <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mb-6 border border-rose-100 shadow-inner">
                  <AlertTriangle size={40} />
                </div>
                <p className="text-sm font-bold text-slate-700 text-center px-4">This action will permanently delete <span className="text-rose-600">{deleteConfirmId}</span> and all associated financial entries.</p>
              </div>
              <div className="dialog-footer">
                <button className="font-bold text-xs px-6" onClick={() => setDeleteConfirmId(null)}>ABSTAIN</button>
                <button className="btn bg-rose-600 text-white hover:bg-rose-700 border-none h-11 px-8 font-black text-xs rounded-xl" onClick={() => {
                  deleteInvoice(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}>CONFIRM DELETION</button>
              </div>
            </div>
          </div>
        )}

        <InvoiceCreateModal
          isOpen={showCreateModal}
          onClose={resetCreateForm}
          onCreate={handleCreateSubmit}
          purchaseOrders={purchaseOrders}
          workOrders={workOrders}
          defaultType={activeTab === 'Tax' ? 'Tax' : 'Proforma'}
        />
      </div>
    </div>
  );
};


const InvoiceCreateModal = ({ isOpen, onClose, onCreate, purchaseOrders, workOrders, defaultType = 'Proforma' }) => {
  const [step, setStep] = useState(0);
  const [selectedPO, setSelectedPO] = useState(null);
  const [poSearch, setPoSearch] = useState('');
  const [formData, setFormData] = useState({
    type: defaultType,
    poId: '',
    customerName: '',
    items: [],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });

  // Sync type when defaultType changes (tab switch while modal closed)
  React.useEffect(() => {
    if (!isOpen) {
      setFormData(f => ({ ...f, type: defaultType }));
    }
  }, [defaultType, isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(0);
    setSelectedPO(null);
    setPoSearch('');
    setFormData({
      type: 'Proforma', poId: '', customerName: '', items: [],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    });
    onClose();
  };

  const handlePOSelect = (po) => {
    const linkedWOs = (workOrders || []).filter(
      wo => wo.traceability?.poId === po.id || wo.poId === po.id
    );
    setSelectedPO(po);
    setFormData(prev => ({
      ...prev,
      poId: po.id,
      customerName: po.customerName,
      items: linkedWOs.map(wo => ({
        woId: wo.id,
        partName: wo.partName || wo.description || 'Service',
        partQty: wo.partQty || 1,
        partPrice: wo.partPrice || 0,
        partSubtotal: wo.partSubtotal > 0 ? wo.partSubtotal : Math.round((wo.totalAmount || 0) / 1.18),
        partGST: wo.partGST > 0 ? wo.partGST : Math.round(((wo.totalAmount || 0) / 1.18) * 0.18),
        amount: wo.totalAmount || 0,
        amountReceived: wo.amountReceived || 0,
        status: wo.status,
      })),
    }));
    setStep(2);
  };

  const updateItemAmount = (woId, newAmount) => {
    const val = Number(newAmount) || 0;
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.woId === woId
          ? { ...item, amount: val, partSubtotal: Math.round(val / 1.18), partGST: Math.round((val / 1.18) * 0.18) }
          : item
      ),
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((s, i) => s + (i.partSubtotal || 0), 0);
    const tax = formData.items.reduce((s, i) => s + (i.partGST || 0), 0);
    const grand = subtotal + tax;
    const advance = formData.type === 'Proforma' ? Math.round(grand * 0.5) : 0;
    const totalPaid = formData.items.reduce((s, i) => s + (i.amountReceived || 0), 0);
    const pending = Math.max(0, grand - totalPaid);
    return { subtotal, tax, grand, advance, totalPaid, pending };
  };

  const totals = calculateTotals();
  const isProforma = formData.type === 'Proforma';
  const accentColor = isProforma ? '#4f46e5' : '#059669';
  const accentLight = isProforma ? '#eef2ff' : '#f0fdf4';
  const accentBorder = isProforma ? '#c7d2fe' : '#bbf7d0';

  const filteredPOs = (purchaseOrders || []).filter(po =>
    po.id?.toLowerCase().includes(poSearch.toLowerCase()) ||
    po.customerName?.toLowerCase().includes(poSearch.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed': return { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' };
      case 'In Progress': return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
      case 'Pending': return { bg: '#fefce8', text: '#92400e', border: '#fde68a' };
      default: return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
    }
  };

  /* ═══════════════════════════════════════════════════
     PHASE 0 — Invoice Type Selection
  ═══════════════════════════════════════════════════ */
  const renderPhase0 = () => (
    <div className="uig-phase0-wrap">
      <div className="uig-phase0-hero">
        <div className="uig-phase0-icon-ring">
          <FilePlus size={34} strokeWidth={1.5} />
        </div>
        <h2 className="uig-phase0-title">What type of invoice would you like to generate?</h2>
        <p className="uig-phase0-sub">Select the document type below. You can switch this at any point during configuration.</p>
      </div>

      <div className="uig-type-cards">
        {/* ── Proforma Invoice ── */}
        <button
          className="uig-type-card proforma"
          onClick={() => { setFormData(f => ({ ...f, type: 'Proforma' })); setStep(1); }}
        >
          <div className="uig-tc-header">
            <div className="uig-tc-icon proforma"><Receipt size={30} strokeWidth={1.5} /></div>
            <div className="uig-tc-badge proforma">PI</div>
          </div>
          <h3 className="uig-tc-name">Proforma Invoice</h3>
          <p className="uig-tc-desc">Non-statutory advance billing document used to request upfront payment before work begins.</p>
          <ul className="uig-tc-features">
            <li><Check size={11} /> Pre-shipment advance request</li>
            <li><Check size={11} /> 50% advance auto-calculated</li>
            <li><Check size={11} /> Converts to Tax Invoice after settlement</li>
          </ul>
          <div className="uig-tc-cta proforma">
            Generate Proforma Invoice <ArrowRight size={16} />
          </div>
        </button>

        {/* ── Tax Invoice ── */}
        <button
          className="uig-type-card tax"
          onClick={() => { setFormData(f => ({ ...f, type: 'Tax' })); setStep(1); }}
        >
          <div className="uig-tc-header">
            <div className="uig-tc-icon tax"><ShieldCheck size={30} strokeWidth={1.5} /></div>
            <div className="uig-tc-badge tax">TI</div>
          </div>
          <h3 className="uig-tc-name">Tax Invoice</h3>
          <p className="uig-tc-desc">GST-compliant statutory document. Official certified invoice for completed delivery and billing.</p>
          <ul className="uig-tc-features">
            <li><Check size={11} /> GSTIN-compliant certified document</li>
            <li><Check size={11} /> CGST + SGST tax breakdown included</li>
            <li><Check size={11} /> Final billing with GRN confirmation</li>
          </ul>
          <div className="uig-tc-cta tax">
            Generate Tax Invoice <ArrowRight size={16} />
          </div>
        </button>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════
     PHASE 1 — PO Selection
  ═══════════════════════════════════════════════════ */
  const renderPhase1 = () => (
    <div className="uig-phase1-wrap">
      {/* Type Context Banner */}
      <div className="uig-type-banner" style={{ background: accentLight, borderColor: accentBorder }}>
        <div className="uig-tb-left">
          <div className="uig-tb-icon" style={{ background: accentColor }}>
            {isProforma ? <Receipt size={13} /> : <ShieldCheck size={13} />}
          </div>
          <div className="uig-tb-text">
            <span className="uig-tb-label">Generating</span>
            <span className="uig-tb-type" style={{ color: accentColor }}>
              {isProforma ? 'Proforma Invoice (PI)' : 'Tax Invoice (TI)'}
            </span>
          </div>
        </div>
        <button className="uig-tb-change-btn" onClick={() => setStep(0)}>
          ← Change Type
        </button>
      </div>

      {/* PO Section Header */}
      <div className="uig-po-section-header">
        <div className="uig-posh-icon"><Receipt size={20} strokeWidth={1.5} /></div>
        <div>
          <h3 className="uig-posh-title">Select a Purchase Order</h3>
          <p className="uig-posh-desc">
            Choosing a PO will auto-populate the linked Quotation line items, Work Orders, quantities, and payment account balances.
          </p>
        </div>
      </div>

      {/* Search Box */}
      <div className="uig-po-searchbox" style={{ borderColor: selectedPO ? accentColor : undefined }}>
        <Search size={16} className="uig-psb-icon" />
        <input
          type="text"
          className="uig-psb-input"
          placeholder="Type PO Number or Client Name to search..."
          value={poSearch}
          onChange={e => setPoSearch(e.target.value)}
          autoFocus
        />
        {poSearch && (
          <button className="uig-psb-clear" onClick={() => setPoSearch('')}><X size={14} /></button>
        )}
      </div>

      {/* PO Cards */}
      <div className="uig-po-cards-list">
        {filteredPOs.length === 0 ? (
          <div className="uig-po-empty-state">
            <FileText size={44} strokeWidth={1} />
            <p>No Purchase Orders found</p>
            <span>Add a PO from the Quotations module first</span>
          </div>
        ) : filteredPOs.map(po => {
          const linkedWOs = (workOrders || []).filter(wo => wo.traceability?.poId === po.id || wo.poId === po.id);
          const totalValue = linkedWOs.reduce((acc, wo) => acc + (wo.totalAmount || 0), 0);
          const totalPaid = linkedWOs.reduce((acc, wo) => acc + (wo.amountReceived || 0), 0);
          const pending = Math.max(0, totalValue - totalPaid);
          const pct = totalValue > 0 ? Math.min(100, Math.round((totalPaid / totalValue) * 100)) : 0;
          const isSelected = selectedPO?.id === po.id;

          return (
            <div
              key={po.id}
              className={`uig-po-card ${isSelected ? 'selected' : ''}`}
              style={isSelected ? { borderColor: accentColor, background: accentLight } : {}}
              onClick={() => handlePOSelect(po)}
            >
              {/* Left: Avatar + Info */}
              <div className="uig-poc-left">
                <div className="uig-poc-avatar" style={isSelected ? { background: accentColor, color: '#fff' } : {}}>
                  <span className="uig-poca-label">PO</span>
                  <span className="uig-poca-num">#{po.id?.slice(-4)}</span>
                </div>
                <div className="uig-poc-info">
                  <div className="uig-poc-id-row">
                    <span className="uig-poc-id" style={isSelected ? { color: accentColor } : {}}>{po.id}</span>
                    <span className="uig-poc-status-badge">{po.status || 'Received'}</span>
                  </div>
                  <div className="uig-poc-meta">
                    <Wallet size={11} />
                    <span>{po.customerName}</span>
                    <span className="uig-poc-dot" />
                    <Clock size={11} />
                    <span>{po.date ? new Date(po.date).toLocaleDateString('en-IN') : 'N/A'}</span>
                  </div>
                  {/* Collection Progress Mini-bar */}
                  <div className="uig-poc-progress">
                    <div className="uig-poc-progress-bar">
                      <div
                        className="uig-poc-progress-fill"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 100 ? '#22c55e' : pct > 0 ? '#6366f1' : '#f59e0b'
                        }}
                      />
                    </div>
                    <span className="uig-poc-progress-label">{pct}% collected</span>
                  </div>
                </div>
              </div>

              {/* Right: Stats */}
              <div className="uig-poc-right">
                <div className="uig-poc-stat">
                  <span className="uig-pocs-label">Total Value</span>
                  <span className="uig-pocs-val">₹{totalValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="uig-poc-stat">
                  <span className="uig-pocs-label">Pending</span>
                  <span className="uig-pocs-val pending-text">₹{pending.toLocaleString('en-IN')}</span>
                </div>
                <div className="uig-poc-stat">
                  <span className="uig-pocs-label">Work Orders</span>
                  <span className="uig-pocs-val accent-text" style={{ color: accentColor }}>{linkedWOs.length}</span>
                </div>
                <div className="uig-poc-arrow" style={isSelected ? { background: accentColor, color: '#fff' } : {}}>
                  {isSelected ? <Check size={16} /> : <ArrowRight size={16} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════
     PHASE 2 — Configuration + Preview
  ═══════════════════════════════════════════════════ */
  const renderPhase2 = () => (
    <div className="uig-phase2-layout">

      {/* ──────────── LEFT CONFIG PANEL ──────────── */}
      <div className="uig-config-col">

        {/* PO Reference Strip */}
        <div className="uig-cfg-section">
          <div className="uig-cfg-section-hdr">
            <span className="uig-cfg-section-title">Purchase Order</span>
            <button className="uig-cfg-change-link" onClick={() => setStep(1)}>
              <Link2 size={11} /> Change PO
            </button>
          </div>
          <div className="uig-po-ref-strip" style={{ borderColor: accentBorder, background: accentLight }}>
            <div className="uig-prs-id" style={{ color: accentColor }}>{formData.poId}</div>
            <div className="uig-prs-client">{formData.customerName}</div>
            <div className="uig-prs-badge" style={{ background: accentColor }}>
              {isProforma ? 'PI' : 'TI'}
            </div>
          </div>
        </div>

        {/* Type Toggle */}
        <div className="uig-cfg-section">
          <div className="uig-cfg-section-hdr">
            <span className="uig-cfg-section-title">Invoice Type</span>
          </div>
          <div className="uig-type-toggle">
            <button
              className={`uig-tt-option ${formData.type === 'Proforma' ? 'selected proforma' : ''}`}
              onClick={() => setFormData(f => ({ ...f, type: 'Proforma' }))}
            >
              <Receipt size={14} /> Proforma (PI)
            </button>
            <button
              className={`uig-tt-option ${formData.type === 'Tax' ? 'selected tax' : ''}`}
              onClick={() => setFormData(f => ({ ...f, type: 'Tax' }))}
            >
              <ShieldCheck size={14} /> Tax Invoice (TI)
            </button>
          </div>
        </div>

        {/* Due Date */}
        <div className="uig-cfg-section">
          <div className="uig-cfg-section-hdr">
            <span className="uig-cfg-section-title">Due Date</span>
          </div>
          <div className="uig-date-wrap">
            <Clock size={13} className="uig-date-icon" />
            <input
              type="date"
              className="uig-date-input"
              value={formData.dueDate}
              onChange={e => setFormData(f => ({ ...f, dueDate: e.target.value }))}
            />
          </div>
        </div>

        {/* Work Orders + Quotation Details */}
        <div className="uig-cfg-section uig-wo-section-cfg">
          <div className="uig-cfg-section-hdr">
            <span className="uig-cfg-section-title">Linked Work Orders & Quotation Items</span>
            <span className="uig-auto-pill"><Zap size={11} /> {formData.items.length} Auto-Synced</span>
          </div>
          <div className="uig-wo-items-list">
            {formData.items.length === 0 ? (
              <div className="uig-wo-items-empty">
                <Zap size={22} strokeWidth={1} />
                <p>No Work Orders linked to this PO</p>
              </div>
            ) : formData.items.map(item => {
              const st = getStatusStyle(item.status);
              const pct = item.amount > 0 ? Math.min(100, Math.round(((item.amountReceived || 0) / item.amount) * 100)) : 0;
              const pendingAmt = Math.max(0, (item.amount || 0) - (item.amountReceived || 0));
              return (
                <div key={item.woId} className="uig-wo-item-card">
                  {/* WO Header */}
                  <div className="uig-woic-top">
                    <div className="uig-woic-ids">
                      <span className="uig-woic-woid">{item.woId}</span>
                      <span className="uig-woic-name">{item.partName}</span>
                    </div>
                    <span
                      className="uig-woic-status"
                      style={{ background: st.bg, color: st.text, border: `1px solid ${st.border}` }}
                    >{item.status || 'Active'}</span>
                  </div>

                  {/* Quotation Pricing Grid */}
                  <div className="uig-quote-grid">
                    <div className="uig-qg-cell">
                      <span className="uig-qg-label">Qty</span>
                      <span className="uig-qg-val">{item.partQty || 1}</span>
                    </div>
                    <div className="uig-qg-cell">
                      <span className="uig-qg-label">Unit Price</span>
                      <span className="uig-qg-val mono">₹{(item.partPrice || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="uig-qg-cell">
                      <span className="uig-qg-label">Subtotal</span>
                      <span className="uig-qg-val mono">₹{(item.partSubtotal || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="uig-qg-cell gst">
                      <span className="uig-qg-label">GST 18%</span>
                      <span className="uig-qg-val mono">₹{(item.partGST || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Payment Account Status */}
                  <div className="uig-pay-acc-strip">
                    <div className="uig-pas-header">
                      <span className="uig-pas-title">Payment Account</span>
                      <div className="uig-pas-amounts">
                        <span className="uig-pas-collected">✓ ₹{(item.amountReceived || 0).toLocaleString('en-IN')} collected</span>
                        <span className="uig-pas-sep">·</span>
                        <span className="uig-pas-pending">₹{pendingAmt.toLocaleString('en-IN')} pending</span>
                      </div>
                    </div>
                    <div className="uig-pas-bar">
                      <div
                        className="uig-pas-bar-fill"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 100 ? '#22c55e' : pct > 0 ? '#6366f1' : '#f59e0b'
                        }}
                      />
                    </div>
                    <span className="uig-pas-pct">{pct}% of total collected</span>
                  </div>

                  {/* Invoice Amount Override */}
                  <div className="uig-amount-field">
                    <span className="uig-af-label">Invoice Amount (incl. GST)</span>
                    <div className="uig-af-input-wrap">
                      <span className="uig-af-prefix">₹</span>
                      <input
                        type="number"
                        className="uig-af-input"
                        value={item.amount}
                        onChange={e => updateItemAmount(item.woId, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Breakdown Card (dark) */}
        <div className="uig-breakdown-dark">
          <div className="uig-bd-header">
            <span className="uig-bd-title">Financial Breakdown</span>
            <span className="uig-bd-gst"><Zap size={11} fill="currentColor" /> GST +18%</span>
          </div>
          <div className="uig-bd-rows">
            <div className="uig-bd-row"><span>Taxable Amount</span><span className="mono">₹{totals.subtotal.toLocaleString('en-IN')}</span></div>
            <div className="uig-bd-row"><span>Integrated GST (18%)</span><span className="mono">₹{totals.tax.toLocaleString('en-IN')}</span></div>
            <div className="uig-bd-divider" />
            <div className="uig-bd-row grand"><span>Grand Total</span><span className="mono">₹{totals.grand.toLocaleString('en-IN')}</span></div>
          </div>
          {/* Payment Account Summary */}
          <div className="uig-pay-summary">
            <div className="uig-ps-row collected-row">
              <span><CreditCard size={12} /> Amount Collected</span>
              <span className="mono">₹{totals.totalPaid.toLocaleString('en-IN')}</span>
            </div>
            <div className="uig-ps-row pending-row">
              <span><AlertCircle size={12} /> Remaining Pending</span>
              <span className="mono">₹{totals.pending.toLocaleString('en-IN')}</span>
            </div>
            {formData.type === 'Proforma' && (
              <div className="uig-ps-row advance-row">
                <span><DollarSign size={12} /> 50% Advance Required</span>
                <span className="mono">₹{totals.advance.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ──────────── RIGHT PREVIEW PANEL ──────────── */}
      <div className="uig-preview-col">
        <div className="uig-preview-topbar">
          <div className="uig-prev-live-badge">
            <span className="uig-prev-pulse" />
            LIVE PREVIEW
          </div>
          <span className="uig-prev-format-label">
            {isProforma ? 'Proforma Invoice · PI Format' : 'Tax Invoice · GST Compliant A4'}
          </span>
          <button className="uig-prev-dl-btn" onClick={() => window.print()} title="Download PDF">
            <Download size={15} />
          </button>
        </div>

        <div className="uig-prev-scroll">
          <div className="uig-inv-paper">

            {/* PAPER HEADER */}
            <div className="uig-inv-ph">
              <div className="uig-inv-seller">
                <div className="uig-inv-seller-logo">FC</div>
                <div className="uig-inv-seller-info">
                  <div className="uig-inv-seller-name">FLOWCHAIN OPERATIONS PVT. LTD.</div>
                  <div className="uig-inv-seller-addr">Industrial Zone, Phase II, MIDC, Pune — 411018, Maharashtra, India</div>
                  <div className="uig-inv-seller-gstin">GSTIN: 27AAACF9123Q1Z5 &nbsp;|&nbsp; CIN: U74999MH2020PTC123456 &nbsp;|&nbsp; Tel: +91-20-1234-5678</div>
                </div>
              </div>
              <div className="uig-inv-title-col">
                <div className="uig-inv-type-text" style={{ color: accentColor }}>
                  {isProforma ? 'PROFORMA' : 'TAX'}
                </div>
                <div className="uig-inv-title-main">INVOICE</div>
                <div className="uig-inv-title-sub">ORIGINAL FOR RECIPIENT</div>
                <div className="uig-inv-type-badge" style={{ background: accentColor }}>
                  {isProforma ? 'NON-STATUTORY' : 'GST COMPLIANT'}
                </div>
              </div>
            </div>

            {/* META STRIP */}
            <div className="uig-inv-meta-strip">
              {[
                { k: 'Invoice No.', v: `#${isProforma ? 'PI' : 'TI'}-PREVIEW` },
                { k: 'Invoice Date', v: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                { k: 'Due Date', v: formData.dueDate ? new Date(formData.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
                { k: 'PO Reference', v: formData.poId || '—' },
                { k: 'Place of Supply', v: 'Maharashtra (27)' },
              ].map(({ k, v }) => (
                <div key={k} className="uig-inv-mc">
                  <span className="uig-inv-mk">{k}</span>
                  <span className="uig-inv-mv">{v}</span>
                </div>
              ))}
            </div>

            {/* PARTIES */}
            <div className="uig-inv-parties-row">
              <div className="uig-inv-party-blk">
                <div className="uig-inv-party-hd">BILL TO</div>
                <div className="uig-inv-party-co">{formData.customerName || '—'}</div>
                <div className="uig-inv-party-addr">Corporate Office, Block B, Tech Hub, Andheri East<br />Mumbai — 400069, Maharashtra</div>
                <div className="uig-inv-party-gstin">GSTIN: 27BBBCS4567M2Z1</div>
              </div>
              <div className="uig-inv-party-div" />
              <div className="uig-inv-party-blk">
                <div className="uig-inv-party-hd">SHIP TO</div>
                <div className="uig-inv-party-co">{formData.customerName || '—'}</div>
                <div className="uig-inv-party-addr">Factory Plant 1, Warehouse Section A<br />Same as Billing Address</div>
                <div className="uig-inv-party-gstin">State: Maharashtra (27)</div>
              </div>
            </div>

            {/* LINE ITEMS */}
            <table className="uig-inv-tbl">
              <thead>
                <tr>
                  <th className="sn">SN</th>
                  <th className="desc">Description of Services</th>
                  <th className="hsn">HSN/SAC</th>
                  <th className="qty">Qty</th>
                  <th className="rate">Unit Price (₹)</th>
                  <th className="sub">Subtotal (₹)</th>
                  <th className="gst">GST%</th>
                  <th className="tot">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.length === 0 ? (
                  <tr><td colSpan={8} className="uig-inv-empty-td">Select a PO with linked Work Orders to populate line items</td></tr>
                ) : formData.items.map((item, idx) => {
                  const qty = item.partQty || 1;
                  const sub = item.partSubtotal || Math.round((item.amount || 0) / 1.18);
                  const unit = sub > 0 ? Math.round(sub / qty) : 0;
                  const gst = item.partGST || Math.round(sub * 0.18);
                  const tot = sub + gst;
                  return (
                    <tr key={item.woId} className={idx % 2 === 1 ? 'alt-row' : ''}>
                      <td className="sn tc">{idx + 1}</td>
                      <td className="desc">
                        <div className="uig-inv-item-nm">{item.partName}</div>
                        <div className="uig-inv-item-ref">WO Ref: {item.woId}</div>
                      </td>
                      <td className="hsn tc mono-s">998314</td>
                      <td className="qty tr">{qty}.00</td>
                      <td className="rate tr mono-s">₹{unit.toLocaleString('en-IN')}</td>
                      <td className="sub tr mono-s">₹{sub.toLocaleString('en-IN')}</td>
                      <td className="gst tc">18%</td>
                      <td className="tot tr mono-s bold">₹{tot.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* BANK + TOTALS */}
            <div className="uig-inv-bottom-row">
              <div className="uig-inv-bank-blk">
                <div className="uig-inv-bank-hd">BANK DETAILS</div>
                {[['Bank Name', 'HDFC Bank Ltd.'], ['Account No.', '50100123456789'], ['IFSC Code', 'HDFC0001234'], ['Branch', 'Pune — Viman Nagar'], ['Account Type', 'Current Account']].map(([k, v]) => (
                  <div key={k} className="uig-inv-bank-r"><span>{k}</span><span className="mono-s">{v}</span></div>
                ))}
              </div>
              <div className="uig-inv-totals-blk">
                <div className="uig-inv-tr"><span>Subtotal (ex-GST)</span><span className="mono-s">₹{totals.subtotal.toLocaleString('en-IN')}</span></div>
                <div className="uig-inv-tr"><span>CGST @ 9%</span><span className="mono-s">₹{Math.round(totals.tax / 2).toLocaleString('en-IN')}</span></div>
                <div className="uig-inv-tr"><span>SGST @ 9%</span><span className="mono-s">₹{Math.round(totals.tax / 2).toLocaleString('en-IN')}</span></div>
                <div className="uig-inv-tdiv" />
                <div className="uig-inv-tr uig-grand" style={{ color: accentColor }}><span>Grand Total</span><span className="mono-s">₹{totals.grand.toLocaleString('en-IN')}</span></div>
                {formData.type === 'Proforma' && (
                  <div className="uig-inv-tr uig-advance"><span>50% Advance Due</span><span className="mono-s">₹{totals.advance.toLocaleString('en-IN')}</span></div>
                )}
                <div className="uig-inv-tr uig-collected"><span>Amount Collected</span><span className="mono-s">₹{totals.totalPaid.toLocaleString('en-IN')}</span></div>
                <div className="uig-inv-tr uig-pending"><span>Balance Pending</span><span className="mono-s">₹{totals.pending.toLocaleString('en-IN')}</span></div>
              </div>
            </div>


            {/* AMOUNT SUMMARY BANNER — prominent key figures */}
            <div className="uig-inv-amount-banner">
              <div className="uig-inv-ab-cell grand">
                <span className="uig-inv-ab-label">Grand Total (incl. GST)</span>
                <span className="uig-inv-ab-value">₹{totals.grand.toLocaleString('en-IN')}</span>
                <span className="uig-inv-ab-sub">Taxable: ₹{totals.subtotal.toLocaleString('en-IN')} + GST: ₹{totals.tax.toLocaleString('en-IN')}</span>
              </div>
              <div className={`uig-inv-ab-cell ${isProforma ? 'req' : 'grand'}`}>
                <span className="uig-inv-ab-label">{isProforma ? '50% Advance Requested' : 'Total Amount Due'}</span>
                <span className="uig-inv-ab-value">₹{(isProforma ? totals.advance : totals.grand).toLocaleString('en-IN')}</span>
                <span className="uig-inv-ab-sub">{isProforma ? 'Balance ₹' + totals.advance.toLocaleString('en-IN') + ' on delivery' : 'Full payment due on invoice'}</span>
              </div>
              <div className={`uig-inv-ab-cell ${totals.pending > 0 ? 'pend' : 'paid'}`}>
                <span className="uig-inv-ab-label">{totals.pending > 0 ? 'Balance Pending' : 'Fully Settled'}</span>
                <span className="uig-inv-ab-value">₹{totals.pending.toLocaleString('en-IN')}</span>
                <span className="uig-inv-ab-sub">Collected: ₹{totals.totalPaid.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* WORDS */}
            <div className="uig-inv-words-row">
              <span className="uig-inv-words-lbl">Amount in Words:</span>
              <span className="uig-inv-words-val">
                Indian Rupees {totals.grand > 0 ? `${totals.grand.toLocaleString('en-IN')} Only` : 'Zero Only'}
              </span>
            </div>


            {/* FOOTER */}
            <div className="uig-inv-footer-row">
              <div className="uig-inv-terms-blk">
                <div className="uig-inv-terms-hd">Terms & Conditions</div>
                <ul className="uig-inv-terms-ul">
                  <li>Payment due within {isProforma ? '7' : '30'} days of invoice date.</li>
                  <li>Late payment subject to 1.5% monthly interest.</li>
                  <li>All disputes subject to Pune, Maharashtra jurisdiction.</li>
                </ul>
              </div>
              <div className="uig-inv-sign-blk">
                <div className="uig-inv-sign-area">Authorised Signature</div>
                <div className="uig-inv-sign-name">FLOWCHAIN OPERATIONS PVT. LTD.</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════
     RENDER MODAL
  ═══════════════════════════════════════════════════ */
  const STEPS = [
    { n: 0, label: 'Invoice Type' },
    { n: 1, label: 'Purchase Order' },
    { n: 2, label: 'Configure & Preview' },
  ];

  return (
    <div className="uig-overlay">
      <div className="uig-modal">

        {/* ── HEADER ── */}
        <div className="uig-hdr">
          <div className="uig-hdr-left">
            <div className="uig-hdr-icon">
              <FilePlus size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="uig-hdr-title">Universal Invoice Generator</h2>
              <div className="uig-hdr-sub">
                {step === 0 && 'Step 1 of 3 — Choose the invoice document type'}
                {step === 1 && `Step 2 of 3 — Select a Purchase Order · ${isProforma ? 'Proforma Invoice' : 'Tax Invoice'}`}
                {step === 2 && `Step 3 of 3 — Configure & Preview · ${formData.poId}`}
              </div>
            </div>
          </div>
          <div className="uig-hdr-right">
            {step === 2 && (
              <button className="uig-hdr-export" onClick={() => window.print()}>
                <Download size={13} /> EXPORT PDF
              </button>
            )}
            <button className="uig-hdr-close" onClick={handleClose}><X size={18} /></button>
          </div>
        </div>

        {/* ── STEP BAR ── */}
        <div className="uig-step-bar">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.n}>
              <div className={`uig-sb-item ${step >= s.n ? 'done' : ''} ${step === s.n ? 'current' : ''}`}>
                <div className="uig-sb-dot">
                  {step > s.n ? <Check size={12} /> : <span>{s.n + 1}</span>}
                </div>
                <span className="uig-sb-label">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`uig-sb-line ${step > s.n ? 'filled' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── BODY ── */}
        <div className="uig-body">
          {step === 0 && renderPhase0()}
          {step === 1 && renderPhase1()}
          {step === 2 && renderPhase2()}
        </div>

        {/* ── FOOTER ── */}
        <div className="uig-footer-bar">
          <button
            className="uig-fb-back"
            onClick={() => step === 0 ? handleClose() : setStep(s => s - 1)}
          >
            {step === 0
              ? 'Cancel'
              : <><ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> {step === 1 ? 'Back to Type' : 'Back to PO List'}</>
            }
          </button>

          <div className="uig-fb-right">
            {step === 1 && selectedPO && (
              <div className="uig-fb-selected-pill">
                <Check size={12} /> {selectedPO.id} selected
              </div>
            )}

            {step === 0 && (
              <span className="uig-fb-hint">Click a card above to select and proceed</span>
            )}

            {step === 1 && (
              <button
                className={`uig-fb-next ${selectedPO ? 'active' : 'disabled'}`}
                style={selectedPO ? { background: accentColor } : {}}
                onClick={() => selectedPO && setStep(2)}
                disabled={!selectedPO}
              >
                Configure Invoice <ArrowRight size={17} />
              </button>
            )}

            {step === 2 && (
              <button
                className={`uig-fb-commit ${formData.items.length > 0 ? 'active' : 'disabled'}`}
                style={formData.items.length > 0 ? { background: accentColor } : {}}
                onClick={() => { onCreate(formData); handleClose(); }}
                disabled={formData.items.length === 0}
              >
                <CheckCircle2 size={17} />
                Seal & Commit {isProforma ? 'Proforma' : 'Tax'} Invoice
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoicingModule;
