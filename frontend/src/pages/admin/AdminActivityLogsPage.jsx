import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FileText, Search, Filter, Calendar, User, Shield, Ban, Crown, 
  Ticket, Settings, Trash2, Eye, CheckCircle, XCircle,
  LayoutDashboard, Users, Camera, AlertTriangle, LogOut, DollarSign, Menu, X
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminActivityLogsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all'); // all, user, premium, moderation, settings
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }

    loadActivityLogs();
  }, [navigate]);

  const loadActivityLogs = () => {
    const saved = localStorage.getItem('activityLogs');
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading activity logs:', e);
      }
    } else {
      // Initialize with some default logs
      const defaultLogs = [
        {
          id: '1',
          action: 'user_banned',
          admin: 'admin',
          target: 'User ID: 123',
          description: 'Banned user for inappropriate behavior',
          category: 'moderation',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          action: 'premium_granted',
          admin: 'admin',
          target: 'User ID: 456',
          description: 'Granted premium subscription',
          category: 'premium',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          action: 'promo_created',
          admin: 'admin',
          target: 'WELCOME50',
          description: 'Created new promo code',
          category: 'premium',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          action: 'verification_approved',
          admin: 'admin',
          target: 'User ID: 789',
          description: 'Approved photo verification',
          category: 'user',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '5',
          action: 'settings_updated',
          admin: 'admin',
          target: 'App Settings',
          description: 'Updated daily like limit to 25',
          category: 'settings',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setLogs(defaultLogs);
      localStorage.setItem('activityLogs', JSON.stringify(defaultLogs));
    }
  };

  const logActivity = (action, target, description, category) => {
    const newLog = {
      id: Date.now().toString(),
      action,
      admin: localStorage.getItem('adminUsername') || 'admin',
      target,
      description,
      category,
      timestamp: new Date().toISOString()
    };
    const updated = [newLog, ...logs];
    setLogs(updated);
    localStorage.setItem('activityLogs', JSON.stringify(updated));
  };

  // Expose logActivity function globally for other admin pages
  useEffect(() => {
    window.logAdminActivity = logActivity;
    return () => {
      delete window.logAdminActivity;
    };
  }, [logs]);

  const getActionIcon = (action) => {
    if (action.includes('banned') || action.includes('suspended')) return Ban;
    if (action.includes('premium') || action.includes('promo')) return Crown;
    if (action.includes('verification')) return Camera;
    if (action.includes('settings')) return Settings;
    if (action.includes('user')) return Users;
    return FileText;
  };

  const getCategoryColor = (category) => {
    const colors = {
      user: 'bg-blue-100 text-blue-700',
      premium: 'bg-yellow-100 text-yellow-700',
      moderation: 'bg-red-100 text-red-700',
      settings: 'bg-gray-100 text-gray-700',
      verification: 'bg-purple-100 text-purple-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.category === filter;
    const matchesSearch = searchTerm === '' || 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      if (dateFilter === 'today') {
        matchesDate = logDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = logDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = logDate >= monthAgo;
      }
    }
    
    return matchesFilter && matchesSearch && matchesDate;
  });

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: Camera, label: 'Photo Verification', path: '/admin/verification' },
    { icon: AlertTriangle, label: 'Content Moderation', path: '/admin/moderation' },
    { icon: Crown, label: 'Premium Management', path: '/admin/premium' },
    { icon: Ticket, label: 'Promo Codes', path: '/admin/promo-codes' },
    { icon: FileText, label: 'Activity Logs', path: '/admin/activity-logs' },
    { icon: DollarSign, label: 'Payments & Refunds', path: '/admin/payments' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };

  const stats = {
    total: logs.length,
    today: logs.filter(l => {
      const logDate = new Date(l.timestamp);
      const today = new Date();
      return logDate.toDateString() === today.toDateString();
    }).length,
    thisWeek: logs.filter(l => {
      const logDate = new Date(l.timestamp);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return logDate >= weekAgo;
    }).length,
    thisMonth: logs.filter(l => {
      const logDate = new Date(l.timestamp);
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return logDate >= monthAgo;
    }).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex relative">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}
      
      {/* Left Sidebar */}
      <div 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} fixed top-0 left-0 h-screen bg-white/80 backdrop-blur-lg border-r border-gray-200/50 flex flex-col transition-all duration-300 shadow-xl z-50 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-200/50 sticky top-0 bg-white/80 backdrop-blur-lg z-10">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
              {sidebarOpen && (
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {localStorage.getItem('adminUsername') || 'Admin'}
                  </p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <motion.button
                onClick={() => setSidebarOpen(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </motion.button>
            )}
            {!sidebarOpen && (
              <motion.button
                onClick={() => setSidebarOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-500" />
              </motion.button>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                whileHover={{ x: 4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-md'
                    : 'text-gray-700 hover:bg-gray-50/80'
                }`}
              >
                <div className={`${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'} transition-colors`}>
                  <Icon className="w-4 h-4" />
                </div>
                {sidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200/50">
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50/80 transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto md:ml-64">
        {/* Top Header Bar */}
        <div className="fixed top-0 right-0 left-0 md:left-64 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
          <div className="p-4 md:p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                whileTap={{ scale: 0.95 }}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </motion.button>
              <div>
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Activity Logs
                </h1>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  View all admin actions and system activities
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Spacer for fixed header */}
        <div className="h-20 md:h-24"></div>
        <div className="p-4 md:p-6">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg border border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Total Logs</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg border border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-500">Today</p>
                  <p className="text-xl md:text-2xl font-bold text-green-600">{stats.today}</p>
                </div>
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg border border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-500">This Week</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.thisWeek}</p>
                </div>
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg border border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-500">This Month</p>
                  <p className="text-xl md:text-2xl font-bold text-purple-600">{stats.thisMonth}</p>
                </div>
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg border border-gray-200/50 mb-4 md:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search logs..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="all">All Categories</option>
                  <option value="user">User Management</option>
                  <option value="premium">Premium & Promo</option>
                  <option value="moderation">Moderation</option>
                  <option value="verification">Verification</option>
                  <option value="settings">Settings</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </div>

          {/* Logs List - Desktop Table / Mobile Cards */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Admin</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Target</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.map((log, index) => {
                    const Icon = getActionIcon(log.action);
                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">
                              {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">{log.admin}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">{log.target}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-700">{log.description}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(log.category)}`}>
                            {log.category.charAt(0).toUpperCase() + log.category.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {filteredLogs.map((log, index) => {
                const Icon = getActionIcon(log.action);
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getCategoryColor(log.category)}`}>
                            {log.category.charAt(0).toUpperCase() + log.category.slice(1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">Admin: {log.admin}</p>
                        <p className="text-xs text-gray-600 mb-1">Target: {log.target}</p>
                        <p className="text-xs text-gray-700 mb-2">{log.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
              
            {filteredLogs.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No activity logs found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

