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
        whileHover={{ scale: 1.01, y: -2 }}
        className="flex items-center justify-between p-5 sm:p-6 bg-white rounded-2xl border border-[#E8E8E8] hover:border-[#64B5F6] transition-all mb-3 shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
      >
        <div className="flex items-center gap-4 flex-1">
          <Icon className="w-5 h-5 text-[#757575] flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm sm:text-base font-semibold text-[#1A1A1A] tracking-tight">{title}</h3>
            {description && (
              <p className="text-xs sm:text-sm text-[#616161] mt-0.5 font-normal">{description}</p>
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
              className={`relative w-14 h-7 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#64B5F6] focus:ring-offset-2 ${
                value ? 'bg-gradient-to-r from-[#64B5F6] to-[#42A5F5]' : 'bg-[#E0E0E0]'
              }`}
              aria-label={`Toggle ${title}`}
            >
              <motion.div
                animate={{ x: value ? 28 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] pointer-events-none"
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
            className="px-4 py-2.5 border border-[#E0E0E0] rounded-xl text-sm text-[#1A1A1A] focus:border-[#64B5F6] focus:outline-none bg-white shadow-sm hover:shadow-md transition-all font-medium"
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
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] flex flex-col relative overflow-hidden">
      {/* Premium Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-[#64B5F6]/8 to-transparent rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-[#42A5F5]/8 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#90CAF9]/5 to-transparent rounded-full blur-3xl"></div>

      {/* Premium Header - Fixed with Glassmorphism */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-30 backdrop-blur-xl bg-white/80 border-b border-[#E0E0E0]/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => navigate('/profile')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 hover:bg-[#F5F5F5] rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-[#616161]" />
            </motion.button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">
                Settings
              </h1>
              <p className="text-xs sm:text-sm text-[#757575] font-medium mt-0.5">Manage your preferences</p>
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
            className="mb-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight mb-6">Privacy Settings</h2>
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
            className="mb-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight mb-6">Notifications</h2>
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
            className="mb-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight mb-6">Safety & Security</h2>
            
            {/* Blocked Users */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4 tracking-tight">Blocked Users ({blockedUsers.length})</h3>
              {blockedUsers.length > 0 ? (
                <div className="space-y-3">
                  {blockedUsers.map((userId) => {
                    // Get user name from mockProfiles
                    const user = mockProfiles.find(p => p.id === userId);
                    const userName = user?.name || `User ${userId}`;
                    return (
                      <motion.div
                        key={userId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#E8E8E8] shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Ban className="w-4 h-4 text-[#757575]" />
                          <span className="text-sm font-medium text-[#1A1A1A]">{userName}</span>
                        </div>
                        <motion.button
                          onClick={() => handleUnblock(userId)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-[#F5F5F5] hover:bg-[#64B5F6] hover:text-white text-[#616161] rounded-lg text-sm font-medium transition-all"
                        >
                          Unblock
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 bg-white rounded-xl border border-[#E8E8E8] text-center shadow-sm">
                  <p className="text-sm text-[#616161] font-normal">No blocked users</p>
                </div>
              )}
            </div>

            {/* Reported Users */}
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4 tracking-tight">Reported Users ({reportedUsers.length})</h3>
              {reportedUsers.length > 0 ? (
                <div className="space-y-3">
                  {reportedUsers.map((report, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.01, y: -2 }}
                      className="p-4 bg-white rounded-xl border border-[#E8E8E8] shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-[#757575] flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#1A1A1A]">{report.userName}</p>
                          <p className="text-xs text-[#616161] font-normal mt-1">Reason: {report.reason}</p>
                          <p className="text-xs text-[#757575] mt-0.5">
                            Reported: {new Date(report.reportedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-white rounded-xl border border-[#E8E8E8] text-center shadow-sm">
                  <p className="text-sm text-[#616161] font-normal">No reported users</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Help & Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight mb-6">Help & Support</h2>
            <div className="p-6 bg-white rounded-xl border border-[#E8E8E8] text-center shadow-sm">
              <p className="text-sm text-[#616161] font-normal">Help center coming soon!</p>
            </div>
          </motion.div>

          {/* Account Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight mb-6">Account</h2>
            <div className="space-y-3">
              <motion.button
                onClick={() => setShowDeleteConfirm(true)}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 bg-white rounded-xl border border-red-200 hover:border-red-400 transition-all flex items-center gap-3 shadow-sm hover:shadow-md"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span className="flex-1 text-left text-sm font-medium text-red-600">Delete Account</span>
              </motion.button>

              <motion.button
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 bg-white rounded-xl border border-[#E8E8E8] hover:border-[#64B5F6] transition-all flex items-center gap-3 shadow-sm hover:shadow-md"
              >
                <LogOut className="w-4 h-4 text-[#757575]" />
                <span className="flex-1 text-left text-sm font-medium text-[#1A1A1A]">Logout</span>
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
              className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-8 max-w-sm w-full border border-[#E8E8E8]"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3 tracking-tight">Delete Account?</h3>
                <p className="text-sm text-[#616161] font-medium leading-relaxed">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowDeleteConfirm(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-5 py-3.5 border border-[#E0E0E0] text-[#1A1A1A] rounded-xl font-semibold hover:border-[#757575] transition-all shadow-sm"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDeleteAccount}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-5 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all shadow-[0_4px_16px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_24px_rgba(239,68,68,0.4)]"
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

