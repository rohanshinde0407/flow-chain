import React from 'react';
import { ClipboardCheck, X } from 'lucide-react';

const FIELD = ({ label, required, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    {children}
  </div>
);

const INPUT_STYLE = (accentBorder) => ({
  width: '100%', height: '2.625rem', padding: '0 0.875rem',
  border: `1px solid ${accentBorder || '#e2e8f0'}`,
  borderRadius: '0.5rem', fontSize: '0.85rem', fontWeight: 600,
  color: '#0f172a', background: '#f8fafc', outline: 'none', boxSizing: 'border-box'
});

const INITIAL_STATE = {
  customer: '', partName: '', poId: '', poNumber: '',
  assignedUser: '',
  partQty: '', partPrice: '', partSubtotal: 0, partGST: 0,
  totalAmount: 0,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '', deliveryDate: ''
};

/**
 * WOCreateModal — Form to create a new Work Order (manual or PO-linked).
 * Props:
 *   purchaseOrders  {array}     Available POs to link
 *   productionUsers {string[]}  Available technicians
 *   onConfirm       {function}  (newWOData) => void
 *   onClose         {function}
 */
const WOCreateModal = ({ purchaseOrders = [], productionUsers = [], onConfirm, onClose }) => {
  const [form, setForm] = React.useState(INITIAL_STATE);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = () => {
    if (!form.customer.trim() || !form.partName.trim()) {
      alert('Customer Name and Part / Item Name are required.');
      return;
    }
    onConfirm({ ...form, status: 'Pending', date: new Date().toISOString() });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001,
      background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem'
    }}>
      <div style={{ width: '100%', maxWidth: '580px', background: '#fff', borderRadius: '1.5rem', boxShadow: '0 32px 64px -12px rgba(0,0,0,0.3)', overflow: 'hidden' }}>

        {/* ─── Header ─── */}
        <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
              <ClipboardCheck size={20} color="rgba(255,255,255,0.85)" />
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>New Production Order</p>
              <h2 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 900, margin: '0.2rem 0 0', letterSpacing: '-0.02em' }}>Create Work Order</h2>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}>
            <X size={16} />
          </button>
        </div>

        {/* ─── Form Body ─── */}
        <div style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          {/* Row 1: Customer + Part */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <FIELD label="Customer Name" required>
              <input type="text" placeholder="e.g. Reliance Ind." value={form.customer} onChange={e => set('customer', e.target.value)} style={INPUT_STYLE()} />
            </FIELD>
            <FIELD label="Part / Item Name" required>
              <input type="text" placeholder="e.g. Shaft L-100" value={form.partName} onChange={e => set('partName', e.target.value)} style={INPUT_STYLE()} />
            </FIELD>
          </div>

          {/* PO Link */}
          <FIELD label="Link to Purchase Order" >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <select
                value={form.poId}
                onChange={e => {
                  const po = purchaseOrders.find(p => p.id === e.target.value);
                  set('poId', e.target.value);
                  set('poNumber', po?.poNumber || '');
                }}
                style={{ ...INPUT_STYLE(), flex: 1, cursor: 'pointer' }}
              >
                <option value="">— No PO Link (Direct Order) —</option>
                {purchaseOrders.map(po => (
                  <option key={po.id} value={po.id}>{po.poNumber || po.id} · {po.customerName}</option>
                ))}
              </select>
              {form.poNumber && (
                <span style={{ padding: '0.25rem 0.625rem', background: '#eef2ff', color: '#6366f1', border: '1px solid #e0e7ff', borderRadius: '9999px', fontSize: '0.6rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  {form.poNumber}
                </span>
              )}
            </div>
          </FIELD>

          {/* Row 2: Technician + Start */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <FIELD label="Assign Technician">
              <select value={form.assignedUser} onChange={e => set('assignedUser', e.target.value)} style={{ ...INPUT_STYLE(), cursor: 'pointer' }}>
                <option value="">— Select —</option>
                {productionUsers.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </FIELD>
            <FIELD label="Start Date">
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} style={INPUT_STYLE()} />
            </FIELD>
          </div>

          {/* Row 3: Target + Delivery */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <FIELD label="Target Completion">
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} style={INPUT_STYLE('#ddd6fe')} />
            </FIELD>
            <FIELD label="Committed Delivery">
              <input type="date" value={form.deliveryDate} onChange={e => set('deliveryDate', e.target.value)} style={INPUT_STYLE('#fecaca')} />
            </FIELD>
          </div>

          {/* Row 4: Qtty × Unit Price → Live GST Calculator */}
          <div style={{ background: '#eef2ff', border: '1.5px solid #c7d2fe', borderRadius: '0.875rem', padding: '1rem 1.25rem' }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.875rem' }}>
              Quotation Pricing
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
              <FIELD label="Qty / Units" required>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number" min="1" placeholder="1"
                    value={form.partQty || ''}
                    onChange={e => {
                      const qty = Number(e.target.value) || 0;
                      const sub = qty * (Number(form.partPrice) || 0);
                      const gst = sub * 0.18;
                      setForm(prev => ({ ...prev, partQty: qty, partSubtotal: sub, partGST: gst, totalAmount: sub + gst }));
                    }}
                    style={{ ...INPUT_STYLE('#c7d2fe'), fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>
              </FIELD>
              <FIELD label="Unit Price (₹)" required>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', fontWeight: 700, color: '#6366f1', pointerEvents: 'none' }}>₹</span>
                  <input
                    type="number" min="0" placeholder="0"
                    value={form.partPrice || ''}
                    onChange={e => {
                      const price = Number(e.target.value) || 0;
                      const sub   = (Number(form.partQty) || 1) * price;
                      const gst   = sub * 0.18;
                      setForm(prev => ({ ...prev, partPrice: price, partSubtotal: sub, partGST: gst, totalAmount: sub + gst }));
                    }}
                    style={{ ...INPUT_STYLE('#c7d2fe'), paddingLeft: '1.75rem', fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>
              </FIELD>
            </div>

            {/* Live Totals */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              {[
                { label: 'Subtotal', value: `₹${(form.partSubtotal || 0).toLocaleString('en-IN')}`, color: '#0f172a', bg: '#fff' },
                { label: 'GST @ 18%', value: `₹${(form.partGST || 0).toLocaleString('en-IN')}`, color: '#7c3aed', bg: '#f5f3ff' },
                { label: 'Grand Total', value: `₹${(form.totalAmount || 0).toLocaleString('en-IN')}`, color: '#4f46e5', bg: '#eef2ff' },
              ].map(c => (
                <div key={c.label} style={{ background: c.bg, borderRadius: '0.625rem', padding: '0.6rem 0.75rem', border: '1px solid #e0e7ff', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.55rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.25rem' }}>{c.label}</p>
                  <p style={{ fontSize: '0.82rem', fontWeight: 900, color: c.color, margin: 0, fontFamily: 'monospace' }}>{c.value}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.62rem', color: '#6366f1', fontWeight: 600, margin: '0.625rem 0 0', opacity: 0.8 }}>
              This amount will be tracked in Payment Accounts & used when generating invoices.
            </p>
          </div>

          {/* Actions */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', gap: '0.625rem' }}>
            <button
              onClick={onClose}
              style={{ flex: 1, height: '2.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: '#fff', color: '#475569', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              style={{ flex: 2, height: '2.75rem', border: 'none', borderRadius: '0.5rem', background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)', color: '#fff', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 4px 14px rgba(15,23,42,0.28)' }}
            >
              <ClipboardCheck size={15} /> Confirm & Initialize Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WOCreateModal;
