import React, { useState } from 'react';
import { X, AlertTriangle, Shield, Ban } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReportBlockModal({ 
  isOpen, 
  onClose, 
  userName,
  onReport,
  onBlock 
}) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  const reportReasons = [
    'Inappropriate photos',
    'Harassment or bullying',
    'Spam or fake profile',
    'Inappropriate messages',
    'Underage user',
    'Scam or fraud',
    'Other'
  ];

  const handleReportSubmit = () => {
    if (selectedReason || customReason.trim()) {
      const reason = selectedReason === 'Other' ? customReason : selectedReason;
      onReport(reason);
      // Reset form
      setSelectedReason('');
      setCustomReason('');
      setShowReportForm(false);
      onClose();
    }
  };

  const handleBlockConfirm = () => {
    onBlock();
    setShowBlockConfirm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Safety Options</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!showReportForm && !showBlockConfirm && (
                <>
                  <p className="text-sm text-[#757575] mb-6 text-center">
                    What would you like to do with <span className="font-semibold text-[#212121]">{userName}</span>?
                  </p>

                  {/* Report Button */}
                  <motion.button
                    onClick={() => setShowReportForm(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mb-3 p-4 bg-[#FFE4E1] hover:bg-[#FF91A4] hover:text-white border-2 border-[#FFB6C1] rounded-xl transition-all flex items-center gap-3 group"
                  >
                    <AlertTriangle className="w-5 h-5 text-[#FF91A4] group-hover:text-white transition-colors" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-[#212121] group-hover:text-white transition-colors">
                        Report User
                      </div>
                      <div className="text-xs text-[#757575] group-hover:text-white/80 transition-colors">
                        Report inappropriate behavior
                      </div>
                    </div>
                  </motion.button>

                  {/* Block Button */}
                  <motion.button
                    onClick={() => setShowBlockConfirm(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 bg-[#FFE4E1] hover:bg-red-500 hover:text-white border-2 border-[#FFB6C1] rounded-xl transition-all flex items-center gap-3 group"
                  >
                    <Ban className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-[#212121] group-hover:text-white transition-colors">
                        Block User
                      </div>
                      <div className="text-xs text-[#757575] group-hover:text-white/80 transition-colors">
                        Block and hide this user
                      </div>
                    </div>
                  </motion.button>
                </>
              )}

              {/* Report Form */}
              {showReportForm && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h3 className="text-lg font-bold text-[#212121] mb-4">Why are you reporting this user?</h3>
                  
                  <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                    {reportReasons.map((reason) => (
                      <motion.button
                        key={reason}
                        onClick={() => {
                          setSelectedReason(reason);
                          if (reason !== 'Other') setCustomReason('');
                        }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full p-3 text-left rounded-xl border-2 transition-all ${
                          selectedReason === reason
                            ? 'bg-[#FF91A4] text-white border-[#FF91A4]'
                            : 'bg-white text-[#212121] border-[#FFB6C1] hover:border-[#FF91A4]'
                        }`}
                      >
                        {reason}
                      </motion.button>
                    ))}
                  </div>

                  {selectedReason === 'Other' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-4"
                    >
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Please describe the issue..."
                        className="w-full p-3 border-2 border-[#FFB6C1] rounded-xl focus:border-[#FF91A4] focus:outline-none resize-none text-sm"
                        rows="3"
                      />
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowReportForm(false);
                        setSelectedReason('');
                        setCustomReason('');
                      }}
                      className="flex-1 px-4 py-3 border-2 border-[#E0E0E0] text-[#212121] rounded-xl font-semibold hover:border-[#757575] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReportSubmit}
                      disabled={!selectedReason || (selectedReason === 'Other' && !customReason.trim())}
                      className="flex-1 px-4 py-3 bg-[#FF91A4] hover:bg-[#FF69B4] disabled:bg-[#E0E0E0] disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all disabled:transform-none"
                    >
                      Submit Report
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Block Confirmation */}
              {showBlockConfirm && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ban className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-bold text-[#212121] mb-2">Block {userName}?</h3>
                  <p className="text-sm text-[#757575] mb-6">
                    This user will be blocked and won't be able to see your profile or message you. You can unblock them later in settings.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowBlockConfirm(false);
                      }}
                      className="flex-1 px-4 py-3 border-2 border-[#E0E0E0] text-[#212121] rounded-xl font-semibold hover:border-[#757575] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBlockConfirm}
                      className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all"
                    >
                      Block User
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

