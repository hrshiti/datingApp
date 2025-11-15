import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, MoreVertical, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProfiles } from '../data/mockProfiles';

export default function ChatDetailPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [profile, setProfile] = useState(null);

  // Dummy messages data
  const dummyMessages = [
    {
      id: 1,
      senderId: parseInt(userId) || 1,
      text: 'Hey! How are you doing?',
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      isSent: false
    },
    {
      id: 2,
      senderId: 'current',
      text: "Hi! I'm doing great, thanks for asking! 😊",
      timestamp: new Date(Date.now() - 1 * 60000).toISOString(),
      isSent: true
    },
    {
      id: 3,
      senderId: parseInt(userId) || 1,
      text: 'That\'s awesome! Would you like to meet up sometime?',
      timestamp: new Date(Date.now() - 30 * 1000).toISOString(),
      isSent: false
    },
    {
      id: 4,
      senderId: 'current',
      text: 'Sure! I\'d love to. When are you free?',
      timestamp: new Date().toISOString(),
      isSent: true
    }
  ];

  useEffect(() => {
    // Load profile data
    const chatUserId = userId ? parseInt(userId) : location.state?.userId || 1;
    const foundProfile = mockProfiles.find(p => p.id === chatUserId);
    if (foundProfile) {
      setProfile(foundProfile);
    } else {
      // Fallback to first profile
      setProfile(mockProfiles[0]);
    }

    // Load messages (for now using dummy)
    setMessages(dummyMessages);
  }, [userId, location.state]);

  useEffect(() => {
    // Scroll to bottom when messages change
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 150);
    return () => clearTimeout(timer);
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    } else if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      senderId: 'current',
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isSent: true
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate reply after 2 seconds
    setTimeout(() => {
      const replies = [
        'That sounds great!',
        'I agree!',
        'Thanks for letting me know!',
        'Looking forward to it!',
        'Perfect! 😊'
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      const replyMessage = {
        id: messages.length + 2,
        senderId: parseInt(userId) || 1,
        text: randomReply,
        timestamp: new Date().toISOString(),
        isSent: false
      };
      setMessages(prev => [...prev, replyMessage]);
    }, 2000);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!profile) {
    return (
      <div className="h-screen heart-background flex items-center justify-center">
        <div className="text-[#212121]">Loading...</div>
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

      {/* Header - Fixed at Top */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-[#FFB3BA] shadow-sm"
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => navigate('/chats')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 hover:bg-[#FFE5E5] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#212121]" />
              </motion.button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF1744] to-[#FF6B9D] p-0.5">
                    <img
                      src={profile.photos?.[0] || `https://ui-avatars.com/api/?name=${profile.name}&background=FF1744&color=fff&size=100`}
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${profile.name}&background=FF1744&color=fff&size=100`;
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#4CAF50] border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#212121]">{profile.name}</h1>
                  <p className="text-xs text-[#757575]">Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-[#FFE5E5] rounded-lg transition-colors"
              >
                <Heart className="w-5 h-5 text-[#FF1744]" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 hover:bg-[#FFE5E5] rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-[#212121]" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages Area - Scrollable */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scrollbar-hide pt-16 pb-20" 
        style={{ minHeight: 0 }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="space-y-3 pb-4">
            {messages.map((message, index) => {
              const showAvatar = index === 0 || messages[index - 1].isSent !== message.isSent;
              const showTime = index === messages.length - 1 || 
                new Date(message.timestamp).getTime() - new Date(messages[index + 1].timestamp).getTime() > 300000; // 5 minutes

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-end gap-2 ${message.isSent ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar - Only show for received messages */}
                  {!message.isSent && (
                    <div className="flex-shrink-0 w-8 h-8">
                      {showAvatar ? (
                        <img
                          src={profile.photos?.[0] || `https://ui-avatars.com/api/?name=${profile.name}&background=FF1744&color=fff&size=100`}
                          alt={profile.name}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${profile.name}&background=FF1744&color=fff&size=100`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full"></div>
                      )}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${message.isSent ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl ${
                        message.isSent
                          ? 'bg-gradient-to-r from-[#FF1744] to-[#FF6B9D] text-white rounded-tr-sm'
                          : 'bg-white text-[#212121] border border-[#FFB3BA]/30 rounded-tl-sm'
                      } shadow-sm`}
                    >
                      <p className="text-sm leading-relaxed break-words">{message.text}</p>
                    </div>
                    {showTime && (
                      <span className={`text-xs text-[#757575] mt-1 px-1 ${message.isSent ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.timestamp)}
                      </span>
                    )}
                  </div>

                  {/* Spacer for sent messages */}
                  {message.isSent && (
                    <div className="flex-shrink-0 w-8 h-8"></div>
                  )}
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t-2 border-[#FFB3BA]/30 shadow-lg pb-4 sm:pb-3 pt-2">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-[#FFE5E5] border-2 border-[#FFB3BA]/30 rounded-xl text-[#212121] placeholder-[#757575] focus:outline-none focus:border-[#FF1744] transition-all"
            />
            <motion.button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-xl transition-all ${
                newMessage.trim()
                  ? 'bg-gradient-to-r from-[#FF1744] to-[#FF6B9D] text-white shadow-md hover:shadow-lg'
                  : 'bg-[#E0E0E0] text-[#757575] cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

