import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ChatBox.css';
import { 
  streamChatWithoutSession, 
  streamChatWithAuth,
  getStoredSessionId, 
  storeSessionId, 
  clearStoredSessionId,
  getChatHistory,
  getConversations,
  getApiBaseUrl 
} from '../services/chatApi';
import { isAuthenticated, getAccessToken } from '../services/authApi';
import { useToast } from './Toast';
import ChatProductCard from './ChatProductCard';
import ChatOrderCard from './ChatOrderCard';

// Default welcome message
const getWelcomeMessage = () => ({
  id: 1,
  text: "Xin chào! Tôi là trợ lý AI của nhà thuốc. Tôi có thể giúp gì cho bạn thuốc và sức khỏe?",
  sender: "bot",
  timestamp: new Date()
});

// Get file icon based on file type
const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎥';
  if (fileType.startsWith('audio/')) return '🎵';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️';
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('compressed')) return '🗜️';
  return '📎';
};

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('Guest');
  const toast = useToast();
  const [messages, setMessages] = useState([getWelcomeMessage()]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [currentConversationTitle, setCurrentConversationTitle] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [conversations, setConversations] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Đóng chatbox khi navigate sang trang khác
  useEffect(() => {
    const handleNavigateToProduct = () => {
      console.log('🔒 Closing chatbox due to navigation');
      setIsOpen(false);
    };

    window.addEventListener('navigateToProduct', handleNavigateToProduct);

    return () => {
      window.removeEventListener('navigateToProduct', handleNavigateToProduct);
    };
  }, []);

  // Auto scroll to bottom khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user info when opening chatbox
  useEffect(() => {
    if (isOpen) {
      const isAuth = isAuthenticated();
      setIsLoggedIn(isAuth);
      
      // Load user info from API if logged in
      if (isAuth) {
        fetchUserInfo();
        loadConversations();
      }
      
      // Check for stored session
      const storedSessionId = getStoredSessionId();
      if (storedSessionId && !currentSessionId) {
        setCurrentSessionId(storedSessionId);
        // Load chat history for this session
        loadChatHistory(storedSessionId);
      }
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen]);

  // Load conversations list for authenticated users
  const loadConversations = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        console.log('⚠️ No access token, skipping conversations load');
        return;
      }

      console.log('📡 Loading conversations for authenticated user...');
      const conversationsList = await getConversations(token);
      console.log('✅ Received conversations:', conversationsList);
      
      const formattedConversations = conversationsList.map(conv => ({
        id: conv.session_id || conv.id,
        title: conv.title || 'Untitled Conversation',
        active: (conv.session_id || conv.id) === currentSessionId,
        created_at: conv.created_at,
        updated_at: conv.updated_at
      }));
      
      console.log('✅ Formatted conversations:', formattedConversations);
      setConversations(formattedConversations);
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      setConversations([]); // Set empty array on error
    }
  };

  // Fetch user info from API
  const fetchUserInfo = async () => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const response = await fetch(
        `${getApiBaseUrl()}/auth/me`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Try to get name from different possible fields
        const name = data.data?.name || 
                    data.data?.full_name || 
                    data.data?.email?.split('@')[0] || 
                    data.name || 
                    data.full_name || 
                    data.email?.split('@')[0] || 
                    'Guest';
        setUserName(name);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      // Keep default name on error
    }
  };

  // Load chat history from session
  const loadChatHistory = async (sessionId) => {
    if (!sessionId) {
      console.warn('⚠️ No sessionId provided to loadChatHistory');
      return;
    }
    
    console.log('📡 Loading chat history for session:', sessionId);
    setIsLoadingHistory(true);
    
    try {
      // Get access token if user is logged in
      const token = isLoggedIn ? getAccessToken() : null;
      const historyData = await getChatHistory(sessionId, 50, token);
      
      console.log('📜 Chat history loaded:', historyData);
      
      if (historyData && historyData.messages && historyData.messages.length > 0) {
        // Convert history to message format
        const historyMessages = historyData.messages.map((msg, index) => {
          console.log('📝 Processing history message:', msg);
          
          // Extract products từ message
          let products = [];
          if (msg.products) {
            if (Array.isArray(msg.products)) {
              products = msg.products;
            } else if (msg.products.exact_matches) {
              // Xử lý cấu trúc products có exact_matches
              products = msg.products.exact_matches;
            } else if (typeof msg.products === 'object') {
              // Single product object
              products = [msg.products];
            }
          }
          
          // Extract orders từ message
          let orders = null;
          if (msg.orders) {
            orders = msg.orders;
          }
          
          console.log('✅ Extracted products:', products.length, products);
          console.log('✅ Extracted orders:', orders);
          
          return {
            id: Date.now() + index,
            text: msg.content || msg.message || msg.text,
            sender: msg.role === 'user' ? 'user' : 'bot',
            timestamp: new Date(msg.timestamp || msg.created_at || Date.now()),
            products: products,
            orders: orders
          };
        });
        
        console.log('✅ History messages with products:', historyMessages);
        
        // Add welcome message at the beginning if needed
        setMessages([getWelcomeMessage(), ...historyMessages]);
      } else {
        console.log('ℹ️ No messages in history, starting fresh');
        setMessages([getWelcomeMessage()]);
      }
    } catch (error) {
      console.error('❌ Error loading chat history:', error);
      // If history load fails, just start fresh with the session
      setMessages([getWelcomeMessage()]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Toggle chatbox
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Handle new chat - save current conversation and start fresh
  const handleNewChat = () => {
    // Lưu đoạn hội thoại hiện tại vào sidebar nếu có session và messages
    if (currentSessionId && messages.length > 1 && currentConversationTitle) {
      // Kiểm tra xem conversation đã tồn tại chưa
      const existingConv = conversations.find(c => c.id === currentSessionId);
      
      if (!existingConv) {
        // Thêm conversation mới vào đầu danh sách
        setConversations(prev => [
          { 
            id: currentSessionId, 
            title: currentConversationTitle, 
            active: false 
          },
          ...prev.map(c => ({ ...c, active: false }))
        ]);
      } else {
        // Cập nhật title nếu conversation đã tồn tại
        setConversations(prev => prev.map(c => ({
          ...c,
          active: false,
          title: c.id === currentSessionId ? currentConversationTitle : c.title
        })));
      }
    }
    
    // Clear session và bắt đầu cuộc mới
    clearStoredSessionId();
    setCurrentSessionId(null);
    setCurrentConversationTitle(null);
    setMessages([getWelcomeMessage()]);
  };

  // Handle loading a specific conversation by session ID
  const loadConversation = async (sessionId) => {
    if (!sessionId) return;
    
    setCurrentSessionId(sessionId);
    storeSessionId(sessionId);
    
    // Lấy title từ conversations list
    const conv = conversations.find(c => c.id === sessionId);
    if (conv && conv.title) {
      setCurrentConversationTitle(conv.title);
    }
    
    await loadChatHistory(sessionId);
  };

  // Handle conversation selection
  const handleConversationSelect = (sessionId) => {
    console.log('🔄 Conversation selected:', sessionId);
    console.log('🔄 Current sessionId:', currentSessionId);
    
    // Don't reload if selecting the same conversation
    if (currentSessionId === sessionId) {
      console.log('ℹ️ Same conversation already active');
      return;
    }
    
    // Lưu conversation hiện tại trước khi chuyển
    if (currentSessionId && messages.length > 1 && currentConversationTitle) {
      const existingConv = conversations.find(c => c.id === currentSessionId);
      if (!existingConv) {
        console.log('➕ Adding current conversation to list');
        setConversations(prev => [
          { id: currentSessionId, title: currentConversationTitle, active: false },
          ...prev
        ]);
      }
    }
    
    // Cập nhật active state
    console.log('🔄 Updating active conversation to:', sessionId);
    setConversations(conversations.map(conv => ({
      ...conv,
      active: conv.id === sessionId
    })));
    
    // Load the selected conversation
    loadConversation(sessionId);
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

  // Loại bỏ phần [Sản phẩm được đề xuất: ...] khỏi text (vì đã hiển thị dạng thẻ)
  const cleanProductRecommendationText = (content) => {
    if (!content) return content;
    // Loại bỏ block [Sản phẩm được đề xuất: ...]
    return content.replace(/\[Sản phẩm được đề xuất:[\s\S]*?\]/gi, '').trim();
  };

  // Render message với products được chèn vào {products} placeholder
  const renderMessageWithProducts = (message) => {
    console.log('🎨 renderMessageWithProducts called for message:', message.id, {
      hasText: !!message.text,
      products: message.products,
      productsLength: message.products?.length,
      orders: message.orders,
      ordersLength: Array.isArray(message.orders) ? message.orders.length : (message.orders ? 1 : 0),
      isStreaming: message.isStreaming
    });
    
    if (!message.text) return null;

    const hasProducts = message.products && message.products.length > 0 && !message.isStreaming;
    const hasOrders = message.orders && !message.isStreaming;
    const hasProductsPlaceholder = message.text.includes('{products}');
    const hasOrdersPlaceholder = message.text.includes('{orders}');

    console.log('🎨 Rendering message:', {
      hasProducts,
      productsCount: message.products?.length,
      productsList: message.products,
      hasOrders,
      ordersData: message.orders,
      hasProductsPlaceholder,
      hasOrdersPlaceholder,
      isStreaming: message.isStreaming
    });

    // Nếu có products và có placeholder {products}
    if (hasProducts && hasProductsPlaceholder) {
      const parts = message.text.split('{products}');
      console.log('✅ Rendering with placeholder, parts:', parts.length);
      
      return (
        <>
          {/* Phần text trước {products} */}
          {parts[0] && renderMessageContent(parts[0])}
          
          {/* Products grid tại vị trí {products} */}
          <div className="chat-products-separator">
            <span>🛍️ Sản phẩm tham khảo</span>
          </div>
          <div className="chat-products-grid">
            {message.products.map((product, index) => {
              const productKey = product.id || `product-${message.id}-${index}`;
              console.log('🎯 Rendering product card:', { productKey, product });
              return <ChatProductCard key={productKey} product={product} />;
            })}
          </div>
          
          {/* Phần text sau {products} nếu có */}
          {parts[1] && renderMessageContent(parts[1])}
          
          {/* Render orders nếu có */}
          {hasOrders && renderOrders(message.orders)}
        </>
      );
    }

    // Nếu có orders và có placeholder {orders}
    if (hasOrders && hasOrdersPlaceholder) {
      const parts = message.text.split('{orders}');
      console.log('✅ Rendering with orders placeholder, parts:', parts.length);
      
      return (
        <>
          {/* Phần text trước {orders} */}
          {parts[0] && renderMessageContent(parts[0])}
          
          {/* Orders tại vị trí {orders} */}
          {renderOrders(message.orders)}
          
          {/* Phần text sau {orders} nếu có */}
          {parts[1] && renderMessageContent(parts[1])}
          
          {/* Render products nếu có */}
          {hasProducts && (
            <>
              <div className="chat-products-separator">
                <span>🛍️ Sản phẩm tham khảo</span>
              </div>
              <div className="chat-products-grid">
                {message.products.map((product, index) => {
                  const productKey = product.id || `product-${message.id}-${index}`;
                  return <ChatProductCard key={productKey} product={product} />;
                })}
              </div>
            </>
          )}
        </>
      );
    }

    // Nếu có products nhưng không có placeholder, hiển thị text trước, products sau
    if (hasProducts && !hasProductsPlaceholder) {
      console.log('✅ Rendering products after text');
      return (
        <>
          {renderMessageContent(message.text)}
          <div className="chat-products-separator">
            <span>🛍️ Sản phẩm tham khảo</span>
          </div>
          <div className="chat-products-grid">
            {message.products.map((product, index) => {
              const productKey = product.id || `product-${message.id}-${index}`;
              console.log('🎯 Rendering product card:', { productKey, product });
              return <ChatProductCard key={productKey} product={product} />;
            })}
          </div>
          {hasOrders && renderOrders(message.orders)}
        </>
      );
    }

    // Nếu có orders nhưng không có placeholder
    if (hasOrders && !hasOrdersPlaceholder) {
      console.log('✅ Rendering orders after text');
      return (
        <>
          {renderMessageContent(message.text)}
          {renderOrders(message.orders)}
        </>
      );
    }

    // Không có products, chỉ render text bình thường
    console.log('ℹ️ No products, rendering text only');
    return renderMessageContent(message.text);
  };

  // Render orders list
  const renderOrders = (orders) => {
    if (!orders) return null;
    
    // Convert orders to array if it's an object with orders property
    let ordersList = [];
    if (Array.isArray(orders)) {
      ordersList = orders;
    } else if (orders.orders && Array.isArray(orders.orders)) {
      ordersList = orders.orders;
    } else if (orders.data && Array.isArray(orders.data)) {
      ordersList = orders.data;
    } else {
      // Single order object
      ordersList = [orders];
    }

    if (ordersList.length === 0) return null;

    console.log('📦 Rendering orders:', ordersList.length, ordersList);

    return (
      <>
        <div className="chat-products-separator">
          <span>📦 Đơn hàng của bạn</span>
        </div>
        <div className="chat-orders-grid">
          {ordersList.map((order, index) => {
            const orderKey = order.id || `order-${index}`;
            return <ChatOrderCard key={orderKey} order={order} />;
          })}
        </div>
      </>
    );
  };

  // Render nội dung tin nhắn với định dạng
  const renderMessageContent = (content) => {
    if (!content) return null;

    // Loại bỏ phần product recommendation nếu đã có products
    const cleanedContent = cleanProductRecommendationText(content);
    if (!cleanedContent) return null;

    // Tách nội dung thành các phần (paragraphs, headings, lists)
    const lines = cleanedContent.split('\n');
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
      products: [],
      orders: null
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(true);

    // Dùng ref để tránh re-render mỗi chunk
    const streamingTextRef = { current: '' };
    let lastUpdateTime = 0;
    const UPDATE_INTERVAL = 50; // Cập nhật UI tối đa 20 lần/giây

    try {
      // Determine which API to use based on login status
      const streamFunction = isLoggedIn ? streamChatWithAuth : streamChatWithoutSession;
      const accessToken = isLoggedIn ? getAccessToken() : null;

      // Gọi API streaming với session ID
      if (isLoggedIn && accessToken) {
        await streamChatWithAuth(
          userMessageText,
          accessToken,
          currentSessionId,
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
          // onMetadata - khi nhận metadata (session_id, title)
          (metadata) => {
            if (metadata.sessionId) {
              setCurrentSessionId(metadata.sessionId);
            }
            if (metadata.title) {
              setCurrentConversationTitle(metadata.title);
            }
            // Nếu có title mới, cập nhật hoặc thêm vào danh sách conversations
            if (metadata.title && isLoggedIn) {
              setConversations(prev => {
                const existing = prev.find(c => c.id === metadata.sessionId);
                if (existing) {
                  return prev.map(c => 
                    c.id === metadata.sessionId 
                      ? { ...c, title: metadata.title, active: true }
                      : { ...c, active: false }
                  );
                } else {
                  return [
                    { id: metadata.sessionId, title: metadata.title, active: true },
                    ...prev.map(c => ({ ...c, active: false }))
                  ];
                }
              });
            }
          },
          // onProduct - khi nhận sản phẩm gợi ý
          (product, allProducts) => {
            console.log('🛍️ [AUTH] onProduct callback - received products:', allProducts?.length, allProducts);
            // Cập nhật products ngay lập tức
            setMessages(prev => prev.map(msg => {
              if (msg.id === botMessageId) {
                console.log('🛍️ [AUTH] Updating message with products:', allProducts);
                return { ...msg, products: allProducts };
              }
              return msg;
            }));
          },
          // onComplete - khi stream kết thúc
          (data) => {
            console.log('🏁 [AUTH] Stream completed, data.products:', data.products?.length, data.products);
            console.log('🏁 [AUTH] Stream completed, data.orders:', data.orders);
            // Update session ID from response
            if (data.sessionId) {
              setCurrentSessionId(data.sessionId);
            }
            
            setMessages(prev => prev.map(msg => 
              msg.id === botMessageId 
                ? { 
                    ...msg, 
                    text: data.text, 
                    products: data.products || [],
                    orders: data.orders || null,
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
      } else {
        await streamChatWithoutSession(
          userMessageText,
          currentSessionId,
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
          // onMetadata - khi nhận metadata (session_id, title)
          (metadata) => {
            if (metadata.sessionId) {
              setCurrentSessionId(metadata.sessionId);
            }
            if (metadata.title) {
              setCurrentConversationTitle(metadata.title);
            }
          },
          // onProduct - khi nhận sản phẩm gợi ý
          (product, allProducts) => {
            console.log('🛍️ [NO-AUTH] onProduct callback - received products:', allProducts?.length, allProducts);
            // Cập nhật products ngay lập tức
            setMessages(prev => prev.map(msg => {
              if (msg.id === botMessageId) {
                console.log('🛍️ [NO-AUTH] Updating message with products:', allProducts);
                return { ...msg, products: allProducts };
              }
              return msg;
            }));
          },
          // onComplete - khi stream kết thúc
          (data) => {
            console.log('🏁 [NO-AUTH] Stream completed, data.products:', data.products?.length, data.products);
            console.log('🏁 [NO-AUTH] Stream completed, data.orders:', data.orders);
            // Update session ID from response
            if (data.sessionId) {
              setCurrentSessionId(data.sessionId);
            }
            
            setMessages(prev => prev.map(msg => 
              msg.id === botMessageId 
                ? { 
                    ...msg, 
                    text: data.text, 
                    products: data.products || [],
                    orders: data.orders || null,
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
      }
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
      </button>

      {/* Overlay */}
      {isOpen && <div className="chatbox-overlay" onClick={toggleChat}></div>}

      {/* Chat Window */}
      {isOpen && (
        <div className={`chatbox-container ${!isLoggedIn ? 'no-sidebar' : ''}`} onClick={(e) => e.stopPropagation()}>
          {/* Sidebar - Only show when logged in */}
          {isLoggedIn && <div className="chatbox-sidebar">

            <button className="chatbox-new-chat-btn" onClick={handleNewChat}>
              Cuộc trò chuyện mới
            </button>

            {conversations.length > 0 && (
              <div className="chatbox-conversation-list">
                <div className="chatbox-conversation-section">
                  <h3 className="chatbox-conversation-section-title">Cuộc hội thoại</h3>
                  {conversations.map((conv) => (
                    <div 
                      key={conv.id}
                      className={`chatbox-conversation-item ${conv.active ? 'active' : ''}`}
                      onClick={() => handleConversationSelect(conv.id)}
                    >
                      <span className="chatbox-conversation-item-text">{conv.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="chatbox-sidebar-footer">
              <div className="chatbox-user-info">
                <div className="chatbox-user-avatar">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="chatbox-user-details">
                  <h4 className="chatbox-user-name">{userName}</h4>
                </div>
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
                  <h3 className="chatbox-title">Trợ lí nhà thuốc</h3>
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
              {/* Loading history indicator */}
              {isLoadingHistory && (
                <div className="message message-bot">
                  <div className="message-content loading-history">
                  </div>
                </div>
              )}
              
              {!isLoadingHistory && messages.map((message) => {
                // Ẩn message bot khi đang streaming và chưa có text
                if (message.isStreaming && !message.text) {
                  return null;
                }
                
                return (
                <div 
                  key={message.id} 
                  className={`message ${message.sender === 'user' ? 'message-user' : 'message-bot'}`}
                >
                  <div className={`message-content ${message.isStreaming ? 'streaming' : ''} ${message.isError ? 'error' : ''}`}>
                    {/* Render message với products được chèn đúng vị trí */}
                    {message.text && renderMessageWithProducts(message)}
                    
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
              );
              })}
              
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
              <input
                ref={inputRef}
                type="text"
                className="chatbox-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
              />
              
              <button 
                type="submit"
                className="chatbox-send-btn"
                disabled={inputMessage.trim() === ''}
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
