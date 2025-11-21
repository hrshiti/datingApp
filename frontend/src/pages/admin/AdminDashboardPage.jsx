import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, Shield, Ban, Crown, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, Eye, LogOut, Settings, LayoutDashboard,
  Camera, DollarSign, MessageCircle, Heart, Ticket, FileText,
  Bell, Search, Menu, X, ArrowUpRight, ArrowDownRight, Activity,
  Clock, UserPlus, UserMinus, BarChart3, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { mockProfiles } from '../../data/mockProfiles';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    bannedUsers: 0,
    verifiedUsers: 0,
    premiumUsers: 0,
    totalReports: 0,
    pendingReports: 0
  });

  useEffect(() => {
    // Check if admin is logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }

    loadStats();
  }, [navigate]);

  const loadStats = () => {
    // Load current user
    const onboardingData = localStorage.getItem('onboardingData');
    const profileSetup = localStorage.getItem('profileSetup');
    
    let totalUsers = mockProfiles.length;
    if (onboardingData && profileSetup) totalUsers += 1;

    const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
    const suspendedUsers = JSON.parse(localStorage.getItem('suspendedUsers') || '[]');
    const reportedUsers = JSON.parse(localStorage.getItem('reportedUsers') || '[]');
    const isPremium = localStorage.getItem('isPremium') === 'true';
    
    const verifiedCount = profileSetup ? (JSON.parse(profileSetup).verified ? 1 : 0) : 0;
    const premiumCount = isPremium ? 1 : 0;

    setStats({
      totalUsers,
      activeUsers: totalUsers - bannedUsers.length - suspendedUsers.length,
      suspendedUsers: suspendedUsers.length,
      bannedUsers: bannedUsers.length,
      verifiedUsers: verifiedCount,
      premiumUsers: premiumCount,
      totalReports: reportedUsers.length,
      pendingReports: reportedUsers.length // In real app, filter by status
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifications] = useState(3); // Mock notification count
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      trend: '+12%',
      trendUp: true,
      subtitle: 'All registered users'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      trend: '+8%',
      trendUp: true,
      subtitle: 'Currently active'
    },
    {
      title: 'Suspended',
      value: stats.suspendedUsers,
      icon: XCircle,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      trend: '-2%',
      trendUp: false,
      subtitle: 'Temporarily suspended'
    },
    {
      title: 'Banned',
      value: stats.bannedUsers,
      icon: Ban,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      trend: '0%',
      trendUp: null,
      subtitle: 'Permanently banned'
    },
    {
      title: 'Verified Users',
      value: stats.verifiedUsers,
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      trend: '+15%',
      trendUp: true,
      subtitle: 'Photo verified'
    },
    {
      title: 'Premium Users',
      value: stats.premiumUsers,
      icon: Crown,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-700',
      trend: '+23%',
      trendUp: true,
      subtitle: 'Premium subscribers'
    },
    {
      title: 'Total Reports',
      value: stats.totalReports,
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      trend: '+5%',
      trendUp: false,
      subtitle: 'All time reports'
    },
    {
      title: 'Pending Reports',
      value: stats.pendingReports,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      trend: 'Urgent',
      trendUp: false,
      subtitle: 'Requires attention'
    }
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'View, search, and manage all users',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      onClick: () => navigate('/admin/users')
    },
    {
      title: 'Photo Verification',
      description: 'Review and approve verification requests',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      onClick: () => navigate('/admin/verification')
    },
    {
      title: 'Content Moderation',
      description: 'Review reports and moderate content',
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600',
      onClick: () => navigate('/admin/moderation')
    },
    {
      title: 'Premium Management',
      description: 'Manage premium subscriptions',
      icon: Crown,
      color: 'from-yellow-500 to-yellow-600',
      onClick: () => navigate('/admin/premium')
    },
    {
      title: 'Settings',
      description: 'Configure app settings',
      icon: Settings,
      color: 'from-gray-500 to-gray-600',
      onClick: () => navigate('/admin/settings')
    }
  ];

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

  const recentActivities = [
    { type: 'user', action: 'New user registered', time: '2 minutes ago', icon: UserPlus, color: 'text-blue-600' },
    { type: 'verification', action: 'Photo verification approved', time: '15 minutes ago', icon: Shield, color: 'text-green-600' },
    { type: 'report', action: 'New report submitted', time: '1 hour ago', icon: AlertTriangle, color: 'text-orange-600' },
    { type: 'premium', action: 'User upgraded to premium', time: '2 hours ago', icon: Crown, color: 'text-pink-600' },
    { type: 'ban', action: 'User account banned', time: '3 hours ago', icon: Ban, color: 'text-red-600' },
  ];

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
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200/50">
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

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
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

        {/* Logout */}
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
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-xs md:text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <Clock className="w-3 h-3 md:w-4 md:h-4 hidden md:block" />
                  <span className="hidden md:inline">Welcome back, </span><span className="font-semibold text-gray-700">{localStorage.getItem('adminUsername') || 'Admin'}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search */}
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2.5 w-64 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              
              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 md:p-2.5 rounded-xl bg-gray-50/50 hover:bg-gray-100/80 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {notifications}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-20 md:h-24"></div>

        <div className="p-4 md:p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  whileHover={{ y: -4, scale: 1.02 }}
                    className="group relative bg-white/90 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all overflow-hidden"
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:scale-110 transition-transform" />
                      {stat.trendUp !== null && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                          stat.trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {stat.trendUp ? (
                            <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 md:w-4 md:h-4" />
                          )}
                          <span className="text-xs font-semibold">{stat.trend}</span>
                        </div>
                      )}
                      {stat.trendUp === null && stat.trend === 'Urgent' && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-50 text-red-600 animate-pulse text-xs">
                          <AlertTriangle className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="text-xs font-semibold">{stat.trend}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                    <p className="text-xs md:text-sm font-semibold text-gray-700 mb-1">{stat.title}</p>
                    <p className="text-xs text-gray-500 hidden md:block">{stat.subtitle}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.title}
                    onClick={action.onClick}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all text-left overflow-hidden"
                  >
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    
                    <div className="relative">
                      <Icon className="w-6 h-6 md:w-7 md:h-7 text-gray-600 mb-3 md:mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform" />
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 leading-relaxed">{action.description}</p>
                      <div className="mt-3 md:mt-4 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-semibold">Go to page</span>
                        <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Analytics Section */}
            <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-gray-200/50">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  Analytics Overview
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Match Rate</span>
                    <Heart className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stats.totalUsers > 0 ? Math.round((stats.totalUsers * 0.15) / stats.totalUsers * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-600">Estimated match rate</p>
                  <div className="mt-3 flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-semibold">+5.2% from last month</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-5 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Avg Matches/User</span>
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stats.totalUsers > 0 ? Math.round((stats.totalUsers * 0.15) / stats.totalUsers * 10) / 10 : 0}
                  </p>
                  <p className="text-xs text-gray-600">Average matches per user</p>
                  <div className="mt-3 flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-semibold">+0.3 from last month</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700">Premium Conversion</span>
                    <DollarSign className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-600">Users with premium</p>
                  <div className="mt-3 flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs font-semibold">+2.1% from last month</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-gray-200/50">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  Recent Activity
                </h2>
              </div>
              <div className="space-y-3 md:space-y-4">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-xl hover:bg-gray-50/80 transition-colors group"
                    >
                      <div className={`w-7 h-7 md:w-9 md:h-9 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0 ${activity.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                        <Icon className={`w-3 h-3 md:w-4 md:h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-semibold text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-3 md:mt-4 py-2 md:py-2.5 text-xs md:text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                onClick={() => navigate('/admin/activity-logs')}
              >
                View All Activity →
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

