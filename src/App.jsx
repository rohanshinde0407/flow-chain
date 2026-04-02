import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard/Dashboard';
import EnquiryList from './pages/Quotations/EnquiryList';
import QuotationList from './pages/Quotations/QuotationList';
import QuotationDetail from './pages/Quotations/QuotationDetail';
import PurchaseOrderList from './pages/Quotations/PurchaseOrderList';
import WorkOrderList from './pages/WorkOrders/WorkOrderList';
import InvoicingModule from './pages/Invoices/InvoicingModule';
import PaymentAccounts from './pages/Accounts/PaymentAccounts';
import SettingsModule from './pages/Settings/SettingsModule';
import Login from './pages/Login/Login';
import './index.css';

const MainContent = () => {
  const { activePage, onNavigate, isAuthenticated } = useApp();
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);

  if (!isAuthenticated) {
    return <Login />;
  }

  // Navigation Logic
  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard': return <Dashboard />;
      case 'Enquiries': return <EnquiryList onNavigate={onNavigate} />;
      case 'Quotations': 
        return selectedQuoteId ? 
          <QuotationDetail quoteId={selectedQuoteId} onBack={() => setSelectedQuoteId(null)} /> : 
          <QuotationList onSelect={(id) => setSelectedQuoteId(id)} />;
      case 'Work Orders': return <WorkOrderList />;
      case 'Purchase Orders': return <PurchaseOrderList onNavigate={onNavigate} />;
      case 'Invoicing': return <InvoicingModule />;
      case 'Payment Accounts': return <PaymentAccounts />;
      case 'Settings': return <SettingsModule />;
      default: return <Dashboard />;
    }
  };

  return (
    <AppShell 
      activePage={activePage} 
      onNavigate={(page) => {
        onNavigate(page);
        setSelectedQuoteId(null);
      }}
    >
      {renderPage()}
    </AppShell>
  );
};


function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
