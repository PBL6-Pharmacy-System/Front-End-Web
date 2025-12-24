import React, { useState, useEffect } from 'react';
import { formatPrice } from '../utils/productHelpers';
import { useToast } from '../components/Toast';
import AddressModal from '../components/AddressModal';
import OrderSuccessModal from '../components/OrderSuccessModal';
import * as shippingAddressApi from '../services/shippingAddressApi';
import { getCart } from '../services/cartApi';
import { checkout, processCodPayment, createMomoPayment, createVnpayPayment, createPaypalPayment } from '../services/paymentApi';
import { getCustomerId, isAuthenticated } from '../services/authApi';
import './CheckoutPage.css';

export default function CheckoutPage({ onNavigate }) {
  const toast = useToast();

  // Cart state from API
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  // Address Modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [useAddressFromList, setUseAddressFromList] = useState(false);

  // Lấy customerId từ auth
  const customerId = getCustomerId();

  // Form states
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const [deliveryInfo, setDeliveryInfo] = useState({
    receiverName: '',
    receiverPhone: '',
    deliveryType: 'now', // 'now' or 'later'
    city: '',
    state: '',
    address: '',
    note: ''
  });

  const [requireInvoice, setRequireInvoice] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Order Success Modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderSuccessInfo, setOrderSuccessInfo] = useState(null);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Fetch cart from API when component mounts
  useEffect(() => {
    fetchCartItems();
  }, []);

  // Fetch saved addresses when component mounts
  useEffect(() => {
    if (customerId) {
      fetchSavedAddresses();
    }
  }, [customerId]);

  const fetchCartItems = async () => {
    if (!isAuthenticated()) {
      setIsLoadingCart(false);
      toast.error('Vui lòng đăng nhập để tiếp tục thanh toán');
      onNavigate('home');
      return;
    }

    setIsLoadingCart(true);
    try {
      const response = await getCart();
      console.log('🛒 Cart response:', response);
      
      if (response.success && response.data) {
        const orderItems = response.data.orderitems || [];
        
        // Transform cart items for display
        const transformedItems = orderItems.map(item => ({
          id: item.id,
          productId: item.product_id,
          name: item.products?.name || 'Sản phẩm',
          image: item.products?.image_url || '/api/placeholder/60/60',
          price: Number(item.price) || 0,
          quantity: item.quantity || 1,
          unit: item.productunits?.unit_name || 'Hộp',
          subtotal: Number(item.subtotal) || 0
        }));
        
        setCartItems(transformedItems);
        
        // Calculate total price
        const total = transformedItems.reduce((sum, item) => sum + item.subtotal, 0);
        setTotalPrice(total);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Không thể tải giỏ hàng');
    } finally {
      setIsLoadingCart(false);
    }
  };

  const fetchSavedAddresses = async () => {
    if (!customerId) return;
    
    setIsLoadingAddresses(true);
    try {
      const result = await shippingAddressApi.getCustomerAddresses(customerId);
      if (result.success && result.data) {
        setSavedAddresses(result.data);
        
        // Tự động chọn địa chỉ mặc định nếu có
        const defaultAddr = result.data.find(addr => addr.is_default);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
          setUseAddressFromList(true);
          applyAddressToForm(defaultAddr);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const applyAddressToForm = (address) => {
    if (!address) return;
    setDeliveryInfo(prev => ({
      ...prev,
      receiverName: address.recipient_name || '',
      receiverPhone: address.recipient_phone || '',
      city: address.city || '',
      state: address.state || '',
      address: address.address_line || ''
    }));
  };

  // Address Modal handlers
  const handleOpenAddressModal = () => {
    setIsAddressModalOpen(true);
  };

  const handleCloseAddressModal = () => {
    setIsAddressModalOpen(false);
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    setUseAddressFromList(true);
    applyAddressToForm(address);
    setIsAddressModalOpen(false);
    toast.success('Đã chọn địa chỉ giao hàng');
  };

  const handleAddNewAddress = async (addressData) => {
    if (!customerId) {
      toast.error('Vui lòng đăng nhập để lưu địa chỉ');
      return;
    }

    // Check duplicate address
    const isDuplicate = savedAddresses.some(addr => 
      addr.recipient_name === addressData.recipient_name &&
      addr.recipient_phone === addressData.recipient_phone &&
      addr.address_line === addressData.address_line &&
      addr.city === addressData.city
    );

    if (isDuplicate) {
      toast.error('Địa chỉ này đã tồn tại trong danh sách của bạn');
      return;
    }

    try {
      const result = await shippingAddressApi.createAddress(customerId, addressData);
      if (result.success && result.data) {
        setSavedAddresses(prev => [...prev, result.data]);
        toast.success('Đã thêm địa chỉ mới');
        return result.data;
      } else {
        throw new Error(result.error || 'Không thể thêm địa chỉ');
      }
    } catch (error) {
      toast.error('Không thể thêm địa chỉ: ' + error.message);
      throw error;
    }
  };

  const handleEditAddress = async (addressId, addressData) => {
    try {
      const result = await shippingAddressApi.updateAddress(addressId, addressData);
      if (result.success && result.data) {
        setSavedAddresses(prev => prev.map(addr => 
          addr.id === addressId ? result.data : addr
        ));
        
        // Cập nhật form nếu địa chỉ đang chọn được sửa
        if (selectedAddress && selectedAddress.id === addressId) {
          setSelectedAddress(result.data);
          applyAddressToForm(result.data);
        }
        
        toast.success('Đã cập nhật địa chỉ');
        return result.data;
      } else {
        throw new Error(result.error || 'Không thể cập nhật địa chỉ');
      }
    } catch (error) {
      toast.error('Không thể cập nhật địa chỉ: ' + error.message);
      throw error;
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const result = await shippingAddressApi.deleteAddress(addressId);
      if (result.success) {
        setSavedAddresses(prev => prev.filter(addr => addr.id !== addressId));
        
        // Reset nếu địa chỉ bị xóa đang được chọn
        if (selectedAddress && selectedAddress.id === addressId) {
          setSelectedAddress(null);
          setUseAddressFromList(false);
        }
        
        toast.success('Đã xóa địa chỉ');
      } else {
        throw new Error(result.error || 'Không thể xóa địa chỉ');
      }
    } catch (error) {
      toast.error('Không thể xóa địa chỉ: ' + error.message);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const result = await shippingAddressApi.setDefaultAddress(addressId);
      if (result.success) {
        setSavedAddresses(prev => prev.map(addr => ({
          ...addr,
          is_default: addr.id === addressId
        })));
        toast.success('Đã đặt làm địa chỉ mặc định');
      } else {
        throw new Error(result.error || 'Không thể đặt địa chỉ mặc định');
      }
    } catch (error) {
      toast.error('Không thể đặt địa chỉ mặc định: ' + error.message);
    }
  };

  // Validation functions
  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const patterns = [
      /^0[3|5|7|8|9][0-9]{8}$/,
      /^\+84[3|5|7|8|9][0-9]{8}$/,
      /^84[3|5|7|8|9][0-9]{8}$/
    ];
    return patterns.some(pattern => pattern.test(cleanPhone));
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validateForm = () => {
    console.log('📝 ========== validateForm CALLED ==========');
    console.log('📝 customerInfo:', customerInfo);
    console.log('📝 deliveryInfo:', deliveryInfo);
    console.log('📝 selectedAddress:', selectedAddress);
    
    const newErrors = {};

    // Customer info validation
    if (!customerInfo.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
      console.log('❌ Error: name empty');
    } else if (customerInfo.name.trim().length < 2) {
      newErrors.name = 'Họ tên phải có ít nhất 2 ký tự';
      console.log('❌ Error: name too short');
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
      console.log('❌ Error: phone empty');
    } else if (!validatePhone(customerInfo.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
      console.log('❌ Error: phone invalid');
    }

    if (customerInfo.email && !validateEmail(customerInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
      console.log('❌ Error: email invalid');
    }

    // Skip delivery validation if selectedAddress exists
    if (selectedAddress) {
      console.log('✅ selectedAddress exists, skipping delivery validation');
      console.log('📝 Final errors:', newErrors);
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    // Delivery info validation (only if no selected address)
    if (!deliveryInfo.receiverName.trim()) {
      newErrors.receiverName = 'Vui lòng nhập tên người nhận';
      console.log('❌ Error: receiverName empty');
    }

    if (!deliveryInfo.receiverPhone.trim()) {
      newErrors.receiverPhone = 'Vui lòng nhập số điện thoại người nhận';
      console.log('❌ Error: receiverPhone empty');
    } else if (!validatePhone(deliveryInfo.receiverPhone)) {
      newErrors.receiverPhone = 'Số điện thoại không hợp lệ';
      console.log('❌ Error: receiverPhone invalid');
    }

    if (!deliveryInfo.city) {
      newErrors.city = 'Vui lòng nhập Tỉnh/Thành phố';
      console.log('❌ Error: city empty');
    }

    if (!deliveryInfo.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ cụ thể';
      console.log('❌ Error: address empty');
    } else if (deliveryInfo.address.trim().length < 10) {
      newErrors.address = 'Địa chỉ phải có ít nhất 10 ký tự';
      console.log('❌ Error: address too short');
    }

    console.log('📝 Final errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDeliveryInfoChange = (field, value) => {
    setDeliveryInfo(prev => ({ ...prev, [field]: value }));
    // Clear error when user selects/types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCheckout = async () => {
    console.log('🛒 ========== handleCheckout CALLED ==========');
    console.log('🛒 paymentMethod:', paymentMethod);
    console.log('🛒 selectedAddress:', selectedAddress);
    console.log('🛒 deliveryInfo:', deliveryInfo);
    console.log('🛒 cartItems:', cartItems);
    console.log('🛒 onNavigate function:', onNavigate);
    
    if (!validateForm()) {
      console.log('❌ Form validation FAILED');
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }
    console.log('✅ Form validation PASSED');

    // Check authentication
    if (!isAuthenticated()) {
      console.log('❌ User NOT authenticated');
      toast.error('Vui lòng đăng nhập để đặt hàng');
      return;
    }
    console.log('✅ User IS authenticated');

    setIsProcessingPayment(true);
    console.log('🔄 isProcessingPayment set to TRUE');

    try {
      // Prepare checkout data for API
      // Build checkout data according to backend API requirements
      const checkoutData = {
        payment_method: paymentMethod,
        note: deliveryInfo.note || ''
      };

      // Backend requires shipping_address_id at top level
      if (selectedAddress) {
        checkoutData.shipping_address_id = selectedAddress.id;
      }
      // TEMPORARILY COMMENTED: Allow checkout without address for testing
      // else {
      //   // If no saved address, we need to create one first or pass address details
      //   // For now, show error - user should select/add an address
      //   toast.error('Vui lòng chọn hoặc thêm địa chỉ giao hàng');
      //   setIsProcessingPayment(false);
      //   return;
      // }

      console.log('📦 Checkout data:', checkoutData);

      // Step 1: Call checkout API to create order and payment
      const checkoutResponse = await checkout(checkoutData);
      console.log('✅ Checkout response:', checkoutResponse);

      const paymentId = checkoutResponse.data?.payment?.id || checkoutResponse.payment?.id;
      const orderId = checkoutResponse.data?.order?.id || checkoutResponse.order?.id;

      if (!paymentId) {
        throw new Error('Không thể tạo thanh toán');
      }

      // Step 2: Process payment based on method
      if (paymentMethod === 'cod') {
        // COD: Order is already created with checkout API
        // No need to call process-cod (that's for admin/staff to confirm delivery)
        console.log('✅ COD order created successfully, orderId:', orderId);
        
        // Clear cart items after successful order
        console.log('🧹 Clearing cart...');
        setCartItems([]);
        setTotalPrice(0);
        
        // Trigger cart update in Header
        window.dispatchEvent(new Event('cartUpdated'));
        console.log('📢 Cart updated event dispatched');
        
        // Show success toast
        console.log('🎉 Showing success toast for orderId:', orderId);
        toast.success(`Đặt hàng thành công! Mã đơn hàng: #${orderId}`);
        
        // Navigate to orders page after short delay
        console.log('⏱️ Will navigate to orders in 1 second...');
        setTimeout(() => {
          console.log('🚀 Navigating to orders page now!');
          console.log('onNavigate function:', onNavigate);
          if (onNavigate) {
            onNavigate('orders');
          } else {
            console.error('❌ onNavigate is undefined!');
          }
        }, 1000);
        
      } else if (paymentMethod === 'momo') {
        // MoMo: Get payment URL and redirect
        // MoMo API requires orderId, not payment_id
        console.log('🟣 Creating MoMo payment for orderId:', orderId);
        const momoResponse = await createMomoPayment({ orderId: orderId });
        console.log('MoMo response:', momoResponse);
        
        const payUrl = momoResponse.data?.payUrl || momoResponse.payUrl;
        if (payUrl) {
          toast.info('Đang chuyển đến trang thanh toán MoMo...');
          window.location.href = payUrl;
        } else {
          throw new Error('Không thể tạo link thanh toán MoMo');
        }
      } else if (paymentMethod === 'vnpay') {
        // VNPay: Get payment URL and redirect
        // VNPay API requires orderId, not payment_id
        console.log('🔵 Creating VNPay payment for orderId:', orderId);
        const vnpayResponse = await createVnpayPayment({ orderId: orderId });
        console.log('VNPay response:', vnpayResponse);
        
        const paymentUrl = vnpayResponse.data?.paymentUrl || vnpayResponse.paymentUrl;
        if (paymentUrl) {
          toast.info('Đang chuyển đến trang thanh toán VNPay...');
          window.location.href = paymentUrl;
        } else {
          throw new Error('Không thể tạo link thanh toán VNPay');
        }
      } else if (paymentMethod === 'paypal') {
        // PayPal: Get payment approval URL and redirect
        console.log('💙 Creating PayPal payment for orderId:', orderId);
        try {
          const paypalResponse = await createPaypalPayment({ orderId: orderId });
          console.log('PayPal response:', paypalResponse);
          
          const approvalUrl = paypalResponse.data?.approvalUrl || paypalResponse.approvalUrl;
          if (approvalUrl) {
            toast.info('Đang chuyển đến trang thanh toán PayPal...');
            window.location.href = approvalUrl;
          } else {
            throw new Error('Không thể tạo link thanh toán PayPal');
          }
        } catch (paypalError) {
          console.error('PayPal payment error:', paypalError);
          
          // Check if it's a configuration error (503)
          if (paypalError.message?.includes('không khả dụng') || 
              paypalError.message?.includes('chưa được cấu hình')) {
            toast.error('PayPal hiện chưa khả dụng. Vui lòng chọn phương thức thanh toán khác (COD, VNPay, hoặc MoMo).');
          } else {
            toast.error(paypalError.message || 'Không thể tạo thanh toán PayPal. Vui lòng thử lại hoặc chọn phương thức khác.');
          }
          throw paypalError; // Re-throw to be caught by outer try-catch
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      // Only show error if not already shown by PayPal specific handler
      if (!error.message?.includes('PayPal') && !error.message?.includes('không khả dụng')) {
        toast.error(error.message || 'Đặt hàng thất bại. Vui lòng thử lại!');
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const shippingFee = totalPrice >= 300000 ? 0 : 30000;
  const finalTotal = totalPrice + shippingFee;

  // Show loading state
  if (isLoadingCart) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="checkout-loading-spinner"></div>
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Đang tải giỏ hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to cart if no items
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <button className="checkout-back-btn" onClick={() => onNavigate('cart')}>
            ← Quay lại giỏ hàng
          </button>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Giỏ hàng trống</h2>
            <p>Vui lòng thêm sản phẩm vào giỏ hàng để thanh toán.</p>
            <button 
              onClick={() => onNavigate('home')}
              style={{ 
                marginTop: '20px', 
                padding: '12px 24px', 
                background: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Back Button */}
        <button className="checkout-back-btn" onClick={() => onNavigate('cart')}>
          ← Quay lại giỏ hàng
        </button>

        <div className="checkout-content">
          {/* Left Column - Forms */}
          <div className="checkout-left">
            {/* Product List */}
            <div className="checkout-section">
              <h3 className="checkout-section-title">Danh sách sản phẩm</h3>
              
              {totalPrice >= 300000 && (
                <div className="checkout-free-ship-banner">
                  Miễn phí vận chuyển đơi với đơn hàng trên 300.000đ
                </div>
              )}

              <div className="checkout-products">
                {cartItems.map((item) => (
                  <div key={item.id} className="checkout-product-item">
                    <img 
                      src={item.image || '/api/placeholder/60/60'} 
                      alt={item.name}
                      className="checkout-product-image"
                    />
                    <div className="checkout-product-info">
                      <h4 className="checkout-product-name">{item.name}</h4>
                      <p className="checkout-product-price">
                        {formatPrice(item.price)}đ
                        <span className="checkout-product-quantity">x{item.quantity} {item.unit || 'Hộp'}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Info */}
            <div className="checkout-section">
              <div className="checkout-section-header">
                <span className="checkout-section-icon">👤</span>
                <h3 className="checkout-section-title">Thông tin người đặt</h3>
              </div>

              <div className="checkout-form-grid">
                <div className="checkout-form-field">
                  <input
                    type="text"
                    name="name"
                    placeholder="Họ và tên người đặt *"
                    value={customerInfo.name}
                    onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                    className={`checkout-input ${errors.name ? 'error' : ''}`}
                  />
                  {errors.name && <span className="checkout-error-message">{errors.name}</span>}
                </div>
                <div className="checkout-form-field">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Số điện thoại *"
                    value={customerInfo.phone}
                    onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                    className={`checkout-input ${errors.phone ? 'error' : ''}`}
                  />
                  {errors.phone && <span className="checkout-error-message">{errors.phone}</span>}
                </div>
              </div>

              <div className="checkout-form-field">
                <input
                  type="email"
                  name="email"
                  placeholder="Email (không bắt buộc)"
                  value={customerInfo.email}
                  onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                  className={`checkout-input checkout-input-full ${errors.email ? 'error' : ''}`}
                />
                {errors.email && <span className="checkout-error-message">{errors.email}</span>}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="checkout-section">
              <div className="checkout-section-header">
                <span className="checkout-section-icon">📍</span>
                <h3 className="checkout-section-title">Địa chỉ nhận hàng</h3>
                {customerId && (
                  <button 
                    type="button"
                    className="checkout-change-address-btn"
                    onClick={handleOpenAddressModal}
                  >
                    {savedAddresses.length > 0 ? 'Thay đổi' : '+ Thêm địa chỉ'}
                  </button>
                )}
              </div>

              {/* Hiển thị địa chỉ đã chọn */}
              {useAddressFromList && selectedAddress && (
                <div className="checkout-selected-address">
                  <div className="checkout-selected-address-info">
                    <div className="checkout-selected-address-name">
                      <strong>{selectedAddress.recipient_name}</strong>
                      <span className="checkout-selected-address-divider">|</span>
                      <span>{selectedAddress.recipient_phone}</span>
                      {selectedAddress.is_default && (
                        <span className="checkout-default-badge">Mặc định</span>
                      )}
                    </div>
                    <p className="checkout-selected-address-detail">
                      {[selectedAddress.address_line, selectedAddress.state, selectedAddress.city].filter(Boolean).join(', ')}
                    </p>
                  </div>
                  <button 
                    type="button"
                    className="checkout-edit-address-btn"
                    onClick={handleOpenAddressModal}
                  >
                    Thay đổi
                  </button>
                </div>
              )}

              {/* Form nhập địa chỉ mới - hiển thị khi chưa có địa chỉ đã lưu hoặc chưa đăng nhập
              {(!useAddressFromList || !selectedAddress) && (
                <>
                  <div className="checkout-form-grid">
                    <div className="checkout-form-field">
                      <input
                        type="text"
                        name="receiverName"
                        placeholder="Họ và tên người nhận *"
                        value={deliveryInfo.receiverName}
                        onChange={(e) => handleDeliveryInfoChange('receiverName', e.target.value)}
                    className={`checkout-input ${errors.receiverName ? 'error' : ''}`}
                      />
                      {errors.receiverName && <span className="checkout-error-message">{errors.receiverName}</span>}
                    </div>
                    <div className="checkout-form-field">
                      <input
                        type="tel"
                        name="receiverPhone"
                        placeholder="Số điện thoại *"
                        value={deliveryInfo.receiverPhone}
                        onChange={(e) => handleDeliveryInfoChange('receiverPhone', e.target.value)}
                        className={`checkout-input ${errors.receiverPhone ? 'error' : ''}`}
                      />
                      {errors.receiverPhone && <span className="checkout-error-message">{errors.receiverPhone}</span>}
                    </div>
                  </div>

                  <div className="checkout-form-grid">
                    <div className="checkout-form-field">
                      <input
                        type="text"
                        name="city"
                        placeholder="Tỉnh/Thành phố *"
                        value={deliveryInfo.city}
                        onChange={(e) => handleDeliveryInfoChange('city', e.target.value)}
                        className={`checkout-input ${errors.city ? 'error' : ''}`}
                      />
                      {errors.city && <span className="checkout-error-message">{errors.city}</span>}
                    </div>

                    <div className="checkout-form-field">
                      <input
                        type="text"
                        name="state"
                        placeholder="Quận/Huyện/Phường/Xã"
                        value={deliveryInfo.state}
                        onChange={(e) => handleDeliveryInfoChange('state', e.target.value)}
                        className="checkout-input"
                      />
                    </div>
                  </div>

                  <div className="checkout-form-field">
                    <input
                      type="text"
                      name="address"
                      placeholder="Địa chỉ cụ thể (Số nhà, tên đường...) *"
                      value={deliveryInfo.address}
                      onChange={(e) => handleDeliveryInfoChange('address', e.target.value)}
                      className={`checkout-input checkout-input-full ${errors.address ? 'error' : ''}`}
                    />
                    {errors.address && <span className="checkout-error-message">{errors.address}</span>}
                  </div>
                </>
              )} */}

              {/* <div className="checkout-delivery-type">
                <label className="checkout-radio-label">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="now"
                    checked={deliveryInfo.deliveryType === 'now'}
                    onChange={(e) => handleDeliveryInfoChange('deliveryType', e.target.value)}
                  />
                  <span>Giao ngay khi xong</span>
                </label>
                <label className="checkout-radio-label">
                  <input
                    type="radio"
                    name="deliveryType"
                    value="later"
                    checked={deliveryInfo.deliveryType === 'later'}
                    onChange={(e) => handleDeliveryInfoChange('deliveryType', e.target.value)}
                  />
                  <span>Giao vào giờ hành chính</span>
                </label>
              </div> */}

              <textarea
                placeholder="Ghi chú thêm (Ví dụ: Giao hàng giờ hành chính)"
                value={deliveryInfo.note}
                onChange={(e) => handleDeliveryInfoChange('note', e.target.value)}
                className="checkout-textarea"
                rows="3"
              />

              <div className="checkout-invoice-toggle">
                <label className="checkout-toggle-label">
                  <span>Yêu cầu xuất hóa đơn điện tử</span>
                  <input
                    type="checkbox"
                    checked={requireInvoice}
                    onChange={(e) => setRequireInvoice(e.target.checked)}
                    className="checkout-toggle"
                  />
                  <span className="checkout-toggle-slider"></span>
                </label>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="checkout-section">
              <h3 className="checkout-section-title">Chọn phương thức thanh toán</h3>

              <div className="checkout-payment-methods">
                <label className="checkout-payment-method">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="checkout-payment-icon">
                    <img src="/icons/cod.png" alt="COD" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline'; }} />
                    <span style={{ display: 'none' }}>💵</span>
                  </span>
                  <span className="checkout-payment-text">Thanh toán tiền mặt khi nhận hàng</span>
                </label>

                <label className="checkout-payment-method">
                  <input
                    type="radio"
                    name="payment"
                    value="vnpay"
                    checked={paymentMethod === 'vnpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="checkout-payment-icon">
                    <img src="/icons/vnpay.png" alt="VNPay" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline'; }} />
                    <span style={{ display: 'none' }}>💳</span>
                  </span>
                  <span className="checkout-payment-text">Thanh toán qua VNPay</span>
                </label>

                <label className="checkout-payment-method">
                  <input
                    type="radio"
                    name="payment"
                    value="momo"
                    checked={paymentMethod === 'momo'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="checkout-payment-icon">
                    <img src="/icons/momo.png" alt="MoMo" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline'; }} />
                    <span style={{ display: 'none' }}>🔴</span>
                  </span>
                  <span className="checkout-payment-text">Thanh toán bằng ví MoMo</span>
                </label>

                <label className="checkout-payment-method">
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="checkout-payment-icon">
                    <img src="/icons/paypal.png" alt="PayPal" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline'; }} />
                    <span style={{ display: 'none' }}>💙</span>
                  </span>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="checkout-payment-text">Thanh toán qua PayPal</span>
                    <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '500' }}>
                      ⚠️ Đang trong quá trình cấu hình
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="checkout-right">
            <div className="checkout-summary">
              <div className="checkout-summary-header">
                <span>Áp dụng ưu đãi để được giảm giá</span>
                <button className="checkout-coupon-btn">›</button>
              </div>

              <div className="checkout-summary-section">
                <div className="checkout-summary-row">
                  <span>Tổng tiền ({cartItems.length} sản phẩm)</span>
                  <span className="checkout-summary-value">
                    {formatPrice(totalPrice)}đ
                  </span>
                </div>
                <div className="checkout-summary-row">
                  <span>Giảm giá trực tiếp</span>
                  <span className="checkout-summary-value checkout-summary-discount">0đ</span>
                </div>
                <div className="checkout-summary-row">
                  <span>Giảm giá voucher</span>
                  <span className="checkout-summary-value checkout-summary-discount">0đ</span>
                </div>
                <div className="checkout-summary-row">
                  <span>Phí vận chuyển</span>
                  <span className="checkout-summary-value checkout-summary-free">
                    {shippingFee === 0 ? 'Miễn phí' : `${formatPrice(shippingFee)}đ`}
                  </span>
                </div>
              </div>

              <div className="checkout-summary-total">
                <span>Thành tiền</span>
                <span className="checkout-summary-total-value">
                  {formatPrice(finalTotal)}đ
                </span>
              </div>

              <button 
                className={`checkout-submit-btn ${isProcessingPayment ? 'loading' : ''}`}
                onClick={(e) => {
                  console.log('🔘 BUTTON CLICKED!');
                  console.log('🔘 Event:', e);
                  console.log('🔘 isProcessingPayment:', isProcessingPayment);
                  handleCheckout();
                }}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <span className="checkout-btn-spinner"></span>
                    Đang xử lý...
                  </>
                ) : (
                  'Hoàn tất đặt hàng'
                )}
              </button>

              <p className="checkout-terms">
                Bằng việc tiến hành đặt mua hàng, bạn đồng ý với{' '}
                <a href="#">Điều khoản dịch vụ</a> và{' '}
                <a href="#">Chính sách xử lý dữ liệu cá nhân</a> của Nhà thuốc FPT Long Châu
              </p>

              {/* QR Code Promo */}
              <div className="checkout-promo">
                <div className="checkout-promo-content">
                  <div className="checkout-promo-icon">💳</div>
                  <div className="checkout-promo-text">
                    <strong>Tối ưu dụng</strong><br />
                    <span className="checkout-promo-highlight">Miễn phí<br />vận chuyển</span><br />
                    với mọi đơn hàng
                  </div>
                  <button className="checkout-promo-btn">Tải ngay</button>
                </div>
                <div className="checkout-promo-qr">
                  <div className="checkout-qr-placeholder">
                    <div style={{ fontSize: '40px' }}>📱</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={handleCloseAddressModal}
        addresses={savedAddresses}
        selectedAddressId={selectedAddress?.id}
        onSelect={handleSelectAddress}
        onAddNew={handleAddNewAddress}
        onEdit={handleEditAddress}
        onDelete={handleDeleteAddress}
        onSetDefault={handleSetDefaultAddress}
        isLoading={isLoadingAddresses}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        orderInfo={orderSuccessInfo}
        onNavigateHome={() => {
          setShowSuccessModal(false);
          onNavigate('home');
        }}
        onNavigateOrders={() => {
          setShowSuccessModal(false);
          onNavigate('orders');
        }}
      />
    </div>
  );
}
