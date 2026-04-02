import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  History, 
  Download, 
  Send, 
  Edit3, 
  CheckCircle, 
  AlertCircle,
  FilePlus,
  ArrowRight,
  FileText,
  X,
  History as HistoryIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './Quotations.css';

const QuotationDetail = ({ quoteId, onBack }) => {
  const { quotations, reviseQuotation, addPurchaseOrder } = useApp();
  const quote = useMemo(() => quotations.find(q => q.id === quoteId), [quotations, quoteId]);
  
  const [viewMode, setViewMode] = useState('Overview'); // 'Overview', 'Detail', 'Invoice'
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewingRevision, setViewingRevision] = useState(null);
  
  const [revisionNote, setRevisionNote] = useState('Standard Revision');
  const [customerMessage, setCustomerMessage] = useState('Please find the updated quotation attached as per our discussion.');
  const [editableParts, setEditableParts] = useState([]);
  
  const [invoiceDetails, setInvoiceDetails] = useState({
    companyName: quote?.company || '',
    billingAddress: 'Plant No. 4, Mechanical Zone, Pune, MH-411044',
    invoiceDate: new Date().toISOString().split('T')[0],
    terms: 'Payment 30 days from delivery'
  });

  const [poData, setPoData] = useState({
    poNumber: '',
    receivedDate: new Date().toISOString().split('T')[0],
    attachment: ''
  });

  const [manualTotals, setManualTotals] = useState({
    subtotal: null,
    gst: null,
    total: null
  });

  if (!quote) {
    return (
      <div className="module-container">
        <div className="card text-center p-5">
          <AlertCircle size={48} className="text-muted mb-3 mx-auto" />
          <h3>Quotation not found</h3>
          <p className="text-muted">The record you are looking for does not exist or has been removed.</p>
          <button className="btn btn-primary mt-3" onClick={onBack}>Back to List</button>
        </div>
      </div>
    );
  }

  const handleStartEdit = () => {
    setEditableParts((quote.parts || []).map(p => ({ 
      name: p.name || '', 
      description: p.description || '', 
      material: p.material || 'AL6082',
      unit: p.unit || 'Nos',
      qty: Number(p.qty) || 1, 
      price: Number(p.price) || 0 
    })));
    setIsEditing(true);
    setViewingRevision(null);
  };

  const handleUpdatePart = (idx, field, value) => {
    const updated = [...editableParts];
    if (field === 'qty' || field === 'price') {
      const val = parseFloat(value);
      updated[idx][field] = isNaN(val) ? 0 : val;
    } else {
      updated[idx][field] = value;
    }
    setEditableParts(updated);
  };

  const handleAddPart = () => {
    setEditableParts([...editableParts, { name: '', description: '', material: 'AL6082', unit: 'Nos', qty: 1, price: 0 }]);
  };

  const handleRevise = () => {
    const finalTotal = manualTotals.total !== null ? manualTotals.total : (manualTotals.subtotal !== null ? manualTotals.subtotal : (totals.subtotalRaw)) + (manualTotals.gst !== null ? manualTotals.gst : (totals.subtotalRaw * 0.18));
    reviseQuotation(quote.id, editableParts, revisionNote, finalTotal);
    setIsEditing(false);
    setShowRevisionModal(false);
    setRevisionNote('');
    setViewMode('Overview');
  };

  const formatCurrency = (amount) => {
    const val = Number(amount);
    return isNaN(val) ? "0.00" : val.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  const calculateTotals = (parts) => {
    const subtotal = (parts || []).reduce((sum, p) => sum + ((Number(p.qty) || 0) * (Number(p.price) || 0)), 0);
    const gst = subtotal * 0.18;
    const finalSubtotal = manualTotals.subtotal !== null ? manualTotals.subtotal : subtotal;
    const finalGst = manualTotals.gst !== null ? manualTotals.gst : gst;
    const finalTotal = manualTotals.total !== null ? manualTotals.total : (finalSubtotal + finalGst);

    return {
      subtotalRaw: finalSubtotal,
      subtotal: formatCurrency(finalSubtotal),
      gst: formatCurrency(finalGst),
      total: formatCurrency(finalTotal)
    };
  };

  const currentParts = viewingRevision ? (viewingRevision.parts || []) : (isEditing ? editableParts : (quote.parts || []));
  const totals = calculateTotals(currentParts);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Draft': return 'warning';
      case 'Approved': return 'success';
      case 'Converted': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <div className="module-container">
      <div className="module-header-nav">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          {viewMode === 'Overview' ? 'All Quotations' : 'Back to Versions'}
        </button>
        <div className="header-actions">
          {viewMode === 'Overview' ? (
            <>
              <button className="btn btn-primary" onClick={() => {
                handleStartEdit();
                setViewMode('Detail');
              }}>
                <FilePlus size={18} /> {quote.parts?.length === 0 ? 'Create v1 Quote' : 'Edit This Draft'}
              </button>
              {quote.parts?.length > 0 && (
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <button className="btn-outline" onClick={() => {
                    handleStartEdit();
                    setViewMode('Detail');
                    setShowRevisionModal(true);
                  }}>
                    <HistoryIcon size={18} /> New Revision (v{quote.version + 1})
                  </button>
                  <button className="btn btn-success" style={{ backgroundColor: '#059669', color: 'white' }} onClick={() => setShowPOModal(true)}>
                    <CheckCircle size={18} /> Record Customer PO
                  </button>
                </div>
              )}
            </>
          ) : viewMode === 'Detail' ? (
            <>
              <button className="btn-outline" onClick={() => setViewMode('Invoice')}>
                <FileText size={18} /> Formal Print View
              </button>
              {!isEditing && (
                <button className="btn-outline" onClick={handleStartEdit}>
                  <Edit3 size={18} /> Edit Mode
                </button>
              )}
              {isEditing && (
                <button className="btn btn-primary" onClick={() => setShowRevisionModal(true)}>
                  <CheckCircle size={18} /> Save as v{quote.version + (quote.parts?.length > 0 ? 1 : 0)}
                </button>
              )}
              <button className="btn btn-primary" onClick={() => setShowSendModal(true)}>
                <Send size={18} /> Send Quote
              </button>
            </>
          ) : (
            <>
              <button className="btn-outline" onClick={() => setViewMode('Detail')}>
                <ArrowLeft size={18} /> Back to Editor
              </button>
              <button className="btn btn-primary" onClick={() => window.print()}>
                <Download size={18} /> Print PDF
              </button>
            </>
          )}
        </div>
      </div>

      {viewMode === 'Overview' ? (
        <div className="version-overview animate-in">
          <div className="card quote-info-card mb-4">
            <div className="trace-chain mb-2">
              <span className="trace-item">ENQ: {quote.enqId || 'N/A'}</span>
              <ArrowRight size={12} />
              <span className="trace-item active">{quote.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h1>{quote.customerName}</h1>
                <p className="company-info">{quote.company}</p>
              </div>
              <div className="text-right">
                <span className={`badge badge-${getStatusBadge(quote.status)}`}>
                  v{quote.version} - {quote.status}
                </span>
                <p className="amount-text amount-inr mt-2 font-bold" style={{fontSize: '1.75rem'}}>
                  {formatCurrency(quote.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="card version-history-card">
            <div className="flex justify-between items-center mb-4">
              <h3>Version Control Table</h3>
              <p className="text-muted text-sm">{ (quote.revisions?.length || 0) + 1 } total iterations</p>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Version</th>
                  <th>Date</th>
                  <th>Total (Incl Tax)</th>
                  <th>Status</th>
                  <th>Revision Note</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="active-version-row">
                  <td><span className="version-pill">v{quote.version} (Latest)</span></td>
                  <td>{formatDate(quote.date)}</td>
                  <td className="amount-inr font-bold">{quote.totalAmount}</td>
                  <td><span className={`badge badge-${getStatusBadge(quote.status)}`}>{quote.status}</span></td>
                  <td>{quote.lastNote || 'Master iteration'}</td>
                  <td>
                    <button className="btn-outline btn-sm" onClick={() => {
                      setViewingRevision(null);
                      setIsEditing(false);
                      setViewMode('Detail');
                    }}>Open Version</button>
                  </td>
                </tr>
                {(quote.revisions || []).slice().reverse().map((rev, idx) => (
                  <tr key={rev.version || idx} className="archival-row">
                    <td><span className="version-pill archival">v{rev.version}</span></td>
                    <td>{formatDate(rev.date)}</td>
                    <td className="amount-inr">{rev.totalAmount}</td>
                    <td><span className="badge">Archived</span></td>
                    <td>{rev.note || 'No revision notes'}</td>
                    <td>
                      <button className="btn-outline btn-sm" onClick={() => {
                        setViewingRevision(rev);
                        setIsEditing(false);
                        setViewMode('Detail');
                      }}>Audit Record</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="quote-grid">
          <div className="quote-main">
            <div className="card quote-info-card mb-4">
              <div className="quote-badge-row">
                <span className="quote-id">{quote.id}</span>
                <span className={`badge badge-${getStatusBadge(quote.status)}`}>
                  {viewingRevision ? `Archival: v${viewingRevision.version}` : `Latest: v${quote.version}`}
                </span>
              </div>
              <h1>{quote.customerName}</h1>
              <p className="company-info">{quote.company}</p>
              
              <div className="quote-meta-grid">
                <div className="meta-item">
                  <label>Quoted On</label>
                  <p>{formatDate(viewingRevision ? viewingRevision.date : quote.date)}</p>
                </div>
                <div className="meta-item">
                  <label>Valid Period</label>
                  <p>30 Days from issue</p>
                </div>
                <div className="meta-item">
                  <label>Total (INR)</label>
                  <p className="amount-text amount-inr">{totals.total}</p>
                </div>
              </div>
            </div>

            {viewMode === 'Detail' ? (
              <>
                {viewingRevision && (
                  <div className="alert-banner warning mb-4">
                    <AlertCircle size={18} />
                    <span>Audit Mode: viewing historical version v{viewingRevision.version}. Elements are read-only.</span>
                    <button className="ml-auto underline" onClick={() => setViewMode('Overview')}>Back to Versions</button>
                  </div>
                )}

                <div className="card part-list-card">
                  <div className="flex justify-between items-center mb-4">
                    <h3>{isEditing ? `Drafting v${quote.version + (quote.parts?.length > 0 ? 1 : 0)}` : 'Line Items'}</h3>
                  </div>
                  <table className="parts-table">
                    <thead>
                      <tr>
                        <th style={{ width: '25%' }}>Item Name</th>
                        <th style={{ width: '30%' }}>Spec / Description</th>
                        <th style={{ width: '15%' }}>Material</th>
                        <th style={{ width: '140px' }}>Qty</th>
                        <th style={{ width: '140px' }}>Unit</th>
                        <th style={{ width: '200px' }}>Unit Price</th>
                        <th style={{ width: '250px' }}>Total Amount</th>
                        {isEditing && <th style={{ width: '40px' }}></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {currentParts.map((part, idx) => (
                        <tr key={idx}>
                          <td>
                            {isEditing ? 
                              <input value={part.name || ''} onChange={(e) => handleUpdatePart(idx, 'name', e.target.value)} placeholder="Part Name" /> : 
                              part.name}
                          </td>
                          <td>
                            {isEditing ? 
                              <input value={part.description || ''} onChange={(e) => handleUpdatePart(idx, 'description', e.target.value)} placeholder="Specification" /> : 
                              part.description}
                          </td>
                          <td>
                            {isEditing ? 
                              <input value={part.material || ''} onChange={(e) => handleUpdatePart(idx, 'material', e.target.value)} placeholder="Material" /> : 
                              part.material}
                          </td>
                          <td>
                            {isEditing ? 
                              <input type="number" value={isNaN(Number(part.qty)) ? 0 : Number(part.qty)} onChange={(e) => handleUpdatePart(idx, 'qty', e.target.value)} /> : 
                              part.qty}
                          </td>
                          <td>
                            {isEditing ? 
                              <input value={part.unit || ''} onChange={(e) => handleUpdatePart(idx, 'unit', e.target.value)} placeholder="Nos" /> : 
                              part.unit}
                          </td>
                          <td>
                            {isEditing ? 
                              <input type="number" value={isNaN(Number(part.price)) ? 0 : Number(part.price)} onChange={(e) => handleUpdatePart(idx, 'price', e.target.value)} /> : 
                              <span className="amount-inr">{formatCurrency(part.price)}</span>}
                          </td>
                          <td><span className="amount-inr">{formatCurrency((Number(part.qty) || 0) * (Number(part.price) || 0))}</span></td>
                          {isEditing && (
                            <td className="text-center">
                              <button className="delete-row-btn" onClick={() => setEditableParts(editableParts.filter((_, i) => i !== idx))} title="Remove Row">
                                <X size={18} />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {isEditing && (
                        <tr>
                          <td colSpan="8">
                            <button className="btn-outline btn-full" onClick={handleAddPart}>
                              <FilePlus size={16} /> Add New Row
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  
                  <div className="quote-totals-container">
                    <div className="quote-totals-card glass">
                      <div className="total-field-row">
                        <span className="field-label">Subtotal</span>
                        <div className="field-input-box text-right">
                          <span className="final-val">₹ {totals.subtotal}</span>
                        </div>
                      </div>
                      
                      <div className="total-field-row">
                        <span className="field-label">GST (18%)</span>
                        <div className="field-input-box">
                          {isEditing ? (
                             <div className="footer-input-wrapper">
                               <span className="currency-prefix">₹</span>
                               <input 
                                 type="number" 
                                 className="footer-input-clean"
                                 value={manualTotals.gst !== null ? manualTotals.gst : (totals.subtotalRaw * 0.18)} 
                                 onChange={(e) => setManualTotals({...manualTotals, gst: parseFloat(e.target.value)})}
                               />
                             </div>
                          ) : <span className="final-val">₹ {totals.gst}</span>}
                        </div>
                      </div>
                      
                      <div className="total-field-row highlight-total">
                        <span className="field-label">Quote Grand Total</span>
                        <div className="field-input-box text-right">
                          <span className="final-val total">₹ {totals.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="quotation-print-container animate-in">
                {/* Header Section */}
                <div className="print-header">
                  <div className="company-branding">
                    <div className="logo-placeholder">
                       <svg width="60" height="60" viewBox="0 0 100 100">
                          <rect x="10" y="10" width="80" height="80" rx="10" fill="var(--primary)" />
                          <circle cx="50" cy="50" r="25" stroke="white" strokeWidth="4" fill="none" />
                          <path d="M40 50 L60 50 M50 40 L50 60" stroke="white" strokeWidth="4" />
                       </svg>
                       <div className="logo-text">
                          <span className="logo-main">FLOW</span>
                          <span className="logo-sub">CHAIN</span>
                          <span className="logo-tagline text-xs font-normal">Mechanical Precision</span>
                       </div>
                    </div>
                  </div>
                  <div className="company-address-block text-right">
                    <h2 className="company-name-large">FLOWCHAIN MECHANICAL LTD.</h2>
                    <p className="address-line">Corporate Office: Plot No. 44, Industrial Area Phase II,</p>
                    <p className="address-line">Mechanical Cluster, Pimpri-Chinchwad, Pune, Maharashtra - 411044</p>
                    <p className="address-line">Works: Gat No. 120, MIDC Chakan, Pune 410501</p>
                    <p className="contact-line">Phone: +91 20 6711 7000 Email: contact@flowchain.com</p>
                    <p className="gstin-line">GSTIN: 27FLOWC8119B1ZC, State: 27-Maharashtra</p>
                  </div>
                </div>

                <div className="print-doc-title">
                  <h1>Quotation</h1>
                </div>

                {/* Estimate Info Grid */}
                <div className="estimate-info-header">
                  <div className="estimate-for">
                    <h3>Estimate For</h3>
                    <p className="customer-name-print">{quote.company || quote.customerName}</p>
                    <p className="customer-address-mock">Unit No. A, Building No. B 500, Plot Nos. D223/1, D223/2 and D223/3, IndoSpace Industrial Park, Chakan III, Chakan Industrial Area, Phase II, Village Bhamboli, Taluka Khed, Chakan, Pune, Maharashtra, India - 410501</p>
                    <p className="customer-contact-mock">Contact No. : {quote.phone || '9307759741'}</p>
                    <p className="customer-gst-mock">GSTIN : 27AAJCB1512G1Z1</p>
                    <p className="customer-state-mock">State: 27-Maharashtra</p>
                  </div>
                  <div className="estimate-details">
                    <h3>Estimate Details</h3>
                    <div className="detail-row">
                      <span>Estimate No. :</span>
                      <span>FC/QTN/{quote.id?.split('-')[1] || '152175'}</span>
                    </div>
                    <div className="detail-row">
                      <span>Date :</span>
                      <span>{formatDate(new Date())}</span>
                    </div>
                    <div className="detail-row">
                      <span>Place of supply:</span>
                      <span>27-Maharashtra</span>
                    </div>
                  </div>
                </div>

                {/* Main Parts Table */}
                <table className="quotation-print-table">
                  <thead>
                    <tr>
                      <th style={{width: '40px'}}>#</th>
                      <th>Item name / Part Name</th>
                      <th>Material / Process</th>
                      <th style={{width: '60px'}}>Quantity</th>
                      <th style={{width: '60px'}}>Nos</th>
                      <th>Price/ Unit</th>
                      <th>Taxable amount</th>
                      <th>CGST</th>
                      <th>SGST</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentParts.map((part, idx) => {
                      const taxableAmount = (Number(part.qty) || 0) * (Number(part.price) || 0);
                      const cgst = taxableAmount * 0.09;
                      const sgst = taxableAmount * 0.09;
                      const total = taxableAmount + cgst + sgst;
                      return (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{part.name}</td>
                          <td>{part.material || 'BLOCK MACHINING / AL6082'}</td>
                          <td>{part.qty}</td>
                          <td>{part.unit || 'Nos'}</td>
                          <td>₹ {formatCurrency(part.price || 0)}</td>
                          <td>₹ {formatCurrency(taxableAmount)}</td>
                          <td>₹ {formatCurrency(cgst)} (9%)</td>
                          <td>₹ {formatCurrency(sgst)} (9%)</td>
                          <td>₹ {formatCurrency(total)}</td>
                        </tr>
                      );
                    })}
                    <tr className="print-total-row">
                      <td colSpan="3" className="font-bold">Total</td>
                      <td className="font-bold">{currentParts.reduce((sum, p) => sum + Number(p.qty), 0)}</td>
                      <td></td>
                      <td></td>
                      <td className="font-bold">₹ {totals.subtotal}</td>
                      <td className="font-bold">₹ {formatCurrency(totals.subtotalRaw * 0.09)}</td>
                      <td className="font-bold">₹ {formatCurrency(totals.subtotalRaw * 0.09)}</td>
                      <td className="font-bold text-lg">₹ {totals.total}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Tax Breakdown & Amounts */}
                <div className="tax-amounts-container">
                  <div className="tax-summary-box">
                    <table className="summary-print-table">
                      <thead>
                        <tr>
                          <th>Tax type</th>
                          <th>Taxable amount</th>
                          <th>Rate</th>
                          <th>Tax amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>SGST</td>
                          <td>₹ {totals.subtotal}</td>
                          <td>9%</td>
                          <td>₹ {formatCurrency(totals.subtotalRaw * 0.09)}</td>
                        </tr>
                        <tr>
                          <td>CGST</td>
                          <td>₹ {totals.subtotal}</td>
                          <td>9%</td>
                          <td>₹ {formatCurrency(totals.subtotalRaw * 0.09)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="amounts-summary-box">
                    <div className="summary-print-row">
                      <span>Sub Total</span>
                      <span>₹ {totals.total}</span>
                    </div>
                    <div className="summary-print-row total-row-final">
                      <span>Total</span>
                      <span>₹ {totals.total}</span>
                    </div>
                  </div>
                </div>

                {/* Amount in Words & Description */}
                <div className="words-desc-container">
                  <div className="estimate-amount-words">
                    <label>Estimate Amount In Words</label>
                    <p className="font-bold">Twenty Three Thousand Ten Rupees only</p>
                  </div>
                  <div className="estimate-description">
                    <label>Description</label>
                    <p>LEADTIME: 7-8 DAYS</p>
                  </div>
                </div>

                {/* Terms & Signatory */}
                <div className="terms-signatory-container">
                  <div className="terms-bank-section">
                    <div className="terms-header-block">
                      <h3>Terms and Conditions</h3>
                    </div>
                    <div className="terms-content">
                      <p className="font-bold">HSN CODE 998920</p>
                      <ul className="terms-list-mock">
                        <li>Payment: 100% Advance along with PO</li>
                        <li>Lead Time: 1-2 weeks from receipt of PO</li>
                        <li>Transport: Extra at actuals</li>
                        <li>Validity: 30 days from date of issue</li>
                      </ul>
                      <div className="bank-details-block">
                        <h4>Bank Details:</h4>
                        <p>BANK NAME: <strong>HDFC BANK LTD</strong></p>
                        <p>ACCOUNT NUMBER: <strong>502000412672</strong></p>
                        <p>BANK ADDRESS: <strong>CHAKAN MIDC BRANCH, PUNE 410501</strong></p>
                        <p>IFSC/RTGS CODE: <strong>HDFC0001234</strong></p>
                        <p>ACCOUNT TYPE: <strong>CURRENT ACCOUNT</strong></p>
                      </div>
                    </div>
                  </div>
                  <div className="authorized-signatory-block">
                    <div className="sign-stamp-placeholder">
                      <p>For FLOWCHAIN MECHANICAL LTD.</p>
                      <div className="stamp-space"></div>
                      <p className="sign-bottom">Authorized Signatory</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PO Modal */}
      {showPOModal && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '600px' }}>
            <div className="flex justify-between items-center mb-4">
              <h2>Record Customer Purchase Order</h2>
              <button className="icon-btn" onClick={() => setShowPOModal(false)}><X size={20} /></button>
            </div>
            <p className="text-sm text-muted mb-6">Link this approved quotation to a formal Purchase Order to initiate production.</p>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              addPurchaseOrder({
                ...poData,
                quoteId: quote.id,
                customerName: quote.customerName,
                company: quote.company,
                amount: quote.totalAmount
              });
              setShowPOModal(false);
            }} className="enquiry-form">
              <div className="form-group">
                <label>PO Number</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. PO/MECH/2024/001"
                  value={poData.poNumber}
                  onChange={(e) => setPoData({...poData, poNumber: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Date Received</label>
                <input 
                  required 
                  type="date" 
                  value={poData.receivedDate}
                  onChange={(e) => setPoData({...poData, receivedDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>PO Document Attachment</label>
                <div className="file-upload-placeholder">
                  <Download size={24} className="mb-2 mx-auto text-muted" />
                  <p>Click to upload or drag PO scan (PDF/JPG)</p>
                  <input type="file" className="file-input" onChange={(e) => setPoData({...poData, attachment: e.target.files[0]?.name || 'PO_Scan_Uploaded.pdf'})} />
                  {poData.attachment && <p className="mt-2 text-primary font-bold">Selected: {poData.attachment}</p>}
                </div>
              </div>
              
              <div className="form-actions mt-6">
                <button type="button" className="btn-outline" onClick={() => setShowPOModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create PO Record & Initiate Status</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '500px' }}>
            <div className="flex justify-between items-center mb-4">
              <h2>Save Quotation Revision v{quote.version + (quote.parts?.length > 0 ? 1 : 0)}</h2>
              <button className="icon-btn" onClick={() => setShowRevisionModal(false)}><X size={20} /></button>
            </div>
            <div className="form-group">
              <label>Reason for Revision / Note</label>
              <textarea 
                className="form-input" 
                rows="4"
                placeholder="e.g. Updated material costs, client requested discount..."
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
              ></textarea>
            </div>
            <p className="text-sm text-muted mt-2">This will archive version v{quote.version} and create a new master version.</p>
            <div className="form-actions mt-6">
              <button className="btn-outline" onClick={() => setShowRevisionModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRevise}>
                <HistoryIcon size={18} /> Confirm & Save Revision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Quote Modal */}
      {showSendModal && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '500px' }}>
            <div className="flex justify-between items-center mb-4">
              <h2>Send Quotation to Customer</h2>
              <button className="icon-btn" onClick={() => setShowSendModal(false)}><X size={20} /></button>
            </div>
            <div className="form-group">
              <label>Message to {quote.customerName}</label>
              <textarea 
                className="form-input" 
                rows="4"
                placeholder="Write a personalized professional note..."
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
              ></textarea>
            </div>
            <div className="card info-card-small mt-4">
              <p className="text-xs text-muted">A link to this pro-forma (v{quote.version}) will be sent to <strong>{quote.email}</strong> via FlowChain's automated distribution system.</p>
            </div>
            <div className="form-actions mt-6">
              <button className="btn-outline" onClick={() => setShowSendModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => {
                alert(`Quotation ${quote.id} v${quote.version} sent successfully!`);
                setShowSendModal(false);
              }}>
                <Send size={18} /> Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationDetail;
