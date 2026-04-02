import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, Mail, Key } from 'lucide-react';
import { motion } from 'framer-motion';
import './Login.css';

const Login = () => {
  const { login } = useApp();
  const [credentials, setCredentials] = useState({ username: 'admin', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate network delay
    setTimeout(() => {
      const result = login(credentials);
      if (!result.success) {
        setError(result.message);
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleChange = (e) => {
    setCredentials(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="login-root">
      <div className="login-bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <motion.div 
        className="login-card glass"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="login-header">
          <div className="login-logo">
            <ShieldCheck size={32} />
            <span>FlowChain</span>
          </div>
          <h1>Welcome Back</h1>
          <p>Please enter your details to sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="login-error">{error}</motion.div>}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-with-icon">
              <User size={18} />
              <input 
                type="text" 
                id="username"
                name="username" 
                placeholder="Enter your username"
                value={credentials.username}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                id="password"
                name="password" 
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                required 
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            className={`login-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loader"></span>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Mock Credentials: <strong>admin</strong> / <strong>admin123</strong></p>
        </div>
      </motion.div>

      <div className="login-branding">
        <p>© 2026 FlowChain Industrial ERP. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;
