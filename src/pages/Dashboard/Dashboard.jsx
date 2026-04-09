import React, { useState, useMemo } from 'react';
import {
  IndianRupee,
  Users,
  FileText,
  Wallet,
  Activity,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Calendar,
  FilePlus,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './Dashboard.css';

// ── Greeting ──────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// ── Mini Bar Chart (for KPI Cards) ───────────────────────────────────────────
const MiniBarChart = ({ data, color }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  return (
    <div className="db-mini-bars">
      {data.map((v, i) => (
        <div 
          key={i} 
          className="db-mini-bar" 
          style={{ 
            height: `${(v / max) * 100}%`,
            backgroundColor: color,
            opacity: 0.3 + (i / data.length) * 0.7
          }} 
        />
      ))}
    </div>
  );
};

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, accentColor, bgGradient, trend, trendValue, subtitle, trendData }) => (
  <div className="db-stat-card-v2" style={{ '--accent-v2': accentColor }}>
    <div className="db-stat-header-v2">
      <div className="db-stat-icon-v2" style={{ background: bgGradient }}>
        <Icon size={20} color="#fff" />
      </div>
      <p className="db-stat-label-v2">{title}</p>
    </div>
    <div className="db-stat-content-v2">
        <h3 className="db-stat-value-v2">{value}</h3>
        <div className="db-stat-footer-v2">
            <span className={`db-trend-v2 ${trend}`}>
                {trend === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {trendValue}%
            </span>
            <span className="db-stat-sub-v2">{subtitle}</span>
        </div>
    </div>
    {trendData && <MiniBarChart data={trendData} color={accentColor} />}
  </div>
);

// ── Large Monthly Orders Chart ─────────────────────────────────────────────────
const MonthlyOrdersChart = ({ workOrders, purchaseOrders, year, setSelectedYear, years }) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const woStats = useMemo(() => {
    const stats = new Array(12).fill(0);
    workOrders.forEach(wo => {
      const d = new Date(wo.date);
      if (d.getFullYear() === year) stats[d.getMonth()]++;
    });
    return stats;
  }, [workOrders, year]);

  const poStats = useMemo(() => {
    const stats = new Array(12).fill(0);
    purchaseOrders.forEach(po => {
      const d = new Date(po.date);
      if (d.getFullYear() === year) stats[d.getMonth()]++;
    });
    return stats;
  }, [purchaseOrders, year]);

  const maxVal = Math.max(...woStats, ...poStats, 5);

  return (
    <div className="db-main-chart-card">
      <div className="db-chart-header-v2">
        <div className="db-chart-title-area-v2">
          <h3 className="db-chart-title-v2">Order Volume Breakdown</h3>
          <p className="db-chart-subtitle-v2">Monthly Comparison of Work vs Purchase Orders</p>
        </div>
        <div className="db-chart-actions-v2">
          <div className="db-chart-legend-v2">
            <div className="db-legend-item"><span className="db-dot wo" /> Work Orders</div>
            <div className="db-legend-item"><span className="db-dot po" /> Purchase Orders</div>
          </div>
          <div className="db-year-filter-v2">
            <Calendar size={14} />
            <select 
              value={year} 
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="db-year-select-v2"
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown size={12} />
          </div>
        </div>
      </div>
      <div className="db-bar-graph-v2">
        {months.map((m, i) => (
          <div key={m} className="db-graph-col-v2">
            <div className="db-bar-pair-v2">
              <div 
                className="db-graph-bar wo" 
                style={{ height: `${(woStats[i] / maxVal) * 100}%` }}
                data-value={woStats[i]}
              >
                <span className="db-bar-tooltip">{woStats[i]} WO</span>
              </div>
              <div 
                className="db-graph-bar po" 
                style={{ height: `${(poStats[i] / maxVal) * 100}%` }}
                data-value={poStats[i]}
              >
                <span className="db-bar-tooltip">{poStats[i]} PO</span>
              </div>
            </div>
            <span className="db-month-label-v2">{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { enquiries, quotations, workOrders, purchaseOrders } = useApp();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // ── Years for filter ────────────────────────────────────────────────────────
  const years = [2024, 2025, 2026];

  // ── Metrics ───────────────────────────────────────────────────────────────────
  const parseAmount = (amt) => {
    if (typeof amt === 'number') return amt;
    if (typeof amt === 'string') return Number(amt.replace(/[^0-9.-]+/g, '')) || 0;
    return 0;
  };

  const totalEnquiries = (enquiries || []).length;
  const totalQuotations = (quotations || []).length;
  const totalPOs = (purchaseOrders || []).length;
  const totalWOs = (workOrders || []).length;
  
  const totalValue = (workOrders || []).reduce((s, wo) => s + (wo.totalAmount || 0), 0);
  const totalCollected = (workOrders || []).reduce((s, wo) => s + (wo.amountReceived || 0), 0);
  const pendingRevenue = totalValue - totalCollected;
  
  // For "Credited", we can use completed work orders' collected amount
  const settledAmount = (workOrders || []).filter(wo => wo.status === 'Completed').reduce((s, wo) => s + (wo.amountReceived || 0), 0);
  const completedWOs = (workOrders || []).filter(wo => wo.status === 'Completed').length;
  const activeWOs = (workOrders || []).filter(wo => wo.status === 'In Progress').length;

  return (
    <div className="db-root-v2">
      {/* ── Minimal Header ──────────────────────────────────────────────────── */}
      <div className="db-header-v2">
        <div className="db-header-left-v2">
          <h1 className="db-greeting-v2">{getGreeting()}, Rohan 👋</h1>
          <div className="db-subtitle-area-v2">
            <Activity size={14} className="pulse-icon" />
            <p className="db-subtitle-v2">Operational Intelligence Dashboard</p>
          </div>
        </div>
      </div>

      {/* ── Stat Rows ───────────────────────────────────────────────────────── */}
      <div className="db-kpi-row-v2">
        <StatCard
          title="Enquiries"
          value={totalEnquiries}
          icon={Users}
          accentColor="#6366f1"
          bgGradient="linear-gradient(135deg,#6366f1,#4338ca)"
          trend="up" trendValue={0}
          subtitle="New Leads"
          trendData={[]}
        />
        <StatCard
          title="Quotations"
          value={totalQuotations}
          icon={FileText}
          accentColor="#f59e0b"
          bgGradient="linear-gradient(135deg,#f59e0b,#d97706)"
          trend="up" trendValue={0}
          subtitle="Active Bids"
          trendData={[]}
        />
        <StatCard
          title="Purchase Orders"
          value={totalPOs}
          icon={FilePlus}
          accentColor="#3b82f6"
          bgGradient="linear-gradient(135deg,#3b82f6,#1e3a8a)"
          trend="up" trendValue={0}
          subtitle="Customer POs"
          trendData={[]}
        />
        <StatCard
          title="Work Orders"
          value={totalWOs}
          icon={ClipboardCheck}
          accentColor="#10b981"
          bgGradient="linear-gradient(135deg,#10b981,#065f46)"
          trend="up" trendValue={0}
          subtitle="In Production"
          trendData={[]}
        />
        <StatCard
          title="Payment"
          value={totalCollected > 0 ? `₹${(totalCollected / 1000).toFixed(1)}k` : '₹0'}
          icon={Wallet}
          accentColor="#8b5cf6"
          bgGradient="linear-gradient(135deg,#8b5cf6,#6d28d9)"
          trend="up" trendValue={0}
          subtitle="Total Collected"
          trendData={[]}
        />
        <StatCard
          title="Total"
          value={totalValue > 0 ? `₹${(totalValue / 1000).toFixed(1)}k` : '₹0'}
          icon={IndianRupee}
          accentColor="#06b6d4"
          bgGradient="linear-gradient(135deg,#06b6d4,#0891b2)"
          trend="up" trendValue={0}
          subtitle="Invoiced Value"
          trendData={[]}
        />
        <StatCard
          title="Pending"
          value={pendingRevenue > 0 ? `₹${(pendingRevenue / 1000).toFixed(1)}k` : '₹0'}
          icon={AlertCircle}
          accentColor="#ef4444"
          bgGradient="linear-gradient(135deg,#ef4444,#991b1b)"
          trend="down" trendValue={0}
          subtitle="Outstanding"
          trendData={[]}
        />
        <StatCard
          title="Credited"
          value={settledAmount > 0 ? `₹${(settledAmount / 1000).toFixed(1)}k` : '₹0'}
          icon={CheckCircle2}
          accentColor="#10b981"
          bgGradient="linear-gradient(135deg,#10b981,#064e3b)"
          trend="up" trendValue={0}
          subtitle="Verified Funds"
          trendData={[]}
        />
      </div>

      {/* ── Large Graph Section ─────────────────────────────────────────────── */}
      <MonthlyOrdersChart 
        workOrders={workOrders} 
        purchaseOrders={purchaseOrders} 
        year={selectedYear}
        setSelectedYear={setSelectedYear}
        years={years}
      />

      {/* ── Sub Summaries ───────────────────────────────────────────────────── */}
      <div className="db-sub-grid-v2">
        <div className="db-simple-card-v2">
          <h4 className="db-card-title-v2">Financial Summary</h4>
          <div className="db-simple-list-v2">
            <div className="db-simple-item">
              <span>Total Credited</span>
              <span className="val success">₹{totalCollected.toLocaleString('en-IN')}</span>
            </div>
            <div className="db-simple-item">
              <span>Total Pending</span>
              <span className="val danger">₹{pendingRevenue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
        <div className="db-simple-card-v2">
          <h4 className="db-card-title-v2">Operational Efficiency</h4>
          <div className="db-simple-list-v2">
            <div className="db-simple-item">
              <span>Completion Rate</span>
              <span className="val prim">{workOrders.length ? Math.round((completedWOs/workOrders.length)*100) : 0}%</span>
            </div>
            <div className="db-simple-item">
              <span>Active Batch Count</span>
              <span className="val amber">{activeWOs} Batches</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
