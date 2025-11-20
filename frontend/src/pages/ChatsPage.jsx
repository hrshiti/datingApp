import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Search, MoreVertical, Heart, MessageCircle, UserCircle, Users, Sparkles, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProfiles } from '../data/mockProfiles';

export default function ChatsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [matches, setMatches] = useState([]);
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

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
            ...profile,
            userId: profile.id,
            matchedAt: new Date().toISOString()
          }));
          setMatches(dummyMatches);
        }
      } catch (e) {
        console.error('Error loading matches:', e);
        // Set dummy matches on error
        const dummyMatches = mockProfiles.slice(0, 8).map((profile) => ({
          ...profile,
          userId: profile.id,
          matchedAt: new Date().toISOString()
        }));
        setMatches(dummyMatches);
      }
    } else {
      // Set dummy matches if no real matches
      const dummyMatches = mockProfiles.slice(0, 8).map((profile) => ({
        ...profile,
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

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMatches = matches.filter(match => {
    const profile = mockProfiles.find(p => p.id === match.userId);
    return profile && profile.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

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

      {/* Left Sidebar Navigation - Desktop Only (Instagram Style) */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-16 bg-white border-r border-[#E0E0E0] z-30 flex-col items-center justify-center py-4">
        <div className="flex flex-col items-center gap-2">
          {/* Profile */}
          <motion.button
            onClick={() => navigate('/profile')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-12 h-12 transition-colors relative group"
          >
            <UserCircle className={`w-6 h-6 ${location.pathname === '/profile' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            {location.pathname === '/profile' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF91A4] rounded-r-full"></div>
            )}
          </motion.button>

          {/* Discover */}
          <motion.button
            onClick={() => navigate('/discover')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-12 h-12 transition-colors relative group"
          >
            <Sparkles className={`w-6 h-6 ${location.pathname === '/discover' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            {location.pathname === '/discover' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF91A4] rounded-r-full"></div>
            )}
          </motion.button>

          {/* People */}
          <motion.button
            onClick={() => navigate('/people')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-12 h-12 transition-colors relative group"
          >
            <Users className={`w-6 h-6 ${location.pathname === '/people' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            {location.pathname === '/people' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF91A4] rounded-r-full"></div>
            )}
          </motion.button>

          {/* Liked You */}
          <motion.button
            onClick={() => navigate('/liked-you')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-12 h-12 transition-colors relative group"
          >
            <Heart className={`w-6 h-6 ${location.pathname === '/liked-you' ? 'text-[#FF91A4] fill-[#FF91A4]' : 'text-[#212121]'}`} />
            {location.pathname === '/liked-you' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF91A4] rounded-r-full"></div>
            )}
          </motion.button>

          {/* Chats */}
          <motion.button
            onClick={() => navigate('/chats')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-12 h-12 transition-colors relative group"
          >
            <MessageCircle className={`w-6 h-6 ${location.pathname === '/chats' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            {location.pathname === '/chats' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF91A4] rounded-r-full"></div>
            )}
          </motion.button>
        </div>
      </div>

      {/* Header - Fixed */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-30 bg-gradient-to-b from-white via-white/98 to-white/95 backdrop-blur-lg border-b-2 border-[#FFB6C1]/30 shadow-lg"
      >
        <div className="max-w-2xl mx-auto px-4 py-4 sm:py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => navigate('/discover')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-[#FFE4E1] rounded-xl transition-colors sm:hidden"
              >
                <ArrowLeft className="w-5 h-5 text-[#212121]" />
              </motion.button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                  Chats
                </h1>
                <p className="text-xs text-[#757575] font-medium">
                  {chats.length} {chats.length === 1 ? 'conversation' : 'conversations'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setShowSearch(!showSearch)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] hover:from-[#FF91A4] hover:to-[#FF69B4] rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <Search className={`w-5 h-5 ${showSearch ? 'text-white' : 'text-[#FF91A4]'} transition-colors`} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] hover:from-[#FF91A4] hover:to-[#FF69B4] rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <MoreVertical className="w-5 h-5 text-[#FF91A4] transition-colors" />
              </motion.button>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#757575]" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#FFB6C1]/30 rounded-xl focus:outline-none focus:border-[#FF91A4] transition-all text-[#212121] placeholder-[#757575]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Content - with padding for fixed header */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24 pt-24 sm:pt-28 md:ml-16">
        <div className="max-w-2xl mx-auto px-4 py-5">
          {/* Matched Profiles Section */}
          {filteredMatches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] flex items-center justify-center shadow-md border border-[#FFB6C1]/20">
                    <Heart className="w-5 h-5 text-[#FF91A4]" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                    New Matches
                  </h2>
                </div>
                <span className="text-xs font-semibold text-[#757575] bg-[#FFE4E1] px-3 py-1 rounded-full">
                  {filteredMatches.length}
                </span>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-3 -mx-1 px-1">
                {filteredMatches.slice(0, 10).map((match, index) => {
                  const profile = mockProfiles.find(p => p.id === match.userId);
                  if (!profile) return null;
                  
                  return (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer"
                      onClick={() => handleChatClick({ userId: profile.id, name: profile.name })}
                    >
                      <div className="relative">
                        <motion.div
                          whileHover={{ rotate: 5 }}
                          className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF91A4] to-[#FF69B4] p-1 shadow-xl"
                        >
                          <div className="w-full h-full rounded-full bg-white p-1">
                            <img
                              src={profile.photos?.[0] || `https://ui-avatars.com/api/?name=${profile.name}&background=FF1744&color=fff&size=100`}
                              alt={profile.name}
                              className="w-full h-full rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${profile.name}&background=FF1744&color=fff&size=100`;
                              }}
                            />
                          </div>
                        </motion.div>
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#4CAF50] border-3 border-white rounded-full shadow-lg"
                        ></motion.div>
                      </div>
                      <span className="text-xs font-semibold text-[#212121] text-center max-w-[90px] truncate">
                        {profile.name}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Chats List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] flex items-center justify-center shadow-md border border-[#FFB6C1]/20">
                  <MessageCircle className="w-5 h-5 text-[#FF91A4]" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent">
                  Messages
                </h2>
              </div>
              {chats.filter(c => c.unread > 0).length > 0 && (
                <span className="text-xs font-semibold text-white bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] px-3 py-1 rounded-full">
                  {chats.filter(c => c.unread > 0).length} new
                </span>
              )}
            </div>
            
            {filteredChats.length > 0 ? (
              <div className="space-y-3">
                {filteredChats.map((chat, index) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChatClick(chat)}
                    className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-2xl p-4 shadow-lg border-2 border-[#FFB6C1]/30 hover:border-[#FF91A4] hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <motion.div
                          whileHover={{ rotate: 5 }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFE4E1] to-[#FFF0F5] p-1 shadow-md"
                        >
                          <img
                            src={chat.avatar}
                            alt={chat.name}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${chat.name}&background=FF1744&color=fff&size=100`;
                            }}
                          />
                        </motion.div>
                        {chat.isOnline && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute bottom-0 right-0 w-5 h-5 bg-[#4CAF50] border-3 border-white rounded-full shadow-lg"
                          ></motion.div>
                        )}
                      </div>

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <h3 className="text-base font-bold text-[#212121] truncate group-hover:text-[#FF91A4] transition-colors">
                            {chat.name}
                          </h3>
                          <span className="text-xs text-[#757575] flex-shrink-0 ml-2 font-medium">
                            {chat.timestamp}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-[#757575] truncate flex-1 group-hover:text-[#212121] transition-colors">
                            {chat.lastMessage}
                          </p>
                          {chat.unread > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-2 px-2.5 py-1 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white text-xs font-bold rounded-full flex-shrink-0 shadow-lg"
                            >
                              {chat.unread}
                            </motion.span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-white to-[#FFF0F5] rounded-3xl p-12 text-center shadow-xl border-2 border-[#FFB6C1]/20"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  className="w-24 h-24 bg-gradient-to-br from-[#FFE4E1] via-[#FFF0F5] to-[#FFE4E1] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <MessageCircle className="w-12 h-12 text-[#FF91A4]" />
                </motion.div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] bg-clip-text text-transparent mb-3">
                  {searchQuery ? 'No results found' : 'No messages yet'}
                </h3>
                <p className="text-sm text-[#757575] mb-6">
                  {searchQuery 
                    ? 'Try a different search term'
                    : 'Start a conversation with your matches!'}
                </p>
                {!searchQuery && matches.length > 0 && (
                  <motion.button
                    onClick={() => navigate('/discover')}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white rounded-xl font-semibold hover:shadow-xl transition-all shadow-lg"
                  >
                    Find More Matches
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom Navigation Bar - Mobile Only */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-white via-white/98 to-white/95 backdrop-blur-lg border-t-2 border-[#FFB6C1]/30 shadow-2xl">
        <div className="flex items-center justify-around px-2 py-2">
          {/* Profile */}
          <motion.button
            onClick={() => navigate('/profile')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors"
          >
            <UserCircle className={`w-5 h-5 ${location.pathname === '/profile' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/profile' ? 'text-[#FF91A4]' : 'text-[#212121]'}`}>
              Profile
            </span>
          </motion.button>

          {/* Discover */}
          <motion.button
            onClick={() => navigate('/discover')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors"
          >
            <Sparkles className={`w-5 h-5 ${location.pathname === '/discover' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/discover' ? 'text-[#FF91A4]' : 'text-[#212121]'}`}>
              Discover
            </span>
          </motion.button>

          {/* People */}
          <motion.button
            onClick={() => navigate('/people')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors"
          >
            <Users className={`w-5 h-5 ${location.pathname === '/people' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/people' ? 'text-[#FF91A4]' : 'text-[#212121]'}`}>
              People
            </span>
          </motion.button>

          {/* Liked You */}
          <motion.button
            onClick={() => navigate('/liked-you')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative"
          >
            <Heart className={`w-5 h-5 ${location.pathname === '/liked-you' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
            <span className={`text-xs font-medium ${location.pathname === '/liked-you' ? 'text-[#FF91A4]' : 'text-[#212121]'}`}>
              Liked You
            </span>
          </motion.button>

          {/* Chats */}
          <motion.button
            onClick={() => navigate('/chats')}
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors relative"
          >
            <div className="relative inline-block">
              <MessageCircle className={`w-5 h-5 ${location.pathname === '/chats' ? 'text-[#FF91A4]' : 'text-[#212121]'}`} />
              {chats.filter(c => c.unread > 0).length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-r from-[#FF91A4] to-[#FF69B4] text-white text-[10px] rounded-full flex items-center justify-center font-bold transform translate-x-1/2 -translate-y-1/2">
                  {chats.filter(c => c.unread > 0).length}
                </span>
              )}
            </div>
            <span className={`text-xs font-medium ${location.pathname === '/chats' ? 'text-[#FF91A4]' : 'text-[#212121]'}`}>
              Chats
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
