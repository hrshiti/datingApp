import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setIsLoading(true);

    // Simple admin authentication (In production, use proper backend authentication)
    // Default admin credentials: admin / admin123
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        // Store admin session
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUsername', username);
        navigate('/admin/dashboard');
      } else {
        setError('Invalid username or password');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-[#64B5F6]/8 to-transparent rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-[#42A5F5]/8 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#90CAF9]/5 to-transparent rounded-full blur-3xl"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-8 w-full max-w-md border border-[#E8E8E8] relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2 tracking-tight">
            Admin Login
          </h1>
          <p className="text-sm text-[#616161] font-medium">
            Enter your credentials to access admin panel
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2 tracking-tight">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-3 border border-[#E8E8E8] rounded-xl bg-white focus:bg-white focus:border-[#64B5F6] focus:outline-none focus:ring-2 focus:ring-[#64B5F6]/20 transition-all shadow-sm font-medium"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2 tracking-tight">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 border border-[#E8E8E8] rounded-xl bg-white focus:bg-white focus:border-[#64B5F6] focus:outline-none focus:ring-2 focus:ring-[#64B5F6]/20 transition-all shadow-sm font-medium"
              disabled={isLoading}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.02, y: isLoading ? 0 : -2 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className="w-full bg-[#64B5F6] hover:bg-[#42A5F5] disabled:bg-[#E0E0E0] text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_4px_16px_rgba(100,181,246,0.3)] hover:shadow-[0_8px_24px_rgba(100,181,246,0.4)] disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Logging in...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-[#616161] font-medium">
            Default credentials: admin / admin123
          </p>
        </div>
      </motion.div>
    </div>
  );
}

