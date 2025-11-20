import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AlertTriangle, Ban, CheckCircle, XCircle, Eye, Shield,
  LayoutDashboard, Users, Camera, Crown, LogOut, Clock, Settings,
  Ticket, FileText, DollarSign
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
            <h1 className="text-3xl font-bold text-gray-900">Content Moderation</h1>
            <p className="text-sm text-gray-500 mt-1">
              Review reports and take action on reported users
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Dismissed</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.dismissed}</p>
                </div>
                <XCircle className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              {['all', 'pending', 'resolved', 'dismissed'].map((f) => (
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

          {/* Reports List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
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
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
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
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowDetails(true);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                            className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-all"
                            title="Warn User"
                          >
                            Warn
                          </motion.button>
                          <motion.button
                            onClick={() => handleResolve(report.id, 'ban')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all"
                            title="Ban User"
                          >
                            <Ban className="w-4 h-4 inline mr-1" />
                            Ban
                          </motion.button>
                          <motion.button
                            onClick={() => handleDismiss(report.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-all"
                            title="Dismiss Report"
                          >
                            Dismiss
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
                  <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {selectedReport.reportedUser.photos?.[0] ? (
                      <img
                        src={selectedReport.reportedUser.photos[0]}
                        alt={selectedReport.reportedUserName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-8 h-8" />
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

