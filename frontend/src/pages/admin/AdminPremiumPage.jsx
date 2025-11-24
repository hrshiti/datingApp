import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Crown, CheckCircle, XCircle, Eye, DollarSign, TrendingUp,
  LayoutDashboard, Users, Camera, AlertTriangle, LogOut, Calendar, Settings,
  Ticket, FileText, Menu, X, Sparkles, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProfiles } from '../../data/mockProfiles';

export default function AdminPremiumPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [premiumUsers, setPremiumUsers] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, expired
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }

    loadPremiumUsers();
  }, [navigate]);

  const loadPremiumUsers = () => {
    const users = [];
    
    // Load current user if premium
    const isPremium = localStorage.getItem('isPremium') === 'true';
    const onboardingData = localStorage.getItem('onboardingData');
    const profileSetup = localStorage.getItem('profileSetup');
    
    if (isPremium && onboardingData && profileSetup) {
      try {
        const onboarding = JSON.parse(onboardingData);
        const profile = JSON.parse(profileSetup);
        
        users.push({
          id: 'current-user',
          name: onboarding.step1?.name || 'Current User',
          email: onboarding.step1?.email || '',
          photo: profile.photos?.[0]?.preview || profile.photos?.[0] || null,
          plan: 'monthly',
          price: 499,
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          isPremium: true
        });
      } catch (e) {
        console.error('Error loading premium user:', e);
      }
    }

    // Add mock premium users
    const mockPremiumUsers = mockProfiles.slice(0, 8).map((profile, idx) => {
      const plans = ['monthly', 'quarterly', 'yearly'];
      const prices = [499, 1299, 3999];
      const planIndex = Math.floor(Math.random() * 3);
      const plan = plans[planIndex];
      const price = prices[planIndex];
      const days = plan === 'monthly' ? 30 : plan === 'quarterly' ? 90 : 365;
      const startDate = new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
      const isExpired = endDate < new Date();

      return {
        id: profile.id,
        name: profile.name,
        email: `${profile.name.toLowerCase().replace(' ', '.')}@example.com`,
        photo: profile.photos?.[0] || null,
        plan,
        price,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: isExpired ? 'expired' : 'active',
        isPremium: !isExpired
      };
    });

    setPremiumUsers([...users, ...mockPremiumUsers]);
  };

  const handleGrantPremium = (userId, plan = 'monthly') => {
    if (userId === 'current-user') {
      localStorage.setItem('isPremium', 'true');
    }

    const days = plan === 'monthly' ? 30 : plan === 'quarterly' ? 90 : 365;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
    const prices = { monthly: 499, quarterly: 1299, yearly: 3999 };

    setPremiumUsers(prev => {
      const existing = prev.find(u => u.id === userId);
      if (existing) {
        return prev.map(u => 
          u.id === userId 
            ? { ...u, plan, price: prices[plan], startDate: startDate.toISOString(), endDate: endDate.toISOString(), status: 'active', isPremium: true }
            : u
        );
      } else {
        const user = mockProfiles.find(p => p.id === userId) || { id: userId, name: `User ${userId}` };
        return [...prev, {
          id: userId,
          name: user.name,
          email: `${user.name.toLowerCase().replace(' ', '.')}@example.com`,
          photo: user.photos?.[0] || null,
          plan,
          price: prices[plan],
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status: 'active',
          isPremium: true
        }];
      }
    });
  };

  const handleRevokePremium = (userId) => {
    if (userId === 'current-user') {
      localStorage.setItem('isPremium', 'false');
    }

    setPremiumUsers(prev => 
      prev.map(u => 
        u.id === userId 
          ? { ...u, status: 'expired', isPremium: false, endDate: new Date().toISOString() }
          : u
      )
    );
  };

  const filteredUsers = filter === 'all' 
    ? premiumUsers 
    : premiumUsers.filter(u => u.status === filter);

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
    total: premiumUsers.length,
    active: premiumUsers.filter(u => u.status === 'active').length,
    expired: premiumUsers.filter(u => u.status === 'expired').length,
    revenue: premiumUsers.filter(u => u.status === 'active').reduce((sum, u) => sum + u.price, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] flex relative">
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
        className={`${sidebarOpen ? 'w-64' : 'w-20'} fixed top-0 left-0 h-screen bg-white/95 backdrop-blur-lg border-r border-[#E8E8E8] flex flex-col transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-50 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
              {sidebarOpen && (
                <div>
                  <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-[#616161] mt-0.5 font-medium">
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
                className="p-1.5 rounded-lg hover:bg-[#F5F5F5] transition-colors"
              >
                <X className="w-4 h-4 text-[#616161]" />
              </motion.button>
            )}
            {!sidebarOpen && (
              <motion.button
                onClick={() => setSidebarOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg hover:bg-[#F5F5F5] transition-colors"
              >
                <Menu className="w-5 h-5 text-[#616161]" />
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
                onClick={() => navigate(item.path)}
                whileHover={{ x: 4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                  isActive
                    ? 'bg-[#E3F2FD] text-[#64B5F6] shadow-[0_2px_8px_rgba(100,181,246,0.15)]'
                    : 'text-[#616161] hover:bg-[#F5F5F5]'
                }`}
              >
                <div className={`${isActive ? 'text-[#64B5F6]' : 'text-[#616161] group-hover:text-[#64B5F6]'} transition-colors`}>
                  <Icon className="w-4 h-4" />
                </div>
                {sidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-[#64B5F6] rounded-r-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E8E8E8]">
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto md:ml-64">
        {/* Top Header Bar */}
        <div className="fixed top-0 right-0 left-0 md:left-64 z-10 bg-white/95 backdrop-blur-lg border-b border-[#E8E8E8] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div className="p-4 md:p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                whileTap={{ scale: 0.95 }}
                className="md:hidden p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors"
              >
                <Menu className="w-6 h-6 text-[#616161]" />
              </motion.button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] tracking-tight">
                  Premium Management
                </h1>
                <p className="text-xs md:text-sm text-[#616161] mt-1 font-medium">
                  Manage subscriptions
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 md:p-2.5 rounded-xl bg-white hover:bg-[#F5F5F5] transition-colors border border-[#E8E8E8] shadow-sm"
            >
              <Bell className="w-5 h-5 text-[#616161]" />
            </motion.button>
          </div>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-20 md:h-24"></div>

        <div className="p-4 md:p-6">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            {[
              { label: 'Total Subscribers', value: stats.total, icon: Crown, color: 'from-yellow-500 to-yellow-600', textColor: 'text-gray-900', format: (v) => v },
              { label: 'Active', value: stats.active, icon: CheckCircle, color: 'from-green-500 to-green-600', textColor: 'text-green-600', format: (v) => v },
              { label: 'Expired', value: stats.expired, icon: XCircle, color: 'from-red-500 to-red-600', textColor: 'text-red-600', format: (v) => v },
              { label: 'Revenue', value: stats.revenue, icon: DollarSign, color: 'from-blue-500 to-blue-600', textColor: 'text-blue-600', format: (v) => `₹${v.toLocaleString()}` },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group relative bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E8E8E8] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all overflow-hidden"
                >
                  <div className="relative flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-semibold text-[#616161] mb-1">{stat.label}</p>
                      <p className={`text-xl md:text-3xl font-bold ${stat.textColor}`}>{stat.format(stat.value)}</p>
                    </div>
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-[#64B5F6] group-hover:scale-110 transition-transform flex-shrink-0" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Filter */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E8E8E8] mb-4 md:mb-6">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <span className="text-xs md:text-sm font-medium text-[#1A1A1A] w-full md:w-auto">Filter:</span>
              {['all', 'active', 'expired'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex-1 md:flex-none ${
                    filter === f
                      ? 'bg-[#64B5F6] text-white shadow-sm'
                      : 'bg-white text-[#616161] hover:bg-[#F5F5F5] border border-[#E8E8E8]'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Premium Users Table */}
          <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E8E8E8] overflow-hidden">
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <table className="w-full min-w-[700px]">
                <thead className="bg-[#1A1A1A] text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Plan</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Start Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">End Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8]">
                  <AnimatePresence>
                    {filteredUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className="hover:bg-[#F5F5F5] transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#64B5F6] flex items-center justify-center text-white font-semibold">
                              {user.photo ? (
                                <img
                                  src={user.photo}
                                  alt={user.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <Users className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-[#1A1A1A]">{user.name}</p>
                              <p className="text-xs text-[#616161] font-medium">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-3 py-1 bg-[#E3F2FD] text-[#64B5F6] rounded-full text-xs font-semibold capitalize border border-[#BBDEFB]">
                            {user.plan}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-[#1A1A1A]">₹{user.price}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-[#616161] font-medium">
                            {new Date(user.startDate).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-[#616161] font-medium">
                            {new Date(user.endDate).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          {user.status === 'active' ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3" />
                              Expired
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <motion.button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDetails(true);
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-[#64B5F6] hover:bg-[#E3F2FD] rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            
                            {user.status === 'active' ? (
                              <motion.button
                                onClick={() => handleRevokePremium(user.id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Revoke Premium"
                              >
                                <XCircle className="w-4 h-4" />
                              </motion.button>
                            ) : (
                              <motion.button
                                onClick={() => handleGrantPremium(user.id, 'monthly')}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Grant Premium"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Crown className="w-12 h-12 text-[#616161] mx-auto mb-4" />
                  <p className="text-[#616161] font-medium">No premium users found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-w-md w-full p-6 border border-[#E8E8E8]"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#64B5F6] flex items-center justify-center text-white font-semibold">
                  {selectedUser.photo ? (
                    <img
                      src={selectedUser.photo}
                      alt={selectedUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1A1A1A]">{selectedUser.name}</h3>
                  <p className="text-sm text-[#616161] font-medium">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-[#616161] mb-1 font-medium">Plan</p>
                  <p className="text-sm font-semibold text-[#1A1A1A] capitalize">{selectedUser.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-[#616161] mb-1 font-medium">Price</p>
                  <p className="text-sm font-semibold text-[#1A1A1A]">₹{selectedUser.price}</p>
                </div>
                <div>
                  <p className="text-sm text-[#616161] mb-1 font-medium">Start Date</p>
                  <p className="text-sm text-[#1A1A1A]">
                    {new Date(selectedUser.startDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#616161] mb-1 font-medium">End Date</p>
                  <p className="text-sm text-[#1A1A1A]">
                    {new Date(selectedUser.endDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#616161] mb-1 font-medium">Status</p>
                  {selectedUser.status === 'active' ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      Expired
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                {selectedUser.status === 'active' ? (
                  <motion.button
                    onClick={() => {
                      handleRevokePremium(selectedUser.id);
                      setShowDetails(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                  >
                    Revoke Premium
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={() => {
                      handleGrantPremium(selectedUser.id, 'monthly');
                      setShowDetails(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
                  >
                    Grant Premium
                  </motion.button>
                )}
                <motion.button
                  onClick={() => setShowDetails(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-3 bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#1A1A1A] rounded-lg font-semibold transition-all"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

