import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Shield, AlertTriangle, Heart, Users, 
  MessageCircle, MapPin, Lock, Eye, CheckCircle,
  Phone, Mail, FileText, BookOpen, Info, Ban
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SafetyCenterPage() {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);

  const safetyTips = [
    {
      id: 'meeting',
      icon: Users,
      title: 'Meeting Safely',
      color: 'from-[#FF91A4] to-[#FF69B4]',
      tips: [
        'Always meet in a public place for the first time',
        'Tell a friend or family member where you\'re going',
        'Keep your phone charged and accessible',
        'Trust your instincts - if something feels off, leave',
        'Don\'t share personal information too quickly',
        'Arrange your own transportation'
      ]
    },
    {
      id: 'online',
      icon: MessageCircle,
      title: 'Online Safety',
      color: 'from-[#FF91A4] to-[#FF69B4]',
      tips: [
        'Never share your financial information',
        'Be cautious about sharing personal details',
        'Report suspicious behavior immediately',
        'Block users who make you uncomfortable',
        'Don\'t send money to anyone you meet online',
        'Use the app\'s messaging system initially'
      ]
    },
    {
      id: 'privacy',
      icon: Lock,
      title: 'Privacy Protection',
      color: 'from-[#FF91A4] to-[#FF69B4]',
      tips: [
        'Use privacy settings to control who sees your profile',
        'Hide your distance if you prefer',
        'Be mindful of what photos you share',
        'Don\'t share your exact location',
        'Review your profile visibility regularly',
        'Use app lock to protect your account'
      ]
    },
    {
      id: 'lgbtq',
      icon: Heart,
      title: 'LGBTQ+ Safety',
      color: 'from-[#FF91A4] to-[#FF69B4]',
      tips: [
        'Use discreet mode if needed in your area',
        'Be cautious about sharing your orientation publicly',
        'Connect with verified profiles when possible',
        'Report any harassment or discrimination',
        'Use privacy features to protect your identity',
        'Know your local resources and support groups'
      ]
    },
    {
      id: 'consent',
      icon: CheckCircle,
      title: 'Consent & Boundaries',
      color: 'from-[#FF91A4] to-[#FF69B4]',
      tips: [
        'Always respect boundaries and consent',
        'No means no - always',
        'Communicate clearly about your expectations',
        'Respect others\' decisions',
        'If someone says stop, stop immediately',
        'Consent can be withdrawn at any time'
      ]
    },
    {
      id: 'reporting',
      icon: AlertTriangle,
      title: 'Reporting & Support',
      color: 'from-[#FF91A4] to-[#FF69B4]',
      tips: [
        'Report any inappropriate behavior immediately',
        'Block users who make you uncomfortable',
        'Save evidence if you need to report',
        'Our team reviews all reports within 24 hours',
        'You can report anonymously if needed',
        'Contact support for any safety concerns'
      ]
    }
  ];

  const quickActions = [
    {
      icon: Shield,
      title: 'Report User',
      description: 'Report inappropriate behavior',
      action: () => navigate('/discover'),
      color: 'bg-[#FFE4E1] text-[#FF91A4] hover:bg-[#FF91A4] hover:text-white'
    },
    {
      icon: Lock,
      title: 'Privacy Settings',
      description: 'Manage your privacy',
      action: () => navigate('/settings'),
      color: 'bg-[#FFE4E1] text-[#FF91A4] hover:bg-[#FF91A4] hover:text-white'
    },
    {
      icon: Ban,
      title: 'Blocked Users',
      description: 'View blocked users',
      action: () => navigate('/settings'),
      color: 'bg-[#FFE4E1] text-[#FF91A4] hover:bg-[#FF91A4] hover:text-white'
    },
    {
      icon: Eye,
      title: 'Hide Distance',
      description: 'Protect your location',
      action: () => navigate('/settings'),
      color: 'bg-[#FFE4E1] text-[#FF91A4] hover:bg-[#FF91A4] hover:text-white'
    }
  ];

  const resources = [
    {
      title: 'National Domestic Violence Hotline',
      contact: '1-800-799-7233',
      type: 'phone'
    },
    {
      title: 'Crisis Text Line',
      contact: 'Text HOME to 741741',
      type: 'text'
    },
    {
      title: 'RAINN (Sexual Assault)',
      contact: '1-800-656-4673',
      type: 'phone'
    },
    {
      title: 'LGBTQ+ Crisis Support',
      contact: '1-866-488-7386',
      type: 'phone'
    }
  ];

  const SafetyCard = ({ tip, index }) => {
    const Icon = tip.icon;
    const isExpanded = expandedSection === tip.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-2xl shadow-md border-2 border-[#FFB6C1]/30 overflow-hidden mb-4"
      >
        <button
          onClick={() => setExpandedSection(isExpanded ? null : tip.id)}
          className="w-full p-4 flex items-center justify-between hover:bg-[#FFE4E1] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${tip.color} rounded-xl flex items-center justify-center shadow-md`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold text-[#212121]">{tip.title}</h3>
              <p className="text-xs text-[#757575]">{tip.tips.length} safety tips</p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-[#FF91A4]"
          >
            <ArrowLeft className="w-5 h-5 rotate-90" />
          </motion.div>
        </button>

        <motion.div
          initial={false}
          animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="px-4 pb-4 pt-2">
            <ul className="space-y-2">
              {tip.tips.map((tipText, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-2 text-sm text-[#212121]"
                >
                  <CheckCircle className="w-4 h-4 text-[#FF91A4] mt-0.5 flex-shrink-0" />
                  <span>{tipText}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </motion.div>
    );
  };

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
              <h1 className="text-xl font-bold text-[#212121]">Safety Center</h1>
              <p className="text-xs text-[#757575]">Your safety is our priority</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-3 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-lg font-bold text-[#212121] mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-[#FF91A4]" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={index}
                    onClick={action.action}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border-2 border-[#FFB6C1]/30 transition-all text-left ${action.color}`}
                  >
                    <Icon className="w-5 h-5 mb-2" />
                    <div className="text-sm font-semibold">{action.title}</div>
                    <div className="text-xs opacity-80 mt-0.5">{action.description}</div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Safety Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-lg font-bold text-[#212121] mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#FF91A4]" />
              Safety Guidelines
            </h2>
            <div className="space-y-3">
              {safetyTips.map((tip, index) => (
                <SafetyCard key={tip.id} tip={tip} index={index} />
              ))}
            </div>
          </motion.div>

          {/* Emergency Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="text-lg font-bold text-[#212121] mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#FF91A4]" />
              Emergency Resources
            </h2>
            <div className="space-y-3">
              {resources.map((resource, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white rounded-xl border-2 border-[#FFB6C1]/30 hover:border-[#FF91A4] transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {resource.type === 'phone' ? (
                      <Phone className="w-5 h-5 text-[#FF91A4]" />
                    ) : (
                      <MessageCircle className="w-5 h-5 text-[#FF91A4]" />
                    )}
                    <h3 className="text-sm font-semibold text-[#212121]">{resource.title}</h3>
                  </div>
                  <p className="text-sm text-[#757575] ml-8">{resource.contact}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Important Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-gradient-to-r from-[#FFE4E1] to-[#FFF0F5] rounded-xl border-2 border-[#FF91A4]"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#FF91A4] mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-[#212121] mb-1">Important Notice</h3>
                <p className="text-xs text-[#757575] leading-relaxed">
                  If you're in immediate danger, call your local emergency services (911 in US, 100 in India). 
                  Our safety features are designed to help, but they cannot replace emergency services in urgent situations.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <motion.button
              onClick={() => {
                // In real app, this would open support chat or email
                alert('Support: safety@datingapp.com\nWe respond within 24 hours.');
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full p-4 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              <span>Contact Safety Support</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

