import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Crown, CheckCircle, XCircle, Eye, DollarSign, TrendingUp,
  LayoutDashboard, Users, Camera, AlertTriangle, LogOut, Calendar, Settings,
  Ticket, FileText
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
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
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
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
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Premium Management</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage premium subscriptions and grant/revoke access
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Subscribers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Crown className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Expired</p>
                  <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">₹{stats.revenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              {['all', 'active', 'expired'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Premium Users Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 text-white">
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
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                              {user.photo ? (
                                <img
                                  src={user.photo}
                                  alt={user.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <Users className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold capitalize">
                            {user.plan}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-gray-900">₹{user.price}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-600">
                            {new Date(user.startDate).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-600">
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
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No premium users found</p>
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
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                  {selectedUser.photo ? (
                    <img
                      src={selectedUser.photo}
                      alt={selectedUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Users className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Plan</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{selectedUser.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <p className="text-sm font-semibold text-gray-900">₹{selectedUser.price}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Start Date</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedUser.startDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">End Date</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedUser.endDate).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
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
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all"
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

