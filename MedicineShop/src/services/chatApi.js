// Chat API Configuration
const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || 'https://unendowed-placably-aviana.ngrok-free.dev';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

// Session storage key
const SESSION_STORAGE_KEY = 'chat_session_id';

/**
 * Parse tên sản phẩm từ text response của AI
 * Tìm pattern [Sản phẩm được đề xuất: ...] hoặc các tên sản phẩm trong list
 * @param {string} text - Text response từ AI
 * @returns {string[]} - Mảng tên sản phẩm
 */
export const parseProductNamesFromText = (text) => {
  if (!text) return [];
  
  const productNames = [];
  
  // Pattern 1: [Sản phẩm được đề xuất: name1: {products}\n name2: {products}]
  const recommendedMatch = text.match(/\[Sản phẩm được đề xuất:([\s\S]*?)\]/i);
  if (recommendedMatch) {
    const content = recommendedMatch[1];
    // Tách từng dòng và lấy tên (phần trước dấu :)
    const lines = content.split('\n').filter(line => line.trim());
    for (const line of lines) {
      // Lấy phần trước ": {products}" hoặc trước dấu : cuối cùng
      const match = line.match(/^(.+?):\s*\{products\}/i) || line.match(/^(.+?):\s*$/);
      if (match) {
        const name = match[1].trim();
        if (name && name.length > 5) {
          productNames.push(name);
        }
      }
    }
  }
  
  // Pattern 2: Bullet list với • hoặc -
  const bulletMatches = text.matchAll(/[•\-]\s*([^•\-\n]+)/g);
  for (const match of bulletMatches) {
    const name = match[1].trim();
    // Chỉ lấy nếu tên đủ dài và không chứa các từ khóa không phải sản phẩm
    if (name.length > 10 && !name.includes('Bạn có muốn') && !name.includes('?')) {
      // Loại bỏ phần mô tả sau dấu phẩy nếu quá dài
      const shortName = name.split(',')[0].trim();
      if (!productNames.includes(shortName) && !productNames.includes(name)) {
        productNames.push(shortName.length > 15 ? shortName : name);
      }
    }
  }
  
  return [...new Set(productNames)]; // Loại bỏ trùng lặp
};

/**
 * Search sản phẩm từ API backend dựa trên tên
 * @param {string} productName - Tên sản phẩm cần tìm
 * @returns {Promise<Object|null>} - Product object hoặc null
 */
