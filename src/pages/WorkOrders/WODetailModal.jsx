import React from 'react';
import { ClipboardCheck, X, Check, IndianRupee } from 'lucide-react';

/* ── Helper ─────────────────────────────────────────── */
const getStatusStyle = (status) => {
  const map = {
    'Completed':   { background: 'rgba(16,185,129,0.2)',  color: '#065f46', border: '1px solid rgba(16,185,129,0.35)' },
    'In Progress': { background: 'rgba(99,102,241,0.2)',  color: '#3730a3', border: '1px solid rgba(99,102,241,0.35)' },
    'Pending':     { background: 'rgba(245,158,11,0.2)',  color: '#92400e', border: '1px solid rgba(245,158,11,0.35)' },
    'On Hold':     { background: 'rgba(148,163,184,0.2)', color: '#475569', border: '1px solid rgba(148,163,184,0.35)' },
  };
  return map[status] || map['Pending'];
};

const Label = ({ children }) => (
  <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.4rem' }}>
    {children}
  </p>
);

const MetaCard = ({ children, dark }) => (
  <div style={{
    background: dark ? '#0f172a' : '#f8fafc',
    borderRadius: '0.75rem', padding: '0.875rem',
    border: dark ? 'none' : '1px solid #e2e8f0',
    position: 'relative', overflow: 'hidden'
  }}>
    {children}
  </div>
);

/**
 * WODetailModal — Full detail view for a Work Order row.
 * Props:
 *   wo                 {object}    The selected work order object
 *   productionUsers    {string[]}  List of available technicians
 *   onClose            {function}
 *   onUpdate           {function}  (id, patch) => void
 *   onUpdateStatus     {function}  (id, status) => void
 */
