import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DollarSign, Search, Filter, CheckCircle, XCircle, RefreshCw, Eye,
  LayoutDashboard, Users, Camera, AlertTriangle, Crown, LogOut, Settings,
  Ticket, FileText, Calendar, TrendingUp, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProfiles } from '../../data/mockProfiles';

export default function AdminPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [filter, setFilter] = useState('all'); // all, success, pending, failed, refunded
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }

    loadPayments();
    loadRefunds();
  }, [navigate]);

  const loadPayments = () => {
    const saved = localStorage.getItem('paymentHistory');
    if (saved) {
      try {
        setPayments(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading payments:', e);
      }
    } else {
      // Generate mock payment data
      const mockPayments = [];
      const plans = [
        { name: 'Monthly', price: 499 },
        { name: 'Quarterly', price: 1299 },
        { name: 'Yearly', price: 3999 }
      ];
      
      mockProfiles.slice(0, 15).forEach((profile, idx) => {
        const plan = plans[Math.floor(Math.random() * plans.length)];
        const statuses = ['success', 'success', 'success', 'pending', 'failed'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        mockPayments.push({
          id: `payment-${idx + 1}`,
          userId: profile.id,
          userName: profile.name,
          userEmail: `${profile.name.toLowerCase().replace(' ', '.')}@example.com`,
          plan: plan.name,
          amount: plan.price,
          status: status,
          paymentMethod: 'Credit Card',
          transactionId: `TXN${Date.now()}-${idx}`,
          createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          promoCode: idx % 3 === 0 ? 'WELCOME50' : null,
          discount: idx % 3 === 0 ? plan.price * 0.5 : 0,
          finalAmount: idx % 3 === 0 ? plan.price * 0.5 : plan.price
        });
      });
      
      setPayments(mockPayments);
      localStorage.setItem('paymentHistory', JSON.stringify(mockPayments));
    }
  };

  const loadRefunds = () => {
    const saved = localStorage.getItem('refundHistory');
    if (saved) {
      try {
        setRefunds(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading refunds:', e);
      }
    } else {
      // Default empty refunds
      setRefunds([]);
      localStorage.setItem('refundHistory', JSON.stringify([]));
    }
  };

  const handleRefund = (paymentId, reason) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    const refund = {
      id: `refund-${Date.now()}`,
      paymentId: payment.id,
      userId: payment.userId,
      userName: payment.userName,
      amount: payment.finalAmount,
      reason: reason,
      status: 'processing',
      createdAt: new Date().toISOString(),
      processedAt: null
    };

    const updatedRefunds = [...refunds, refund];
    setRefunds(updatedRefunds);
    localStorage.setItem('refundHistory', JSON.stringify(updatedRefunds));

    // Update payment status
    const updatedPayments = payments.map(p =>
      p.id === paymentId ? { ...p, status: 'refunded' } : p
    );
    setPayments(updatedPayments);
    localStorage.setItem('paymentHistory', JSON.stringify(updatedPayments));

    setShowRefundModal(false);
    setSelectedPayment(null);
  };

  const processRefund = (refundId) => {
    const updatedRefunds = refunds.map(r =>
      r.id === refundId
        ? { ...r, status: 'completed', processedAt: new Date().toISOString() }
        : r
    );
    setRefunds(updatedRefunds);
    localStorage.setItem('refundHistory', JSON.stringify(updatedRefunds));
  };

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status === filter;
    const matchesSearch = searchTerm === '' ||
      payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
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
    totalRevenue: payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.finalAmount, 0),
    totalPayments: payments.filter(p => p.status === 'success').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    failedPayments: payments.filter(p => p.status === 'failed').length,
    totalRefunds: refunds.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.amount, 0),
    pendingRefunds: refunds.filter(r => r.status === 'processing').length
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
            <h1 className="text-3xl font-bold text-gray-900">Payments & Refunds</h1>
            <p className="text-sm text-gray-500 mt-1">
              View payment history and process refunds
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Successful Payments</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalPayments}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</p>
                </div>
                <RefreshCw className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Refunds</p>
                  <p className="text-2xl font-bold text-red-600">₹{stats.totalRefunds.toLocaleString()}</p>
                </div>
                <RefreshCw className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Search by user, transaction ID..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Filter
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                >
                  <option value="all">All Payments</option>
                  <option value="success">Successful</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Payment History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Plan</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Transaction ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredPayments.map((payment, index) => (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-semibold text-gray-900">{payment.userName}</p>
                            <p className="text-xs text-gray-500">{payment.userEmail}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-900">{payment.plan}</span>
                          {payment.promoCode && (
                            <p className="text-xs text-gray-500">Code: {payment.promoCode}</p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">₹{payment.finalAmount}</p>
                            {payment.discount > 0 && (
                              <p className="text-xs text-gray-500 line-through">₹{payment.amount}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-mono text-gray-600">{payment.transactionId}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {payment.status === 'success' ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              Success
                            </span>
                          ) : payment.status === 'pending' ? (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                              Pending
                            </span>
                          ) : payment.status === 'failed' ? (
                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                              Failed
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                              Refunded
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <motion.button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowDetails(true);
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            {payment.status === 'success' && (
                              <motion.button
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setShowRefundModal(true);
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Process Refund"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              
              {filteredPayments.length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No payments found</p>
                </div>
              )}
            </div>
          </div>

          {/* Refunds Table */}
          {refunds.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Refund History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Reason</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {refunds.map((refund, index) => (
                      <motion.tr
                        key={refund.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <span className="text-sm font-semibold text-gray-900">{refund.userName}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm font-semibold text-gray-900">₹{refund.amount}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">{refund.reason}</span>
                        </td>
                        <td className="px-4 py-4">
                          {refund.status === 'completed' ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              Completed
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                              Processing
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">
                            {new Date(refund.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {refund.status === 'processing' && (
                            <motion.button
                              onClick={() => processRefund(refund.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all"
                            >
                              Complete
                            </motion.button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Details Modal */}
      <AnimatePresence>
        {showDetails && selectedPayment && (
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
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Details</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">User</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedPayment.userName}</p>
                  <p className="text-xs text-gray-500">{selectedPayment.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedPayment.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-sm font-semibold text-gray-900">₹{selectedPayment.finalAmount}</p>
                  {selectedPayment.discount > 0 && (
                    <p className="text-xs text-gray-500">
                      Original: ₹{selectedPayment.amount} | Discount: ₹{selectedPayment.discount}
                    </p>
                  )}
                </div>
                {selectedPayment.promoCode && (
                  <div>
                    <p className="text-sm text-gray-500">Promo Code</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedPayment.promoCode}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="text-sm font-mono text-gray-900">{selectedPayment.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedPayment.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedPayment.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  {selectedPayment.status === 'success' ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Success
                    </span>
                  ) : selectedPayment.status === 'pending' ? (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                      Pending
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      Failed
                    </span>
                  )}
                </div>
              </div>

              <motion.button
                onClick={() => setShowDetails(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all"
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refund Modal */}
      <AnimatePresence>
        {showRefundModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowRefundModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Process Refund</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">User</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedPayment.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Refund Amount</p>
                  <p className="text-lg font-bold text-gray-900">₹{selectedPayment.finalAmount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refund Reason
                  </label>
                  <textarea
                    id="refundReason"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 resize-none"
                    placeholder="Enter reason for refund..."
                    defaultValue=""
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => {
                    const reason = document.getElementById('refundReason').value || 'No reason provided';
                    handleRefund(selectedPayment.id, reason);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                >
                  Process Refund
                </motion.button>
                <motion.button
                  onClick={() => setShowRefundModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

