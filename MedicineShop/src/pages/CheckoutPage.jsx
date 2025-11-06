import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCartItems, selectSelectedTotalAmount } from '../store/cartSlice';
import { formatPrice } from '../utils/productHelpers';
import './CheckoutPage.css';

// Dữ liệu địa chỉ Việt Nam
const vietnamLocations = {
  'Đà Nẵng': {
    'Quận Hải Châu': ['Phường Hòa Thuận Tây', 'Phường Hòa Thuận Đông', 'Phường Nam Dương', 'Phường Bình Hiên', 'Phường Bình Thuận', 'Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Phước Ninh', 'Phường Thanh Bình', 'Phường Thạch Thang', 'Phường Thạch Thang', 'Phường Hòa Cường Bắc', 'Phường Hòa Cường Nam'],
    'Quận Thanh Khê': ['Phường Tam Thuận', 'Phường Thanh Khê Đông', 'Phường Thanh Khê Tây', 'Phường Xuân Hà', 'Phường Tân Chính', 'Phường Chính Gián', 'Phường Vĩnh Trung', 'Phường Thạc Gián', 'Phường An Khê', 'Phường Hòa Khê'],
    'Quận Sơn Trà': ['Phường Thọ Quang', 'Phường Nại Hiên Đông', 'Phường Mân Thái', 'Phường An Hải Bắc', 'Phường Phước Mỹ', 'Phường An Hải Tây', 'Phường An Hải Đông'],
    'Quận Ngũ Hành Sơn': ['Phường Mỹ An', 'Phường Khuê Mỹ', 'Phường Hòa Quý', 'Phường Hòa Hải'],
    'Quận Liên Chiểu': ['Phường Hòa Hiệp Bắc', 'Phường Hòa Hiệp Nam', 'Phường Hòa Khánh Bắc', 'Phường Hòa Khánh Nam', 'Phường Hòa Minh'],
    'Quận Cẩm Lệ': ['Phường Khuê Trung', 'Phường Hòa Phát', 'Phường Hòa An', 'Phường Hòa Thọ Tây', 'Phường Hòa Thọ Đông', 'Phường Hòa Xuân'],
    'Huyện Hòa Vang': ['Xã Hòa Bắc', 'Xã Hòa Liên', 'Xã Hòa Ninh', 'Xã Hòa Sơn', 'Xã Hòa Nhơn', 'Xã Hòa Phú', 'Xã Hòa Phong', 'Xã Hòa Châu', 'Xã Hòa Tiến', 'Xã Hòa Phước', 'Xã Hòa Khương']
  },
  'Hà Nội': {
    'Quận Ba Đình': ['Phường Phúc Xá', 'Phường Trúc Bạch', 'Phường Vĩnh Phúc', 'Phường Cống Vị', 'Phường Liễu Giai', 'Phường Nguyễn Trung Trực', 'Phường Quán Thánh', 'Phường Ngọc Hà', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Ngọc Khánh', 'Phường Kim Mã', 'Phường Giảng Võ', 'Phường Thành Công'],
    'Quận Hoàn Kiếm': ['Phường Phúc Tân', 'Phường Đồng Xuân', 'Phường Hàng Mã', 'Phường Hàng Buồm', 'Phường Hàng Đào', 'Phường Hàng Bồ', 'Phường Cửa Đông', 'Phường Lý Thái Tổ', 'Phường Hàng Bạc', 'Phường Hàng Gai', 'Phường Chương Dương Độ', 'Phường Cửa Nam', 'Phường Hàng Trống', 'Phường Phan Chu Trinh', 'Phường Tràng Tiền', 'Phường Trần Hưng Đạo', 'Phường Pháo Đài Láng', 'Phường Hàng Bài'],
    'Quận Đống Đa': ['Phường Cát Linh', 'Phường Văn Miếu', 'Phường Quốc Tử Giám', 'Phường Láng Thượng', 'Phường Ô Chợ Dừa', 'Phường Văn Chương', 'Phường Hàng Bột', 'Phường Láng Hạ', 'Phường Khâm Thiên', 'Phường Thổ Quan', 'Phường Nam Đồng', 'Phường Trung Phụng', 'Phường Quang Trung', 'Phường Trung Liệt', 'Phường Phương Liên', 'Phường Thịnh Quang', 'Phường Trung Tự', 'Phường Kim Liên', 'Phường Phương Mai', 'Phường Ngã Tư Sở', 'Phường Khương Thượng'],
    'Quận Hai Bà Trưng': ['Phường Nguyễn Du', 'Phường Bạch Đằng', 'Phường Phạm Đình Hổ', 'Phường Lê Đại Hành', 'Phường Đồng Nhân', 'Phường Phố Huế', 'Phường Đống Mác', 'Phường Thanh Lương', 'Phường Thanh Nhân', 'Phường Cầu Dền', 'Phường Bách Khoa', 'Phường Đồng Tâm', 'Phường Vĩnh Tuy', 'Phường Bạch Mai', 'Phường Quỳnh Mai', 'Phường Quỳnh Lôi', 'Phường Minh Khai', 'Phường Trương Định']
  },
  'TP. Hồ Chí Minh': {
    'Quận 1': ['Phường Tân Định', 'Phường Đa Kao', 'Phường Bến Nghé', 'Phường Bến Thành', 'Phường Nguyễn Thái Bình', 'Phường Phạm Ngũ Lão', 'Phường Cầu Ông Lãnh', 'Phường Cô Giang', 'Phường Nguyễn Cư Trinh', 'Phường Cầu Kho'],
    'Quận 3': ['Phường 01', 'Phường 02', 'Phường 03', 'Phường 04', 'Phường 05', 'Phường 06', 'Phường 07', 'Phường 08', 'Phường 09', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'],
    'Quận 5': ['Phường 01', 'Phường 02', 'Phường 03', 'Phường 04', 'Phường 05', 'Phường 06', 'Phường 07', 'Phường 08', 'Phường 09', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
    'Quận 10': ['Phường 01', 'Phường 02', 'Phường 03', 'Phường 04', 'Phường 05', 'Phường 06', 'Phường 07', 'Phường 08', 'Phường 09', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
    'Quận Bình Thạnh': ['Phường 01', 'Phường 02', 'Phường 03', 'Phường 05', 'Phường 06', 'Phường 07', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 17', 'Phường 19', 'Phường 21', 'Phường 22', 'Phường 24', 'Phường 25', 'Phường 26', 'Phường 27', 'Phường 28']
  }
};

export default function CheckoutPage({ onNavigate }) {
  const cartItems = useSelector(selectCartItems);
  // Chỉ lấy các sản phẩm đã được chọn để thanh toán
  const selectedItems = cartItems.filter(item => item.selected);
  const totalPrice = useSelector(selectSelectedTotalAmount);

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
    province: '',
    district: '',
    ward: '',
    address: '',
    note: ''
  });

  const [requireInvoice, setRequireInvoice] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Validation errors
  const [errors, setErrors] = useState({});

  // Available locations based on selection
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);

  // Update districts when province changes
  useEffect(() => {
    if (deliveryInfo.province && vietnamLocations[deliveryInfo.province]) {
      setAvailableDistricts(Object.keys(vietnamLocations[deliveryInfo.province]));
      // Reset district and ward
      setDeliveryInfo(prev => ({ ...prev, district: '', ward: '' }));
      setAvailableWards([]);
    } else {
      setAvailableDistricts([]);
      setAvailableWards([]);
    }
  }, [deliveryInfo.province]);

  // Update wards when district changes
  useEffect(() => {
    if (deliveryInfo.province && deliveryInfo.district && 
        vietnamLocations[deliveryInfo.province] && 
        vietnamLocations[deliveryInfo.province][deliveryInfo.district]) {
      setAvailableWards(vietnamLocations[deliveryInfo.province][deliveryInfo.district]);
      // Reset ward
      setDeliveryInfo(prev => ({ ...prev, ward: '' }));
    } else {
      setAvailableWards([]);
    }
  }, [deliveryInfo.district, deliveryInfo.province]);

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
    const newErrors = {};

    // Customer info validation
    if (!customerInfo.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    } else if (customerInfo.name.trim().length < 2) {
      newErrors.name = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!validatePhone(customerInfo.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
    }

    if (customerInfo.email && !validateEmail(customerInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Delivery info validation
    if (!deliveryInfo.receiverName.trim()) {
      newErrors.receiverName = 'Vui lòng nhập tên người nhận';
    }

    if (!deliveryInfo.receiverPhone.trim()) {
      newErrors.receiverPhone = 'Vui lòng nhập số điện thoại người nhận';
    } else if (!validatePhone(deliveryInfo.receiverPhone)) {
      newErrors.receiverPhone = 'Số điện thoại không hợp lệ';
    }

    if (!deliveryInfo.province) {
      newErrors.province = 'Vui lòng chọn Tỉnh/Thành phố';
    }

    if (!deliveryInfo.district) {
      newErrors.district = 'Vui lòng chọn Quận/Huyện';
    }

    if (!deliveryInfo.ward) {
      newErrors.ward = 'Vui lòng chọn Phường/Xã';
    }

    if (!deliveryInfo.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ cụ thể';
    } else if (deliveryInfo.address.trim().length < 10) {
      newErrors.address = 'Địa chỉ phải có ít nhất 10 ký tự';
    }

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

  const handleCheckout = () => {
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }

    // All validation passed
    const orderData = {
      customerInfo,
      deliveryInfo,
      requireInvoice,
      paymentMethod,
      items: selectedItems,
      totalPrice,
      shippingFee,
      finalTotal,
      orderDate: new Date().toISOString()
    };

    console.log('✅ Order submitted:', orderData);
    
    // TODO: Call API to create order
    alert(`Đặt hàng thành công!\n\nTổng tiền: ${formatPrice(finalTotal)}đ\nPhương thức: ${
      paymentMethod === 'cod' ? 'Tiền mặt' :
      paymentMethod === 'qr' ? 'QR Code' :
      paymentMethod === 'atm' ? 'Thẻ ATM' :
      paymentMethod === 'card' ? 'Thẻ tín dụng' :
      paymentMethod === 'zalopay' ? 'ZaloPay' : 'MoMo'
    }`);

    // Redirect to order success page or home
    // onNavigate('home');
  };

  const shippingFee = totalPrice >= 300000 ? 0 : 30000;
  const finalTotal = totalPrice + shippingFee;

  // Redirect to cart if no items selected
  if (!selectedItems || selectedItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <button className="checkout-back-btn" onClick={() => onNavigate('cart')}>
            ← Quay lại giỏ hàng
          </button>
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Không có sản phẩm nào được chọn</h2>
            <p>Vui lòng quay lại giỏ hàng và chọn sản phẩm để thanh toán.</p>
            <button 
              onClick={() => onNavigate('cart')}
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
              Quay lại giỏ hàng
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
                {selectedItems.map((item) => (
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
              </div>

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

              <div className="checkout-delivery-type">
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
              </div>

              <div className="checkout-form-grid checkout-form-grid-3">
                <div className="checkout-form-field">
                  <select
                    name="province"
                    value={deliveryInfo.province}
                    onChange={(e) => handleDeliveryInfoChange('province', e.target.value)}
                    className={`checkout-select ${errors.province ? 'error' : ''}`}
                  >
                    <option value="">Chọn Tỉnh/Thành phố *</option>
                    {Object.keys(vietnamLocations).map(province => (
                      <option key={province} value={province}>{province}</option>
                    ))}
                  </select>
                  {errors.province && <span className="checkout-error-message">{errors.province}</span>}
                </div>

                <div className="checkout-form-field">
                  <select
                    name="district"
                    value={deliveryInfo.district}
                    onChange={(e) => handleDeliveryInfoChange('district', e.target.value)}
                    className={`checkout-select ${errors.district ? 'error' : ''}`}
                    disabled={!deliveryInfo.province}
                  >
                    <option value="">Chọn Quận/Huyện *</option>
                    {availableDistricts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                  {errors.district && <span className="checkout-error-message">{errors.district}</span>}
                </div>

                <div className="checkout-form-field">
                  <select
                    name="ward"
                    value={deliveryInfo.ward}
                    onChange={(e) => handleDeliveryInfoChange('ward', e.target.value)}
                    className={`checkout-select ${errors.ward ? 'error' : ''}`}
                    disabled={!deliveryInfo.district}
                  >
                    <option value="">Chọn Phường/Xã *</option>
                    {availableWards.map(ward => (
                      <option key={ward} value={ward}>{ward}</option>
                    ))}
                  </select>
                  {errors.ward && <span className="checkout-error-message">{errors.ward}</span>}
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
                  <span className="checkout-payment-icon">💵</span>
                  <span className="checkout-payment-text">Thanh toán tiền mặt khi nhận hàng</span>
                </label>

                <label className="checkout-payment-method">
                  <input
                    type="radio"
                    name="payment"
                    value="qr"
                    checked={paymentMethod === 'qr'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="checkout-payment-icon">📱</span>
                  <span className="checkout-payment-text">Thanh toán bằng chuyển khoản (QR Code)</span>
                </label>

                <label className="checkout-payment-method">
                  <input
                    type="radio"
                    name="payment"
                    value="atm"
                    checked={paymentMethod === 'atm'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="checkout-payment-icon">🏦</span>
                  <span className="checkout-payment-text">Thanh toán bằng thẻ ATM nội địa và tài khoản ngân hàng</span>
                </label>

                <label className="checkout-payment-method">
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="checkout-payment-icon">💳</span>
                  <span className="checkout-payment-text">Thanh toán bằng thẻ quốc tế (Visa, Master...), Apple Pay, Google Pay và ví VNPay</span>
                </label>

                <label className="checkout-payment-method">
                  <input
                    type="radio"
                    name="payment"
                    value="zalopay"
                    checked={paymentMethod === 'zalopay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="checkout-payment-icon">💙</span>
                  <span className="checkout-payment-text">Thanh toán bằng ví ZaloPay</span>
                </label>

                <label className="checkout-payment-method">
                  <input
                    type="radio"
                    name="payment"
                    value="momo"
                    checked={paymentMethod === 'momo'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span className="checkout-payment-icon">🔴</span>
                  <span className="checkout-payment-text">Thanh toán bằng ví MoMo</span>
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
                  <span>Tổng tiền ({selectedItems.length} sản phẩm)</span>
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
                className="checkout-submit-btn"
                onClick={handleCheckout}
              >
                Hoàn tất
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
    </div>
  );
}
