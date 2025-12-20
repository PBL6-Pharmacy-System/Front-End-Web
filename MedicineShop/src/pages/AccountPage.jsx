import React, { useState, useEffect } from 'react';
import { getAccessToken, getCustomerId } from '../services/authApi';
import { updateCustomerInfo } from '../services/customerApi';
import { useToast } from '../components/Toast';
import { API_CONFIG } from '../config/api';
import './AccountPage.css';

export default function AccountPage({ onNavigate }) {
  const toast = useToast();
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        toast.warning('Vui lòng đăng nhập');
        onNavigate('home');
        return;
      }

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/auth/me`,
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
        const user = data.data || data;
        setUserInfo(user);
        setEditData({
          username: user.username || '',
          email: user.email || '',
          full_name: user.full_name || '',
          phone: user.phone || ''
        });
      } else {
        toast.error('Không thể lấy thông tin tài khoản');
        onNavigate('home');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      toast.error('Lỗi khi tải thông tin tài khoản');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      username: userInfo.username || '',
      email: userInfo.email || '',
      full_name: userInfo.full_name || '',
      phone: userInfo.phone || ''
    });
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      const customerId = getCustomerId();
      
      if (!customerId) {
        toast.error('Không tìm thấy thông tin khách hàng');
        return;
      }

      // Validate data
      if (!editData.full_name || editData.full_name.trim() === '') {
        toast.warning('Vui lòng nhập họ và tên');
        return;
      }

      if (!editData.phone || editData.phone.trim() === '') {
        toast.warning('Vui lòng nhập số điện thoại');
        return;
      }

      // Validate phone format (Vietnamese phone number)
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneRegex.test(editData.phone.replace(/\s/g, ''))) {
        toast.warning('Số điện thoại không hợp lệ');
        return;
      }

      setIsLoading(true);

      // Call update API
      const updateData = {
        full_name: editData.full_name.trim(),
        phone: editData.phone.trim()
      };

      console.log('Updating customer info:', updateData);

      const response = await updateCustomerInfo(customerId, updateData);

      if (response.success) {
        toast.success(response.message || 'Cập nhật thông tin thành công');
        setIsEditing(false);
        
        // Refresh user info
        await fetchUserInfo();
      } else {
        toast.error(response.error || 'Không thể cập nhật thông tin');
      }
    } catch (error) {
      console.error('Error updating user info:', error);
      toast.error('Lỗi khi cập nhật thông tin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    onNavigate('home');
  };


  if (!userInfo) {
    return (
      <div className="account-page">
        <div className="account-container">
          <div className="error-message">Không thể tải thông tin tài khoản</div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-container">
        {/* Account Header */}
        <div className="account-header">
          <h1>Thông tin tài khoản</h1>
          {!isEditing && (
            <button className="edit-btn" onClick={handleEdit}>
              Chỉnh sửa
            </button>
          )}
        </div>

        {/* Account Info Card */}
        <div className="account-card">
          {/* Avatar Section */}
          <div className="account-avatar-section">
            <div className="account-avatar">
              {userInfo.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="account-status">
              <span className="status-badge">Đang hoạt động</span>
            </div>
          </div>

          {/* Info Fields */}
          <div className="account-fields">
            {/* Username */}
            <div className="account-field">
              <label className="field-label">Tên đăng nhập</label>
              {isEditing ? (
                <input
                  type="text"
                  className="field-input"
                  value={editData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  disabled
                />
              ) : (
                <div className="field-value">{userInfo.username}</div>
              )}
            </div>

            {/* Full Name */}
            <div className="account-field">
              <label className="field-label">Họ và tên <span style={{color: 'red'}}>*</span></label>
              {isEditing ? (
                <input
                  type="text"
                  className="field-input"
                  value={editData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="Nhập họ và tên"
                  disabled={isLoading}
                  required
                />
              ) : (
                <div className="field-value">{userInfo.full_name || 'Chưa cập nhật'}</div>
              )}
            </div>

            {/* Email */}
            <div className="account-field">
              <label className="field-label">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  className="field-input"
                  value={editData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled
                  title="Email không thể thay đổi"
                />
              ) : (
                <div className="field-value">{userInfo.email}</div>
              )}
            </div>

            {/* Phone */}
            <div className="account-field">
              <label className="field-label">Số điện thoại <span style={{color: 'red'}}>*</span></label>
              {isEditing ? (
                <input
                  type="tel"
                  className="field-input"
                  value={editData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Nhập số điện thoại (VD: 0912345678)"
                  disabled={isLoading}
                  required
                />
              ) : (
                <div className="field-value">{userInfo.phone || 'Chưa cập nhật'}</div>
              )}
            </div>

            {/* Role */}
            <div className="account-field">
              <label className="field-label">Loại tài khoản</label>
              <div className="field-value">
                <span className="role-badge">{userInfo.role_name || 'Khách hàng'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="account-actions">
              <button 
                className="save-btn" 
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button 
                className="cancel-btn" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Hủy
              </button>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="account-additional">
          <h3>Thông tin bổ sung</h3>
          <div className="additional-grid">
            <div className="additional-item">
              <label>Ngày tạo tài khoản</label>
              <div className="field-value">
                {userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('vi-VN') : 'Không có'}
              </div>
            </div>
            <div className="additional-item">
              <label>Trạng thái</label>
              <div className="field-value">
                <span className="status-active">Hoạt động</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
