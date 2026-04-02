import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Wallet,
  IndianRupee,
  X,
  CreditCard
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DataTablePagination from '../../components/common/DataTablePagination';

// This integrates into the standard dashboard styles
import '../WorkOrders/WorkOrders.css'; 

const PaymentAccounts = () => {
  const { workOrders, addWorkOrderPayment, updateWorkOrder } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWO, setSelectedWO] = useState(null);
  const itemsPerPage = 10;

  // Filter out any Work Orders that somehow got removed or lack details
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
      
      // Update local side-panel state visually without waiting for reload
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
      e.target.reset(); // clear form
    }
  };

  return (
    <div className="module-container-wrapper">
      <div className="module-container animate-in">
        <div className="module-header">
          <div className="header-info">
            <h1>Payment Accounts</h1>
            <p>Track advances and financial collections directly tied to live Work Orders.</p>
          </div>
          <div className="header-stats">
             <div className="mini-stat">
               <span>
                 <IndianRupee size={16} className="inline mr-1 text-slate-500" />
                 Total Exposure: ₹{filteredWorkOrders.reduce((sum, wo) => sum + (wo.totalAmount || 0), 0).toLocaleString('en-IN')}
               </span>
             </div>
             <div className="mini-stat bg-emerald-50 text-emerald-700 border border-emerald-100">
               <span>
                 <Wallet size={16} className="inline mr-1 text-emerald-500" />
                 Collected: ₹{filteredWorkOrders.reduce((sum, wo) => sum + (wo.amountReceived || 0), 0).toLocaleString('en-IN')}
               </span>
             </div>
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

        <div className="flex-1 w-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-in">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sn-col">#</th>
                <th>Work Order</th>
                <th>Customer</th>
                <th className="text-center">Total Est. Value</th>
                <th className="text-center">Credited (Received)</th>
                <th className="text-center">Pending To Collect</th>
                <th className="text-center">WO Status</th>
                <th className="text-center">Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAccounts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="h-32 text-center text-muted-foreground italic">
                    No active workspaces match your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map((wo, idx) => {
                  const pending = (wo.totalAmount || 0) - (wo.amountReceived || 0);
                  const isFullyPaid = wo.totalAmount > 0 && pending <= 0;
                  const paymentStatus = isFullyPaid ? 'Paid' : wo.amountReceived > 0 ? 'Partial' : 'Unpaid';
                  const badgeClass = isFullyPaid ? 'badge-success' : wo.amountReceived > 0 ? 'badge-info' : 'badge-warning';
                  
                  return (
                    <tr 
                      key={wo.id} 
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedWO?.id === wo.id ? 'bg-indigo-50/50' : ''}`}
                      onClick={() => setSelectedWO(wo)}
                    >
                      <td className="sn-col text-center font-medium text-muted-foreground">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td>
                        <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 text-xs">
                          {wo.id}
                        </span>
                      </td>
                      <td className="font-bold text-slate-900">{wo.customer}</td>
                      <td className="text-center font-mono font-medium text-slate-700">₹{(wo.totalAmount || 0).toLocaleString('en-IN')}</td>
                      <td className="text-center font-mono font-semibold text-emerald-600">₹{(wo.amountReceived || 0).toLocaleString('en-IN')}</td>
                      <td className={`text-center font-mono font-bold ${pending > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                        ₹{pending.toLocaleString('en-IN')}
                      </td>
                      <td className="text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            wo.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            wo.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {wo.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${badgeClass}`}>{paymentStatus}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <DataTablePagination 
          currentPage={currentPage}
          totalItems={filteredWorkOrders.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Side Panel for Payment Context */}
      {selectedWO && (
        <div className="side-panel show glass">
          <div className="panel-header">
            <h3>Finances: {selectedWO.id}</h3>
            <button className="icon-btn" onClick={() => setSelectedWO(null)}><X size={20} /></button>
          </div>
          
           <div className="panel-content overflow-y-auto max-h-[calc(100vh-100px)] space-y-6 pb-20">
            {/* Sec 1: Finance Summary & Settings */}
            <div className="panel-section pb-6 border-b border-slate-200 last:border-b-0">
              <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                <Wallet size={18} className="text-indigo-600"/> Master Financial Override
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                 <div className="form-group">
                    <label className="text-xs font-bold uppercase text-slate-500">Order Quote (₹)</label>
                    <input 
                      type="number"
                      className="form-input font-mono font-bold text-slate-900 border-indigo-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-indigo-50/30"
                      value={selectedWO.totalAmount || 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        updateWorkOrder(selectedWO.id, { totalAmount: val });
                        setSelectedWO(prev => ({...prev, totalAmount: val}));
                      }}
                    />
                 </div>
                 <div className="form-group">
                    <label className="text-xs font-bold uppercase text-slate-500">Total Collected</label>
                    <div className="form-input bg-emerald-50 border-emerald-200 text-emerald-800 font-mono font-bold flex items-center">
                      ₹{(selectedWO.amountReceived || 0).toLocaleString('en-IN')}
                    </div>
                 </div>
              </div>

              <div className="form-group mb-0">
                <label className="text-xs font-bold uppercase text-slate-500 block mb-1">Internal Finance Remarks</label>
                <textarea 
                  className="form-input w-full min-h-[70px] text-sm resize-none"
                  placeholder="E.g., Special partial payment clearance authorized by Mgmt..."
                  value={selectedWO.financeRemarks || ''}
                  onChange={(e) => {
                    updateWorkOrder(selectedWO.id, { financeRemarks: e.target.value });
                    setSelectedWO(prev => ({...prev, financeRemarks: e.target.value}));
                  }}
                />
              </div>
            </div>

            {/* Sec 2: Record New Transaction */}
            <div className="panel-section pb-6 border-b border-slate-200 last:border-b-0">
               <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                 <CreditCard size={18} className="text-emerald-600" /> Log Transaction
               </h4>
               <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="form-group">
                    <label className="text-xs font-bold uppercase text-slate-500">Payment Mode</label>
                    <select name="method" className="form-input text-sm" required>
                      <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer</option>
                      <option value="UPI">UPI</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="form-group">
                       <label className="text-xs font-bold uppercase text-slate-500">Deposit Date</label>
                       <input type="date" name="date" className="form-input text-sm" required defaultValue={new Date().toISOString().split('T')[0]} />
                     </div>
                     <div className="form-group">
                       <label className="text-xs font-bold uppercase text-slate-500">Amount (₹)</label>
                       <input 
                         type="number" 
                         name="amount" 
                         className="form-input text-sm font-mono font-semibold" 
                         required 
                         defaultValue={Math.max(0, (selectedWO.totalAmount || 0) - (selectedWO.amountReceived || 0))} 
                         min="1"
                       />
                     </div>
                  </div>
                  
                  <div className="form-group">
                     <label className="text-xs font-bold uppercase text-slate-500">UTR / Reference Number</label>
                     <input type="text" name="reference" placeholder="Enter bank transaction ID..." className="form-input text-sm" />
                  </div>

                  <button type="submit" className="btn btn-primary w-full justify-center mt-2 py-2.5 shadow hover:shadow-md transition-all">Submit Remittance</button>
               </form>
            </div>

            {/* Sec 3: Transaction History */}
            <div className="panel-section pb-6 border-b border-slate-200 last:border-b-0">
               <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-4">
                 <Clock size={18} className="text-slate-500" /> Remittance Ledger
               </h4>
               <div className="space-y-3">
                 {!(selectedWO.payments?.length) ? (
                    <div className="flex flex-col flex-1 items-center justify-center py-6 text-slate-400">
                      <Search size={32} className="mb-2 opacity-20" />
                      <p className="text-sm italic">No funds collected for this order yet.</p>
                    </div>
                 ) : (
                    selectedWO.payments.map((p, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50/80 hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="font-bold text-indigo-900 text-sm mb-0.5">{p.method}</p>
                          <p className="text-[11px] text-slate-500 font-medium">Logged: {new Date(p.date).toLocaleDateString('en-IN')}</p>
                        </div>
                        <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">
                          + ₹{Number(p.amount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))
                 )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentAccounts;
