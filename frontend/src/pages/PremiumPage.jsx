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
      color: 'text-[#64B5F6]'
    },
    {
      icon: Eye,
      title: 'See Who Liked You',
      description: 'View all profiles that liked you',
      color: 'text-[#64B5F6]'
    },
    {
      icon: Zap,
      title: 'Boost Your Profile',
      description: 'Get 10x more profile views',
      color: 'text-[#64B5F6]'
    },
    {
      icon: Star,
      title: 'Super Likes',
      description: 'Stand out with unlimited super likes',
      color: 'text-[#64B5F6]'
    },
    {
      icon: Sparkles,
      title: 'Read Receipts',
      description: 'See when your messages are read',
      color: 'text-[#64B5F6]'
    },
    {
      icon: Shield,
      title: 'Incognito Mode',
      description: 'Browse profiles without being seen',
      color: 'text-[#64B5F6]'
    },
    {
      icon: Heart,
      title: 'Priority Support',
      description: 'Get help from our team faster',
      color: 'text-[#64B5F6]'
    },
    {
      icon: Crown,
      title: 'Premium Badge',
      description: 'Show your premium status',
      color: 'text-[#64B5F6]'
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
      <div className="h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-8 max-w-md w-full text-center border border-[#E8E8E8]"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="w-20 h-20 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2 tracking-tight">You're Premium! 🎉</h2>
          <p className="text-sm text-[#616161] mb-6 font-medium">
            You already have premium access. Enjoy all the features!
          </p>
          <motion.button
            onClick={() => navigate('/discover')}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-6 py-3 bg-[#64B5F6] hover:bg-[#42A5F5] text-white rounded-xl font-semibold shadow-[0_4px_16px_rgba(100,181,246,0.3)] hover:shadow-[0_8px_24px_rgba(100,181,246,0.4)] transition-all"
          >
            Go to Discover
          </motion.button>
        </motion.div>
      </div>
    );
  }

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
        className="relative z-20 backdrop-blur-xl bg-white/80 border-b border-[#E0E0E0]/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate(-1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 hover:bg-[#F5F5F5] rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-[#616161]" />
            </motion.button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
                Go Premium
              </h1>
              <p className="text-xs sm:text-sm text-[#757575] font-medium mt-0.5">Unlock unlimited possibilities</p>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] tracking-tight mb-3">
              Unlock Premium
            </h2>
            <p className="text-base sm:text-lg text-[#616161] font-medium">
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
                  className={`flex-1 p-4 rounded-2xl border transition-all ${
                    selectedPlan === key
                      ? 'border-[#64B5F6] bg-white shadow-[0_4px_16px_rgba(100,181,246,0.2)]'
                      : 'border-[#E8E8E8] bg-white hover:border-[#64B5F6] shadow-sm'
                  }`}
                >
                  <div className="text-sm font-bold text-[#1A1A1A] mb-1 tracking-tight">{plan.name}</div>
                  {plan.popular && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs text-[#64B5F6] font-semibold"
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
              className="bg-white rounded-3xl p-6 sm:p-8 border border-[#64B5F6] shadow-[0_8px_32px_rgba(100,181,246,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#64B5F6]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-5xl sm:text-6xl font-bold text-[#1A1A1A] tracking-tight">
                    ₹{currentPlan.price}
                  </span>
                  <span className="text-base sm:text-lg text-[#616161] font-medium">/{currentPlan.period}</span>
                </div>
                {currentPlan.savings && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block px-4 py-2 bg-[#64B5F6] text-white rounded-full text-sm font-bold shadow-[0_4px_12px_rgba(100,181,246,0.3)]"
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
            <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] mb-6 text-center tracking-tight">Premium Features</h3>
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-[#E8E8E8] hover:border-[#64B5F6] transition-all shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
                  >
                    <Icon className={`w-5 h-5 ${feature.color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-[#1A1A1A] mb-1 tracking-tight">{feature.title}</h4>
                      <p className="text-sm text-[#616161] font-medium">{feature.description}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-[#64B5F6] flex-shrink-0 mt-0.5" />
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
              className="w-full py-4 sm:py-5 bg-[#64B5F6] hover:bg-[#42A5F5] text-white rounded-2xl font-bold text-lg sm:text-xl shadow-[0_8px_24px_rgba(100,181,246,0.3)] hover:shadow-[0_12px_32px_rgba(100,181,246,0.4)] transition-all flex items-center justify-center gap-3"
            >
              <Crown className="w-6 h-6 sm:w-7 sm:h-7" />
              <span>Subscribe Now - ₹{currentPlan.price}/{currentPlan.period}</span>
            </motion.button>
            <p className="text-sm text-center text-[#616161] mt-4 font-medium">
              Cancel anytime. Secure payment via Razorpay.
            </p>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-6 text-xs text-[#616161] font-medium"
          >
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-[#64B5F6]" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-[#64B5F6]" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-[#64B5F6]" />
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
              className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-8 max-w-sm w-full text-center border border-[#E8E8E8]"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6 }}
                className="w-20 h-20 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2 tracking-tight">Welcome to Premium! 🎉</h3>
              <p className="text-sm text-[#616161] mb-6 font-medium">
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

