import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, MoreVertical, Heart, Shield, User, Camera, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockProfiles } from '../data/mockProfiles';
import ReportBlockModal from '../components/ReportBlockModal';

export default function ChatDetailPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [profile, setProfile] = useState(null);
  const [showReportBlockModal, setShowReportBlockModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

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

    // Generate dummy messages based on the chat user ID
    const dummyMessages = [
      {
        id: 1,
        senderId: chatUserId,
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
        senderId: chatUserId,
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

  const handleReport = (reason) => {
    // Store reported user in localStorage
    const reportedUsers = JSON.parse(localStorage.getItem('reportedUsers') || '[]');
    const alreadyReported = reportedUsers.some(r => r.userId === profile.id);
    if (!alreadyReported) {
      reportedUsers.push({
        userId: profile.id,
        userName: profile.name,
        reason: reason,
        reportedAt: new Date().toISOString()
      });
      localStorage.setItem('reportedUsers', JSON.stringify(reportedUsers));
      alert(`Thank you for reporting. We'll review this profile.`);
    } else {
      alert('You have already reported this user.');
    }
    setShowReportBlockModal(false);
  };

  const handleBlock = () => {
    // Store blocked user in localStorage
    const blockedUsers = JSON.parse(localStorage.getItem('blockedUsers') || '[]');
    if (!blockedUsers.includes(profile.id)) {
      blockedUsers.push(profile.id);
      localStorage.setItem('blockedUsers', JSON.stringify(blockedUsers));
    }
    alert(`${profile.name} has been blocked.`);
    // Navigate back to chats
    navigate('/chats');
  };

  if (!profile) {
    return (
      <div className="h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-[#64B5F6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#1A1A1A] font-medium">Loading chat...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#F5F7FA] via-[#E8ECF1] to-[#F5F7FA] flex flex-col relative overflow-hidden">
      {/* Premium Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-[#64B5F6]/8 to-transparent rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-[#42A5F5]/8 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      {/* Premium Header - Fixed with Glassmorphism */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-30 backdrop-blur-xl bg-white/80 border-b border-[#E0E0E0]/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <motion.button
                onClick={() => navigate('/chats')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 hover:bg-[#F5F5F5] rounded-xl transition-all duration-200 flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-[#616161]" />
              </motion.button>
              
              {/* Profile Info - Clickable */}
              <motion.div
                onClick={() => navigate('/people', { state: { showUserId: profile.id } })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
              >
                <div className="relative flex-shrink-0">
                  <motion.div
                    whileHover={{ rotate: 5 }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-[#64B5F6] to-[#42A5F5] p-1 shadow-[0_4px_16px_rgba(100,181,246,0.3)]"
                  >
                    <img
                      src={profile.photos?.[0] || `https://ui-avatars.com/api/?name=${profile.name}&background=64B5F6&color=fff&size=100`}
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${profile.name}&background=64B5F6&color=fff&size=100`;
                      }}
                    />
                  </motion.div>
                  {isOnline && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#4CAF50] border-3 border-white rounded-full shadow-lg"
                    ></motion.div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-[#1A1A1A] truncate tracking-tight">
                    {profile.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#4CAF50]' : 'bg-[#757575]'}`}
                    ></motion.div>
                    <p className="text-xs text-[#757575] font-medium">
                      {isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            <div className="flex items-center gap-2 relative flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-white border border-[#E0E0E0] text-[#616161] hover:border-[#64B5F6] rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                <Heart className="w-5 h-5" />
              </motion.button>
              <div className="relative">
                <motion.button
                  onClick={() => setShowMenu(!showMenu)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 bg-white border border-[#E0E0E0] text-[#616161] hover:border-[#64B5F6] rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  <MoreVertical className="w-5 h-5" />
                </motion.button>
                
                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#E8E8E8] overflow-hidden z-40"
                    >
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          navigate('/people', { state: { showUserId: profile.id } });
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors flex items-center gap-3 text-[#1A1A1A] border-b border-[#E8E8E8]"
                      >
                        <User className="w-4 h-4 text-[#64B5F6]" />
                        <span className="text-sm font-medium">View Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowReportBlockModal(true);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors flex items-center gap-3 text-[#1A1A1A]"
                      >
                        <Shield className="w-4 h-4 text-[#64B5F6]" />
                        <span className="text-sm font-medium">Report & Block</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages Area - Scrollable */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto scrollbar-hide pt-20 pb-24" 
        style={{ minHeight: 0 }}
      >
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="space-y-4 pb-4">
            {messages.map((message, index) => {
              const showAvatar = index === 0 || messages[index - 1].isSent !== message.isSent;
              const showTime = index === messages.length - 1 || 
                new Date(message.timestamp).getTime() - new Date(messages[index + 1].timestamp).getTime() > 300000; // 5 minutes

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.03, type: "spring", stiffness: 300, damping: 25 }}
                  className={`flex items-end gap-3 ${message.isSent ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar - Only show for received messages */}
                  {!message.isSent && (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      onClick={() => navigate('/people', { state: { showUserId: profile.id } })}
                      className="flex-shrink-0 w-10 h-10 cursor-pointer"
                    >
                      {showAvatar ? (
                        <img
                          src={profile.photos?.[0] || `https://ui-avatars.com/api/?name=${profile.name}&background=64B5F6&color=fff&size=100`}
                          alt={profile.name}
                          className="w-full h-full rounded-full object-cover border-2 border-[#E8E8E8] shadow-sm"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${profile.name}&background=64B5F6&color=fff&size=100`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full"></div>
                      )}
                    </motion.div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${message.isSent ? 'items-end' : 'items-start'} max-w-[75%] sm:max-w-[65%]`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className={`px-4 py-3 rounded-2xl ${
                        message.isSent
                          ? 'bg-[#64B5F6] text-white rounded-tr-sm shadow-[0_4px_12px_rgba(100,181,246,0.3)]'
                          : 'bg-white text-[#1A1A1A] border border-[#E8E8E8] rounded-tl-sm shadow-sm'
                      }`}
                    >
                      <p className="text-sm sm:text-base leading-relaxed break-words font-medium">{message.text}</p>
                    </motion.div>
                    {showTime && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-xs text-[#757575] mt-1.5 px-2 font-medium ${message.isSent ? 'text-right' : 'text-left'}`}
                      >
                        {formatTime(message.timestamp)}
                      </motion.span>
                    )}
                  </div>

                  {/* Spacer for sent messages */}
                  {message.isSent && (
                    <div className="flex-shrink-0 w-10 h-10"></div>
                  )}
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl bg-white/80 border-t border-[#E0E0E0]/50 shadow-[0_-8px_32px_rgba(0,0,0,0.06)] pb-4 sm:pb-3 pt-3">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex items-end gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-white border border-[#E0E0E0] text-[#616161] hover:border-[#64B5F6] rounded-xl shadow-sm hover:shadow-md transition-all flex-shrink-0"
            >
              <ImageIcon className="w-5 h-5" />
            </motion.button>
            <div className="flex-1 relative">
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
                className="w-full px-4 py-3.5 bg-white border border-[#E0E0E0] rounded-2xl text-[#1A1A1A] placeholder-[#757575] focus:outline-none focus:border-[#64B5F6] transition-all shadow-sm font-medium"
              />
            </div>
            <motion.button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              whileHover={newMessage.trim() ? { scale: 1.05 } : {}}
              whileTap={newMessage.trim() ? { scale: 0.95 } : {}}
              className={`p-3.5 rounded-2xl transition-all flex-shrink-0 ${
                newMessage.trim()
                  ? 'bg-[#64B5F6] hover:bg-[#42A5F5] text-white shadow-[0_4px_16px_rgba(100,181,246,0.3)] hover:shadow-[0_8px_24px_rgba(100,181,246,0.4)]'
                  : 'bg-[#E0E0E0] text-[#757575] cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Report/Block Modal */}
      <ReportBlockModal
        isOpen={showReportBlockModal}
        onClose={() => {
          setShowReportBlockModal(false);
          setShowMenu(false);
        }}
        userName={profile?.name || 'User'}
        onReport={handleReport}
        onBlock={handleBlock}
      />

      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
