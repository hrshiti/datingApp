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
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F5] via-[#FFE4E1] to-[#FFF0F5] flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#FFD700]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFA500]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      {/* Enhanced Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-20 bg-gradient-to-b from-white via-white/98 to-white/95 backdrop-blur-lg border-b border-[#FFB6C1]/30 shadow-lg"
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-[#FFE4E1] rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#212121]" />
            </motion.button>
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-10 h-10 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FFD700] rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <Crown className="w-5 h-5 text-white relative z-10" />
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                Go Premium
              </h1>
              <p className="text-xs sm:text-sm text-[#757575] font-medium">Unlock unlimited possibilities</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-6 pb-24 relative z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FFD700] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent mb-3">
              Unlock Premium
            </h2>
            <p className="text-base sm:text-lg text-[#757575] font-medium">
              Get unlimited likes, see who liked you, and much more!
            </p>
          </motion.div>

          {/* Plan Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <div className="flex gap-3 mb-6">
              {Object.entries(plans).map(([key, plan]) => (
                <motion.button
                  key={key}
                  onClick={() => setSelectedPlan(key)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 p-4 rounded-2xl border-2 transition-all ${
                    selectedPlan === key
                      ? 'border-[#FF91A4] bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] shadow-lg'
                      : 'border-[#FFB6C1]/30 bg-white hover:border-[#FF91A4] shadow-md'
                  }`}
                >
                  <div className="text-sm font-bold text-[#212121] mb-1">{plan.name}</div>
                  {plan.popular && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs text-[#FF91A4] font-semibold"
                    >
                      Most Popular
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Selected Plan Card */}
            <motion.div
              key={selectedPlan}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-3xl p-6 sm:p-8 border-2 border-[#FF91A4] shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF91A4]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                    ₹{currentPlan.price}
                  </span>
                  <span className="text-base sm:text-lg text-[#757575] font-medium">/{currentPlan.period}</span>
                </div>
                {currentPlan.savings && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block px-4 py-2 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white rounded-full text-sm font-bold shadow-lg"
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
            className="mb-8"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-[#212121] mb-6 text-center">Premium Features</h3>
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="flex items-start gap-4 p-5 bg-gradient-to-br from-white to-[#FFF0F5] rounded-2xl border-2 border-[#FFB6C1]/30 hover:border-[#FF91A4] transition-all shadow-md hover:shadow-lg"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                    >
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </motion.div>
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-[#212121] mb-1">{feature.title}</h4>
                      <p className="text-sm text-[#757575]">{feature.description}</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-[#FF91A4] flex-shrink-0" />
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
            className="mb-8"
          >
            <motion.button
              onClick={handleSubscribe}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 sm:py-5 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white rounded-2xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center gap-3"
            >
              <Crown className="w-6 h-6 sm:w-7 sm:h-7" />
              <span>Subscribe Now - ₹{currentPlan.price}/{currentPlan.period}</span>
            </motion.button>
            <p className="text-sm text-center text-[#757575] mt-4 font-medium">
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