export const searchProductByName = async (productName) => {
  try {
    // Lấy từ khóa chính từ tên sản phẩm (lấy 3-4 từ đầu)
    const keywords = productName.split(' ').slice(0, 4).join(' ');
    
    const response = await fetch(`${API_BASE_URL}/products/search?keyword=${encodeURIComponent(keywords)}&limit=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.success && data.data?.products?.length > 0) {
      // Tìm sản phẩm có tên khớp nhất
      const products = data.data.products;
      
      // So sánh tên để tìm sản phẩm phù hợp nhất
      const normalizedSearch = productName.toLowerCase();
      
      for (const product of products) {
        const normalizedName = product.name.toLowerCase();
        // Nếu tên chứa từ khóa search hoặc ngược lại
        if (normalizedName.includes(normalizedSearch.slice(0, 20)) || 
            normalizedSearch.includes(normalizedName.slice(0, 20))) {
          return product;
        }
      }
      
      // Fallback: trả về sản phẩm đầu tiên nếu có kết quả
      return products[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error searching product:', error);
    return null;
  }
};

/**
 * Search nhiều sản phẩm từ danh sách tên
 * @param {string[]} productNames - Mảng tên sản phẩm
 * @returns {Promise<Object[]>} - Mảng products tìm được
 */
export const searchProductsByNames = async (productNames) => {
  if (!productNames || productNames.length === 0) return [];
  
  const results = await Promise.all(
    productNames.map(name => searchProductByName(name))
  );
  
  // Lọc bỏ null và loại trùng theo id
  const validProducts = results.filter(p => p !== null);
  const uniqueProducts = [];
  const seenIds = new Set();
  
  for (const product of validProducts) {
    if (!seenIds.has(product.id)) {
      seenIds.add(product.id);
      uniqueProducts.push(product);
    }
  }
  
  return uniqueProducts;
};

/**
 * Get API base URL from environment
 * @returns {string} - API base URL
 */
export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

/**
 * Get current session ID from localStorage
 * @returns {string|null} - Session ID or null
 */
export const getStoredSessionId = () => {
  return localStorage.getItem(SESSION_STORAGE_KEY);
};

/**
 * Store session ID to localStorage
 * @param {string} sessionId - Session ID to store
 */
export const storeSessionId = (sessionId) => {
  if (sessionId) {
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
};

/**
 * Clear stored session ID
 */
export const clearStoredSessionId = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

/**
 * Get chat history for a session
 * @param {string} sessionId - Session ID
 * @param {number} limit - Number of messages to fetch (default 50)
 * @returns {Promise<Array>} - Array of messages
 */
export const getChatHistory = async (sessionId, limit = 50) => {
  try {
    const response = await fetch(`${AI_BASE_URL}/chat/sessions/${sessionId}/history?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📜 getChatHistory response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

/**
 * Stream chat without session (for non-logged in users)
 * Hỗ trợ cấu trúc response mới với 3 loại type:
 * - metadata: chứa session_id và title cho đoạn hội thoại
 * - text: chứa các chunk text response
 * - product: chứa thông tin sản phẩm gợi ý
 * 
 * @param {string} message - User message
 * @param {string|null} sessionId - Optional session ID for continuing conversation
 * @param {Function} onChunk - Callback for each word/token of response
 * @param {Function} onMetadata - Callback when metadata received (session_id, title)
 * @param {Function} onProduct - Callback when product received
 * @param {Function} onComplete - Callback when stream completes with full message data
 * @param {Function} onError - Callback for errors
 */
export const streamChatWithoutSession = async (message, sessionId, onChunk, onMetadata, onProduct, onComplete, onError) => {
  try {
    const requestBody = { message };
    
    // Add session_id if provided
    if (sessionId) {
      requestBody.session_id = sessionId;
    }

    const response = await fetch(`${AI_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let buffer = '';
    const textChunks = [];
    const productsMap = new Map();
    let responseSessionId = sessionId;
    let conversationTitle = null;

    // Helper function để parse và xử lý line
    const processLine = (line) => {
      if (!line || !line.startsWith('data: ')) return;
      
      try {
        const data = JSON.parse(line.slice(6));
        
        console.log('📦 Stream data type:', data.type, data); // Debug
        
        // Xử lý theo type
        if (data.type === 'metadata') {
          // Metadata: chứa session_id và title
          if (data.session_id) {
            responseSessionId = data.session_id;
            storeSessionId(responseSessionId);
          }
          if (data.title) {
            conversationTitle = data.title;
          }
          // Gọi callback metadata
          onMetadata?.({
            sessionId: responseSessionId,
            title: conversationTitle
          });
        } else if (data.type === 'text') {
          // Text: chứa chunk text
          if (data.chunk) {
            // ✅ Push vào đầu mảng để đảo ngược thứ tự (vì server gửi ngược)
            textChunks.unshift(data.chunk);
            // Join và đảo ngược lại để hiển thị đúng
            const fullText = textChunks.slice().reverse().join('');
            onChunk?.(data.chunk, fullText);
          }
        } else if (data.type === 'product' || data.type === 'products') {
          // Product: chứa thông tin sản phẩm (hỗ trợ cả "product" và "products")
          console.log('🛍️ Product type received:', data);
          if (data.session_id) {
            responseSessionId = data.session_id;
          }
          
          // Xử lý cấu trúc products có exact_matches
          let productsList = [];
          if (data.products) {
            if (data.products.exact_matches) {
              productsList = data.products.exact_matches;
            } else if (Array.isArray(data.products)) {
              productsList = data.products;
            } else {
              productsList = [data.products];
            }
          } else if (data.product) {
            productsList = [data.product];
          }
          
          console.log('📦 Products list to add:', productsList.length, 'items');
          
          // Thêm sản phẩm vào map
          if (productsList.length > 0) {
            for (const product of productsList) {
              if (product.id && !productsMap.has(product.id)) {
                productsMap.set(product.id, product);
              }
            }
            console.log('✅ Total products in map:', productsMap.size);
            // Gọi callback với tất cả products
            onProduct?.(null, Array.from(productsMap.values()));
          }
        }
        // Fallback: hỗ trợ cấu trúc cũ
        else {
          if (data.session_id) {
            responseSessionId = data.session_id;
            storeSessionId(responseSessionId);
          }
          if (data.chunk) {
            // ✅ Đảo ngược cho fallback
            textChunks.unshift(data.chunk);
            const fullText = textChunks.slice().reverse().join('');
            onChunk?.(data.chunk, fullText);
          }
          if (data.products?.length) {
            for (const product of data.products) {
              if (product.id && !productsMap.has(product.id)) {
                productsMap.set(product.id, product);
              }
            }
          }
        }
      } catch (e) {
        // Silent fail for invalid JSON - continue processing
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        // Xử lý buffer còn lại
        if (buffer) {
          buffer.split('\n').forEach(processLine);
        }
        
        const fullText = textChunks.join('');
        let finalProducts = Array.from(productsMap.values());
        
        // Nếu không có products từ API, thử parse từ text và search
        if (finalProducts.length === 0) {
          console.log('🔍 No products from API, parsing from text...');
          const productNames = parseProductNamesFromText(fullText);
          console.log('📝 Parsed product names:', productNames);
          
          if (productNames.length > 0) {
            try {
              const searchedProducts = await searchProductsByNames(productNames);
              console.log('✅ Found products from search:', searchedProducts);
              finalProducts = searchedProducts;
            } catch (err) {
              console.error('Error searching products:', err);
            }
          }
        }
        
        onComplete?.({
          text: fullText,
          products: finalProducts,
          sessionId: responseSessionId,
          title: conversationTitle
        });
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      
      // Chỉ xử lý nếu có newline
      const lastNewline = buffer.lastIndexOf('\n');
      if (lastNewline === -1) continue;
      
      // Tách phần hoàn chỉnh và giữ lại phần chưa hoàn chỉnh
      const complete = buffer.slice(0, lastNewline);
      buffer = buffer.slice(lastNewline + 1);
      
      // Xử lý các dòng hoàn chỉnh
      complete.split('\n').forEach(processLine);
    }

    return { 
      text: textChunks.join(''), 
      products: Array.from(productsMap.values()), 
      sessionId: responseSessionId,
      title: conversationTitle
    };
  } catch (error) {
    console.error('Error streaming chat:', error);
    onError?.(error);
    throw error;
  }
};

/**
 * Simple chat without session (non-streaming)
 * @param {string} message - User message
 * @param {string|null} sessionId - Optional session ID
 * @returns {Promise<Object>} - Bot response with text and sessionId
 */
export const chatWithoutSession = async (message, sessionId = null) => {
  try {
    const requestBody = { message };
    if (sessionId) {
      requestBody.session_id = sessionId;
    }

    const response = await fetch(`${AI_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let responseSessionId = sessionId;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
      
      // Try to extract session_id from response
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.session_id) {
              responseSessionId = data.session_id;
              storeSessionId(responseSessionId);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }

    return { text: fullResponse, sessionId: responseSessionId };
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
};

/**
 * Get all conversations for authenticated user
 * @param {string} accessToken - User's access token
 * @returns {Promise<Array>} - Array of conversations with session_id and title
 */
export const getConversations = async (accessToken) => {
  try {
    const response = await fetch(`${AI_BASE_URL}/api/auth-chat/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.conversations || data.data || data || [];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

/**
 * Stream chat with authentication (for logged in users)
 * Hỗ trợ cấu trúc response mới với 3 loại type: metadata, text, product
 * 
 * @param {string} message - User message
 * @param {string} accessToken - User's access token
 * @param {string|null} sessionId - Optional session ID for continuing conversation
 * @param {Function} onChunk - Callback for each chunk
 * @param {Function} onMetadata - Callback when metadata received
 * @param {Function} onProduct - Callback when product received
 * @param {Function} onComplete - Callback when complete
 * @param {Function} onError - Callback for errors
 */
export const streamChatWithAuth = async (message, accessToken, sessionId, onChunk, onMetadata, onProduct, onComplete, onError) => {
  try {
    const requestBody = { message };
    if (sessionId) {
      requestBody.session_id = sessionId;
    }

    const response = await fetch(`${AI_BASE_URL}/api/auth-chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let buffer = '';
    const textChunks = [];
    const productsMap = new Map();
    let responseSessionId = sessionId;
    let conversationTitle = null;

    const processLine = (line) => {
      if (!line || !line.startsWith('data: ')) return;
      
      try {
        const data = JSON.parse(line.slice(6));
        
        // Xử lý theo type
        if (data.type === 'metadata') {
          // Metadata: chứa session_id và title
          if (data.session_id) {
            responseSessionId = data.session_id;
            storeSessionId(responseSessionId);
          }
          if (data.title) {
            conversationTitle = data.title;
          }
          // Gọi callback metadata
          onMetadata?.({
            sessionId: responseSessionId,
            title: conversationTitle
          });
        } else if (data.type === 'text') {
          // Text: chứa chunk text
          if (data.chunk) {
            // ✅ Push vào đầu mảng để đảo ngược thứ tự (vì server gửi ngược)
            textChunks.unshift(data.chunk);
            // Join và đảo ngược lại để hiển thị đúng
            const fullText = textChunks.slice().reverse().join('');
            onChunk?.(data.chunk, fullText);
          }
        } else if (data.type === 'product' || data.type === 'products') {
          // Product: chứa thông tin sản phẩm (hỗ trợ cả "product" và "products")
          console.log('🛍️ Product type received (auth):', data);
          if (data.session_id) {
            responseSessionId = data.session_id;
          }
          
          // Xử lý cấu trúc products có exact_matches
          let productsList = [];
          if (data.products) {
            if (data.products.exact_matches) {
              productsList = data.products.exact_matches;
            } else if (Array.isArray(data.products)) {
              productsList = data.products;
            } else {
              productsList = [data.products];
            }
          } else if (data.product) {
            productsList = [data.product];
          }
          
          console.log('📦 Products list to add (auth):', productsList.length, 'items');
          
          // Thêm sản phẩm vào map
          if (productsList.length > 0) {
            for (const product of productsList) {
              if (product.id && !productsMap.has(product.id)) {
                productsMap.set(product.id, product);
              }
            }
            console.log('✅ Total products in map (auth):', productsMap.size);
            // Gọi callback với tất cả products
            onProduct?.(null, Array.from(productsMap.values()));
          }
        }
        // Fallback: hỗ trợ cấu trúc cũ
        else {
          if (data.session_id) {
            responseSessionId = data.session_id;
            storeSessionId(responseSessionId);
          }
          if (data.chunk) {
            // ✅ Đảo ngược cho fallback (auth)
            textChunks.unshift(data.chunk);
            const fullText = textChunks.slice().reverse().join('');
            onChunk?.(data.chunk, fullText);
          }
          if (data.products?.length) {
            for (const product of data.products) {
              if (product.id && !productsMap.has(product.id)) {
                productsMap.set(product.id, product);
              }
            }
          }
        }
      } catch (e) {
        // Silent fail
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        if (buffer) {
          buffer.split('\n').forEach(processLine);
        }
        
        onComplete?.({
          text: textChunks.join(''),
          products: Array.from(productsMap.values()),
          sessionId: responseSessionId,
          title: conversationTitle
        });
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      
      const lastNewline = buffer.lastIndexOf('\n');
      if (lastNewline === -1) continue;
      
      const complete = buffer.slice(0, lastNewline);
      buffer = buffer.slice(lastNewline + 1);
      
      complete.split('\n').forEach(processLine);
    }

    return { 
      text: textChunks.join(''), 
      products: Array.from(productsMap.values()), 
      sessionId: responseSessionId,
      title: conversationTitle
    };
  } catch (error) {
    console.error('Error streaming authenticated chat:', error);
    onError?.(error);
    throw error;
  }
};
