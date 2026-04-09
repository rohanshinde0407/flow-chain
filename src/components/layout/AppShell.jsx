import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MessageSquarePlus, 
  FileText, 
  ClipboardCheck, 
  Receipt, 
  Settings, 
  User, 
  ChevronRight, 
  ChevronLeft,
  Menu,
  X,
  FilePlus,
  Wallet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './AppShell.css';

const AppShell = ({ children, activePage, onNavigate }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { role, user, logout } = useApp();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const menuSections = [
    {
      title: 'Core Dashboard',
      items: [
        { icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin', 'Manager', 'Sales'] }
      ]
    },
    {
      title: 'Commercial Hub',
      items: [
        { icon: MessageSquarePlus, label: 'Enquiries', roles: ['Admin', 'Manager', 'Sales'] },
        { icon: FileText, label: 'Quotations', roles: ['Admin', 'Manager', 'Sales'] },
        { icon: FilePlus, label: 'Purchase Orders', roles: ['Admin', 'Manager', 'Sales'] }
      ]
    },
    {
      title: 'Operations',
      items: [
        { icon: ClipboardCheck, label: 'Work Orders', roles: ['Admin', 'Manager'] }
      ]
    },
    {
      title: 'Finance & Invoicing',
      items: [
        { icon: Wallet, label: 'Payment Accounts', roles: ['Admin', 'Manager', 'Sales'] },
        { icon: Receipt, label: 'Invoicing', roles: ['Admin', 'Manager'] }
      ]
    },
    {
      title: 'System',
      items: [
        { icon: Settings, label: 'Settings', roles: ['Admin'] }
      ]
    }
  ];

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  return (
    <div className={`app-container ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header-area">
          <div className="sidebar-logo">
            <div className="logo-icon">FC</div>
            <span className="logo-text">FlowChain</span>
          </div>
          <button className="sidebar-toggle-v2" onClick={toggleSidebar}>
            {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuSections.map((section) => {
            const visibleItems = section.items.filter(item => item.roles.includes(role));
            if (visibleItems.length === 0) return null;

            return (
              <React.Fragment key={section.title}>
                <div className="nav-category">{section.title}</div>
                {visibleItems.map((item) => (
                  <button 
                    key={item.label} 
                    className={`nav-item ${activePage === item.label ? 'active' : ''}`}
                    onClick={() => onNavigate(item.label)}
                  >
                    <div className="nav-icon-wrapper">
                      <item.icon size={20} className="stroke-[2.5px] opacity-80 transition-opacity flex-shrink-0" />
                    </div>
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-tooltip">{item.label}</span>
                    {activePage === item.label && <div className="active-pill"></div>}
                  </button>
                ))}
              </React.Fragment>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">
              <User size={20} />
              {!isSidebarOpen && <div className="online-indicator"></div>}
            </div>
            <div className="user-info">
              <p className="user-name">{user?.name || 'Rohan Shinde'}</p>
              <p className="user-role">{role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="app-header glass">
          <div className="header-left">
            <h2 className="page-title">{activePage}</h2>
          </div>
          <div className="header-right">
            <div className="header-profile-section">
              <div className="profile-info">
                <p className="profile-name">{user?.name || 'Rohan Shinde'}</p>
                <p className="profile-role">{role}</p>
              </div>
              <div className="profile-dropdown-container">
                <button className="profile-btn glass" onClick={() => setShowProfileDropdown(!showProfileDropdown)}>
                  <div className="profile-avatar-sm">
                    {user?.name?.charAt(0) || 'R'}
                  </div>
                </button>
                
                {showProfileDropdown && (
                  <div className="profile-dropdown glass animate-in">
                    <div className="dropdown-header">
                      <p className="user-email">{user?.email || 'rohan@flowchain.com'}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={() => onNavigate('Settings')}>
                      <Settings size={16} />
                      <span>Account Settings</span>
                    </button>
                    <button className="dropdown-item logout" onClick={logout}>
                      <X size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
