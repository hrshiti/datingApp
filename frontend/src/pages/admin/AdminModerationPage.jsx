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
                  Content Moderation
                </h1>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Review reports and take action
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 md:p-2.5 rounded-xl bg-gray-50/50 hover:bg-gray-100/80 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
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
                  className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-gray-600 mb-1">{stat.label}</p>
                      <p className={`text-xl md:text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                    </div>
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:scale-110 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Filter */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-gray-200/50 mb-4 md:mb-6">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <span className="text-xs md:text-sm font-medium text-gray-700 w-full md:w-auto">Filter:</span>
              {['all', 'pending', 'resolved', 'dismissed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex-1 md:flex-none ${
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

          {/* Reports List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredReports.map((report, index) => (
                <div
                  key={report.id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-4 md:p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
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
                          <h3 className="font-semibold text-gray-900">{report.reportedUserName}</h3>
                          {getStatusBadge(report.status)}
                          {report.action && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                              {report.action === 'banned' ? 'Banned' : report.action === 'blocked' ? 'Blocked' : 'Warned'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Reported by: <span className="font-medium">{report.reporterName}</span>
                        </p>
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">Reason:</span> {report.reason}
                        </p>
                        <p className="text-xs text-gray-500">
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
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
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
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reports found</p>
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
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gray-800 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Report Details</h2>
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
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
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
                    <h3 className="text-xl font-bold text-gray-900">{selectedReport.reportedUserName}</h3>
                    <p className="text-sm text-gray-500">
                      Reported by: {selectedReport.reporterName}
                    </p>
                    {getStatusBadge(selectedReport.status)}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Report Reason</h4>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReport.reason}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Reported At</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedReport.reportedAt).toLocaleString()}
                  </p>
                </div>

                {selectedReport.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <motion.button
                      onClick={() => {
                        handleResolve(selectedReport.id, 'warn');
                        setShowDetails(false);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all"
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
                      className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
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
                      className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all"
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

