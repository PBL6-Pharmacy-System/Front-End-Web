// Chat API Configuration
const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || 'https://unendowed-placably-aviana.ngrok-free.dev';

/**
 * Stream chat without session (for non-logged in users)
 * Optimized for performance with:
 * - Map for O(1) product deduplication
 * - Minimal object creation
 * - Efficient string concatenation
 * 
 * @param {string} message - User message
 * @param {Function} onChunk - Callback for each word/token of response
 * @param {Function} onComplete - Callback when stream completes with full message data
 * @param {Function} onError - Callback for errors
 */
export const streamChatWithoutSession = async (message, onChunk, onComplete, onError) => {
  try {
    const response = await fetch(`${AI_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    let buffer = '';
    const textChunks = [];  // Dùng mảng rồi join() cuối cùng - nhanh hơn += string
    const productsMap = new Map();  // Map để O(1) lookup thay vì O(n) với array.find()

    // Helper function để parse và xử lý line
    const processLine = (line) => {
      if (!line || !line.startsWith('data: ')) return;
      
      try {
        const messageData = JSON.parse(line.slice(6));
        
        if (messageData.chunk) {
          textChunks.push(messageData.chunk);
          onChunk?.(messageData.chunk, textChunks.join(''));
        }
        
        if (messageData.products?.length) {
          for (const product of messageData.products) {
            if (product.id && !productsMap.has(product.id)) {
              productsMap.set(product.id, product);
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
        
        onComplete?.({
          text: textChunks.join(''),
          products: Array.from(productsMap.values())
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

    return { text: textChunks.join(''), products: Array.from(productsMap.values()) };
  } catch (error) {
    console.error('Error streaming chat:', error);
    onError?.(error);
    throw error;
  }
};

/**
 * Simple chat without session (non-streaming)
 * @param {string} message - User message
 * @returns {Promise<string>} - Bot response
 */
export const chatWithoutSession = async (message) => {
  try {
    const response = await fetch(`${AI_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        message: message
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
    }

    return fullResponse;
  } catch (error) {
    console.error('Error in chat:', error);
    throw error;
  }
};
