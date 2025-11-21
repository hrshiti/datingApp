import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Settings, Save, RefreshCw, Bell, Shield, Users, Heart,
  LayoutDashboard, Camera, AlertTriangle, Crown, LogOut, Sliders,
  Ticket, FileText, DollarSign, Menu, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { mockProfiles } from '../../data/mockProfiles';

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState({
    // App Limits
    dailyLikeLimit: 20,
    maxPhotosPerUser: 6,
    minPhotosPerUser: 4,
    maxBioLength: 200,
    
    // Matching
    defaultDistancePreference: 25,
    minAge: 18,
    maxAge: 100,
    
    // Features
    enablePhotoVerification: true,
    enablePremiumFeatures: true,
    enableReports: true,
    enableBlocking: true,
    
    // Notifications
    enablePushNotifications: true,
    enableEmailNotifications: false,
    
    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing maintenance. Please check back later.'
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }

    loadSettings();
  }, [navigate]);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  };

  const handleSave = () => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaultSettings = {
      dailyLikeLimit: 20,
      maxPhotosPerUser: 6,
      minPhotosPerUser: 4,
      maxBioLength: 200,
      defaultDistancePreference: 25,
      minAge: 18,
      maxAge: 100,
      enablePhotoVerification: true,
      enablePremiumFeatures: true,
      enableReports: true,
      enableBlocking: true,
      enablePushNotifications: true,
      enableEmailNotifications: false,
      maintenanceMode: false,
      maintenanceMessage: 'We are currently performing maintenance. Please check back later.'
    };
    setSettings(defaultSettings);
    localStorage.setItem('adminSettings', JSON.stringify(defaultSettings));
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
        <div className="p-6 border-b border-gray-200/50 sticky top-0 bg-white/80 backdrop-blur-lg z-10">
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
                  App Settings
                </h1>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  Configure app limits, features, and system settings
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Spacer for fixed header */}
        <div className="h-20 md:h-24"></div>
        <div className="p-4 md:p-6">

          <div className="space-y-6">
            {/* App Limits */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Sliders className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">App Limits</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Like Limit (Free Users)
                  </label>
                  <input
                    type="number"
                    value={settings.dailyLikeLimit}
                    onChange={(e) => setSettings({ ...settings, dailyLikeLimit: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    min="1"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Photos Per User
                  </label>
                  <input
                    type="number"
                    value={settings.maxPhotosPerUser}
                    onChange={(e) => setSettings({ ...settings, maxPhotosPerUser: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Photos Per User
                  </label>
                  <input
                    type="number"
                    value={settings.minPhotosPerUser}
                    onChange={(e) => setSettings({ ...settings, minPhotosPerUser: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    min="1"
                    max="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Bio Length
                  </label>
                  <input
                    type="number"
                    value={settings.maxBioLength}
                    onChange={(e) => setSettings({ ...settings, maxBioLength: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    min="50"
                    max="500"
                  />
                </div>
              </div>
            </div>

            {/* Matching Settings */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Matching Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Distance Preference (km)
                  </label>
                  <input
                    type="number"
                    value={settings.defaultDistancePreference}
                    onChange={(e) => setSettings({ ...settings, defaultDistancePreference: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    min="5"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Age
                  </label>
                  <input
                    type="number"
                    value={settings.minAge}
                    onChange={(e) => setSettings({ ...settings, minAge: parseInt(e.target.value) || 18 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    min="18"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Age
                  </label>
                  <input
                    type="number"
                    value={settings.maxAge}
                    onChange={(e) => setSettings({ ...settings, maxAge: parseInt(e.target.value) || 100 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    min="18"
                    max="100"
                  />
                </div>
              </div>
            </div>

            {/* Feature Flags */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Feature Flags</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { key: 'enablePhotoVerification', label: 'Photo Verification' },
                  { key: 'enablePremiumFeatures', label: 'Premium Features' },
                  { key: 'enableReports', label: 'Report System' },
                  { key: 'enableBlocking', label: 'User Blocking' }
                ].map((feature) => (
                  <motion.div 
                    key={feature.key} 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50 hover:shadow-md transition-all"
                  >
                    <span className="text-sm font-semibold text-gray-700">{feature.label}</span>
                    <button
                      onClick={() => setSettings({ ...settings, [feature.key]: !settings[feature.key] })}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shadow-inner ${
                        settings[feature.key] ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                          settings[feature.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { key: 'enablePushNotifications', label: 'Push Notifications' },
                  { key: 'enableEmailNotifications', label: 'Email Notifications' }
                ].map((notif) => (
                  <motion.div 
                    key={notif.key} 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50 hover:shadow-md transition-all"
                  >
                    <span className="text-sm font-semibold text-gray-700">{notif.label}</span>
                    <button
                      onClick={() => setSettings({ ...settings, [notif.key]: !settings[notif.key] })}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shadow-inner ${
                        settings[notif.key] ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                          settings[notif.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Maintenance Mode */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <RefreshCw className="w-5 h-5 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Maintenance Mode</h2>
              </div>
              
              <div className="space-y-4">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50 hover:shadow-md transition-all"
                >
                  <span className="text-sm font-semibold text-gray-700">Enable Maintenance Mode</span>
                  <button
                    onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shadow-inner ${
                      settings.maintenanceMode ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                        settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </motion.div>

                {settings.maintenanceMode && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-br from-orange-50 to-red-50/50 rounded-xl border border-orange-200/50"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Maintenance Message
                    </label>
                    <textarea
                      value={settings.maintenanceMessage}
                      onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white/80 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none transition-all"
                      placeholder="Enter maintenance message..."
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg ${
                  saved ? 'bg-gradient-to-r from-green-500 to-green-600' : ''
                }`}
              >
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : 'Save Settings'}
              </motion.button>
              <motion.button
                onClick={handleReset}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3.5 bg-white/90 backdrop-blur-sm hover:bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
