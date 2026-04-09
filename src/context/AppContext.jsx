import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// Mock Data Generators
const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('fc_auth') === 'true');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fc_user');
      return (saved && saved !== 'undefined') ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [role, setRole] = useState(() => user?.role || 'Admin');

  // One-time Purge for Clean Slate (v4 Cleanup)
  useEffect(() => {
    if (localStorage.getItem('fc_v4_purge') !== 'true') {
      localStorage.removeItem('fc_enquiries');
      localStorage.removeItem('fc_quotations');
      localStorage.removeItem('fc_work_orders');
      localStorage.removeItem('fc_purchase_orders');
      localStorage.removeItem('fc_invoices');
      localStorage.removeItem('fc_inventory');
      localStorage.setItem('fc_v4_purge', 'true');
      window.location.reload(); // Refresh to apply empty state
    }
  }, []);
  
  // Load data from localStorage
  const [enquiries, setEnquiries] = useState(() => {
    const saved = localStorage.getItem('fc_enquiries');
    return saved ? JSON.parse(saved) : [];
  });

  const [quotations, setQuotations] = useState(() => {
    const saved = localStorage.getItem('fc_quotations');
    const parsed = saved ? JSON.parse(saved) : [];
    // Sanitization: Ensure all quotes have parts and version
    return parsed.map(q => ({
      ...q,
      parts: Array.isArray(q.parts) ? q.parts : [],
      version: q.version || 1,
      revisions: Array.isArray(q.revisions) ? q.revisions : [],
      status: q.status || 'Draft'
    }));
  });
  const [workOrders, setWorkOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('fc_work_orders');
      const parsed = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed)) return [];
      // Sanitization: Ensure all WOs have the new financial fields for consistent display
      return parsed.filter(Boolean).map(wo => {
        const total = wo.totalAmount || wo.amount || 50000;
        const sub   = wo.partSubtotal || Math.round(total / 1.18);
        const gst   = wo.partGST      || Math.round((total / 1.18) * 0.18);
        return {
          ...wo,
          totalAmount: total,
          partSubtotal: sub,
          partGST: gst,
          // Ensure other basic fields exist
          status: wo.status || 'Pending',
          customer: wo.customer || '—',
          partQuantity: wo.partQty || wo.partQuantity || 1
        };
      });
    } catch (e) {
      console.error("Error parsing work orders:", e);
      return [];
    }
  });

  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('fc_purchase_orders');
      return (saved && saved !== 'undefined') ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [invoices, setInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem('fc_invoices');
      const parsed = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed)) return [];
      // Sanitization: Ensure all invoices have totalAmount and other basic fields
      return parsed.filter(Boolean).map(inv => ({
        ...inv,
        totalAmount: inv.totalAmount || inv.amount || 100000,
        status: inv.status || 'Pending',
        date: inv.date || new Date().toISOString()
      }));
    } catch (e) {
      console.error("Error parsing invoices:", e);
      return [];
    }
  });
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('fc_inventory');
    return saved ? JSON.parse(saved) : [];
  });
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('fc_settings')) || {
    reminderGap: 2, // days
    smtpConfig: { host: 'smtp.flowchain.com', port: 587, user: 'admin@flowchain.com' },
    whatsappEnabled: true,
    gstRate: 18,
    currency: '₹'
  });

  const [activePage, onNavigate] = useState(() => localStorage.getItem('fc_active_page') || 'Dashboard');
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('fc_auth', isAuthenticated);
    localStorage.setItem('fc_user', JSON.stringify(user));
    localStorage.setItem('fc_role', role);
    localStorage.setItem('fc_enquiries', JSON.stringify(enquiries));
    localStorage.setItem('fc_quotations', JSON.stringify(quotations));
    localStorage.setItem('fc_work_orders', JSON.stringify(workOrders));
    localStorage.setItem('fc_purchase_orders', JSON.stringify(purchaseOrders));
    localStorage.setItem('fc_invoices', JSON.stringify(invoices));
    localStorage.setItem('fc_inventory', JSON.stringify(inventory));
    localStorage.setItem('fc_active_page', activePage);
    localStorage.setItem('fc_settings', JSON.stringify(settings));
  }, [isAuthenticated, user, role, enquiries, quotations, workOrders, purchaseOrders, invoices, settings, activePage]);

  // Actions
  const addEnquiry = (enquiry) => {
    const newEnquiry = { ...enquiry, id: `ENQ-${generateId()}`, status: 'New', date: new Date().toISOString() };
    setEnquiries(prev => [newEnquiry, ...prev]);
    addNotification('New enquiry received', 'Success');
    return newEnquiry;
  };

  const addQuotation = (quoteData) => {
    const quoteId = `QTN-${generateId()}`;
    const newQuote = {
      ...quoteData,
      id: quoteId,
      version: 1,
      status: 'Draft',
      date: new Date().toISOString(),
      revisions: [],
      history: [{ version: 1, date: new Date().toISOString(), status: 'Created', note: 'Initial quotation' }]
    };
    setQuotations(prev => [newQuote, ...prev]);
    return newQuote;
  };

  const convertToQuotation = (enquiryId, customParts = null) => {
    const enquiry = enquiries.find(e => e.id === enquiryId);
    if (!enquiry) return null;

    const parts = customParts || [];

    const subtotal = parts.reduce((sum, p) => sum + (Number(p.qty) || 0) * (Number(p.price) || 0), 0);
    const gst = subtotal * 0.18;

    const newQuote = addQuotation({
      enqId: enquiry.id,
      customerName: enquiry.customerName,
      company: enquiry.company,
      email: enquiry.email,
      phone: enquiry.phone,
      parts: parts,
      totalAmount: subtotal + gst // Store as raw Number
    });

    setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, status: 'Quoted', quoteId: newQuote.id } : e));
    addNotification(`Enquiry ${enquiryId} converted to Quotation ${newQuote.id}`, 'Success');
    return newQuote;
  };

  const updateEnquiry = (id, data) => {
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    addNotification(`Enquiry ${id} updated`, 'Info');
  };

  const deleteEnquiry = (id) => {
    setEnquiries(prev => prev.filter(e => e.id !== id));
    addNotification(`Enquiry ${id} deleted`, 'Warning');
  };

  const updateEnquiryStatus = (id, status) => {
    const enquiry = enquiries.find(e => e.id === id);
    
    // Automation: If status is manually moved to 'Quoted' and no quote exists, convert it.
    if (status === 'Quoted' && enquiry && !enquiry.quoteId) {
      convertToQuotation(id);
      return; // convertToQuotation handles the state update and notification
    }

    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    addNotification(`Enquiry ${id} status updated to ${status}`, 'Info');
  };

  const archiveEnquiry = (id) => {
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: 'Archived' } : e));
    addNotification(`Enquiry ${id} has been archived`, 'Warning');
  };

  const updateQuotationStatus = (id, status) => {
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    addNotification(`Quotation ${id} status updated to ${status}`, 'Info');
  };

  const deleteQuotation = (id) => {
    const quote = quotations.find(q => q.id === id);
    if (quote && quote.enqId) {
       // Reset linked enquiry status
       setEnquiries(prev => prev.map(e => e.id === quote.enqId ? { ...e, status: 'New', quoteId: null } : e));
    }
    setQuotations(prev => prev.filter(q => q.id !== id));
    addNotification(`Quotation ${id} deleted`, 'Warning');
  };

  const updatePurchaseOrderStatus = (id, status) => {
    setPurchaseOrders(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    addNotification(`Purchase Order ${id} status updated to ${status}`, 'Info');
  };

  const deletePurchaseOrder = (id) => {
    setPurchaseOrders(prev => prev.filter(p => p.id !== id));
    addNotification(`Purchase Order ${id} deleted`, 'Warning');
  };

  const updateWorkOrderStatus = (id, status) => {
    setWorkOrders(prev => prev.map(wo => wo.id === id ? { ...wo, status } : wo));
    addNotification(`Work Order ${id} status updated to ${status}`, 'Info');
    
    if (status === 'Completed') {
      const wo = workOrders.find(w => w.id === id);
      if (wo) {
        generateInvoiceFromWO(wo);
      }
    }
  };

  const deleteWorkOrder = (id) => {
    setWorkOrders(prev => prev.filter(wo => wo.id !== id));
    addNotification(`Work Order ${id} deleted`, 'Warning');
  };

  const reviseQuotation = (id, newParts, note, manualTotal = null) => {
    setQuotations(prev => prev.map(q => {
      if (q.id === id) {
        const nextVersion = q.version + 1;
        const subtotal = newParts.reduce((sum, p) => sum + (Number(p.qty) || 0) * (Number(p.price) || 0), 0);
        const totalWithGst = manualTotal !== null ? manualTotal : (subtotal * 1.18);
        
        // Snapshot current version as a revision
        const currentVersionAsRevision = { 
          version: q.version, 
          date: q.date, 
          totalAmount: q.totalAmount, 
          parts: [...q.parts], 
          status: q.status,
          note: q.lastNote || 'N/A'
        };
        
        return {
          ...q,
          version: nextVersion,
          date: new Date().toISOString(),
          totalAmount: totalWithGst, // Store as raw Number
          parts: [...newParts],
          lastNote: note || `Revision v${nextVersion}`,
          revisions: [...(q.revisions || []), currentVersionAsRevision],
          history: [...q.history, { 
            version: nextVersion, 
            date: new Date().toISOString(), 
            status: 'Revised', 
            note: note || `Updated pricing and parts for v${nextVersion}` 
          }]
        };
      }
      return q;
    }));
  };

  const addPurchaseOrder = (poData) => {
    const newPO = { 
      ...poData, 
      id: `PO-${generateId()}`, 
      date: new Date().toISOString(),
      status: 'Received',
      attachment: poData.attachment || 'N/A'
    };
    setPurchaseOrders(prev => [newPO, ...prev]);
    // Also update Quote status
    setQuotations(prev => prev.map(q => q.id === poData.quoteId ? { ...q, status: 'PO Received' } : q));
    addNotification(`Purchase Order ${newPO.id} received for Quote ${poData.quoteId}`, 'Success');
    return newPO;
  };

  const [productionUsers] = useState(['Rohan S.', 'Vikram M.', 'Anita K.', 'Sameer D.', 'Priya R.']);

  const addWorkOrder = (woData) => {
    const newWO = {
      ...woData,
      id: `WO-${generateId()}`,
      status: 'Pending',
      date: new Date().toISOString(),
      process: [
        { label: 'Material Procurement', status: 'Pending' },
        { label: 'Machining / Production', status: 'Pending' },
        { label: 'Quality Inspection', status: 'Pending' },
        { label: 'Final Packaging', status: 'Pending' }
      ]
    };
    setWorkOrders(prev => [newWO, ...prev]);
    // Optionally update PO status to "Work Order Created" if it was "Received"
    if (woData.poInternalId) {
      updatePurchaseOrderStatus(woData.poInternalId, 'Work Order Created');
    }
    addNotification(`Work Order ${newWO.id} created for PO ${woData.poNumber}`, 'Success');
    return newWO;
  };

  const convertToWorkOrders = (quoteId, poId) => {
    const quote = quotations.find(q => q.id === quoteId);
    if (!quote) return;

    const newWOs = (quote.parts || []).map((part, index) => {
      const qty     = Number(part.qty)   || 1;
      const price   = Number(part.price) || 0;
      const subtotal = qty * price;
      const gst     = subtotal * 0.18;
      return {
        id: `WO-${quoteId.replace('QTN-','')}-${index + 1}`,
        quoteId: quote.id,
        poId: poId || 'PENDING',
        partName: part.name,
        description: part.description,
        status: 'Pending',
        // ── Quotation-derived pricing (always stored for display in all modules) ──
        partQty: qty,
        partPrice: price,
        partSubtotal: subtotal,
        partGST: gst,
        totalAmount: subtotal + gst,   // subtotal + 18% GST
        amountReceived: 0,
        payments: [],
        assignedTo: 'Unassigned',
        dept: 'Manufacturing',
        startDate: null,
        completionDate: null,
        customer: quote.customerName,
        remarks: '',
        process: [
          { label: 'Inward',      status: 'Pending', time: null },
          { label: 'Production',  status: 'Pending', time: null },
          { label: 'QC',          status: 'Pending', time: null },
          { label: 'Dispatch',    status: 'Pending', time: null }
        ],
        traceability: { enqId: quote.enqId || 'N/A', quoteId: quote.id, poId: poId || 'N/A' }
      };
    });

    setWorkOrders(prev => [...newWOs, ...prev]);
    setQuotations(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'Work Order Created' } : q));
    
    // Also update PO status
    setPurchaseOrders(prev => prev.map(p => p.id === poId ? { ...p, status: 'Work Order Created' } : p));
    
    addNotification(`Created ${newWOs.length} work orders for ${quoteId}`, 'Success');
  };

  const addManualWorkOrder = (woData) => {
    const newWO = {
      ...woData,
      id: `WO-M-${generateId()}`,
      status: 'Pending',
      totalAmount: woData.totalAmount || 50000, // mock fallback
      amountReceived: 0,
      payments: [],
      remarks: '',
      process: [
        { label: 'Inward', status: 'Pending', time: null },
        { label: 'Production', status: 'Pending', time: null },
        { label: 'QC', status: 'Pending', time: null },
        { label: 'Dispatch', status: 'Pending', time: null }
      ],
      traceability: { enqId: 'MANUAL', quoteId: 'MANUAL', poId: woData.poId || 'MANUAL' }
    };
    setWorkOrders(prev => [newWO, ...prev]);
    addNotification(`Manual Work Order ${newWO.id} created`, 'Info');
    return newWO;
  };

  const updateWorkOrder = (id, updates) => {
    setWorkOrders(prev => prev.map(wo => wo.id === id ? { ...wo, ...updates } : wo));
  };

  const addInvoice = (invoiceData) => {
    const prefix = invoiceData.type === 'Proforma' ? 'PI' : 'TX';
    const newInvoice = {
      ...invoiceData,
      id: `${prefix}-${generateId()}`,
      date: new Date().toISOString(),
      payments: [],
      grnStatus: 'Pending',
      grnNumber: null,
      status: invoiceData.type === 'Proforma' ? 'Pending' : 'Unpaid'
    };
    setInvoices(prev => [newInvoice, ...prev]);
    addNotification(`${newInvoice.type} Invoice ${newInvoice.id} generated`, 'Success');
    return newInvoice;
  };

  const generateInvoiceFromWO = (wo) => {
    // Determine if customer has credit balance (Mock logic: 'TechCorp' has credit balance)
    const hasCreditBalance = wo.customer === 'TechCorp' || wo.customer.toLowerCase().includes('credit');
    
    // Attempt to lookup quote for pricing, otherwise mock
    const quote = quotations.find(q => q.id === wo.traceability?.quoteId);
    let totalAmount = 50000; // Mock default
    if (quote && quote.totalAmount) {
      totalAmount = quote.totalAmount / (quote.parts.length || 1); // rough estimating per part
    }

    if (hasCreditBalance) {
      // Skip PI, Go directly to Tax Invoice
      addInvoice({
        type: 'Tax',
        customerName: wo.customer,
        linkedWO: wo.id,
        linkedPI: 'Skipped (Credit Balance)',
        totalAmount: totalAmount,
        amountReceived: wo.amountReceived || 0,
        pendingAmount: totalAmount - (wo.amountReceived || 0),
        payments: wo.payments || [],
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days
      });
      addNotification(`Credit Balance detected for ${wo.customer}. Generated Tax Invoice directly.`, 'Info');
    } else {
      // Generate Proforma Invoice
      const advanceRequested = totalAmount * 0.5; // 50% advance
      addInvoice({
        type: 'Proforma',
        customerName: wo.customer,
        linkedWO: wo.id,
        totalAmount: totalAmount,
        advanceAmount: advanceRequested,
        balanceAmount: totalAmount - advanceRequested,
        amountReceived: wo.amountReceived || 0,
        payments: wo.payments || [],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        mailSent: false
      });
      addNotification(`Work Order ${wo.id} Completed. Generated Proforma Invoice.`, 'Info');
    }
  };

  const convertToTaxInvoice = (piId) => {
    const pi = invoices.find(inv => inv.id === piId);
    if (!pi) return;

    if (pi.type === 'Proforma') {
      if (pi.balanceAmount > 0) {
        addNotification(`Conversion Blocked: Proforma ${piId} has a balance of ₹${pi.balanceAmount}. Full settlement required.`, 'Warning');
        return;
      }
      
      // Update PI status
      setInvoices(prev => prev.map(inv => inv.id === pi.id ? { ...inv, status: 'Converted to Tax Invoice' } : inv));
      
      // Generate Tax Invoice
      addInvoice({
        type: 'Tax',
        customerName: pi.customerName,
        linkedWO: pi.linkedWO,
        linkedPI: pi.id,
        totalAmount: pi.totalAmount,
        amountReceived: pi.totalAmount, // confirmed by balance check
        pendingAmount: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      });
    }
  };

  const updateInvoiceGRN = (invoiceId, grnNumber) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const updatedInv = { ...inv, grnNumber, grnStatus: 'Received' };
        // If already fully paid, move to Completed & Closed
        if (updatedInv.pendingAmount <= 0) {
          updatedInv.status = 'Completed & Closed';
          
          // CRITICAL: Update linked Work Order Status
          if (updatedInv.linkedWO) {
             setWorkOrders(prevWO => prevWO.map(wo => 
               wo.id === updatedInv.linkedWO ? { ...wo, status: 'Completed' } : wo
             ));
             addNotification(`Process Closed: ${updatedInv.id} & WO ${updatedInv.linkedWO} finalized`, 'Success');
          }
        }
        return updatedInv;
      }
      return inv;
    }));
    addNotification(`GRN confirmed for Invoice ${invoiceId}`, 'Success');
  };

  const sendInvoice = (id) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Sent', lastSent: new Date().toISOString() } : inv));
    addNotification(`Invoice ${id} shared with client`, 'Success');
  };

  const sendPI = (id) => sendInvoice(id);

  const deleteInvoice = (id) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    addNotification(`Invoice ${id} deleted`, 'Warning');
  };

  const addPaymentEntry = (invoiceId, paymentData) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const newPayments = [...(inv.payments || []), { ...paymentData, id: Date.now(), date: paymentData.date || new Date().toISOString() }];
        const totalPaid = newPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const pending = inv.totalAmount - totalPaid;
        
        let status = pending <= 0 ? 'Paid' : 'Partial';
        
        // Advanced logic: If Paid but missing GRN (for Tax invoices), set to 'GRN Pending'
        if (inv.type === 'Tax' && pending <= 0) {
          if (inv.grnStatus !== 'Received') {
            status = 'GRN Pending';
          } else {
            status = 'Completed & Closed';
            // CRITICAL: Update linked Work Order Status
            if (inv.linkedWO) {
               setWorkOrders(prevWO => prevWO.map(wo => 
                 wo.id === inv.linkedWO ? { ...wo, status: 'Completed' } : wo
               ));
               addNotification(`Order Finalized: Invoice ${invoiceId} & WO ${inv.linkedWO} closed`, 'Success');
            }
          }
        }
        
        return { 
          ...inv, 
          payments: newPayments, 
          status,
          amountReceived: totalPaid,
          pendingAmount: pending
        };
      }
      return inv;
    }));
    addNotification(`Payment received for Invoice ${invoiceId}`, 'Success');
  };

  const addWorkOrderPayment = (woId, paymentData) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id === woId) {
        const newPayments = [...(wo.payments || []), { ...paymentData, id: Date.now(), date: paymentData.date || new Date().toISOString() }];
        const totalPaid = newPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        
        return {
          ...wo,
          payments: newPayments,
          amountReceived: totalPaid
        };
      }
      return wo;
    }));
    addNotification(`Advance payment received for Work Order ${woId}`, 'Success');
  };

  const login = (credentials) => {
    // Mock login logic
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      const newUser = { name: 'Rohan Shinde', role: 'Admin', email: 'rohan@flowchain.com' };
      setUser(newUser);
      setIsAuthenticated(true);
      setRole('Admin');
      addNotification('Login successful', 'Success');
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('fc_auth');
    localStorage.removeItem('fc_user');
    addNotification('Logged out', 'Info');
  };

  const addNotification = (message, type = 'Info') => {
    const newNote = { id: Date.now(), message, type, time: new Date().toLocaleTimeString() };
    setNotifications(prev => [newNote, ...prev].slice(0, 10));
  };

  const value = {
    isAuthenticated, login, logout, user,
    role, setRole,
    enquiries, addEnquiry,
    quotations, addQuotation, convertToQuotation, reviseQuotation,
    purchaseOrders, addPurchaseOrder, updatePurchaseOrderStatus,
    workOrders, convertToWorkOrders, updateWorkOrderStatus, updateWorkOrder, addManualWorkOrder, addWorkOrder, addWorkOrderPayment,
    invoices, addInvoice, updateInvoiceGRN, addPaymentEntry, convertToTaxInvoice, sendPI, sendInvoice,
    inventory, setInventory,
    notifications, addNotification,
    settings, setSettings,
    selectedWorkOrderId, setSelectedWorkOrderId,
    activePage, onNavigate,
    productionUsers,
    updateEnquiryStatus, archiveEnquiry, updateQuotationStatus,
    updateEnquiry, deleteEnquiry, deleteQuotation, deletePurchaseOrder, deleteWorkOrder, deleteInvoice
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
