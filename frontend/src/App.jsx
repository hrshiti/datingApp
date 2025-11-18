import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPages from './pages/auth/AuthPages';
import OnboardingPage from './pages/OnboardingPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import DiscoveryFeedPage from './pages/DiscoveryFeedPage';
import FilterPage from './pages/FilterPage';
import ChatsPage from './pages/ChatsPage';
import ChatDetailPage from './pages/ChatDetailPage';
import SettingsPage from './pages/SettingsPage';
import SafetyCenterPage from './pages/SafetyCenterPage';
import PremiumPage from './pages/PremiumPage';
import LikedYouPage from './pages/LikedYouPage';
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
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/login" element={<AuthPages />} />
        <Route path="/signup" element={<AuthPages />} />
        <Route path="/verify-otp" element={<AuthPages />} />
        <Route path="/success" element={<AuthPages />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/profile-setup" element={<ProfileSetupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/discover" element={<DiscoveryFeedPage />} />
        <Route path="/filters" element={<FilterPage />} />
        <Route path="/chats" element={<ChatsPage />} />
        <Route path="/chat/:userId" element={<ChatDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/safety" element={<SafetyCenterPage />} />
        <Route path="/premium" element={<PremiumPage />} />
        <Route path="/liked-you" element={<LikedYouPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
