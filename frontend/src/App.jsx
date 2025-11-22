import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPages from './pages/auth/AuthPages';
import BasicInfoPage from './pages/BasicInfoPage';
import OnboardingPage from './pages/OnboardingPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import PhotoVerificationPage from './pages/PhotoVerificationPage';
import ProfilePage from './pages/ProfilePage';
import DiscoveryFeedPage from './pages/DiscoveryFeedPage';
import DiscoverPage from './pages/DiscoverPage';
import FilterPage from './pages/FilterPage';
import ChatsPage from './pages/ChatsPage';
import ChatDetailPage from './pages/ChatDetailPage';
import SettingsPage from './pages/SettingsPage';
import SafetyCenterPage from './pages/SafetyCenterPage';
import PremiumPage from './pages/PremiumPage';
import LikedYouPage from './pages/LikedYouPage';
import EditProfileInfoPage from './pages/EditProfileInfoPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUserManagementPage from './pages/admin/AdminUserManagementPage';
import AdminPhotoVerificationPage from './pages/admin/AdminPhotoVerificationPage';
import AdminModerationPage from './pages/admin/AdminModerationPage';
import AdminPremiumPage from './pages/admin/AdminPremiumPage';
import AdminPromoCodePage from './pages/admin/AdminPromoCodePage';
import AdminActivityLogsPage from './pages/admin/AdminActivityLogsPage';
import AdminPaymentPage from './pages/admin/AdminPaymentPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import './App.css';

function Home() {
  return (
    <div className="min-h-screen bg-[#FFF0F5] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black mb-4">Welcome Home!</h1>
        <p className="text-gray-600 mb-6">You're successfully logged in.</p>
        <a href="/login" className="text-[#FF91A4] hover:text-[#FF69B4] font-medium">
          Go to Login
        </a>
      </div>
      </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/welcome" element={<AuthPages />} />
        <Route path="/phone" element={<AuthPages />} />
        <Route path="/verify-otp" element={<AuthPages />} />
        <Route path="/basic-info" element={<BasicInfoPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/profile-setup" element={<ProfileSetupPage />} />
        <Route path="/photo-verification" element={<PhotoVerificationPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-profile-info" element={<EditProfileInfoPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/people" element={<DiscoveryFeedPage />} />
        <Route path="/filters" element={<FilterPage />} />
        <Route path="/chats" element={<ChatsPage />} />
        <Route path="/chat/:userId" element={<ChatDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/safety" element={<SafetyCenterPage />} />
        <Route path="/premium" element={<PremiumPage />} />
        <Route path="/liked-you" element={<LikedYouPage />} />
        <Route path="/home" element={<Home />} />
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUserManagementPage />} />
        <Route path="/admin/verification" element={<AdminPhotoVerificationPage />} />
        <Route path="/admin/moderation" element={<AdminModerationPage />} />
        <Route path="/admin/premium" element={<AdminPremiumPage />} />
        <Route path="/admin/promo-codes" element={<AdminPromoCodePage />} />
        <Route path="/admin/activity-logs" element={<AdminActivityLogsPage />} />
        <Route path="/admin/payments" element={<AdminPaymentPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
