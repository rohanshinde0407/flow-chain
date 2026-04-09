import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * WODeleteModal — Confirm before permanently deleting a Work Order record.
 * Props:
 *   workOrderId  {string}    The WO ID to delete
 *   onConfirm    {function}  Called when user clicks "Yes, Delete"
 *   onClose      {function}  Called when user cancels
 */
const WODeleteModal = ({ workOrderId, onConfirm, onClose }) => {
  if (!workOrderId) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10050,
      background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem'
    }}>
      <div style={{
        width: '100%', maxWidth: '420px', background: '#fff',
        borderRadius: '1.25rem', boxShadow: '0 32px 64px -12px rgba(0,0,0,0.35)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#7f1d1d,#991b1b)', padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{
              width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <AlertTriangle size={20} color="rgba(255,255,255,0.85)" />
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Danger Zone</p>
              <h2 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 900, margin: '0.15rem 0 0', letterSpacing: '-0.02em' }}>Delete Work Order</h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ background: '#fef2f2', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #fee2e2' }}>
            <p style={{ fontSize: '0.82rem', color: '#7f1d1d', margin: '0 0 0.4rem', fontWeight: 700 }}>
              This action cannot be undone.
            </p>
            <p style={{ fontSize: '0.8rem', color: '#991b1b', margin: 0, lineHeight: 1.5 }}>
              Work Order <strong style={{ fontFamily: 'monospace' }}>{workOrderId}</strong> and all its production tracking data will be permanently removed.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, height: '2.625rem', border: '1px solid #e2e8f0',
                borderRadius: '0.5rem', background: '#fff', color: '#475569',
                fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.05em'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => { onConfirm(workOrderId); onClose(); }}
              style={{
                flex: 2, height: '2.625rem', border: 'none',
                borderRadius: '0.5rem', background: 'linear-gradient(135deg,#991b1b,#7f1d1d)',
                color: '#fff', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                boxShadow: '0 4px 14px rgba(153,27,27,0.35)'
              }}
            >
              <AlertTriangle size={14} /> Yes, Delete Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WODeleteModal;
