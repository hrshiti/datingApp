import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Shield, Lock, Bell, Eye, User, 
  Ban, AlertTriangle, Trash2, LogOut, Key, 
  MapPin, Clock, Globe, CheckCircle, Crown
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
    showAge: true,
    
    // App Lock
    appLockEnabled: false,
    appLockType: 'pin', // pin, biometric
    pin: '',
    
    // Notifications
    pushNotifications: true,
    emailNotifications: false,
    matchNotifications: true,
    messageNotifications: true,
    
    // Safety
    showBlockedUsers: false,
    showReportedUsers: false
  });

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [reportedUsers, setReportedUsers] = useState([]);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }

    // Load blocked users
    const blocked = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
    setBlockedUsers(blocked);

    // Load reported users
    const reported = JSON.parse(localStorage.getItem('reportedUsers') || '[]');
    setReportedUsers(reported);
  }, []);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const handlePinSetup = () => {
    if (pinInput.length === 4 && pinInput === confirmPin) {
      handleSettingChange('appLockEnabled', true);
      handleSettingChange('pin', pinInput);
      setShowPinSetup(false);
      setPinInput('');
      setConfirmPin('');
      alert('App Lock enabled successfully!');
    } else if (pinInput.length !== 4) {
      alert('PIN must be 4 digits');
    } else {
      alert('PINs do not match');
    }
  };

  const handleDisableAppLock = () => {
    handleSettingChange('appLockEnabled', false);
    handleSettingChange('pin', '');
    alert('App Lock disabled');
  };

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

  const SettingItem = ({ icon: Icon, title, description, value, onChange, type = 'toggle' }) => (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-[#FFB6C1]/30 hover:border-[#FF91A4] transition-all mb-3"
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-[#FFE4E1] rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#FF91A4]" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-[#212121]">{title}</h3>
          {description && (
            <p className="text-xs text-[#757575] mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {type === 'toggle' ? (
        <button
          onClick={() => onChange(!value)}
          className={`relative w-12 h-6 rounded-full transition-all ${
            value ? 'bg-[#FF91A4]' : 'bg-[#E0E0E0]'
          }`}
        >
          <motion.div
            animate={{ x: value ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
          />
        </button>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="px-3 py-2 border-2 border-[#FFB6C1] rounded-lg text-sm text-[#212121] focus:border-[#FF91A4] focus:outline-none bg-white"
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

  return (
    <div className="h-screen heart-background flex flex-col relative overflow-hidden">
      <span className="heart-decoration">💕</span>
      <span className="heart-decoration">💖</span>
      <span className="heart-decoration">💗</span>
      <span className="heart-decoration">💝</span>
      <span className="heart-decoration">❤️</span>
      <span className="heart-decoration">💓</span>
      <div className="decoration-circle"></div>
      <div className="decoration-circle"></div>

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-20 bg-white/95 backdrop-blur-md border-b-2 border-[#FFB6C1] shadow-sm"
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate('/profile')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 hover:bg-[#FFE4E1] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#212121]" />
            </motion.button>
            <div className="w-10 h-10 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-lg flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#212121]">Settings</h1>
              <p className="text-xs text-[#757575]">Manage your preferences</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-3 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Privacy Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-lg font-bold text-[#212121] mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#FF91A4]" />
              Privacy Settings
            </h2>
            <div className="space-y-3">
              <SettingItem
                icon={MapPin}
                title="Hide Distance"
                description="Hide your distance from other users"
                value={settings.hideDistance}
                onChange={(val) => handleSettingChange('hideDistance', val)}
              />
              <SettingItem
                icon={Clock}
                title="Hide Last Active"
                description="Don't show when you were last active"
                value={settings.hideLastActive}
                onChange={(val) => handleSettingChange('hideLastActive', val)}
              />
              <SettingItem
                icon={Globe}
                title="Profile Visibility"
                description="Control who can see your profile"
                value={settings.profileVisibility}
                onChange={(val) => handleSettingChange('profileVisibility', val)}
                type="visibility"
              />
              <SettingItem
                icon={User}
                title="Show Age"
                description="Display your age on profile"
                value={settings.showAge}
                onChange={(val) => handleSettingChange('showAge', val)}
              />
            </div>
          </motion.div>

          {/* App Lock */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-lg font-bold text-[#212121] mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#FF91A4]" />
              App Lock
            </h2>
            <div className="space-y-3">
              <SettingItem
                icon={Key}
                title="Enable App Lock"
                description="Protect your app with PIN"
                value={settings.appLockEnabled}
                onChange={(val) => {
                  if (val) {
                    setShowPinSetup(true);
                  } else {
                    handleDisableAppLock();
                  }
                }}
              />
              {settings.appLockEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-[#FFE4E1] rounded-xl border-2 border-[#FFB6C1]"
                >
                  <p className="text-sm text-[#212121] mb-2">App Lock is enabled</p>
                  <button
                    onClick={handleDisableAppLock}
                    className="text-sm text-[#FF91A4] hover:text-[#FF69B4] font-medium"
                  >
                    Disable App Lock
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="text-lg font-bold text-[#212121] mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#FF91A4]" />
              Notifications
            </h2>
            <div className="space-y-3">
              <SettingItem
                icon={Bell}
                title="Push Notifications"
                description="Receive push notifications"
                value={settings.pushNotifications}
                onChange={(val) => handleSettingChange('pushNotifications', val)}
              />
              <SettingItem
                icon={User}
                title="Email Notifications"
                description="Receive email updates"
                value={settings.emailNotifications}
                onChange={(val) => handleSettingChange('emailNotifications', val)}
              />
              <SettingItem
                icon={CheckCircle}
                title="Match Notifications"
                description="Get notified about new matches"
                value={settings.matchNotifications}
                onChange={(val) => handleSettingChange('matchNotifications', val)}
              />
              <SettingItem
                icon={Bell}
                title="Message Notifications"
                description="Get notified about new messages"
                value={settings.messageNotifications}
                onChange={(val) => handleSettingChange('messageNotifications', val)}
              />
            </div>
          </motion.div>

          {/* Blocked Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-lg font-bold text-[#212121] mb-4 flex items-center gap-2">
              <Ban className="w-5 h-5 text-[#FF91A4]" />
              Blocked Users ({blockedUsers.length})
            </h2>
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
          </motion.div>

          {/* Reported Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <h2 className="text-lg font-bold text-[#212121] mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#FF91A4]" />
              Reported Users ({reportedUsers.length})
            </h2>
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
          </motion.div>

          {/* Account Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <h2 className="text-lg font-bold text-[#212121] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#FF91A4]" />
              Account
            </h2>
            <div className="space-y-3">
              <motion.button
                onClick={() => navigate('/edit-profile')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 bg-white rounded-xl border-2 border-[#FFB6C1]/30 hover:border-[#FF91A4] transition-all flex items-center gap-3"
              >
                <User className="w-5 h-5 text-[#FF91A4]" />
                <span className="flex-1 text-left text-sm font-medium text-[#212121]">Edit Profile</span>
                <ArrowLeft className="w-4 h-4 text-[#757575] rotate-180" />
              </motion.button>

              <motion.button
                onClick={() => navigate('/premium')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] rounded-xl border-2 border-[#FF91A4] hover:shadow-lg transition-all flex items-center gap-3"
              >
                <Crown className="w-5 h-5 text-[#FFD700]" />
                <span className="flex-1 text-left text-sm font-medium text-[#212121]">Premium Subscription</span>
                <ArrowLeft className="w-4 h-4 text-[#757575] rotate-180" />
              </motion.button>

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

      {/* PIN Setup Modal */}
      <AnimatePresence>
        {showPinSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowPinSetup(false);
              setPinInput('');
              setConfirmPin('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#212121] mb-2">Set Up App Lock</h3>
                <p className="text-sm text-[#757575]">Enter a 4-digit PIN to secure your app</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">Enter PIN</label>
                  <input
                    type="password"
                    maxLength="4"
                    value={pinInput}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        setPinInput(e.target.value);
                      }
                    }}
                    placeholder="0000"
                    className="w-full px-4 py-3 border-2 border-[#FFB6C1] rounded-xl focus:border-[#FF91A4] focus:outline-none text-center text-2xl tracking-widest"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#212121] mb-2">Confirm PIN</label>
                  <input
                    type="password"
                    maxLength="4"
                    value={confirmPin}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        setConfirmPin(e.target.value);
                      }
                    }}
                    placeholder="0000"
                    className="w-full px-4 py-3 border-2 border-[#FFB6C1] rounded-xl focus:border-[#FF91A4] focus:outline-none text-center text-2xl tracking-widest"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowPinSetup(false);
                      setPinInput('');
                      setConfirmPin('');
                    }}
                    className="flex-1 px-4 py-3 border-2 border-[#E0E0E0] text-[#212121] rounded-xl font-semibold hover:border-[#757575] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePinSetup}
                    disabled={pinInput.length !== 4 || confirmPin.length !== 4}
                    className="flex-1 px-4 py-3 bg-[#FF91A4] hover:bg-[#FF69B4] disabled:bg-[#E0E0E0] disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all disabled:transform-none"
                  >
                    Set PIN
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

