import React, { useState } from 'react';
import { 
  Users, 
  BellRing, 
  Mail, 
  MessageSquare, 
  ShieldCheck, 
  Plus, 
  Edit2, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';
import './Settings.css';

const SettingsModule = () => {
  const [activeSection, setActiveSection] = useState('Users');
  const [reminders, setReminders] = useState({
    grn: '2 Days Gap',
    payment: '3 Days Gap',
    quote: '5 Days Gap'
  });

  const [notificationStatus, setNotificationStatus] = useState({
    email: true,
    whatsapp: false
  });

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="header-info">
          <h1>System Settings</h1>
          <p>Manage users, configure automated reminders, and integrations.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-nav card">
          <button className={activeSection === 'Users' ? 'active' : ''} onClick={() => setActiveSection('Users')}>
            <Users size={18} />
            User Management
          </button>
          <button className={activeSection === 'Reminders' ? 'active' : ''} onClick={() => setActiveSection('Reminders')}>
            <BellRing size={18} />
            Reminder Schedules
          </button>
          <button className={activeSection === 'Integration' ? 'active' : ''} onClick={() => setActiveSection('Integration')}>
            <MessageSquare size={18} />
            Channel Integration
          </button>
          <button className={activeSection === 'Email' ? 'active' : ''} onClick={() => setActiveSection('Email')}>
            <Mail size={18} />
            Email Templates
          </button>
          <button className={activeSection === 'System' ? 'active' : ''} onClick={() => setActiveSection('System')}>
            <ShieldCheck size={18} />
            System Configuration
          </button>
        </div>

        <div className="settings-main">
          {activeSection === 'Users' && (
            <div className="card settings-card animate-in">
              <div className="card-header no-border">
                <div>
                  <h3>System Users</h3>
                  <p>Manage access and roles for your team members.</p>
                </div>
                <button className="btn btn-primary"><Plus size={16} /> Add User</button>
              </div>
              <table className="data-table mt-4">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Rohan Shinde', email: 'rohan.s@flowchain.com', role: 'Admin', dept: 'Operations', status: 'Active' },
                    { name: 'Sagar Patel', email: 'sagar.p@flowchain.com', role: 'Manager', dept: 'Production', status: 'Active' },
                    { name: 'Anita Rao', email: 'anita.r@flowchain.com', role: 'Sales', dept: 'Business Dev', status: 'Active' }
                  ].map((user, idx) => (
                    <tr key={idx}>
                      <td>
                        <div className="cell-main">
                          <p className="primary-text">{user.name}</p>
                          <p className="secondary-text">{user.email}</p>
                        </div>
                      </td>
                      <td><span className="badge badge-info">{user.role}</span></td>
                      <td>{user.dept}</td>
                      <td><span className="badge badge-success">{user.status}</span></td>
                      <td>
                        <div className="table-actions">
                          <button className="icon-btn"><Edit2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeSection === 'Reminders' && (
            <div className="card settings-card animate-in">
              <div className="card-header no-border">
                <div>
                  <h3>Automated Reminder Schedule</h3>
                  <p>Set frequency for pending actions across all modules.</p>
                </div>
              </div>
              
              <div className="reminder-list mt-6">
                {[
                  { title: 'GRN Not Received', desc: 'Sent when Tax Invoice is partial/unpaid.', val: reminders.grn, key: 'grn', options: ['Every Day', 'Alternate Day', '2 Days Gap', '4 Days Gap'] },
                  { title: 'Payment Pending', desc: 'Triggered for Unpaid or Partially paid invoices.', val: reminders.payment, key: 'payment', options: ['Every Day', 'Alternate Day', '3 Days Gap', '5 Days Gap'] },
                  { title: 'Quote Follow-up', desc: 'Sent after a Quote is sent but no response.', val: reminders.quote, key: 'quote', options: ['Every Day', 'Alternate Day', '2 Days Gap', '3 Days Gap', '5 Days Gap'] }
                ].map((item, idx) => (
                  <div key={idx} className="reminder-item-box glass mb-4 p-4">
                    <div className="item-info">
                      <h4 className="font-semibold">{item.title}</h4>
                      <p className="text-sm text-muted mb-2">{item.desc}</p>
                    </div>
                    <select 
                      className="form-select w-full"
                      value={item.val} 
                      onChange={(e) => setReminders({...reminders, [item.key]: e.target.value})}
                    >
                      {item.options.map(opt => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'Integration' && (
            <div className="card settings-card animate-in">
              <div className="card-header no-border">
                <div>
                  <h3>Global Channels</h3>
                  <p>Connect and configure notification services.</p>
                </div>
              </div>
              
              <div className="integration-stack mt-6">
                <div className="integration-item glass p-4 mb-4">
                  <div className="item-info">
                    <div className="channel-title flex items-center gap-2 mb-2">
                      <Mail size={20} color="var(--primary)" />
                      <h4 className="font-semibold text-lg">Email Notifications (SMTP)</h4>
                    </div>
                    <p className="text-sm text-muted">Primary channel for quotes, POs, and invoices.</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className={`badge ${notificationStatus.email ? 'badge-success' : 'badge-danger'}`}>
                      {notificationStatus.email ? 'Connected' : 'Disabled'}
                    </span>
                    <button onClick={() => setNotificationStatus({...notificationStatus, email: !notificationStatus.email})}>
                      {notificationStatus.email ? <ToggleRight size={32} color="var(--success)" /> : <ToggleLeft size={32} color="var(--text-muted)" />}
                    </button>
                  </div>
                </div>

                <div className="integration-item glass p-4 mb-4">
                  <div className="item-info">
                    <div className="channel-title flex items-center gap-2 mb-2">
                       <MessageSquare size={20} color="#25D366" />
                       <h4 className="font-semibold text-lg">WhatsApp Business API</h4>
                    </div>
                    <p className="text-sm text-muted">Direct high-conversion messaging for Indian customers.</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className={`badge ${notificationStatus.whatsapp ? 'badge-success' : 'badge-danger'}`}>
                      {notificationStatus.whatsapp ? 'Connected' : 'Disabled'}
                    </span>
                    <button onClick={() => setNotificationStatus({...notificationStatus, whatsapp: !notificationStatus.whatsapp})}>
                      {notificationStatus.whatsapp ? <ToggleRight size={32} color="var(--success)" /> : <ToggleLeft size={32} color="var(--text-muted)" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'Email' && (
            <div className="card settings-card animate-in">
              <div className="card-header no-border">
                <div>
                  <h3>Email Templates</h3>
                  <p>Customize automated messages sent to customers.</p>
                </div>
                <button className="btn btn-primary"><Plus size={16} /> New Template</button>
              </div>
              <div className="template-grid mt-6">
                {[
                  { name: 'Quotation Sent', subject: 'New Quotation from FlowChain - {quote_id}', trigger: 'When quote is sent' },
                  { name: 'Payment Reminder', subject: 'Overdue Payment Notification - {invoice_id}', trigger: 'Manual or Auto-trigger' },
                  { name: 'Work Order Started', subject: 'Production Started for {part_name}', trigger: 'When WO status changes to In Progress' }
                ].map((tpl, idx) => (
                  <div key={idx} className="template-item glass p-4 mb-4">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-semibold">{tpl.name}</h4>
                       <button className="icon-btn"><Edit2 size={16} /></button>
                    </div>
                    <p className="text-sm text-muted mb-1"><strong>Subject:</strong> {tpl.subject}</p>
                    <p className="text-xs text-info"><strong>Trigger:</strong> {tpl.trigger}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'System' && (
            <div className="card settings-card animate-in">
              <div className="card-header no-border">
                <div>
                  <h3>System Configuration</h3>
                  <p>Global settings for localization and business logic.</p>
                </div>
              </div>
              <div className="config-form mt-6">
                <div className="form-group mb-6">
                  <label>Base Currency</label>
                  <select className="form-select w-full max-w-xs">
                    <option>₹ Indian Rupee (INR)</option>
                    <option>$ US Dollar (USD)</option>
                    <option>€ Euro (EUR)</option>
                  </select>
                </div>
                <div className="form-group mb-6">
                  <label>Date Display Format</label>
                  <select className="form-select w-full max-w-xs">
                    <option>DD/MM/YYYY (Indian Standard)</option>
                    <option>MM/DD/YYYY (US Standard)</option>
                    <option>YYYY-MM-DD (ISO)</option>
                  </select>
                </div>
                <div className="form-group mb-6">
                  <label>Default GST Rate (%)</label>
                  <input type="number" defaultValue="18" className="form-input w-24" />
                </div>
                <div className="form-actions pt-4 border-t">
                  <button className="btn btn-primary">Save Changes</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;
