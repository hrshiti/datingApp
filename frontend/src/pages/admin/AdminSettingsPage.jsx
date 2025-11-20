import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Settings, Save, RefreshCw, Bell, Shield, Users, Heart,
  LayoutDashboard, Camera, AlertTriangle, Crown, LogOut, Sliders,
  Ticket, FileText, DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import { mockProfiles } from '../../data/mockProfiles';

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
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
            <h1 className="text-3xl font-bold text-gray-900">App Settings</h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure app limits, features, and system settings
            </p>
          </div>

          <div className="space-y-6">
            {/* App Limits */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sliders className="w-6 h-6 text-blue-600" />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                    min="50"
                    max="500"
                  />
                </div>
              </div>
            </div>

            {/* Matching Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-6 h-6 text-blue-600" />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                    min="18"
                    max="100"
                  />
                </div>
              </div>
            </div>

            {/* Feature Flags */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Feature Flags</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { key: 'enablePhotoVerification', label: 'Photo Verification' },
                  { key: 'enablePremiumFeatures', label: 'Premium Features' },
                  { key: 'enableReports', label: 'Report System' },
                  { key: 'enableBlocking', label: 'User Blocking' }
                ].map((feature) => (
                  <div key={feature.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{feature.label}</span>
                    <button
                      onClick={() => setSettings({ ...settings, [feature.key]: !settings[feature.key] })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings[feature.key] ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings[feature.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { key: 'enablePushNotifications', label: 'Push Notifications' },
                  { key: 'enableEmailNotifications', label: 'Email Notifications' }
                ].map((notif) => (
                  <div key={notif.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{notif.label}</span>
                    <button
                      onClick={() => setSettings({ ...settings, [notif.key]: !settings[notif.key] })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings[notif.key] ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings[notif.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance Mode */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Maintenance Mode</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Enable Maintenance Mode</span>
                  <button
                    onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {settings.maintenanceMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance Message
                    </label>
                    <textarea
                      value={settings.maintenanceMessage}
                      onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 resize-none"
                      placeholder="Enter maintenance message..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saved ? 'Saved!' : 'Save Settings'}
              </motion.button>
              <motion.button
                onClick={handleReset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Reset
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
