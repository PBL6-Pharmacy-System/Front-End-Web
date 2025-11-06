import { createSlice } from '@reduxjs/toolkit';

const loadCartFromLocalStorage = () => {
  try {
    const serializedCart = localStorage.getItem('medicineShopCart');
    if (serializedCart === null) {
      return [];
    }
    return JSON.parse(serializedCart);
  } catch (err) {
    console.error('Error loading cart from localStorage:', err);
    return [];
  }
};

const saveCartToLocalStorage = (cartItems) => {
  try {
    const serializedCart = JSON.stringify(cartItems);
    localStorage.setItem('medicineShopCart', serializedCart);
  } catch (err) {
    console.error('Error saving cart to localStorage:', err);
  }
};

// Tính tổng từ items khi load
const calculateInitialTotals = (items) => {
  let totalQuantity = 0;
  let totalAmount = 0;
  
  items.forEach(item => {
    totalQuantity += item.quantity || 0;
    if (item.selected) {
      totalAmount += item.totalPrice || 0;
    }
  });
  
  return { totalQuantity, totalAmount };
};

const loadedItems = loadCartFromLocalStorage();
const initialTotals = calculateInitialTotals(loadedItems);

const initialState = {
  items: loadedItems,
  totalQuantity: initialTotals.totalQuantity,
  totalAmount: initialTotals.totalAmount,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      console.log('🛒 Adding to cart:', newItem);
      
      const existingItem = state.items.find(item => item.id === newItem.id);
      
      if (existingItem) {
        // Nếu sản phẩm đã tồn tại, tăng quantity
        existingItem.quantity += newItem.quantity || 1;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;
        console.log('✅ Updated existing item quantity:', existingItem.quantity);
      } else {
        // Thêm sản phẩm mới
        state.items.push({
          id: newItem.id,
          name: newItem.name,
          price: newItem.price,
          originalPrice: newItem.originalPrice,
          image: newItem.image,
          quantity: newItem.quantity || 1,
          unit: newItem.unit || 'Hộp',
          discount: newItem.discount,
          category: newItem.category,
          source: newItem.source,
          selected: true, // Mặc định được chọn
          totalPrice: newItem.price * (newItem.quantity || 1),
        });
        console.log('✅ Added new item to cart');
      }
      
      // Cập nhật tổng số lượng và tổng tiền
      cartSlice.caseReducers.calculateTotals(state);
      
      // Lưu vào localStorage
      saveCartToLocalStorage(state.items);
    },
    
    removeFromCart: (state, action) => {
      const id = action.payload;
      console.log('🗑️ Removing from cart:', id);
      
      state.items = state.items.filter(item => item.id !== id);
      cartSlice.caseReducers.calculateTotals(state);
      saveCartToLocalStorage(state.items);
      
      console.log('✅ Item removed, cart size:', state.items.length);
    },
    
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      console.log('📝 Updating quantity:', id, quantity);
      
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.quantity = Math.max(1, quantity); // Minimum 1
        item.totalPrice = item.price * item.quantity;
        cartSlice.caseReducers.calculateTotals(state);
        saveCartToLocalStorage(state.items);
        console.log('✅ Quantity updated:', item.quantity);
      }
    },
    
    incrementQuantity: (state, action) => {
      const id = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.quantity += 1;
        item.totalPrice = item.price * item.quantity;
        cartSlice.caseReducers.calculateTotals(state);
        saveCartToLocalStorage(state.items);
      }
    },
    
    decrementQuantity: (state, action) => {
      const id = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        item.totalPrice = item.price * item.quantity;
        cartSlice.caseReducers.calculateTotals(state);
        saveCartToLocalStorage(state.items);
      }
    },
    
    toggleSelectItem: (state, action) => {
      const id = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        item.selected = !item.selected;
        cartSlice.caseReducers.calculateTotals(state);
        saveCartToLocalStorage(state.items);
      }
    },
    
    toggleSelectAll: (state, action) => {
      const selected = action.payload;
      state.items.forEach(item => {
        item.selected = selected;
      });
      cartSlice.caseReducers.calculateTotals(state);
      saveCartToLocalStorage(state.items);
    },
    
    clearCart: (state) => {
      console.log('🧹 Clearing cart');
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      saveCartToLocalStorage(state.items);
    },
    
    calculateTotals: (state) => {
      let totalQuantity = 0;
      let totalAmount = 0;
      
      state.items.forEach(item => {
        totalQuantity += item.quantity;
        if (item.selected) {
          totalAmount += item.totalPrice;
        }
      });
      
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;
      
      console.log('💰 Cart totals - Quantity:', totalQuantity, 'Amount:', totalAmount);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  toggleSelectItem,
  toggleSelectAll,
  clearCart,
  calculateTotals,
} = cartSlice.actions;

export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalQuantity = (state) => state.cart.totalQuantity;
export const selectCartTotalAmount = (state) => state.cart.totalAmount;
export const selectSelectedItems = (state) => state.cart.items.filter(item => item.selected);
export const selectSelectedTotalAmount = (state) => {
  return state.cart.items
    .filter(item => item.selected)
    .reduce((total, item) => total + item.totalPrice, 0);
};
