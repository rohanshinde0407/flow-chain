import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Filter, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  FileText,
  Upload,
  AlertCircle,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  ArrowRight,
  Mail,
  Wallet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTablePagination from '../../components/common/DataTablePagination';
import './Invoices.css';

const InvoicingModule = () => {
  const { invoices, deleteInvoice, convertToTaxInvoice, addPaymentEntry, updateInvoiceGRN } = useApp();
  const [activeTab, setActiveTab] = useState('Proforma');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [paymentModalData, setPaymentModalData] = useState(null);
  const [grnModalData, setGrnModalData] = useState(null);

  const itemsPerPage = 10;

  const getInvoiceStatusClass = (status) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Partial': return 'info';
      case 'Unpaid': return 'warning';
      case 'Pending': return 'warning';
      case 'GRN Pending': return 'danger';
      case 'Converted to Tax Invoice': return 'secondary';
      default: return 'info';
    }
  };

  const activeInvoices = (invoices || [])
    .filter(inv => activeTab === 'Payments' ? true : inv.type === activeTab)
    .filter(inv => {
      const term = searchTerm.toLowerCase();
      return (
        (inv.id || '').toLowerCase().includes(term) ||
        (inv.customerName || '').toLowerCase().includes(term) ||
        (inv.linkedWO || '').toLowerCase().includes(term) ||
        (inv.linkedPI || '').toLowerCase().includes(term)
      );
    });

  const paginatedInvoices = activeInvoices.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

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
    updateInvoiceGRN(grnModalData.id, formData.get('grnNumber'));
    setGrnModalData(null);
  };

  return (
    <div className="module-container-wrapper">
      <div className="module-container animate-in">
        <div className="module-header">
          <div className="header-info">
            <h1>Invoicing & Payments</h1>
            <p>Track Proforma Invoices, Tax Invoices, and Payment History.</p>
          </div>
        </div>

        <div className="module-tabs card glass">
          <button 
            className={activeTab === 'Proforma' ? 'active' : ''} 
            onClick={() => { setActiveTab('Proforma'); setCurrentPage(1); }}
          >
            Proforma Invoices (PI)
          </button>
          <button 
            className={activeTab === 'Tax' ? 'active' : ''} 
            onClick={() => { setActiveTab('Tax'); setCurrentPage(1); }}
          >
            Tax Invoices
          </button>
          <button 
            className={activeTab === 'Payments' ? 'active' : ''} 
            onClick={() => { setActiveTab('Payments'); setCurrentPage(1); }}
          >
            Payment Ledger
          </button>
        </div>

        <div className="module-actions glass">
          <div className="search-box">
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by Invoice #, WO, PI, or Customer..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button className="btn-outline">
            <Filter size={18} />
            Filter
          </button>
        </div>

        <div className="flex-1 w-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in">
          <table className="data-table">
            <thead>
                {activeTab === 'Proforma' && (
                  <tr>
                    <th className="sn-col">#</th>
                    <th>PI Number</th>
                    <th>Linked WO</th>
                    <th>Customer</th>
                    <th className="text-right">Total Amount</th>
                    <th className="text-right">Advance Request</th>
                    <th className="text-right">Balance</th>
                    <th className="text-center">Due Date</th>
                    <th className="text-center">Mail Sent</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                )}
                {activeTab === 'Tax' && (
                  <tr>
                    <th className="sn-col">#</th>
                    <th>Tax Invoice #</th>
                    <th>Linked PI/WO</th>
                    <th>Customer</th>
                    <th className="text-right">Total Amount</th>
                    <th className="text-right">Received</th>
                    <th className="text-right">Pending</th>
                    <th className="text-center">GRN Details</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                )}
                {activeTab === 'Payments' && (
                  <tr>
                    <th className="sn-col">#</th>
                    <th>Payment Ref</th>
                    <th>Invoice To</th>
                    <th>Customer</th>
                    <th className="text-right">Amount Paid</th>
                    <th>Payment Mode</th>
                    <th className="text-center">Payment Date</th>
                    <th className="text-center">Status</th>
                  </tr>
                )}
            </thead>
            <tbody>
              {activeTab === 'Proforma' && paginatedInvoices.map((inv, idx) => (
                <tr key={inv.id} className={inv.status === 'Converted to Tax Invoice' ? 'bg-slate-50 opacity-70' : ''}>
                  <td className="sn-col text-center font-medium text-muted-foreground">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td><span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">{inv.id}</span></td>
                  <td><span className="font-mono text-xs font-bold text-slate-600 border border-slate-200 bg-slate-50 px-2 py-0.5 rounded">{inv.linkedWO || 'N/A'}</span></td>
                  <td className="font-bold text-slate-900">{inv.customerName}</td>
                  <td className="text-right font-mono font-medium text-slate-700">₹{inv.totalAmount?.toLocaleString('en-IN')}</td>
                  <td className="text-right font-mono font-medium text-indigo-600">₹{inv.advanceAmount?.toLocaleString('en-IN') || 0}</td>
                  <td className="text-right font-mono font-bold text-rose-500">₹{inv.balanceAmount?.toLocaleString('en-IN') || 0}</td>
                  <td className="text-center text-sm">{new Date(inv.dueDate).toLocaleDateString('en-IN')}</td>
                  <td className="text-center">
                    {inv.mailSent ? <span className="inline-flex items-center text-emerald-600"><CheckCircle2 size={16} className="mr-1"/> Yes</span> : <span className="inline-flex items-center text-amber-500"><Mail size={16} className="mr-1"/> No</span>}
                  </td>
                  <td className="text-center">
                    <span className={`badge badge-${getInvoiceStatusClass(inv.status)}`}>{inv.status}</span>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                       {inv.status !== 'Converted to Tax Invoice' && (
                          <button 
                            className="btn btn-sm btn-primary px-3 text-xs flex items-center gap-1"
                            onClick={() => convertToTaxInvoice(inv.id)}
                            title="Convert PI instantly to Tax Invoice"
                          >
                            To Tax <ArrowRight size={12} />
                          </button>
                       )}
                       <button className="icon-btn text-rose-500 hover:bg-rose-50" onClick={() => setDeleteConfirmId(inv.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}

              {activeTab === 'Tax' && paginatedInvoices.map((inv, idx) => (
                <tr key={inv.id} className={inv.status === 'Paid' ? 'bg-emerald-50/20 border-l-4 border-l-emerald-500' : inv.status === 'GRN Pending' ? 'bg-amber-50/30 border-l-4 border-l-amber-500' : ''}>
                  <td className="sn-col text-center font-medium text-muted-foreground">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td><span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">{inv.id}</span></td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500">PI: {inv.linkedPI}</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">WO: {inv.linkedWO}</span>
                    </div>
                  </td>
                  <td className="font-bold text-slate-900">{inv.customerName}</td>
                  <td className="text-right font-mono font-medium text-slate-700">₹{inv.totalAmount?.toLocaleString('en-IN')}</td>
                  <td className="text-right font-mono font-semibold text-emerald-600">₹{(inv.amountReceived || 0).toLocaleString('en-IN')}</td>
                  <td className="text-right font-mono font-bold text-rose-500">₹{(inv.pendingAmount || 0).toLocaleString('en-IN')}</td>
                  <td className="text-center">
                     {inv.grnStatus === 'Received' ? (
                       <span className="badge badge-success flex items-center justify-center gap-1 mx-auto w-max"><CheckCircle2 size={12}/> GRN-{inv.grnNumber}</span>
                     ) : (
                       <div className="flex flex-col items-center">
                         <span className="badge badge-warning flex items-center gap-1 mb-1"><AlertCircle size={12}/> Pending</span>
                         <button className="text-[10px] text-indigo-600 hover:underline font-bold" onClick={() => setGrnModalData(inv)}>Upload GRN</button>
                       </div>
                     )}
                  </td>
                  <td className="text-center">
                    <span className={`badge badge-${getInvoiceStatusClass(inv.status)}`}>
                      {inv.status === 'GRN Pending' && <AlertTriangle size={12} className="inline mr-1 text-amber-700"/>}
                      {inv.status}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                       <button 
                         className="btn btn-sm btn-outline px-2 text-xs flex items-center gap-1 border-slate-300 text-slate-700" 
                         onClick={() => setPaymentModalData(inv)}
                         disabled={inv.pendingAmount <= 0}
                       >
                         <Wallet size={12} /> Pay
                       </button>
                       <button className="icon-btn text-slate-400 hover:text-slate-700" title="Edit Invoice Details"><Edit2 size={16} /></button>
                       <button className="icon-btn text-rose-400 hover:text-rose-600" onClick={() => setDeleteConfirmId(inv.id)}><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}

              {activeTab === 'Payments' && invoices.flatMap(inv => (inv.payments || []).map(p => ({...p, invOrigin: inv}))).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((p, idx) => (
                 <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="sn-col text-center font-medium text-muted-foreground">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td><span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">PAY-{p.id.toString().slice(-6)}</span></td>
                    <td><span className="font-semibold text-indigo-600 text-sm">{p.invOrigin.id}</span></td>
                    <td className="font-semibold text-slate-700">{p.invOrigin.customerName}</td>
                    <td className="text-right font-mono font-bold text-emerald-600">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                    <td>
                      <span className="flex items-center gap-2 text-sm text-slate-600">
                        <Wallet size={14} className="text-slate-400" />
                        {p.method}
                      </span>
                    </td>
                    <td className="text-center font-medium text-slate-700">{new Date(p.date).toLocaleDateString('en-IN')}</td>
                    <td className="text-center"><span className="badge badge-success"><CheckCircle2 size={12} className="inline mr-0.5" /> Successful</span></td>
                 </tr>
              ))}

              {((activeTab === 'Proforma' || activeTab === 'Tax') && activeInvoices.length === 0) && (
                 <tr><td colSpan="11" className="h-32 text-center text-muted-foreground italic">No {activeTab} invoices found.</td></tr>
              )}
              {(activeTab === 'Payments' && invoices.every(inv => (inv.payments || []).length === 0)) && (
                 <tr><td colSpan="8" className="h-32 text-center text-muted-foreground italic">No payment history found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <DataTablePagination 
          currentPage={currentPage}
          totalItems={activeTab === 'Payments' ? invoices.flatMap(inv => inv.payments || []).length : activeInvoices.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />

        {/* Payment Modal */}
        {paymentModalData && (
          <div className="modal-overlay">
            <div className="modal-content glass" style={{ maxWidth: '400px' }}>
              <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
                <h2 className="text-lg font-bold text-slate-800">Record Payment</h2>
                <button className="icon-btn hover:bg-slate-100" onClick={() => setPaymentModalData(null)}><X size={20} /></button>
              </div>
              <form onSubmit={handlePaymentSubmit}>
                <div className="mb-4 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  Recording payment for <strong>{paymentModalData.id}</strong><br/>
                  Pending Amount: <strong className="text-rose-600">₹{(paymentModalData.pendingAmount || 0).toLocaleString('en-IN')}</strong>
                </div>
                
                <div className="form-group mb-3">
                  <label>Amount Received (₹)</label>
                  <input type="number" name="amount" className="form-input" required max={paymentModalData.pendingAmount} defaultValue={paymentModalData.pendingAmount} />
                </div>
                <div className="form-group mb-3">
                  <label>Payment Mode</label>
                  <select name="method" className="form-input" required>
                    <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div className="form-group mb-3">
                  <label>Payment Date</label>
                  <input type="date" name="date" className="form-input" required defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="form-group mb-4">
                  <label>Transaction Reference (Optional)</label>
                  <input type="text" name="reference" className="form-input" placeholder="e.g. UTR Number" />
                </div>
                
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" className="btn-outline px-4" onClick={() => setPaymentModalData(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-6">Confirm Payment</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* GRN Modal */}
        {grnModalData && (
          <div className="modal-overlay">
            <div className="modal-content glass" style={{ maxWidth: '400px' }}>
              <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
                <h2 className="text-lg font-bold text-slate-800">Upload GRN Details</h2>
                <button className="icon-btn hover:bg-slate-100" onClick={() => setGrnModalData(null)}><X size={20} /></button>
              </div>
              <form onSubmit={handleGRNSubmit}>
                <div className="mb-4 text-sm text-slate-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                  Missing GRN blocks payment confirmation for <strong>{grnModalData.id}</strong>.
                </div>
                
                <div className="form-group mb-3">
                  <label>GRN Document Number</label>
                  <input type="text" name="grnNumber" className="form-input" required placeholder="e.g. GRN-2023-XXXX" />
                </div>
                <div className="form-group mb-4">
                  <label>Upload Document</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                    <Upload size={24} className="mb-2 text-indigo-500" />
                    <span className="text-sm font-medium">Click or drag file here</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" className="btn-outline px-4" onClick={() => setGrnModalData(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary bg-indigo-600 px-6">Save GRN</button>
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
              <h2>Confirm Invoice Deletion</h2>
              <p className="text-muted mb-6">Are you sure you want to delete Invoice <strong>{deleteConfirmId}</strong>? This action will permanently purge the financial record.</p>
              <div className="form-actions" style={{ justifyContent: 'center' }}>
                <button className="btn-outline" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                <button className="btn btn-danger" style={{ backgroundColor: '#ef4444', color: 'white' }} onClick={() => {
                  deleteInvoice(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}>Yes, Delete Record</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicingModule;