const WODetailModal = ({ wo, productionUsers = [], onClose, onUpdate, onUpdateStatus }) => {
  const [local, setLocal] = React.useState(wo);

  const patch = (field, value) => {
    const updated = { ...local, [field]: value };
    setLocal(updated);
    onUpdate(wo.id, { [field]: value });
  };

  const patchProcess = (idx) => {
    const p = [...(local.process || [])];
    p[idx] = { ...p[idx], status: p[idx].status === 'Completed' ? 'Pending' : 'Completed', time: new Date().toISOString() };
    setLocal({ ...local, process: p });
    onUpdate(wo.id, { process: p });
  };

  if (!wo) return null;

  const completedCount = (local.process || []).filter(s => s.status === 'Completed').length;
  const totalSteps = (local.process || []).length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001,
      background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem'
    }}>
      <div style={{
        width: '100%', maxWidth: '700px', background: '#fff',
        borderRadius: '1.5rem', boxShadow: '0 40px 80px -12px rgba(0,0,0,0.35)',
        overflow: 'hidden', maxHeight: '92vh', display: 'flex', flexDirection: 'column'
      }}>

        {/* ─── Header ─────────────────────────────────── */}
        <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)', padding: '1.5rem 2rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: '2.75rem', height: '2.75rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
                <ClipboardCheck size={22} color="rgba(255,255,255,0.85)" />
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Work Order</p>
                <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 900, margin: '0.15rem 0 0', letterSpacing: '-0.02em' }}>{local.partName || 'Production Order'}</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', margin: 0 }}>{local.customer || '—'}</p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', flexShrink: 0 }}>
              <X size={16} />
            </button>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ padding: '0.2rem 0.625rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '9999px', fontSize: '0.6rem', fontWeight: 800, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{local.id}</span>
            <span style={{ padding: '0.2rem 0.625rem', background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(129,140,248,0.4)', borderRadius: '9999px', fontSize: '0.6rem', fontWeight: 800, color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{local.poNumber || 'DIRECT'}</span>
            <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', ...getStatusStyle(local.status) }}>{local.status}</span>
          </div>
        </div>

        {/* ─── Body ────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* 3-col metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <MetaCard>
              <Label>Assigned To</Label>
              <select
                value={local.assignedUser || local.assignedTo || ''}
                onChange={(e) => patch('assignedUser', e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', outline: 'none', cursor: 'pointer', padding: 0 }}
              >
                <option value="">Unassigned</option>
                {productionUsers.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </MetaCard>

            <MetaCard>
              <Label>Delivery Date</Label>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {local.deliveryDate ? new Date(local.deliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not Set'}
              </p>
            </MetaCard>

            <MetaCard dark>
              <Label><span style={{ color: 'rgba(255,255,255,0.45)' }}>Order Value</span></Label>
              <p style={{ fontSize: '1rem', fontWeight: 900, color: '#fff', margin: '0 0 0.25rem' }}>&#8377;{(local.totalAmount || 0).toLocaleString('en-IN')}</p>
              {local.partSubtotal > 0 ? (
                <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', margin: 0, fontFamily: 'monospace', lineHeight: 1.5 }}>
                  &#8377;{local.partSubtotal.toLocaleString('en-IN')} + 18% GST
                </p>
              ) : (
                <p style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', margin: 0 }}>incl. GST</p>
              )}
              <IndianRupee size={40} style={{ position: 'absolute', right: '-4px', bottom: '-4px', color: 'rgba(255,255,255,0.05)' }} />
            </MetaCard>
          </div>

          {/* Production Timeline */}
          <div>
            <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 0.625rem' }}>Production Timeline</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.625rem' }}>
              {[
                { label: 'Start Date',         key: 'startDate',    accent: '#e2e8f0' },
                { label: 'Target Completion',  key: 'endDate',      accent: '#ddd6fe' },
                { label: 'Dispatch Deadline',  key: 'deliveryDate', accent: '#fecaca' },
              ].map(({ label, key, accent }) => (
                <div key={key} style={{ background: '#f8fafc', borderRadius: '0.625rem', padding: '0.75rem', border: `1px solid ${accent}` }}>
                  <p style={{ fontSize: '0.55rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.35rem' }}>{label}</p>
                  <input
                    type="date"
                    value={local[key] || ''}
                    onChange={(e) => patch(key, e.target.value)}
                    style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', width: '100%', cursor: 'pointer', padding: 0 }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Production Checklist */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Production Checklist</p>
              <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#6366f1', background: '#eef2ff', padding: '0.2rem 0.625rem', borderRadius: '9999px', border: '1px solid #e0e7ff' }}>
                {completedCount}/{totalSteps} Done
              </span>
            </div>

            {totalSteps > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {(local.process || []).map((step, idx) => (
                  <label
                    key={idx}
                    onClick={() => patchProcess(idx)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem',
                      padding: '0.75rem', borderRadius: '0.625rem', cursor: 'pointer',
                      border: step.status === 'Completed' ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                      background: step.status === 'Completed' ? '#f0fdf4' : '#fff',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <div style={{
                      width: '1.375rem', height: '1.375rem', borderRadius: '0.375rem', flexShrink: 0,
                      background: step.status === 'Completed' ? '#10b981' : '#f1f5f9',
                      border: step.status === 'Completed' ? '1px solid #6ee7b7' : '1px solid #cbd5e1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.12s ease'
                    }}>
                      {step.status === 'Completed' && <Check size={10} color="#fff" strokeWidth={3} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, margin: 0, color: step.status === 'Completed' ? '#065f46' : '#334155' }}>{step.label}</p>
                      {step.time && (
                        <p style={{ fontSize: '0.6rem', color: '#10b981', margin: '0.1rem 0 0', fontWeight: 600 }}>
                          ✓ {new Date(step.time).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '0.625rem', border: '1px solid #e2e8f0', margin: 0 }}>
                No production steps defined
              </p>
            )}
          </div>

          {/* Status control */}
          <div style={{ background: '#f8fafc', borderRadius: '0.75rem', padding: '0.875rem 1.125rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.15rem' }}>Order Status</p>
              <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>Update the production stage</p>
            </div>
            <select
              value={local.status}
              onChange={(e) => {
                setLocal({ ...local, status: e.target.value });
                onUpdateStatus(wo.id, e.target.value);
              }}
              style={{ height: '2.25rem', padding: '0 0.875rem', border: '1.5px solid #0f172a', borderRadius: '0.5rem', background: '#fff', fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', outline: 'none', cursor: 'pointer', flexShrink: 0 }}
            >
              {['Pending', 'In Progress', 'On Hold', 'Completed'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            style={{ width: '100%', height: '2.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', background: '#fff', color: '#475569', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WODetailModal;
