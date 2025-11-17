import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, MoreVertical, Heart, MessageCircle, UserCircle, Users, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProfiles } from '../data/mockProfiles';

export default function ChatsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [matches, setMatches] = useState([]);
  const [chats, setChats] = useState([]);

  // Dummy chat data
  const dummyChats = [
    {
      id: 1,
      userId: 1,
      name: 'Priya',
      lastMessage: 'Hey! How are you doing?',
      timestamp: '2m ago',
      unread: 2,
      isOnline: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    },
    {
      id: 2,
      userId: 2,
      name: 'Rahul',
      lastMessage: 'Thanks for the match! 😊',
      timestamp: '1h ago',
      unread: 0,
      isOnline: false,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    {
      id: 3,
      userId: 3,
      name: 'Sneha',
      lastMessage: 'Would love to meet up!',
      timestamp: '3h ago',
      unread: 1,
      isOnline: true,
      avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100'
    },
    {
      id: 4,
      userId: 4,
      name: 'Vikram',
      lastMessage: 'Hey there! 👋',
      timestamp: 'Yesterday',
      unread: 0,
      isOnline: false,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'
    },
    {
      id: 5,
      userId: 5,
      name: 'Ananya',
      lastMessage: 'Great talking to you!',
      timestamp: '2 days ago',
      unread: 0,
      isOnline: false,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    }
  ];

  useEffect(() => {
    // Load matches from localStorage
    const savedMatches = localStorage.getItem('discoveryMatches');
    if (savedMatches) {
      try {
        const parsed = JSON.parse(savedMatches);
        if (parsed && parsed.length > 0) {
          setMatches(parsed);
        } else {
          // Set dummy matches if no real matches
          const dummyMatches = mockProfiles.slice(0, 8).map((profile) => ({
            userId: profile.id,
            matchedAt: new Date().toISOString()
          }));
          setMatches(dummyMatches);
        }
      } catch (e) {
        console.error('Error loading matches:', e);
        // Set dummy matches on error
        const dummyMatches = mockProfiles.slice(0, 8).map((profile) => ({
          userId: profile.id,
          matchedAt: new Date().toISOString()
        }));
        setMatches(dummyMatches);
      }
    } else {
      // Set dummy matches if no real matches
      const dummyMatches = mockProfiles.slice(0, 8).map((profile) => ({
        userId: profile.id,
        matchedAt: new Date().toISOString()
      }));
      setMatches(dummyMatches);
    }

    // Set dummy chats
    setChats(dummyChats);
  }, []);

  const handleChatClick = (chat) => {
    // Navigate to chat detail page
    navigate(`/chat/${chat.userId || chat.id}`, { state: { userId: chat.userId || chat.id, name: chat.name } });
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
        className="relative z-20 bg-white/95 backdrop-blur-md border-b-2 border-[#90CAF9] shadow-sm"
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => navigate('/discover')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 hover:bg-[#E7F3FF] rounded-lg transition-colors sm:hidden"
              >
                <ArrowLeft className="w-5 h-5 text-[#212121]" />
              </motion.button>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#1877F2]" />
                <h1 className="text-xl font-bold text-[#212121]">Chats</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-[#E7F3FF] rounded-lg transition-colors"
              >
                <Search className="w-5 h-5 text-[#212121]" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-[#E7F3FF] rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-[#212121]" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Matched Profiles Section - Always Visible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-base font-bold text-[#212121] mb-3 px-1">New Matches</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
              {matches.slice(0, 10).map((match, index) => {
                const profile = mockProfiles.find(p => p.id === match.userId);
                if (!profile) return null;
                
                return (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer"
                    onClick={() => handleChatClick({ userId: profile.id, name: profile.name })}
                  >
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1877F2] to-[#42A5F5] p-1">
                        <div className="w-full h-full rounded-full bg-white p-0.5">
                          <img
                            src={profile.photos?.[0] || `https://ui-avatars.com/api/?name=${profile.name}&background=FF1744&color=fff&size=100`}
                            alt={profile.name}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${profile.name}&background=FF1744&color=fff&size=100`;
                            }}
                          />
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#4CAF50] border-2 border-white rounded-full"></div>
                    </div>
                    <span className="text-xs font-semibold text-[#212121] text-center max-w-[80px] truncate">
                      {profile.name}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Chats List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-base font-bold text-[#212121] mb-3">Messages</h2>
            <div className="space-y-2">
              {chats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  onClick={() => handleChatClick(chat)}
                  className="bg-white rounded-xl p-4 shadow-sm border border-[#90CAF9]/20 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E7F3FF] to-[#F0F8FF] p-0.5">
                        <img
                          src={chat.avatar}
                          alt={chat.name}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${chat.name}&background=FF1744&color=fff&size=100`;
                          }}
                        />
                      </div>
                      {chat.isOnline && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#4CAF50] border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-bold text-[#212121] truncate">
                          {chat.name}
                        </h3>
                        <span className="text-xs text-[#757575] flex-shrink-0 ml-2">
                          {chat.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-[#757575] truncate flex-1">
                          {chat.lastMessage}
                        </p>
                        {chat.unread > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-[#1877F2] text-white text-xs font-bold rounded-full flex-shrink-0">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State if no chats */}
            {chats.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-[#E7F3FF] to-[#F0F8FF] rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-[#1877F2]" />
                </div>
                <h3 className="text-lg font-bold text-[#212121] mb-2">No messages yet</h3>
                <p className="text-sm text-[#757575]">
                  Start a conversation with your matches!
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom Navigation Bar - Mobile Only */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t-2 border-[#90CAF9]/30 shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {/* Profile */}
          <motion.button
            onClick={() => navigate('/profile')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors"
          >
            <UserCircle className={`w-5 h-5 ${location.pathname === '/profile' ? 'text-[#1877F2]' : 'text-[#212121]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/profile' ? 'text-[#1877F2]' : 'text-[#212121]'}`}>
              Profile
            </span>
          </motion.button>

          {/* Discover */}
          <motion.button
            onClick={() => navigate('/discover')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors"
          >
            <Sparkles className={`w-5 h-5 ${location.pathname === '/discover' ? 'text-[#1877F2]' : 'text-[#212121]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/discover' ? 'text-[#1877F2]' : 'text-[#212121]'}`}>
              Discover
            </span>
          </motion.button>

          {/* People */}
          <motion.button
            onClick={() => navigate('/discover')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors"
          >
            <Users className={`w-5 h-5 ${location.pathname === '/discover' ? 'text-[#1877F2]' : 'text-[#212121]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/discover' ? 'text-[#1877F2]' : 'text-[#212121]'}`}>
              People
            </span>
          </motion.button>

          {/* Liked You */}
          <motion.button
            onClick={() => navigate('/discover')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative"
          >
            <Heart className="w-5 h-5 text-[#212121]" />
            <span className="text-xs font-medium text-[#212121]">
              Liked You
            </span>
          </motion.button>

          {/* Chats */}
          <motion.button
            onClick={() => navigate('/chats')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative"
          >
            <MessageCircle className={`w-5 h-5 ${location.pathname === '/chats' ? 'text-[#1877F2]' : 'text-[#212121]'}`} />
            {matches.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1877F2] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {matches.length}
              </span>
            )}
            <span className={`text-xs font-medium ${location.pathname === '/chats' ? 'text-[#1877F2]' : 'text-[#212121]'}`}>
              Chats
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

