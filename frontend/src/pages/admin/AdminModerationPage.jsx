import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AlertTriangle, Ban, CheckCircle, XCircle, Eye, Shield,
  LayoutDashboard, Users, Camera, Crown, LogOut, Clock, Settings,
  Ticket, FileText, DollarSign, Menu, X, Sparkles, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProfiles } from '../../data/mockProfiles';

export default function AdminModerationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, resolved, dismissed
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }

    loadReports();
  }, [navigate]);

  const loadReports = () => {
    const reportedUsers = JSON.parse(localStorage.getItem('reportedUsers') || '[]');
    const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
    const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '[]');

    const allReports = reportedUsers.map((report, idx) => {
      const reportedUser = mockProfiles.find(p => p.id === report.userId) || {
        id: report.userId,
        name: report.userName,
        photos: []
      };

      return {
        id: `report-${report.userId}-${idx}`,
        reporterId: 'current-user',
        reporterName: 'Current User',
        reportedUserId: report.userId,
        reportedUserName: report.userName,
        reason: report.reason,
        status: bannedUsers.includes(report.userId) ? 'resolved' : 'pending',
        reportedAt: report.reportedAt || new Date().toISOString(),
        reportedUser: reportedUser,
        action: bannedUsers.includes(report.userId) ? 'banned' : blockedUsers.includes(report.userId) ? 'blocked' : null
      };
    });

    // Add mock reports
    const mockReports = mockProfiles.slice(0, 3).map((profile, idx) => ({
      id: `mock-report-${profile.id}`,
      reporterId: mockProfiles[(idx + 1) % mockProfiles.length].id,
      reporterName: mockProfiles[(idx + 1) % mockProfiles.length].name,
      reportedUserId: profile.id,
      reportedUserName: profile.name,
      reason: ['Inappropriate photos', 'Harassment or bullying', 'Spam or fake profile'][idx],
      status: idx === 0 ? 'pending' : idx === 1 ? 'resolved' : 'dismissed',
      reportedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      reportedUser: profile,
      action: idx === 1 ? 'banned' : null
    }));

    setReports([...allReports, ...mockReports]);
  };

  const handleResolve = (reportId, action) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    if (action === 'ban') {
      const bannedUsers = JSON.parse(localStorage.getItem('bannedUsers') || '[]');
      if (!bannedUsers.includes(report.reportedUserId)) {
        bannedUsers.push(report.reportedUserId);
        localStorage.setItem('bannedUsers', JSON.stringify(bannedUsers));
      }
    } else if (action === 'warn') {
      // Store warning
      const warnings = JSON.parse(localStorage.getItem('userWarnings') || '[]');
      if (!warnings.find(w => w.userId === report.reportedUserId)) {
        warnings.push({
          userId: report.reportedUserId,
          warnedAt: new Date().toISOString(),
          reason: report.reason
        });
        localStorage.setItem('userWarnings', JSON.stringify(warnings));
      }
    }

    setReports(prev => 
      prev.map(r => 
        r.id === reportId 
          ? { ...r, status: 'resolved', action }
          : r
      )
    );
  };

  const handleDismiss = (reportId) => {
    setReports(prev => 
      prev.map(r => 
        r.id === reportId 
          ? { ...r, status: 'dismissed' }
          : r
      )
    );
  };

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(r => r.status === filter);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      resolved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      dismissed: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle }
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
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length
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
                  Content Moderation
                </h1>
                <p className="text-xs md:text-sm text-[#616161] mt-1 font-medium">
                  Review reports and take action
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
              { label: 'Total Reports', value: stats.total, icon: AlertTriangle, color: 'from-orange-500 to-orange-600', textColor: 'text-gray-900' },
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-yellow-500 to-yellow-600', textColor: 'text-yellow-600' },
              { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'from-green-500 to-green-600', textColor: 'text-green-600' },
              { label: 'Dismissed', value: stats.dismissed, icon: XCircle, color: 'from-gray-500 to-gray-600', textColor: 'text-gray-600' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group relative bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E8E8E8] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all overflow-hidden"
                >
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-[#616161] mb-1">{stat.label}</p>
                      <p className={`text-xl md:text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                    </div>
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-[#64B5F6] group-hover:scale-110 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Filter */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E8E8E8] mb-4 md:mb-6">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <span className="text-xs md:text-sm font-medium text-[#1A1A1A] w-full md:w-auto">Filter:</span>
              {['all', 'pending', 'resolved', 'dismissed'].map((f) => (
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

          {/* Reports List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredReports.map((report, index) => (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E8E8E8] p-4 md:p-6 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#64B5F6] flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {report.reportedUser.photos?.[0] ? (
                          <img
                            src={report.reportedUser.photos[0]}
                            alt={report.reportedUserName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                          <h3 className="font-semibold text-[#1A1A1A]">{report.reportedUserName}</h3>
                          {getStatusBadge(report.status)}
                          {report.action && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                              {report.action === 'banned' ? 'Banned' : report.action === 'blocked' ? 'Blocked' : 'Warned'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#616161] mb-1">
                          Reported by: <span className="font-medium text-[#1A1A1A]">{report.reporterName}</span>
                        </p>
                        <p className="text-sm text-[#1A1A1A] mb-2">
                          <span className="font-medium">Reason:</span> {report.reason}
                        </p>
                        <p className="text-xs text-[#616161] font-medium">
                          {new Date(report.reportedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:flex-nowrap flex-shrink-0">
                      <motion.button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowDetails(true);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-[#64B5F6] hover:bg-[#E3F2FD] rounded-lg transition-colors flex-shrink-0"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      
                      {report.status === 'pending' && (
                        <>
                          <motion.button
                            onClick={() => handleResolve(report.id, 'warn')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-2 md:px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs md:text-sm font-medium transition-all flex-shrink-0"
                            title="Warn User"
                          >
                            Warn
                          </motion.button>
                          <motion.button
                            onClick={() => handleResolve(report.id, 'ban')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-2 md:px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs md:text-sm font-medium transition-all flex-shrink-0"
                            title="Ban User"
                          >
                            <Ban className="w-3 h-3 md:w-4 md:h-4 inline md:mr-1" />
                            <span className="hidden md:inline">Ban</span>
                          </motion.button>
                          <motion.button
                            onClick={() => handleDismiss(report.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-2 md:px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs md:text-sm font-medium transition-all flex-shrink-0"
                            title="Dismiss Report"
                          >
                            Dismiss
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] border border-[#E8E8E8]">
              <AlertTriangle className="w-12 h-12 text-[#616161] mx-auto mb-4" />
              <p className="text-[#616161] font-medium">No reports found</p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && selectedReport && (
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
                  <h2 className="text-2xl font-bold tracking-tight">Report Details</h2>
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
                    {selectedReport.reportedUser.photos?.[0] ? (
                      <img
                        src={selectedReport.reportedUser.photos[0]}
                        alt={selectedReport.reportedUserName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1A1A1A]">{selectedReport.reportedUserName}</h3>
                    <p className="text-sm text-[#616161] font-medium">
                      Reported by: {selectedReport.reporterName}
                    </p>
                    {getStatusBadge(selectedReport.status)}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#1A1A1A] mb-2">Report Reason</h4>
                  <p className="text-sm text-[#1A1A1A] bg-[#F5F5F5] p-3 rounded-lg">{selectedReport.reason}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#1A1A1A] mb-2">Reported At</h4>
                  <p className="text-sm text-[#616161] font-medium">
                    {new Date(selectedReport.reportedAt).toLocaleString()}
                  </p>
                </div>

                {selectedReport.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-[#E8E8E8]">
                    <motion.button
                      onClick={() => {
                        handleResolve(selectedReport.id, 'warn');
                        setShowDetails(false);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all shadow-sm"
                    >
                      Warn User
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        handleResolve(selectedReport.id, 'ban');
                        setShowDetails(false);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-sm"
                    >
                      <Ban className="w-5 h-5 inline mr-2" />
                      Ban User
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        handleDismiss(selectedReport.id);
                        setShowDetails(false);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#1A1A1A] rounded-lg font-semibold transition-all"
                    >
                      Dismiss
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

