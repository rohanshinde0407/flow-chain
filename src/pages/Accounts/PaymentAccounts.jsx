import React, { useState } from 'react';
import {
  Search,
  Filter,
  Clock,
  X,
  CreditCard,
  Receipt,
  FileText,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FilePlus,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTablePagination from '../../components/common/DataTablePagination';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../../components/ui/table';
import '../WorkOrders/WorkOrders.css';

// ── Invoice Creation Modal ──────────────────────────────────────────────────
const CreateInvoiceModal = ({ wo, type, invoices, onConfirm, onClose }) => {
  const pending = (wo.totalAmount || 0) - (wo.amountReceived || 0);
  const defaultAdvance = Math.round((wo.totalAmount || 0) * 0.5);

  const [form, setForm] = useState({
    totalAmount: wo.totalAmount || 0,
    advanceAmount: type === 'Proforma' ? defaultAdvance : 0,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const balance = form.totalAmount - form.advanceAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'Proforma') {
      onConfirm({
        type: 'Proforma',
        customerName: wo.customer,
        linkedWO: wo.id,
        totalAmount: Number(form.totalAmount),
        advanceAmount: Number(form.advanceAmount),
        balanceAmount: Number(form.totalAmount) - Number(form.advanceAmount),
        amountReceived: wo.amountReceived || 0,
        pendingAmount: Number(form.totalAmount) - (wo.amountReceived || 0),
        payments: wo.payments || [],
        dueDate: new Date(form.dueDate).toISOString(),
        mailSent: false
      });
    } else {
      onConfirm({
        type: 'Tax',
        customerName: wo.customer,
        linkedWO: wo.id,
        linkedPI: (invoices || []).find(i => i.linkedWO === wo.id && i.type === 'Proforma')?.id || 'Direct',
        totalAmount: Number(form.totalAmount),
        amountReceived: wo.amountReceived || 0,
        pendingAmount: Number(form.totalAmount) - (wo.amountReceived || 0),
        payments: wo.payments || [],
        dueDate: new Date(form.dueDate).toISOString()
      });
    }
  };

  const isProforma = type === 'Proforma';
  const accentColor = isProforma ? '#6366f1' : '#059669';
  const accentLight = isProforma ? '#eef2ff' : '#f0fdf4';
  const accentBorder = isProforma ? '#e0e7ff' : '#bbf7d0';

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 10000, padding: '1.5rem'
    }}>
      <div style={{
        background: '#fff', borderRadius: '1.5rem',
        width: '100%', maxWidth: '520px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          background: `linear-gradient(135deg, ${isProforma ? '#6366f1' : '#059669'} 0%, ${isProforma ? '#4338ca' : '#047857'} 100%)`,
          padding: '1.5rem 2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                {isProforma ? 'New Proforma Invoice' : 'New Tax Invoice'}
              </p>
              <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 900, margin: '0.25rem 0 0.15rem' }}>
                {wo.customer}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', margin: 0 }}>
                Work Order: {wo.id} · {wo.partName || 'Production Order'}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                width: '2rem', height: '2rem', cursor: 'pointer', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '1.75rem 2rem' }}>

            {/* WO Financial Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.625rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'WO Total', value: `₹${(wo.totalAmount || 0).toLocaleString('en-IN')}`, color: '#0f172a' },
                { label: 'Collected', value: `₹${(wo.amountReceived || 0).toLocaleString('en-IN')}`, color: '#059669' },
                { label: 'Pending', value: `₹${pending.toLocaleString('en-IN')}`, color: '#dc2626' }
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.58rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.3rem' }}>{label}</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 900, color, margin: 0, fontFamily: 'monospace' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Invoice Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
                  Invoice Total Amount (₹)
                </label>
                <input
                  type="number" required min="1"
                  className="form-input"
                  style={{ fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 700 }}
                  value={form.totalAmount}
                  onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))}
                />
              </div>

              {isProforma && (
                <>
                  <div>
                    <label style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
                      Advance Requested (₹)
                    </label>
                    <input
                      type="number" required min="0"
                      className="form-input"
                      style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700 }}
                      value={form.advanceAmount}
                      onChange={e => setForm(f => ({ ...f, advanceAmount: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
                      Balance Amount (₹)
                    </label>
                    <div className="form-input" style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700, background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center' }}>
                      ₹{Number(balance || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </>
              )}

              <div style={{ gridColumn: isProforma ? 'auto' : '1 / -1' }}>
                <label style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
                  Due Date
                </label>
                <input
                  type="date" required
                  className="form-input"
                  value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Info notice */}
            <div style={{ background: accentLight, border: `1px solid ${accentBorder}`, borderRadius: '0.625rem', padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <CheckCircle2 size={14} color={accentColor} style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '0.75rem', color: accentColor, margin: 0, fontWeight: 600, lineHeight: 1.5 }}>
                {isProforma
                  ? 'This Proforma Invoice will appear in the Invoicing module under the PI tab, linked to the Work Order.'
                  : 'This Tax Invoice will appear in the Invoicing module under the Tax Invoices tab, linked to this Work Order.'
                }
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1, height: '2.5rem', border: '1px solid #e2e8f0', borderRadius: '0.625rem',
                  background: '#f8fafc', color: '#475569', fontSize: '0.78rem', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  flex: 2, height: '2.5rem', border: 'none', borderRadius: '0.625rem',
                  background: `linear-gradient(135deg, ${isProforma ? '#6366f1' : '#059669'} 0%, ${isProforma ? '#4338ca' : '#047857'} 100%)`,
                  color: '#fff', fontSize: '0.78rem', fontWeight: 800,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                  boxShadow: `0 4px 12px ${isProforma ? 'rgba(99,102,241,0.3)' : 'rgba(5,150,105,0.3)'}`
                }}
              >
                {isProforma ? <Receipt size={14} /> : <FileText size={14} />}
                Create {isProforma ? 'Proforma' : 'Tax'} Invoice
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────────────
const PaymentAccounts = () => {
  const { workOrders, invoices, addInvoice, addWorkOrderPayment, updateWorkOrder, onNavigate } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWO, setSelectedWO] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [invoiceModal, setInvoiceModal] = useState(null); // { wo, type: 'Proforma'|'Tax' }

  const filteredWorkOrders = (workOrders || []).filter(wo => {
    const term = searchTerm.toLowerCase();
    return (
      (wo.id || '').toLowerCase().includes(term) ||
      (wo.customer || '').toLowerCase().includes(term) ||
      (wo.partName || '').toLowerCase().includes(term)
    );
  });

  const paginatedAccounts = filteredWorkOrders.slice(
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
    const amt = Number(formData.get('amount'));
    if (amt > 0) {
      addWorkOrderPayment(selectedWO.id, {
        amount: amt,
        method: formData.get('method'),
        date: formData.get('date'),
        reference: formData.get('reference')
      });
      setSelectedWO(prev => ({
        ...prev,
        amountReceived: (prev.amountReceived || 0) + amt,
        payments: [...(prev.payments || []), {
          amount: amt,
          method: formData.get('method'),
          date: formData.get('date'),
          id: Date.now()
        }]
      }));
      e.target.reset();
    }
  };

  const handleCreateInvoice = (invoiceData) => {
    addInvoice(invoiceData);
    setInvoiceModal(null);
  };

  // Helper: find invoices linked to a WO
  const getLinkedPI = (woId) => (invoices || []).find(i => i.linkedWO === woId && i.type === 'Proforma');
  const getLinkedTI = (woId) => (invoices || []).find(i => i.linkedWO === woId && i.type === 'Tax');

  return (
    <div className="module-container-wrapper">
      <div className="module-container animate-in">
        <div className="module-header">
          <div className="header-info">
            <h1>Payment Accounts</h1>
            <p>Track advances and financial collections — create Proforma &amp; Tax Invoices directly.</p>
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
          <button className="btn-outline">
            <Filter size={18} />
            Filter Status
          </button>
        </div>

        <div className="fc-table-container">
          <Table className="min-w-[1200px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">SN</TableHead>
                <TableHead className="w-[140px]">Work Order</TableHead>
                <TableHead className="w-[180px]">Customer</TableHead>
                <TableHead className="w-[130px] text-center">Total Value</TableHead>
                <TableHead className="w-[130px] text-center">Collected</TableHead>
                <TableHead className="w-[130px] text-center">Pending</TableHead>
                <TableHead className="w-[120px] text-center">WO Status</TableHead>
                <TableHead className="w-[120px] text-center">Pay Status</TableHead>
                <TableHead className="w-[160px] text-center">Proforma Invoice</TableHead>
                <TableHead className="w-[160px] text-center">Tax Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-muted-foreground italic">
                    No active work orders match your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAccounts.map((wo, idx) => {
                  const pending = (wo.totalAmount || 0) - (wo.amountReceived || 0);
                  const isFullyPaid = wo.totalAmount > 0 && pending <= 0;
                  const paymentStatus = isFullyPaid ? 'Paid' : wo.amountReceived > 0 ? 'Partial' : 'Unpaid';
                  const pi = getLinkedPI(wo.id);
                  const ti = getLinkedTI(wo.id);

                  return (
                    <TableRow
                      key={wo.id}
                      className={`cursor-pointer transition-all hover:bg-slate-50/80 ${
                        selectedWO?.id === wo.id ? 'bg-indigo-50/40' :
                        isFullyPaid ? 'bg-emerald-50/10' : ''
                      }`}
                      onClick={() => setSelectedWO(wo)}
                    >
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 text-xs uppercase tracking-wider">
                          {wo.id}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">{wo.customer}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-mono font-bold text-slate-800 text-sm">
                            ₹{(wo.totalAmount || 0).toLocaleString('en-IN')}
                          </span>
                          {wo.partSubtotal > 0 ? (
                            <span className="text-[9px] font-semibold text-slate-400">
                              ₹{wo.partSubtotal.toLocaleString('en-IN')} + 18% GST
                            </span>
                          ) : (
                            <span className="text-[9px] text-slate-300">incl. GST</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono font-semibold text-emerald-600">
                        ₹{(wo.amountReceived || 0).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className={`text-center font-mono font-bold ${pending > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                        ₹{Math.abs(pending).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          wo.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          wo.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {wo.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          isFullyPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          wo.amountReceived > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {paymentStatus}
                        </span>
                      </TableCell>

                      {/* ── Proforma Invoice Column ── */}
                      <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                        {pi ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                              <Receipt size={10} /> {pi.id}
                            </span>
                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{pi.status}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setInvoiceModal({ wo, type: 'Proforma' })}
                            className="relative group inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border border-dashed border-indigo-300 text-indigo-500 hover:bg-indigo-50 hover:border-indigo-400 transition-all whitespace-nowrap"
                          >
                            <Plus size={10} /> Create PI
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block px-2 py-1 bg-indigo-700 text-white text-[9px] font-medium whitespace-nowrap rounded shadow-lg z-50 pointer-events-none">
                              Create Proforma Invoice
                            </span>
                          </button>
                        )}
                      </TableCell>

                      {/* ── Tax Invoice Column ── */}
                      <TableCell className="text-center" onClick={e => e.stopPropagation()}>
                        {ti ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                              <FileText size={10} /> {ti.id}
                            </span>
                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{ti.status}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setInvoiceModal({ wo, type: 'Tax' })}
                            className="relative group inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 transition-all whitespace-nowrap"
                          >
                            <Plus size={10} /> Create Tax
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block px-2 py-1 bg-emerald-700 text-white text-[9px] font-medium whitespace-nowrap rounded shadow-lg z-50 pointer-events-none">
                              Create Tax Invoice
                            </span>
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
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

      {/* ── Create Invoice Modal ── */}
      {invoiceModal && (
        <CreateInvoiceModal
          wo={invoiceModal.wo}
          type={invoiceModal.type}
          invoices={invoices}
          onConfirm={handleCreateInvoice}
          onClose={() => setInvoiceModal(null)}
        />
      )}

      {/* ── Premium Side Drawer ── */}
      {selectedWO && (() => {
        const pending = (selectedWO.totalAmount || 0) - (selectedWO.amountReceived || 0);
        const isFullyPaid = selectedWO.totalAmount > 0 && pending <= 0;
        const amtReceived = selectedWO.amountReceived || 0;
        const paymentStatus = isFullyPaid ? 'Paid' : amtReceived > 0 ? 'Partial' : 'Unpaid';
        const collectionPct = selectedWO.totalAmount > 0
          ? Math.min(100, Math.round((amtReceived / selectedWO.totalAmount) * 100))
          : 0;
        const pi = getLinkedPI(selectedWO.id);
        const ti = getLinkedTI(selectedWO.id);

        return (
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0,
            width: '440px', zIndex: 9999,
            background: '#fff',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
            display: 'flex', flexDirection: 'column'
          }}>
            {/* Dark Gradient Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
              padding: '1.5rem', flexShrink: 0
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                    Payment Account
                  </p>
                  <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 900, margin: '0.3rem 0 0.2rem', letterSpacing: '-0.01em' }}>
                    {selectedWO.customer || 'Unknown Customer'}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem', margin: 0 }}>
                    {selectedWO.id}&nbsp;&nbsp;·&nbsp;&nbsp;{selectedWO.partName || 'Production Order'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6rem',
                    fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                    background: isFullyPaid ? '#dcfce7' : amtReceived > 0 ? '#dbeafe' : '#fef3c7',
                    color: isFullyPaid ? '#166534' : amtReceived > 0 ? '#1d4ed8' : '#92400e'
                  }}>
                    {paymentStatus}
                  </span>
                  <button
                    onClick={() => setSelectedWO(null)}
                    style={{
                      background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                      width: '2rem', height: '2rem', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', flexShrink: 0
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Collection Progress Bar */}
              <div style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Collection Progress
                  </span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#fff' }}>{collectionPct}%</span>
                </div>
                <div style={{ height: '5px', background: 'rgba(255,255,255,0.12)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '9999px',
                    width: `${collectionPct}%`,
                    background: isFullyPaid ? '#22c55e' : collectionPct > 0 ? '#60a5fa' : '#f59e0b',
                    transition: 'width 0.6s ease'
                  }} />
                </div>
              </div>
            </div>

            {/* Scrollable Body */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

              {/* Financial Overview Cards */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.75rem' }}>
                  Financial Overview
                </p>
                {/* ── Quotation Pricing Breakdown ── */}
                {selectedWO.partSubtotal > 0 && (
                  <div style={{ background: '#f8fafc', border: '1px solid #e0e7ff', borderRadius: '0.75rem', padding: '0.75rem', marginBottom: '0.75rem' }}>
                    <p style={{ fontSize: '0.55rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.5rem' }}>Quotation Pricing Breakdown</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: '0.375rem', alignItems: 'center' }}>
                      <div style={{ background: '#fff', borderRadius: '0.5rem', padding: '0.5rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.15rem' }}>Qty × Price</p>
                        <p style={{ fontSize: '0.72rem', fontWeight: 900, color: '#1e293b', margin: 0, fontFamily: 'monospace' }}>{selectedWO.partQty || 1} × ₹{(selectedWO.partPrice || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <span style={{ color: '#cbd5e1', fontWeight: 700, fontSize: '0.75rem' }}>+</span>
                      <div style={{ background: '#f5f3ff', borderRadius: '0.5rem', padding: '0.5rem', border: '1px solid #ddd6fe', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.55rem', color: '#7c3aed', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.15rem' }}>GST 18%</p>
                        <p style={{ fontSize: '0.72rem', fontWeight: 900, color: '#7c3aed', margin: 0, fontFamily: 'monospace' }}>₹{(selectedWO.partGST || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <span style={{ color: '#cbd5e1', fontWeight: 700, fontSize: '0.75rem' }}>=</span>
                      <div style={{ background: '#eef2ff', borderRadius: '0.5rem', padding: '0.5rem', border: '1px solid #c7d2fe', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.55rem', color: '#4f46e5', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.15rem' }}>Total</p>
                        <p style={{ fontSize: '0.72rem', fontWeight: 900, color: '#4f46e5', margin: 0, fontFamily: 'monospace' }}>₹{(selectedWO.totalAmount || 0).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: '#0f172a', borderRadius: '0.75rem', padding: '0.875rem', gridColumn: '1 / -1' }}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.25rem' }}>Total Contract Value</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: '0 0 0.25rem', fontFamily: 'monospace' }}>
                      ₹{(selectedWO.totalAmount || 0).toLocaleString('en-IN')}
                    </p>
                    {selectedWO.partSubtotal > 0 && (
                      <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, margin: 0, fontFamily: 'monospace' }}>
                        ₹{selectedWO.partSubtotal.toLocaleString('en-IN')} subtotal + ₹{(selectedWO.partGST || 0).toLocaleString('en-IN')} GST
                      </p>
                    )}
                  </div>
                  <div style={{ background: '#f0fdf4', borderRadius: '0.75rem', padding: '0.875rem', border: '1px solid #bbf7d0' }}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>Collected</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 900, color: '#166534', margin: 0, fontFamily: 'monospace' }}>₹{amtReceived.toLocaleString('en-IN')}</p>
                  </div>
                  <div style={{ background: pending > 0 ? '#fff1f2' : '#f0fdf4', borderRadius: '0.75rem', padding: '0.875rem', border: `1px solid ${pending > 0 ? '#fecdd3' : '#bbf7d0'}` }}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 800, color: pending > 0 ? '#be123c' : '#15803d', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.4rem' }}>
                      {pending > 0 ? 'Pending' : 'Settled ✓'}
                    </p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 900, color: pending > 0 ? '#9f1239' : '#166534', margin: 0, fontFamily: 'monospace' }}>₹{Math.abs(pending).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div style={{ marginTop: '0.875rem', display: 'grid', gap: '0.625rem' }}>
                  <div>
                    <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.35rem' }}>Override Grand Total (₹) — incl. GST</label>
                    <input type="number" className="form-input"
                      style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700, borderColor: '#e0e7ff', background: '#eef2ff' }}
                      value={selectedWO.totalAmount || 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateWorkOrder(selectedWO.id, { totalAmount: val });
                        setSelectedWO(prev => ({ ...prev, totalAmount: val }));
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.35rem' }}>Finance Remarks</label>
                    <textarea className="form-input"
                      style={{ width: '100%', minHeight: '56px', fontSize: '0.8rem', resize: 'none' }}
                      placeholder="E.g., Partial payment approved by management..."
                      value={selectedWO.financeRemarks || ''}
                      onChange={(e) => {
                        updateWorkOrder(selectedWO.id, { financeRemarks: e.target.value });
                        setSelectedWO(prev => ({ ...prev, financeRemarks: e.target.value }));
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Status Section */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Invoice Documents</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                  {/* Proforma Invoice Card */}
                  {pi ? (
                    <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '0.75rem', padding: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                        <Receipt size={12} color="#6366f1" />
                        <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Proforma</p>
                      </div>
                      <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#3730a3', margin: '0 0 0.25rem', fontFamily: 'monospace' }}>{pi.id}</p>
                      <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#6366f1', margin: 0 }}>{pi.status}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setInvoiceModal({ wo: selectedWO, type: 'Proforma' })}
                      style={{
                        background: '#f8fafc', border: '1.5px dashed #c7d2fe', borderRadius: '0.75rem',
                        padding: '0.875rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                        <FilePlus size={12} color="#6366f1" />
                        <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Proforma</p>
                      </div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', margin: 0 }}>+ Create PI</p>
                    </button>
                  )}
                  {/* Tax Invoice Card */}
                  {ti ? (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                        <FileText size={12} color="#059669" />
                        <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Tax Invoice</p>
                      </div>
                      <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#065f46', margin: '0 0 0.25rem', fontFamily: 'monospace' }}>{ti.id}</p>
                      <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#059669', margin: 0 }}>{ti.status}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setInvoiceModal({ wo: selectedWO, type: 'Tax' })}
                      style={{
                        background: '#f8fafc', border: '1.5px dashed #bbf7d0', borderRadius: '0.75rem',
                        padding: '0.875rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                        <FilePlus size={12} color="#059669" />
                        <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Tax Invoice</p>
                      </div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', margin: 0 }}>+ Create TI</p>
                    </button>
                  )}
                </div>
                {(pi || ti) && (
                  <button
                    onClick={() => onNavigate && onNavigate('Invoicing')}
                    style={{
                      marginTop: '0.75rem', width: '100%', height: '2rem', border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem', background: '#f8fafc', color: '#475569',
                      fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                    }}
                  >
                    View in Invoicing Module <ArrowRight size={12} />
                  </button>
                )}
              </div>

              {/* Log New Transaction */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Log New Transaction</p>
                  <CreditCard size={14} color="#6366f1" />
                </div>
                <form onSubmit={handlePaymentSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '0.625rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.35rem' }}>Payment Channel</label>
                      <select name="method" className="form-input" style={{ fontSize: '0.82rem' }} required>
                        <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT / RTGS)</option>
                        <option value="UPI">UPI / GPay</option>
                        <option value="Cheque">Physical Cheque</option>
                        <option value="Cash">Cash Ledger</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.35rem' }}>Amount (₹)</label>
                      <input type="number" name="amount" className="form-input"
                        style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700 }}
                        required min="1"
                        defaultValue={Math.max(0, (selectedWO.totalAmount || 0) - amtReceived)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.35rem' }}>Value Date</label>
                      <input type="date" name="date" className="form-input"
                        style={{ fontSize: '0.82rem' }}
                        required defaultValue={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.35rem' }}>UTR / Reference No.</label>
                      <input type="text" name="reference" className="form-input"
                        style={{ fontSize: '0.82rem' }}
                        placeholder="e.g. NEFT-1928374615"
                      />
                    </div>
                  </div>
                  <button type="submit" style={{
                    width: '100%', height: '2.5rem', border: 'none', borderRadius: '0.625rem',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
                    color: '#fff', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.07em',
                    boxShadow: '0 4px 12px rgba(15,23,42,0.25)'
                  }}>
                    <CreditCard size={14} /> Submit Remittance
                  </button>
                </form>
              </div>

              {/* Remittance Ledger */}
              <div style={{ padding: '1.25rem 1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Remittance Ledger</p>
                  <span style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #e0e7ff', borderRadius: '9999px', fontSize: '0.6rem', fontWeight: 800, padding: '0.15rem 0.5rem' }}>
                    {(selectedWO.payments || []).length} entries
                  </span>
                </div>
                {!(selectedWO.payments?.length) ? (
                  <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>No transactions recorded yet.</p>
                  </div>
                ) : (
                  <div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    {selectedWO.payments.map((p, i, arr) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '0.75rem 0.875rem', background: '#fff',
                        borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eef2ff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CreditCard size={13} color="#6366f1" />
                          </div>
                          <div>
                            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{p.method}</p>
                            <p style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, margin: 0 }}>
                              {new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 800, color: '#059669', background: '#f0fdf4', padding: '0.2rem 0.5rem', borderRadius: '0.375rem', border: '1px solid #bbf7d0' }}>
                          +₹{Number(p.amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default PaymentAccounts;
