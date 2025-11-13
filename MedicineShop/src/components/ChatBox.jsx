import React, { useState, useRef, useEffect } from 'react';
import './ChatBox.css';

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi có thể giúp gì cho bạn?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
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

  // Focus vào input khi mở chatbox
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Toggle chatbox
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Xử lý chọn file
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} quá lớn. Kích thước tối đa là 10MB.`);
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

  // Xử lý gửi tin nhắn
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (inputMessage.trim() === '' && selectedFiles.length === 0) return;

    // Thêm tin nhắn của user
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
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

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setSelectedFiles([]);

    // Giả lập bot đang gõ
    setIsTyping(true);

    // Giả lập phản hồi từ bot sau 1-2 giây
    setTimeout(() => {
      let botResponse = '';
      
      if (selectedFiles.length > 0) {
        botResponse = `Cảm ơn bạn đã gửi ${selectedFiles.length} file. Tôi đã nhận được và sẽ xem xét để hỗ trợ bạn tốt nhất. `;
      }
      
      botResponse += generateBotResponse(inputMessage || 'file');
      
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: "bot",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  // Hàm tạo phản hồi từ bot (có thể thay bằng API thực)
  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Các câu trả lời mẫu
    if (input.includes('giá') || input.includes('bao nhiêu')) {
      return "Để biết giá chính xác của sản phẩm, bạn vui lòng cho tôi biết tên sản phẩm bạn quan tâm nhé!";
    } else if (input.includes('đặt hàng') || input.includes('mua')) {
      return "Để đặt hàng, bạn có thể thêm sản phẩm vào giỏ hàng và tiến hành thanh toán. Tôi có thể hỗ trợ thêm gì không?";
    } else if (input.includes('giao hàng') || input.includes('ship')) {
      return "Chúng tôi giao hàng toàn quốc trong 2-3 ngày. Miễn phí ship cho đơn hàng từ 300.000đ. Bạn cần thêm thông tin gì không?";
    } else if (input.includes('tư vấn') || input.includes('hỏi')) {
      return "Tôi sẵn sàng tư vấn cho bạn! Bạn muốn hỏi về sản phẩm nào hoặc vấn đề sức khỏe gì?";
    } else if (input.includes('cảm ơn') || input.includes('thanks')) {
      return "Rất vui được hỗ trợ bạn! Nếu còn thắc mắc gì, đừng ngại hỏi tôi nhé! 😊";
    } else if (input.includes('chào') || input.includes('hello') || input.includes('hi')) {
      return "Xin chào! Tôi là trợ lý ảo của Nhà Thuốc Long Châu. Tôi có thể giúp gì cho bạn hôm nay?";
    } else {
      return "Cảm ơn câu hỏi của bạn! Để được tư vấn chi tiết hơn, bạn có thể liên hệ hotline: 1800-6928 hoặc để lại câu hỏi cụ thể, tôi sẽ cố gắng hỗ trợ bạn.";
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
        aria-label="Chat với dược sĩ"
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

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbox-container">
          {/* Header */}
          <div className="chatbox-header">
            <div className="chatbox-header-info">
              <div className="chatbox-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <h3 className="chatbox-title">Chat với Dược Sĩ</h3>
                <span className="chatbox-status">
                  <span className="status-dot"></span>
                  Đang hoạt động
                </span>
              </div>
            </div>
            <div className="chatbox-header-actions">
              <button 
                className="chatbox-header-btn"
                onClick={() => window.open('/contact', '_blank')}
                title="Mở trong cửa sổ mới"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M19 19H5V5H12V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V12H19V19ZM14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14Z" fill="currentColor"/>
                </svg>
              </button>
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
                <div className="message-content">
                  {message.text && <p>{message.text}</p>}
                  
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
                  
                  <span className="message-time">{formatTime(message.timestamp)}</span>
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
              placeholder="Gửi yêu cầu..."
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
      )}
    </div>
  );
}
