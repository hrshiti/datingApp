import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Filter, User, Mail, Phone, MapPin, Calendar, 
  Ban, CheckCircle, XCircle, Eye, Trash2, MoreVertical,
  Users, Shield, Crown, LayoutDashboard, Camera, AlertTriangle, LogOut, Settings,
  Ticket, FileText, DollarSign, Menu, X, Sparkles, Bell, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProfiles } from '../../data/mockProfiles';

export default function AdminUserManagementPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, suspended, banned
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, statusFilter, users]);

  const loadUsers = () => {
    // Load current user from localStorage
    const onboardingData = localStorage.getItem('onboardingData');
    const profileSetup = localStorage.getItem('profileSetup');
    
    const allUsers = [];
    
    // Add current user if exists
    if (onboardingData && profileSetup) {
      try {
        const onboarding = JSON.parse(onboardingData);
        const profile = JSON.parse(profileSetup);
        
        const currentUser = {
          id: 'current-user',
          name: onboarding.step1?.name || 'Current User',
          email: onboarding.step1?.email || '',
          phone: localStorage.getItem('userPhone') || '',
          dob: onboarding.step1?.dob || '',
          gender: onboarding.step1?.gender || '',
          city: onboarding.step2?.city || '',
          photos: profile.photos || [],
          bio: profile.bio || '',
          interests: onboarding.step3?.interests || [],
          verified: profile.verified || false,
          status: getUserStatus('current-user'),
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          isPremium: localStorage.getItem('isPremium') === 'true',
          onboardingData,
          profileSetup
        };
        
        allUsers.push(currentUser);
      } catch (e) {
        console.error('Error loading current user:', e);
      }
    }
    
    // Add mock profiles as other users
    const mockUsers = mockProfiles.map(profile => ({
      ...profile,
      email: `${profile.name.toLowerCase().replace(' ', '.')}@example.com`,
      phone: `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      verified: Math.random() > 0.5,
      status: getUserStatus(profile.id),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      isPremium: Math.random() > 0.7
    }));
    
    allUsers.push(...mockUsers);
    setUsers(allUsers);
    setFilteredUsers(allUsers);
  };

  const getUserStatus = (userId) => {
    const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
    const suspendedUsers = JSON.parse(localStorage.getItem('suspendedUsers') || '[]');
    
    if (bannedUsers.includes(userId)) return 'banned';
    if (suspendedUsers.includes(userId)) return 'suspended';
    return 'active';
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.includes(query) ||
        user.city?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleSuspend = (userId) => {
    const suspendedUsers = JSON.parse(localStorage.getItem('suspendedUsers') || '[]');
    if (!suspendedUsers.includes(userId)) {
      suspendedUsers.push(userId);
      localStorage.setItem('suspendedUsers', JSON.stringify(suspendedUsers));
    }
    
    // Remove from banned if suspended
    const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
    const updatedBanned = bannedUsers.filter(id => id !== userId);
    localStorage.setItem('bannedUsers', JSON.stringify(updatedBanned));
    
    loadUsers();
  };

  const handleBan = (userId) => {
    const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
    if (!bannedUsers.includes(userId)) {
      bannedUsers.push(userId);
      localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
    }
    
    // Remove from suspended if banned
    const suspendedUsers = JSON.parse(localStorage.getItem('suspendedUsers') || '[]');
    const updatedSuspended = suspendedUsers.filter(id => id !== userId);
    localStorage.setItem('suspendedUsers', JSON.stringify(updatedSuspended));
    
    loadUsers();
  };

  const handleUnban = (userId) => {
    const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
    const updated = bannedUsers.filter(id => id !== userId);
    localStorage.setItem('bannedUsers', JSON.stringify(updated));
    loadUsers();
  };

  const handleUnsuspend = (userId) => {
    const suspendedUsers = JSON.parse(localStorage.getItem('suspendedUsers') || '[]');
    const updated = suspendedUsers.filter(id => id !== userId);
    localStorage.setItem('suspendedUsers', JSON.stringify(updated));
    loadUsers();
  };

  const handleDelete = (userId) => {
    setUserToDelete(userId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (userToDelete === 'current-user') {
      // Delete current user data
      localStorage.removeItem('onboardingData');
      localStorage.removeItem('profileSetup');
      localStorage.removeItem('userPhone');
    } else {
      // For mock users, just remove from display
      setUsers(users.filter(u => u.id !== userToDelete));
      setFilteredUsers(filteredUsers.filter(u => u.id !== userToDelete));
    }
    
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      suspended: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: XCircle },
      banned: { bg: 'bg-red-100', text: 'text-red-700', icon: Ban }
    };
    const badge = badges[status] || badges.active;
    const Icon = badge.icon;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

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
                  User Management
                </h1>
                <p className="text-xs md:text-sm text-gray-500 mt-1 flex items-center gap-2">
                  <Clock className="w-3 h-3 md:w-4 md:h-4 hidden md:block" />
                  <span className="hidden md:inline">Manage all users, view profiles, and take actions</span>
                  <span className="md:hidden">User Management</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2.5 w-64 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 md:p-2.5 rounded-xl bg-gray-50/50 hover:bg-gray-100/80 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  3
                </span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-20 md:h-24"></div>

        <div className="p-4 md:p-6">

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-semibold text-gray-600 mb-1">Total Users</p>
                  <p className="text-xl md:text-3xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Users className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:scale-110 transition-transform flex-shrink-0" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Active Users</p>
                  <p className="text-3xl font-bold text-green-600">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:scale-110 transition-transform" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-yellow-600 opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Suspended</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {users.filter(u => u.status === 'suspended').length}
                  </p>
                </div>
                <XCircle className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:scale-110 transition-transform" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 opacity-0 group-hover:opacity-5 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Banned</p>
                  <p className="text-3xl font-bold text-red-600">
                    {users.filter(u => u.status === 'banned').length}
                  </p>
                </div>
                <Ban className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:scale-110 transition-transform" />
              </div>
            </motion.div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-gray-200/50 mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email..."
                  className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hidden md:block" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 md:flex-none px-3 md:px-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div className="overflow-x-auto -mx-4 md:mx-0">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Location</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Verified</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Premium</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FFB6C1]/20">
                <AnimatePresence>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 md:px-4 py-3 md:py-4">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {user.photos?.[0] ? (
                              <img
                                src={user.photos[0].preview || user.photos[0]}
                                alt={user.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-3 h-3 md:w-4 md:h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#212121] text-sm md:text-base truncate">{user.name}</p>
                            <p className="text-xs text-[#757575]">
                              {user.dob ? `Age: ${calculateAge(user.dob)}` : 'Age: N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-3 md:py-4">
                        <div className="space-y-1">
                          {user.email && (
                            <p className="text-xs md:text-sm text-[#212121] flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 text-[#757575] flex-shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </p>
                          )}
                          {user.phone && (
                            <p className="text-xs md:text-sm text-[#212121] flex items-center gap-1 truncate">
                              <Phone className="w-3 h-3 text-[#757575] flex-shrink-0" />
                              <span className="truncate">{user.phone}</span>
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-3 md:py-4">
                        {user.city ? (
                          <p className="text-xs md:text-sm text-[#212121] flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-[#757575] flex-shrink-0" />
                            <span className="truncate">{user.city}</span>
                          </p>
                        ) : (
                          <p className="text-xs md:text-sm text-[#757575]">N/A</p>
                        )}
                      </td>
                      <td className="px-3 md:px-4 py-3 md:py-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-3 md:px-4 py-3 md:py-4">
                        {user.verified ? (
                          <span className="px-2 md:px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                            <Shield className="w-3 h-3" />
                            <span className="hidden sm:inline">Verified</span>
                          </span>
                        ) : (
                          <span className="px-2 md:px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            <span className="hidden sm:inline">Not Verified</span>
                            <span className="sm:hidden">No</span>
                          </span>
                        )}
                      </td>
                      <td className="px-3 md:px-4 py-3 md:py-4">
                        {user.isPremium ? (
                          <span className="px-2 md:px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white flex items-center gap-1 w-fit">
                            <Crown className="w-3 h-3" />
                            <span className="hidden sm:inline">Premium</span>
                          </span>
                        ) : (
                          <span className="text-xs md:text-sm text-[#757575]">Free</span>
                        )}
                      </td>
                      <td className="px-3 md:px-4 py-3 md:py-4">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          <motion.button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetails(true);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          
                          {user.status === 'active' && (
                            <>
                              <motion.button
                                onClick={() => handleSuspend(user.id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Suspend"
                              >
                                <XCircle className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                onClick={() => handleBan(user.id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Ban"
                              >
                                <Ban className="w-4 h-4" />
                              </motion.button>
                            </>
                          )}
                          
                          {user.status === 'suspended' && (
                            <motion.button
                              onClick={() => handleUnsuspend(user.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Unsuspend"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </motion.button>
                          )}
                          
                          {user.status === 'banned' && (
                            <motion.button
                              onClick={() => handleUnban(user.id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Unban"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </motion.button>
                          )}
                          
                          <motion.button
                            onClick={() => handleDelete(user.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showUserDetails && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowUserDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gray-800 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">User Details</h2>
                  <button
                    onClick={() => setShowUserDetails(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                    {selectedUser.photos?.[0] ? (
                      <img
                        src={selectedUser.photos[0].preview || selectedUser.photos[0]}
                        alt={selectedUser.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#212121]">{selectedUser.name}</h3>
                    <p className="text-sm text-[#757575]">
                      {selectedUser.dob ? `Age: ${calculateAge(selectedUser.dob)}` : 'Age: N/A'}
                    </p>
                    {getStatusBadge(selectedUser.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[#757575] mb-1">Email</p>
                    <p className="text-sm font-semibold text-[#212121]">{selectedUser.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#757575] mb-1">Phone</p>
                    <p className="text-sm font-semibold text-[#212121]">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#757575] mb-1">City</p>
                    <p className="text-sm font-semibold text-[#212121]">{selectedUser.city || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#757575] mb-1">Gender</p>
                    <p className="text-sm font-semibold text-[#212121]">
                      {selectedUser.gender ? selectedUser.gender.charAt(0).toUpperCase() + selectedUser.gender.slice(1) : 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedUser.bio && (
                  <div>
                    <p className="text-sm text-[#757575] mb-1">Bio</p>
                    <p className="text-sm text-[#212121]">{selectedUser.bio}</p>
                  </div>
                )}

                {selectedUser.interests && selectedUser.interests.length > 0 && (
                  <div>
                    <p className="text-sm text-[#757575] mb-2">Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="text-center mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-[#212121] mb-2">Delete User?</h3>
                <p className="text-sm text-[#757575]">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowDeleteConfirm(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 border-2 border-[#E0E0E0] text-[#212121] rounded-xl font-semibold hover:border-[#757575] transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmDelete}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

