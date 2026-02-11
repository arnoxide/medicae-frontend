import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Search, MessageCircle, Users, Phone, Video, Paperclip, MoreVertical, Check, CheckCheck } from 'lucide-react';

type MessageStatus = 'sent' | 'delivered' | 'read';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  status: MessageStatus;
  isOwn: boolean;
}

interface Conversation {
  id: string;
  name: string;
  type: 'direct' | 'group';
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  members?: string[];
}

export default function TeamChat() {
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState<string | null>('1');
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const conversations: Conversation[] = [
    {
      id: '1',
      name: 'Dr. Sarah Jones',
      type: 'direct',
      avatar: 'SJ',
      lastMessage: 'Patient in room 3 needs consultation',
      lastMessageTime: '2 min ago',
      unreadCount: 2,
      online: true
    },
    {
      id: '2',
      name: 'Nursing Team',
      type: 'group',
      avatar: 'NT',
      lastMessage: 'Shift handover at 3pm',
      lastMessageTime: '15 min ago',
      unreadCount: 0,
      online: true,
      members: ['Dr. Smith', 'Nurse Emily', 'Nurse Michael']
    },
    {
      id: '3',
      name: 'Dr. Michael Chen',
      type: 'direct',
      avatar: 'MC',
      lastMessage: 'Thanks for the referral',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      online: false
    },
    {
      id: '4',
      name: 'Emergency Team',
      type: 'group',
      avatar: 'ET',
      lastMessage: 'All clear, back to normal operations',
      lastMessageTime: '2 hours ago',
      unreadCount: 5,
      online: true,
      members: ['Dr. Smith', 'Dr. Jones', 'Nurse Emily', 'Admin Lisa']
    },
  ];

  const messages: Record<string, Message[]> = {
    '1': [
      {
        id: 'm1',
        senderId: '2',
        senderName: 'Dr. Sarah Jones',
        content: 'Hi, I need your input on the patient in room 3',
        timestamp: '10:30 AM',
        status: 'read',
        isOwn: false
      },
      {
        id: 'm2',
        senderId: '1',
        senderName: 'Dr. Smith',
        content: 'Sure, let me check the chart. What are the main concerns?',
        timestamp: '10:32 AM',
        status: 'read',
        isOwn: true
      },
      {
        id: 'm3',
        senderId: '2',
        senderName: 'Dr. Sarah Jones',
        content: 'Patient in room 3 needs consultation',
        timestamp: '10:35 AM',
        status: 'delivered',
        isOwn: false
      },
    ],
    '2': [
      {
        id: 'm4',
        senderId: '3',
        senderName: 'Nurse Emily',
        content: 'Reminder: Shift handover meeting at 3pm today',
        timestamp: '9:45 AM',
        status: 'read',
        isOwn: false
      },
    ],
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentConversation = conversations.find(c => c.id === selectedConversation);
  const currentMessages = selectedConversation ? (messages[selectedConversation] || []) : [];

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // In a real app, this would send the message to the backend
      setMessageInput('');
    }
  };

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'sent': return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered': return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read': return <CheckCheck className="w-3 h-3 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/clinic')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Communication</h1>
              <p className="text-gray-600 mt-1">Internal messaging for staff coordination</p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-900/5 border border-gray-100/50 overflow-hidden h-[calc(100vh-200px)] flex">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-100 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 bg-gray-50 text-sm"
                />
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                      conversation.type === 'group' ? 'bg-gradient-to-br from-purple-600 to-purple-700' : 'bg-gradient-to-br from-blue-600 to-blue-700'
                    }`}>
                      {conversation.avatar}
                    </div>
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{conversation.name}</h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{conversation.lastMessageTime}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-blue-600 to-blue-700 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {conversation.unreadCount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {currentConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                      currentConversation.type === 'group' ? 'bg-gradient-to-br from-purple-600 to-purple-700' : 'bg-gradient-to-br from-blue-600 to-blue-700'
                    }`}>
                      {currentConversation.avatar}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900">{currentConversation.name}</h2>
                      {currentConversation.type === 'group' ? (
                        <p className="text-xs text-gray-500">{currentConversation.members?.length} members</p>
                      ) : (
                        <p className="text-xs text-gray-500">{currentConversation.online ? 'Online' : 'Offline'}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Phone className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Video className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
                  {currentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-md ${message.isOwn ? 'order-2' : 'order-1'}`}>
                        {!message.isOwn && (
                          <p className="text-xs font-medium text-gray-600 mb-1 ml-3">{message.senderName}</p>
                        )}
                        <div className={`rounded-2xl px-4 py-2.5 ${
                          message.isOwn
                            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${message.isOwn ? 'justify-end' : 'justify-start'} ml-3`}>
                          <span className="text-xs text-gray-500">{message.timestamp}</span>
                          {message.isOwn && getStatusIcon(message.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex items-end gap-3">
                    <button className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                      <Paperclip className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex-1 relative">
                      <textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 resize-none shadow-sm"
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Conversation</h3>
                  <p className="text-gray-600">Choose a team member or group to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
