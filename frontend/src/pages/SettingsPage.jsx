import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Shield, Lock, Bell, Eye, User, 
  Ban, AlertTriangle, Trash2, LogOut, 
  MapPin, Clock, Globe, CheckCircle, Crown, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProfiles } from '../data/mockProfiles';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    // Privacy Settings
    hideDistance: false,
    hideLastActive: false,
    profileVisibility: 'public', // public, private
    showAge: false,
    
    // Notifications
    pushNotifications: false,
    matchNotifications: false,
    messageNotifications: false,
    
    // Safety
    showBlockedUsers: false,
    showReportedUsers: false
  });

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [reportedUsers, setReportedUsers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Default settings with all toggles off
    const defaultSettings = {
      // Privacy Settings
      hideDistance: false,
      hideLastActive: false,
      profileVisibility: 'public',
      showAge: false,
      
      // Notifications
      pushNotifications: false,
      matchNotifications: false,
      messageNotifications: false,
      
      // Safety
      showBlockedUsers: false,
      showReportedUsers: false
    };

    // Load settings from localStorage and merge with defaults
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Merge saved settings with defaults, but force all boolean toggles to false
        const mergedSettings = {
          ...defaultSettings,
          ...parsed,
          // Force all boolean toggles to false
          hideDistance: false,
          hideLastActive: false,
          showAge: false,
          pushNotifications: false,
          matchNotifications: false,
          messageNotifications: false,
          showBlockedUsers: false,
          showReportedUsers: false,
          // Keep non-boolean settings from saved
          profileVisibility: parsed.profileVisibility || 'public'
        };
        setSettings(mergedSettings);
        // Update localStorage with reset toggles
        localStorage.setItem('userSettings', JSON.stringify(mergedSettings));
      } catch (e) {
        console.error('Error loading settings:', e);
        setSettings(defaultSettings);
        localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
      }
    } else {
      // No saved settings, use defaults
      setSettings(defaultSettings);
      localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
    }

    // Load blocked users
    const blocked = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
    setBlockedUsers(blocked);

    // Load reported users
    const reported = JSON.parse(localStorage.getItem('reportedUsers') || '[]');
    setReportedUsers(reported);
  }, []);

  const handleSettingChange = useCallback((key, value) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings, [key]: value };
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
      return newSettings;
    });
  }, []);

  // Create stable onChange handlers for each setting
  const settingHandlers = useMemo(() => ({
    hideDistance: (val) => handleSettingChange('hideDistance', val),
    hideLastActive: (val) => handleSettingChange('hideLastActive', val),
    profileVisibility: (val) => handleSettingChange('profileVisibility', val),
    showAge: (val) => handleSettingChange('showAge', val),
    pushNotifications: (val) => handleSettingChange('pushNotifications', val),
    matchNotifications: (val) => handleSettingChange('matchNotifications', val),
    messageNotifications: (val) => handleSettingChange('messageNotifications', val),
  }), [handleSettingChange]);


  const handleUnblock = (userId) => {
    const updated = blockedUsers.filter(id => id !== userId);
    setBlockedUsers(updated);
    localStorage.setItem('blockedUsers', JSON.stringify(updated));
    alert('User unblocked successfully');
  };

  const handleDeleteAccount = () => {
    // Clear all data
    localStorage.clear();
    navigate('/signup');
  };

  const SettingItem = memo(({ icon: Icon, title, description, value, onChange, type = 'toggle', settingKey }) => {
    const handleToggle = useCallback((e) => {
      e.preventDefault();
      e.stopPropagation();
      if (onChange && typeof onChange === 'function') {
        onChange(!value);
      }
    }, [onChange, value]);

    return (
      <motion.div
        whileHover={{ scale: 1.01, x: 4 }}
        className="flex items-center justify-between p-4 sm:p-5 bg-gradient-to-br from-white to-[#FFF0F5] rounded-xl border-2 border-[#FFB6C1]/30 hover:border-[#FF91A4] transition-all mb-3 shadow-md hover:shadow-lg"
      >
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-12 h-12 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] rounded-xl flex items-center justify-center shadow-md"
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF91A4]" />
          </motion.div>
          <div className="flex-1">
            <h3 className="text-sm sm:text-base font-bold text-[#212121]">{title}</h3>
            {description && (
              <p className="text-xs sm:text-sm text-[#757575] mt-1">{description}</p>
            )}
          </div>
        </div>
        {type === 'toggle' ? (
          <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={handleToggle}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className={`relative w-14 h-7 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#FF91A4] focus:ring-offset-2 ${
                value ? 'bg-gradient-to-r from-[#FF91A4] to-[#FF69B4]' : 'bg-[#E0E0E0]'
              }`}
              aria-label={`Toggle ${title}`}
            >
              <motion.div
                animate={{ x: value ? 28 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-lg pointer-events-none"
              />
            </button>
          </div>
        ) : (
          <select
            value={value}
            onChange={(e) => {
              e.stopPropagation();
              onChange(e.target.value);
            }}
            className="px-3 py-2 border-2 border-[#FFB6C1] rounded-xl text-sm text-[#212121] focus:border-[#FF91A4] focus:outline-none bg-white shadow-md"
          >
            {type === 'visibility' && (
              <>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </>
            )}
          </select>
        )}
      </motion.div>
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F5] via-[#FFE4E1] to-[#FFF0F5] flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#FF91A4]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FF69B4]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      {/* Enhanced Header - Fixed */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-white via-white/98 to-white/95 backdrop-blur-lg border-b border-[#FFB6C1]/30 shadow-lg"
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate('/profile')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-[#FFE4E1] rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#212121]" />
            </motion.button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-xs sm:text-sm text-[#757575] font-medium">Manage your preferences</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content - with padding for fixed header */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 relative z-10 pt-24 sm:pt-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          {/* Privacy Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-[#212121] mb-5 flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] flex items-center justify-center shadow-md"
              >
                <Eye className="w-5 h-5 text-[#FF91A4]" />
              </motion.div>
              Privacy Settings
            </h2>
            <div className="space-y-3">
              <SettingItem
                key="hideDistance"
                icon={MapPin}
                title="Hide Distance"
                description="Hide your distance from other users"
                value={settings.hideDistance}
                onChange={settingHandlers.hideDistance}
                settingKey="hideDistance"
              />
              <SettingItem
                key="hideLastActive"
                icon={Clock}
                title="Hide Last Active"
                description="Don't show when you were last active"
                value={settings.hideLastActive}
                onChange={settingHandlers.hideLastActive}
                settingKey="hideLastActive"
              />
              <SettingItem
                key="profileVisibility"
                icon={Globe}
                title="Profile Visibility"
                description="Control who can see your profile"
                value={settings.profileVisibility}
                onChange={settingHandlers.profileVisibility}
                type="visibility"
                settingKey="profileVisibility"
              />
              <SettingItem
                key="showAge"
                icon={User}
                title="Show Age"
                description="Display your age on profile"
                value={settings.showAge}
                onChange={settingHandlers.showAge}
                settingKey="showAge"
              />
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-[#212121] mb-5 flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] flex items-center justify-center shadow-md"
              >
                <Bell className="w-5 h-5 text-[#FF91A4]" />
              </motion.div>
              Notifications
            </h2>
            <div className="space-y-3">
              <SettingItem
                key="pushNotifications"
                icon={Bell}
                title="Push Notifications"
                description="Receive push notifications"
                value={settings.pushNotifications}
                onChange={settingHandlers.pushNotifications}
                settingKey="pushNotifications"
              />
              <SettingItem
                key="matchNotifications"
                icon={CheckCircle}
                title="Match Notifications"
                description="Get notified about new matches"
                value={settings.matchNotifications}
                onChange={settingHandlers.matchNotifications}
                settingKey="matchNotifications"
              />
              <SettingItem
                key="messageNotifications"
                icon={Bell}
                title="Message Notifications"
                description="Get notified about new messages"
                value={settings.messageNotifications}
                onChange={settingHandlers.messageNotifications}
                settingKey="messageNotifications"
              />
            </div>
          </motion.div>

          {/* Safety & Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-[#212121] mb-5 flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] flex items-center justify-center shadow-md"
              >
                <Shield className="w-5 h-5 text-[#FF91A4]" />
              </motion.div>
              Safety & Security
            </h2>
            
            {/* Blocked Users */}
            <div className="mb-5">
              <h3 className="text-lg font-bold text-[#212121] mb-3 flex items-center gap-2">
                <Ban className="w-5 h-5 text-[#FF91A4]" />
                Blocked Users ({blockedUsers.length})
              </h3>
              {blockedUsers.length > 0 ? (
                <div className="space-y-2">
                  {blockedUsers.map((userId) => {
                    // Get user name from mockProfiles
                    const user = mockProfiles.find(p => p.id === userId);
                    const userName = user?.name || `User ${userId}`;
                    return (
                      <motion.div
                        key={userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-[#FFB6C1]/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#FFE4E1] rounded-full flex items-center justify-center">
                            <Ban className="w-5 h-5 text-[#FF91A4]" />
                          </div>
                          <span className="text-sm font-medium text-[#212121]">{userName}</span>
                        </div>
                        <button
                          onClick={() => handleUnblock(userId)}
                          className="px-4 py-2 bg-[#FFE4E1] hover:bg-[#FF91A4] hover:text-white text-[#FF91A4] rounded-lg text-sm font-medium transition-all"
                        >
                          Unblock
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-[#FFE4E1] rounded-xl border-2 border-[#FFB6C1] text-center">
                  <p className="text-sm text-[#757575]">No blocked users</p>
                </div>
              )}
            </div>

            {/* Reported Users */}
            <div>
              <h3 className="text-lg font-bold text-[#212121] mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#FF91A4]" />
                Reported Users ({reportedUsers.length})
              </h3>
              {reportedUsers.length > 0 ? (
                <div className="space-y-2">
                  {reportedUsers.map((report, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-white rounded-xl border-2 border-[#FFB6C1]/30"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#FFE4E1] rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-[#FF91A4]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#212121]">{report.userName}</p>
                          <p className="text-xs text-[#757575]">Reason: {report.reason}</p>
                          <p className="text-xs text-[#757575]">
                            Reported: {new Date(report.reportedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[#FFE4E1] rounded-xl border-2 border-[#FFB6C1] text-center">
                  <p className="text-sm text-[#757575]">No reported users</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Help & Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-[#212121] mb-5 flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] flex items-center justify-center shadow-md"
              >
                <HelpCircle className="w-5 h-5 text-[#FF91A4]" />
              </motion.div>
              Help & Support
            </h2>
            <div className="p-4 bg-[#FFE4E1] rounded-xl border-2 border-[#FFB6C1] text-center">
              <p className="text-sm text-[#757575]">Help center coming soon!</p>
            </div>
          </motion.div>

          {/* Account Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-[#212121] mb-5 flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] flex items-center justify-center shadow-md"
              >
                <User className="w-5 h-5 text-[#FF91A4]" />
              </motion.div>
              Account
            </h2>
            <div className="space-y-3">
              <motion.button
                onClick={() => setShowDeleteConfirm(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 bg-white rounded-xl border-2 border-red-200 hover:border-red-400 transition-all flex items-center gap-3"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="flex-1 text-left text-sm font-medium text-red-600">Delete Account</span>
              </motion.button>

              <motion.button
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 bg-white rounded-xl border-2 border-[#FFB6C1]/30 hover:border-[#FF91A4] transition-all flex items-center gap-3"
              >
                <LogOut className="w-5 h-5 text-[#FF91A4]" />
                <span className="flex-1 text-left text-sm font-medium text-[#212121]">Logout</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Account Confirmation */}
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
              className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-[#212121] mb-2">Delete Account?</h3>
                <p className="text-sm text-[#757575]">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 border-2 border-[#E0E0E0] text-[#212121] rounded-xl font-semibold hover:border-[#757575] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

