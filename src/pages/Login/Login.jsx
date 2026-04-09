import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  ClipboardList, 
  FilePlus, 
  Settings2, 
  Wallet, 
  Receipt,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Login.css';

const Login = () => {
  const { login } = useApp();
  const [credentials, setCredentials] = useState({ username: 'admin', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeNode, setActiveNode] = useState(0);

  // Process nodes sequence derived from business logic
  const processSteps = [
    { label: 'Requirements', icon: ClipboardList, desc: 'Demand Capture' },
    { label: 'Purchase Order', icon: FilePlus, desc: 'Procurement' },
    { label: 'Work Orders', icon: Settings2, desc: 'Production' },
    { label: 'Operations', icon: LayoutGrid, desc: 'Fulfillment' },
    { label: 'Financials', icon: Wallet, desc: 'Ledger Management' },
    { label: 'Invoicing', icon: Receipt, desc: 'Revenue Capture' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % processSteps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      const result = login(credentials);
      if (!result.success) {
        setError(result.message);
        setIsLoading(false);
      }
    }, 1200);
  };

  const handleChange = (e) => {
    setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="login-root">
      {/* Visual Section: Animated ERP Ecosystem */}
      <div className="auth-visual">
        <div className="visual-content">
          <div className="process-diagram">
            <div className="process-row">
              {processSteps.slice(0, 3).map((step, idx) => (
                <React.Fragment key={step.label}>
                  <div className={`process-node ${activeNode === idx ? 'active' : ''}`}>
                    <step.icon size={28} className="node-icon" />
                    <span className="node-label">{step.label}</span>
                  </div>
                  {idx < 2 && <div className="connector-h"></div>}
                </React.Fragment>
              ))}
            </div>
            
            <div className="flex flex-col items-center gap-4 py-8">
               <motion.div 
                 animate={{ opacity: [0.3, 1, 0.3], y: [0, 10, 0] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="w-1 h-12 bg-indigo-500/20 rounded-full"
               />
            </div>

            <div className="process-row">
              {processSteps.slice(3, 6).map((step, idx) => {
                const globalIdx = idx + 3;
                return (
                  <React.Fragment key={step.label}>
                    <div className={`process-node ${activeNode === globalIdx ? 'active' : ''}`}>
                      <step.icon size={28} className="node-icon" />
                      <span className="node-label">{step.label}</span>
                    </div>
                    {idx < 2 && <div className="connector-h"></div>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <motion.div 
            className="visual-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2>End-to-End <br/>Operational Mastery.</h2>
            <p>From Customer Requirement to Final Invoice — <br/>Automate your entire factory lifecycle in one unified portal.</p>
          </motion.div>
        </div>
      </div>

      {/* Login Section */}
      <div className="auth-form-container">
        <motion.div 
          className="login-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="login-header">
            <div className="login-logo">
              <div className="logo-inner">
                <ShieldCheck size={26} className="stroke-[2.5px]" />
              </div>
              <span>FlowChain</span>
            </div>
            <h1>Portal Entry</h1>
            <p>Authenticate to manage operations</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="login-error"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="form-group">
              <label>System Username</label>
              <div className="input-with-icon">
                <User size={19} />
                <input 
                  type="text" 
                  name="username" 
                  placeholder="admin"
                  value={credentials.username}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Access Key</label>
              <div className="input-with-icon">
                <Lock size={19} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={handleChange}
                  required 
                />
                <button 
                  type="button" 
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="auth-spinner"></div>
              ) : (
                <>
                  Enter Lifecycle Management
                  <ArrowRight size={20} className="stroke-[3px]" />
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Auth Protocol: <strong>admin</strong> / <strong>admin123</strong></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
