import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Camera, CheckCircle, XCircle, Eye, Clock, Shield,
  LayoutDashboard, Users, AlertTriangle, Crown, LogOut, Settings,
  Ticket, FileText, DollarSign, Menu, X, Sparkles, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProfiles } from '../../data/mockProfiles';

export default function AdminPhotoVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }

    loadVerificationRequests();
  }, [navigate]);

  const loadVerificationRequests = () => {
    const requests = [];
    
    // Load current user verification
    const profileSetup = localStorage.getItem('profileSetup');
    if (profileSetup) {
      try {
        const profile = JSON.parse(profileSetup);
        const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
        
        if (profile.verificationPhoto) {
          requests.push({
            id: 'current-user',
            userId: 'current-user',
            userName: onboardingData.step1?.name || 'Current User',
            photo: profile.verificationPhoto,
            status: profile.verified ? 'approved' : 'pending',
            submittedAt: profile.verifiedAt || new Date().toISOString(),
            profilePhoto: profile.photos?.[0]?.preview || profile.photos?.[0] || null
          });
        }
      } catch (e) {
        console.error('Error loading verification:', e);
      }
    }

    // Add mock verification requests
    const mockRequests = mockProfiles.slice(0, 5).map((profile, idx) => ({
      id: `verification-${profile.id}`,
      userId: profile.id,
      userName: profile.name,
      photo: profile.photos?.[0] || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400`,
      status: idx === 0 ? 'pending' : idx === 1 ? 'approved' : idx === 2 ? 'rejected' : 'pending',
      submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      profilePhoto: profile.photos?.[0]
    }));

    requests.push(...mockRequests);
    setVerificationRequests(requests);
  };

  const handleApprove = (requestId) => {
    if (requestId === 'current-user') {
      const profileSetup = localStorage.getItem('profileSetup');
      if (profileSetup) {
        try {
          const profile = JSON.parse(profileSetup);
          profile.verified = true;
          profile.verifiedAt = new Date().toISOString();
          localStorage.setItem('profileSetup', JSON.stringify(profile));
        } catch (e) {
          console.error('Error updating verification:', e);
        }
      }
    }

    setVerificationRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved', verifiedAt: new Date().toISOString() }
          : req
      )
    );
  };

  const handleReject = (requestId) => {
    if (requestId === 'current-user') {
      const profileSetup = localStorage.getItem('profileSetup');
      if (profileSetup) {
        try {
          const profile = JSON.parse(profileSetup);
          profile.verified = false;
          profile.verificationPhoto = null;
          localStorage.setItem('profileSetup', JSON.stringify(profile));
        } catch (e) {
          console.error('Error updating verification:', e);
        }
      }
    }

    setVerificationRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' }
          : req
      )
    );
  };

  const filteredRequests = filter === 'all' 
    ? verificationRequests 
    : verificationRequests.filter(req => req.status === filter);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
    };
    const badge = badges[status] || badges.pending;
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

  const stats = {
    total: verificationRequests.length,
    pending: verificationRequests.filter(r => r.status === 'pending').length,
    approved: verificationRequests.filter(r => r.status === 'approved').length,
    rejected: verificationRequests.filter(r => r.status === 'rejected').length
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
        <div className="p-6 border-b border-[#E8E8E8]">
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
                  Photo Verification
                </h1>
                <p className="text-xs md:text-sm text-[#616161] mt-1 font-medium">
                  Review and approve requests
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
              { label: 'Total Requests', value: stats.total, icon: Camera, color: 'from-blue-500 to-blue-600', textColor: 'text-gray-900' },
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-yellow-500 to-yellow-600', textColor: 'text-yellow-600' },
              { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'from-green-500 to-green-600', textColor: 'text-green-600' },
              { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'from-red-500 to-red-600', textColor: 'text-red-600' },
            ].map((stat, index) => {
              return (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group relative bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E8E8E8] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all overflow-hidden"
                >
                  <div className="relative">
                    <p className="text-xs md:text-sm font-semibold text-[#616161] mb-1">{stat.label}</p>
                    <p className={`text-xl md:text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Filter */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E8E8E8] mb-4 md:mb-6">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <span className="text-xs md:text-sm font-medium text-[#1A1A1A] w-full md:w-auto">Filter:</span>
              {['all', 'pending', 'approved', 'rejected'].map((f) => (
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

          {/* Verification Requests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredRequests.map((request, index) => (
                <div
                  key={request.id}
                  className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E8E8E8] overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all group"
                >
                  <div className="relative">
                    <img
                      src={request.photo}
                      alt="Verification"
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${request.userName}&background=FF1744&color=fff&size=400`;
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {request.profilePhoto ? (
                          <img
                            src={request.profilePhoto}
                            alt={request.userName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1A1A1A]">{request.userName}</h3>
                        <p className="text-xs text-[#616161] font-medium">
                          {new Date(request.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetails(true);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 px-3 py-2 bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#1A1A1A] rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </motion.button>
                      
                      {request.status === 'pending' && (
                        <>
                          <motion.button
                            onClick={() => handleApprove(request.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 shadow-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </motion.button>
                          <motion.button
                            onClick={() => handleReject(request.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 shadow-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E8E8E8]">
              <Camera className="w-12 h-12 text-[#616161] mx-auto mb-4" />
              <p className="text-[#616161] font-medium">No verification requests found</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && selectedRequest && (
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
              className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E8E8E8]"
            >
              <div className="bg-[#1A1A1A] p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Verification Details</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#64B5F6] flex items-center justify-center text-white font-semibold">
                    {selectedRequest.profilePhoto ? (
                      <img
                        src={selectedRequest.profilePhoto}
                        alt={selectedRequest.userName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1A1A1A]">{selectedRequest.userName}</h3>
                    <p className="text-sm text-[#616161] font-medium">
                      Submitted: {new Date(selectedRequest.submittedAt).toLocaleString()}
                    </p>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#1A1A1A] mb-2">Verification Photo</h4>
                  <img
                    src={selectedRequest.photo}
                    alt="Verification"
                    className="w-full rounded-lg border border-[#E8E8E8]"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${selectedRequest.userName}&background=FF1744&color=fff&size=400`;
                    }}
                  />
                </div>

                {selectedRequest.status === 'pending' && (
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => {
                        handleApprove(selectedRequest.id);
                        setShowDetails(false);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-sm"
                    >
                      <CheckCircle className="w-5 h-5 inline mr-2" />
                      Approve Verification
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        handleReject(selectedRequest.id);
                        setShowDetails(false);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-sm"
                    >
                      <XCircle className="w-5 h-5 inline mr-2" />
                      Reject Verification
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

