import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Crown, Check, Sparkles, Heart, Eye, 
  Zap, Star, Infinity, Shield, X, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PremiumPage() {
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const savedPremium = localStorage.getItem('isPremium');
    if (savedPremium) {
      setIsPremium(JSON.parse(savedPremium) === true);
    }
  }, []);

  const plans = {
    monthly: {
      name: 'Monthly',
      price: 499,
      period: 'month',
      savings: null,
      popular: false
    },
    quarterly: {
      name: 'Quarterly',
      price: 1299,
      period: '3 months',
      savings: 'Save 13%',
      popular: true
    },
    yearly: {
      name: 'Yearly',
      price: 3999,
      period: 'year',
      savings: 'Save 33%',
      popular: false
    }
  };

  const features = [
    {
      icon: Infinity,
      title: 'Unlimited Likes',
      description: 'Like as many profiles as you want',
      color: 'text-[#FF91A4]'
    },
    {
      icon: Eye,
      title: 'See Who Liked You',
      description: 'View all profiles that liked you',
      color: 'text-[#FF91A4]'
    },
    {
      icon: Zap,
      title: 'Boost Your Profile',
      description: 'Get 10x more profile views',
      color: 'text-[#FF91A4]'
    },
    {
      icon: Star,
      title: 'Super Likes',
      description: 'Stand out with unlimited super likes',
      color: 'text-[#FF91A4]'
    },
    {
      icon: Sparkles,
      title: 'Read Receipts',
      description: 'See when your messages are read',
      color: 'text-[#FF91A4]'
    },
    {
      icon: Shield,
      title: 'Incognito Mode',
      description: 'Browse profiles without being seen',
      color: 'text-[#FF91A4]'
    },
    {
      icon: Heart,
      title: 'Priority Support',
      description: 'Get help from our team faster',
      color: 'text-[#FF91A4]'
    },
    {
      icon: Crown,
      title: 'Premium Badge',
      description: 'Show your premium status',
      color: 'text-[#FF91A4]'
    }
  ];

  const handleSubscribe = () => {
    // Simulate payment processing
    setTimeout(() => {
      setIsPremium(true);
      localStorage.setItem('isPremium', JSON.stringify(true));
      setShowSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/discover');
      }, 2000);
    }, 1500);
  };

  const currentPlan = plans[selectedPlan];

  if (isPremium && !showSuccess) {
    return (
      <div className="h-screen heart-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="w-20 h-20 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-[#212121] mb-2">You're Premium! 🎉</h2>
          <p className="text-sm text-[#757575] mb-6">
            You already have premium access. Enjoy all the features!
          </p>
          <motion.button
            onClick={() => navigate('/discover')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Go to Discover
          </motion.button>
        </motion.div>
      </div>
    );
  }

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
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 hover:bg-[#FFE4E1] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#212121]" />
            </motion.button>
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-lg flex items-center justify-center shadow-md">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#212121]">Go Premium</h1>
              <p className="text-xs text-[#757575]">Unlock unlimited possibilities</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-4 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
            >
              <Crown className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-[#212121] mb-2">Unlock Premium</h2>
            <p className="text-sm text-[#757575]">
              Get unlimited likes, see who liked you, and much more!
            </p>
          </motion.div>

          {/* Plan Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex gap-2 mb-4">
              {Object.entries(plans).map(([key, plan]) => (
                <motion.button
                  key={key}
                  onClick={() => setSelectedPlan(key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    selectedPlan === key
                      ? 'border-[#FF91A4] bg-[#FFE4E1]'
                      : 'border-[#FFB6C1]/30 bg-white hover:border-[#FF91A4]'
                  }`}
                >
                  <div className="text-sm font-semibold text-[#212121]">{plan.name}</div>
                  {plan.popular && (
                    <div className="text-xs text-[#FF91A4] font-medium mt-1">Most Popular</div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Selected Plan Card */}
            <motion.div
              key={selectedPlan}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] rounded-2xl p-6 border-2 border-[#FF91A4] shadow-lg"
            >
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-[#212121]">₹{currentPlan.price}</span>
                  <span className="text-sm text-[#757575]">/{currentPlan.period}</span>
                </div>
                {currentPlan.savings && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="inline-block px-3 py-1 bg-[#FF91A4] text-white rounded-full text-xs font-semibold"
                  >
                    {currentPlan.savings}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h3 className="text-lg font-bold text-[#212121] mb-4">Premium Features</h3>
            <div className="space-y-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl border-2 border-[#FFB6C1]/30 hover:border-[#FF91A4] transition-all"
                  >
                    <div className={`w-10 h-10 bg-[#FFE4E1] rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-[#212121] mb-1">{feature.title}</h4>
                      <p className="text-xs text-[#757575]">{feature.description}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-[#FF91A4] flex-shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Subscribe Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <motion.button
              onClick={handleSubscribe}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center gap-2"
            >
              <Crown className="w-6 h-6" />
              <span>Subscribe Now - ₹{currentPlan.price}/{currentPlan.period}</span>
            </motion.button>
            <p className="text-xs text-center text-[#757575] mt-3">
              Cancel anytime. Secure payment via Razorpay.
            </p>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-6 text-xs text-[#757575]"
          >
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>Trusted</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
                className="w-20 h-20 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-[#212121] mb-2">Welcome to Premium! 🎉</h3>
              <p className="text-sm text-[#757575] mb-6">
                You now have access to all premium features. Enjoy unlimited likes and more!
              </p>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-4xl mb-4"
              >
                ✨
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

