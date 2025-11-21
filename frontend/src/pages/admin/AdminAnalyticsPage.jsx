import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  TrendingUp, Users, Heart, MessageCircle, DollarSign, Eye,
  LayoutDashboard, Camera, AlertTriangle, Crown, LogOut, BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { mockProfiles } from '../../data/mockProfiles';

export default function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    totalMatches: 0,
    matchesToday: 0,
    totalMessages: 0,
    messagesToday: 0,
    totalRevenue: 0,
    revenueThisMonth: 0,
    premiumUsers: 0,
    verifiedUsers: 0,
    reportsCount: 0,
    pendingReports: 0
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }

    loadAnalytics();
  }, [navigate]);

  const loadAnalytics = () => {
    const onboardingData = localStorage.getItem('onboardingData');
    const profileSetup = localStorage.getItem('profileSetup');
    const reportedUsers = JSON.parse(localStorage.getItem('reportedUsers') || '[]');
    const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
    const suspendedUsers = JSON.parse(localStorage.getItem('suspendedUsers') || '[]');
    const isPremium = localStorage.getItem('isPremium') === 'true';
    const discoveryLikes = JSON.parse(localStorage.getItem('discoveryLikes') || '[]');

    let totalUsers = mockProfiles.length;
    if (onboardingData && profileSetup) totalUsers += 1;

    const activeUsers = totalUsers - bannedUsers.length - suspendedUsers.length;
    const verifiedCount = profileSetup ? (JSON.parse(profileSetup).verified ? 1 : 0) : 0;
    const premiumCount = isPremium ? 1 : 0;

    // Calculate matches (simplified - in real app, this would come from backend)
    const totalMatches = Math.floor(discoveryLikes.length * 0.3); // Assume 30% match rate
    const matchesToday = Math.floor(totalMatches * 0.1);

    // Calculate messages (simplified)
    const totalMessages = totalMatches * 5; // Assume 5 messages per match on average
    const messagesToday = Math.floor(totalMessages * 0.05);

    // Calculate revenue (simplified)
    const premiumUsers = premiumCount + Math.floor(mockProfiles.length * 0.2);
    const totalRevenue = premiumUsers * 499; // Assume all monthly
    const revenueThisMonth = Math.floor(totalRevenue * 0.3);

    setAnalytics({
      totalUsers,
      activeUsers,
      newUsersToday: Math.floor(totalUsers * 0.02),
      newUsersThisWeek: Math.floor(totalUsers * 0.1),
      totalMatches,
      matchesToday,
      totalMessages,
      messagesToday,
      totalRevenue,
      revenueThisMonth,
      premiumUsers,
      verifiedUsers: verifiedCount + Math.floor(mockProfiles.length * 0.3),
      reportsCount: reportedUsers.length,
      pendingReports: reportedUsers.filter(r => !bannedUsers.includes(r.userId)).length
    });
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: Camera, label: 'Photo Verification', path: '/admin/verification' },
    { icon: AlertTriangle, label: 'Content Moderation', path: '/admin/moderation' },
    { icon: Crown, label: 'Premium Management', path: '/admin/premium' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Eye, label: 'Settings', path: '/admin/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };

  const statCards = [
    {
      title: 'Total Users',
      value: analytics.totalUsers,
      change: `+${analytics.newUsersThisWeek} this week`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Users',
      value: analytics.activeUsers,
      change: `${Math.round((analytics.activeUsers / analytics.totalUsers) * 100)}% of total`,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Matches',
      value: analytics.totalMatches,
      change: `+${analytics.matchesToday} today`,
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
    {
      title: 'Total Messages',
      value: analytics.totalMessages,
      change: `+${analytics.messagesToday} today`,
      icon: MessageCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Total Revenue',
      value: `₹${analytics.totalRevenue.toLocaleString()}`,
      change: `₹${analytics.revenueThisMonth.toLocaleString()} this month`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Premium Users',
      value: analytics.premiumUsers,
      change: `${Math.round((analytics.premiumUsers / analytics.totalUsers) * 100)}% conversion`,
      icon: Crown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Verified Users',
      value: analytics.verifiedUsers,
      change: `${Math.round((analytics.verifiedUsers / analytics.totalUsers) * 100)}% verified`,
      icon: Camera,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Total Reports',
      value: analytics.reportsCount,
      change: `${analytics.pendingReports} pending`,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col z-50">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-xs text-gray-500 mt-1">
            {localStorage.getItem('adminUsername') || 'Admin'}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium whitespace-nowrap">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto ml-64">
        {/* Top Header Bar */}
        <div className="fixed top-0 right-0 left-64 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">
              View platform statistics and insights
            </p>
          </div>
        </div>
        {/* Spacer for fixed header */}
        <div className="h-24"></div>
        <div className="p-6">

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-sm text-gray-500 mb-2">{stat.title}</p>
                  <p className="text-xs text-gray-400">{stat.change}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Charts Section (Placeholder) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Chart will be displayed here</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Match Rate</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Chart will be displayed here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Key Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Match Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalUsers > 0 
                    ? Math.round((analytics.totalMatches / analytics.totalUsers) * 100) 
                    : 0}%
                </p>
                <p className="text-xs text-gray-400 mt-1">Matches per user</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Messages per Match</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalMatches > 0 
                    ? Math.round(analytics.totalMessages / analytics.totalMatches) 
                    : 0}
                </p>
                <p className="text-xs text-gray-400 mt-1">Average messages</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Premium Conversion</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.totalUsers > 0 
                    ? Math.round((analytics.premiumUsers / analytics.totalUsers) * 100) 
                    : 0}%
                </p>
                <p className="text-xs text-gray-400 mt-1">Users with premium</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

