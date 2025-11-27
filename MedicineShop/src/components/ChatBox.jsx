import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatBox.css';
import { streamChatWithoutSession } from '../services/chatApi';
import { isAuthenticated } from '../services/authApi';
import { useToast } from './Toast';
import ChatProductCard from './ChatProductCard';

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const toast = useToast();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi là CHAT A.I+ - trợ lý ảo thông minh của bạn. Tôi có thể giúp gì cho bạn hôm nay?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [conversations, setConversations] = useState([
    { id: 1, title: "Create Chatbot GPT", active: true },
    { id: 2, title: "Apply To Leave For Emergency", active: false },
    { id: 3, title: "What Is UI UX Design?", active: false },
    { id: 4, title: "Create POS System", active: false },
    { id: 5, title: "What is UX Audit?", active: false },
    { id: 6, title: "How Chat GPT Work?", active: false }
  ]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto scroll to bottom khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus vào input khi mở chatbox và check authentication
  useEffect(() => {
    if (isOpen) {
      setIsLoggedIn(isAuthenticated());
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen]);

  // Toggle chatbox
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Handle new chat
  const handleNewChat = () => {
    setMessages([
      {
        id: 1,
        text: "Xin chào! Tôi là CHAT A.I+ - trợ lý ảo thông minh của bạn. Tôi có thể giúp gì cho bạn hôm nay?",
        sender: "bot",
        timestamp: new Date()
      }
    ]);
  };

  // Handle conversation selection
  const handleConversationSelect = (id) => {
    setConversations(conversations.map(conv => ({
      ...conv,
      active: conv.id === id
    })));
  };

  // Xử lý chọn file
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.warning(`File ${file.name} quá lớn. Kích thước tối đa là 10MB.`);
        return false;
      }
      return true;
    });

    // Create file previews
    const newFiles = validFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  // Xóa file đã chọn
  const removeFile = (fileId) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file icon based on type
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('zip') || type.includes('rar')) return '🗜️';
    return '📎';
  };

  // Render nội dung tin nhắn với định dạng
  const renderMessageContent = (content) => {
    if (!content) return null;

    // Tách nội dung thành các phần (paragraphs, headings, lists)
    const lines = content.split('\n');
    const elements = [];
    let currentList = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        // Thêm list hiện tại nếu có
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="chat-message-list">
              {currentList.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          );
          currentList = [];
        }
        return;
      }

      // Heading (###)
      if (trimmedLine.startsWith('###')) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="chat-message-list">
              {currentList.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <h3 key={`heading-${index}`} className="chat-message-heading">
            {trimmedLine.replace(/^###\s*/, '')}
          </h3>
        );
        return;
      }

      // Heading (**)
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.length > 4) {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`list-${index}`} className="chat-message-list">
              {currentList.map((item, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          );
          currentList = [];
        }
        elements.push(
          <strong key={`bold-${index}`} className="chat-message-bold">
            {trimmedLine.replace(/^\*\*|\*\*$/g, '')}
          </strong>
        );
        return;
      }

      // List item (số hoặc dấu -)
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s*(.+)/);
      const bulletMatch = trimmedLine.match(/^[-•]\s*(.+)/);
      
      if (numberedMatch || bulletMatch) {
        const itemContent = numberedMatch ? numberedMatch[2] : bulletMatch[1];
        // Parse bold text trong list item
        const formattedContent = itemContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        currentList.push(formattedContent);
        return;
      }

      // Paragraph thông thường
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${index}`} className="chat-message-list">
            {currentList.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
            ))}
          </ul>
        );
        currentList = [];
      }

      // Parse bold text trong paragraph
      const formattedLine = trimmedLine.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      elements.push(
        <p key={`para-${index}`} className="chat-message-paragraph" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });

    // Thêm list cuối cùng nếu có
    if (currentList.length > 0) {
      elements.push(
        <ul key="list-final" className="chat-message-list">
          {currentList.map((item, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      );
    }

    return <div className="chat-message-formatted">{elements}</div>;
  };

  // Xử lý gửi tin nhắn
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (inputMessage.trim() === '' && selectedFiles.length === 0) return;

    const userMessageText = inputMessage;

    // Thêm tin nhắn của user
    const userMessage = {
      id: Date.now(),
      text: userMessageText,
      sender: "user",
      timestamp: new Date(),
      files: selectedFiles.length > 0 ? selectedFiles.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        preview: f.preview
      })) : null
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSelectedFiles([]);

    // Tạo message placeholder cho bot
    const botMessageId = Date.now() + 1;
    const botMessage = {
      id: botMessageId,
      text: "",
      sender: "bot",
      timestamp: new Date(),
      isStreaming: true,
      products: []
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(true);

    // Dùng ref để tránh re-render mỗi chunk
    const streamingTextRef = { current: '' };
    let lastUpdateTime = 0;
    const UPDATE_INTERVAL = 50; // Cập nhật UI tối đa 20 lần/giây

    try {
      // Gọi API streaming
      await streamChatWithoutSession(
        userMessageText,
        // onChunk - throttled update để giảm re-render
        (chunk, fullText) => {
          streamingTextRef.current = fullText;
          
          const now = Date.now();
          if (now - lastUpdateTime >= UPDATE_INTERVAL) {
            lastUpdateTime = now;
            setMessages(prev => prev.map(msg => 
              msg.id === botMessageId 
                ? { ...msg, text: fullText }
                : msg
            ));
          }
        },
        // onComplete - khi stream kết thúc
        (data) => {
          setMessages(prev => prev.map(msg => 
            msg.id === botMessageId 
              ? { 
                  ...msg, 
                  text: data.text, 
                  products: data.products || [],
                  isStreaming: false 
                }
              : msg
          ));
          setIsTyping(false);
        },
        // onError - xử lý lỗi
        (error) => {
          console.error('Chat error:', error);
          setMessages(prev => prev.map(msg => 
            msg.id === botMessageId 
              ? { 
                  ...msg, 
                  text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
                  isStreaming: false,
                  isError: true
                }
              : msg
          ));
          setIsTyping(false);
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === botMessageId 
          ? { 
              ...msg, 
              text: "Xin lỗi, không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
              isStreaming: false,
              isError: true
            }
          : msg
      ));
      setIsTyping(false);
    }
  };

  // Format thời gian
  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chatbox-wrapper">
      {/* Chat Button */}
      <button 
        className={`chat-toggle-btn ${isOpen ? 'active' : ''}`}
        onClick={toggleChat}
        aria-label="Chat với trợ lý AI"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
            <circle cx="8" cy="9" r="1.5" fill="white"/>
            <circle cx="12" cy="9" r="1.5" fill="white"/>
            <circle cx="16" cy="9" r="1.5" fill="white"/>
          </svg>
        )}
        {!isOpen && <span className="chat-notification-badge">1</span>}
      </button>

      {/* Overlay */}
      {isOpen && <div className="chatbox-overlay" onClick={toggleChat}></div>}

      {/* Chat Window */}
      {isOpen && (
        <div className={`chatbox-container ${!isLoggedIn ? 'no-sidebar' : ''}`} onClick={(e) => e.stopPropagation()}>
          {/* Sidebar - Only show when logged in */}
          {isLoggedIn && <div className="chatbox-sidebar">
            <div className="chatbox-sidebar-header">
              <h2 className="chatbox-sidebar-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                </svg>
                CHAT A.I+
              </h2>
              <p className="chatbox-sidebar-subtitle">Trợ lý AI thông minh</p>
            </div>

            <button className="chatbox-new-chat-btn" onClick={handleNewChat}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              New chat
            </button>

            <div className="chatbox-conversation-list">
              <div className="chatbox-conversation-section">
                <h3 className="chatbox-conversation-section-title">Your conversations</h3>
                {conversations.slice(0, 1).map((conv) => (
                  <div 
                    key={conv.id}
                    className={`chatbox-conversation-item ${conv.active ? 'active' : ''}`}
                    onClick={() => handleConversationSelect(conv.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"/>
                    </svg>
                    <span className="chatbox-conversation-item-text">{conv.title}</span>
                  </div>
                ))}
              </div>

              <div className="chatbox-conversation-section">
                <h3 className="chatbox-conversation-section-title">Last 7 Days</h3>
                {conversations.slice(1).map((conv) => (
                  <div 
                    key={conv.id}
                    className={`chatbox-conversation-item ${conv.active ? 'active' : ''}`}
                    onClick={() => handleConversationSelect(conv.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"/>
                    </svg>
                    <span className="chatbox-conversation-item-text">{conv.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="chatbox-sidebar-footer">
              <div className="chatbox-user-info">
                <div className="chatbox-user-avatar">AN</div>
                <div className="chatbox-user-details">
                  <h4 className="chatbox-user-name">Andrew Nelson</h4>
                </div>
                <svg className="chatbox-settings-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </div>
            </div>
          </div>}

          {/* Main Chat Area */}
          <div className="chatbox-main">
            {/* Header */}
            <div className="chatbox-header">
              <div className="chatbox-header-info">
                <div className="chatbox-avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor"/>
                  </svg>
                </div>
                <div>
                  <h3 className="chatbox-title">CHAT A.I+</h3>
                  <span className="chatbox-status">
                    <span className="status-dot"></span>
                    Đang hoạt động
                  </span>
                </div>
              </div>
              <div className="chatbox-header-actions">
                <button 
                  className="chatbox-header-btn"
                  onClick={toggleChat}
                  title="Đóng"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="chatbox-messages">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}
                >
                  <div className={`message-content ${message.isStreaming ? 'streaming' : ''} ${message.isError ? 'error' : ''}`}>
                    {message.text && renderMessageContent(message.text)}
                    
                    {/* Display products */}
                    {message.products && message.products.length > 0 && !message.isStreaming && (
                      <div className="chat-products-grid">
                        {message.products.map((product) => (
                          <ChatProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    )}
                    
                    {/* Display attached files */}
                    {message.files && message.files.length > 0 && (
                      <div className="message-files">
                        {message.files.map((file) => (
                          <div key={file.id} className="message-file-item">
                            {file.preview ? (
                              <img 
                                src={file.preview} 
                                alt={file.name}
                                className="message-file-image"
                              />
                            ) : (
                              <div className="message-file-icon">
                                <span>{getFileIcon(file.type)}</span>
                                <div className="message-file-info">
                                  <span className="message-file-name">{file.name}</span>
                                  <span className="message-file-size">{formatFileSize(file.size)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {!message.isStreaming && <span className="message-time">{formatTime(message.timestamp)}</span>}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="message message-bot">
                  <div className="message-content typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* File preview before sending */}
            {selectedFiles.length > 0 && (
              <div className="file-preview-container">
                <div className="file-preview-header">
                  <span>Đã chọn {selectedFiles.length} file</span>
                  <button 
                    className="clear-all-files-btn"
                    onClick={() => setSelectedFiles([])}
                  >
                    Xóa tất cả
                  </button>
                </div>
                <div className="file-preview-list">
                  {selectedFiles.map((file) => (
                    <div key={file.id} className="file-preview-item">
                      {file.preview ? (
                        <img src={file.preview} alt={file.name} className="file-preview-image" />
                      ) : (
                        <div className="file-preview-icon">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                      <div className="file-preview-info">
                        <span className="file-preview-name">{file.name}</span>
                        <span className="file-preview-size">{formatFileSize(file.size)}</span>
                      </div>
                      <button 
                        className="remove-file-btn"
                        onClick={() => removeFile(file.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form className="chatbox-input-container" onSubmit={handleSendMessage}>
              <button 
                type="button"
                className="chatbox-attach-btn"
                title="Menu"
                onClick={() => setShowMenu(!showMenu)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z" fill="currentColor"/>
                </svg>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              
              <button 
                type="button"
                className="chatbox-attach-btn"
                title="Đính kèm file"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M16.5 6V17.5C16.5 19.71 14.71 21.5 12.5 21.5C10.29 21.5 8.5 19.71 8.5 17.5V5C8.5 3.62 9.62 2.5 11 2.5C12.38 2.5 13.5 3.62 13.5 5V15.5C13.5 16.05 13.05 16.5 12.5 16.5C11.95 16.5 11.5 16.05 11.5 15.5V6H10V15.5C10 16.88 11.12 18 12.5 18C13.88 18 15 16.88 15 15.5V5C15 2.79 13.21 1 11 1C8.79 1 7 2.79 7 5V17.5C7 20.54 9.46 23 12.5 23C15.54 23 18 20.54 18 17.5V6H16.5Z" fill="currentColor"/>
                </svg>
              </button>

              <input
                ref={inputRef}
                type="text"
                className="chatbox-input"
                placeholder="What's in your mind?..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              
              <button 
                type="submit"
                className="chatbox-send-btn"
                disabled={inputMessage.trim() === '' && selectedFiles.length === 0}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
