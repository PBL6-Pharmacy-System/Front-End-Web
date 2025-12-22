import React, { useState, useEffect } from 'react';
import { useToast } from './Toast';
import ConfirmDialog from './ConfirmDialog';
import './AddressModal.css';

export default function AddressModal({ 
  isOpen, 
  onClose, 
  addresses = [], 
  selectedAddressId,
  onSelect,
  onAddNew,
  onEdit,
  onDelete,
  onSetDefault,
  isLoading 
}) {
  const toast = useToast();
  const [editingAddress, setEditingAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, addressId: null });
  const [formData, setFormData] = useState({
    recipient_name: '',
    recipient_phone: '',
    address_line: '',
    city: '',      // Tỉnh/Thành phố (required by API)
    state: '',     // Quận/Huyện/Phường/Xã
    is_default: false
  });

  useEffect(() => {
    if (!isOpen) {
      setEditingAddress(null);
      setShowAddForm(false);
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      recipient_name: '',
      recipient_phone: '',
      address_line: '',
      city: '',
      state: '',
      is_default: false
    });
  };

  const handleEditClick = (address) => {
    setEditingAddress(address);
    setFormData({
      recipient_name: address.recipient_name || '',
      recipient_phone: address.recipient_phone || '',
      address_line: address.address_line || '',
      city: address.city || '',
      state: address.state || '',
      is_default: address.is_default || false
    });
    setShowAddForm(false);
  };

  const handleAddClick = () => {
    setShowAddForm(true);
    setEditingAddress(null);
    resetForm();
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = async () => {
    // Validate required fields
    if (!formData.recipient_name || !formData.recipient_phone || !formData.address_line || !formData.city) {
      toast.error('Vui lòng điền đầy đủ thông tin: Tên, SĐT, Địa chỉ và Tỉnh/Thành phố');
      return;
    }

    try {
      if (editingAddress) {
        await onEdit(editingAddress.id, formData);
      } else {
        await onAddNew(formData);
      }
      
      setEditingAddress(null);
      setShowAddForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleDeleteClick = (addressId) => {
    setConfirmDialog({ isOpen: true, addressId });
  };

  const handleConfirmDelete = async () => {
    if (confirmDialog.addressId) {
      await onDelete(confirmDialog.addressId);
      setConfirmDialog({ isOpen: false, addressId: null });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, addressId: null });
  };

  const handleSetDefaultClick = async (addressId) => {
    await onSetDefault(addressId);
  };

  const handleSelectAndConfirm = (address) => {
    onSelect(address);
  };

  if (!isOpen) return null;

  return (
    <>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc muốn xóa địa chỉ này không?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
      <div className="address-modal-overlay" onClick={onClose}>
      <div className="address-modal" onClick={e => e.stopPropagation()}>
        <div className="address-modal-header">
          <h2>Địa Chỉ Của Tôi</h2>
          <button className="address-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="address-modal-content">
          {isLoading ? (
            <div className="address-modal-loading">
              <div className="spinner"></div>
              <p>Đang tải địa chỉ...</p>
            </div>
          ) : (showAddForm || editingAddress) ? (
            // Form thêm/sửa địa chỉ
            <div className="address-form">
              <h3>{editingAddress ? 'Cập Nhật Địa Chỉ' : 'Thêm Địa Chỉ Mới'}</h3>
              
              <div className="address-form-row">
                <div className="address-form-field">
                  <label>Họ và tên người nhận *</label>
                  <input
                    type="text"
                    value={formData.recipient_name}
                    onChange={(e) => handleFormChange('recipient_name', e.target.value)}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="address-form-field">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    value={formData.recipient_phone}
                    onChange={(e) => handleFormChange('recipient_phone', e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              <div className="address-form-row">
                <div className="address-form-field">
                  <label>Tỉnh/Thành phố *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleFormChange('city', e.target.value)}
                    placeholder="VD: Đà Nẵng"
                  />
                </div>
                <div className="address-form-field">
                  <label>Quận/Huyện/Phường/Xã</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleFormChange('state', e.target.value)}
                    placeholder="VD: Quận Liên Chiểu, Phường Hòa Khánh Bắc"
                  />
                </div>
              </div>

              <div className="address-form-field full-width">
                <label>Địa chỉ cụ thể (Số nhà, tên đường) *</label>
                <input
                  type="text"
                  value={formData.address_line}
                  onChange={(e) => handleFormChange('address_line', e.target.value)}
                  placeholder="VD: 123 Nguyễn Lương Bằng"
                />
              </div>

              <div className="address-form-checkboxes">
                <label className="address-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => handleFormChange('is_default', e.target.checked)}
                  />
                  <span>Đặt làm địa chỉ mặc định</span>
                </label>
              </div>

              <div className="address-form-actions">
                <button 
                  className="address-btn-cancel"
                  onClick={() => {
                    setEditingAddress(null);
                    setShowAddForm(false);
                    resetForm();
                  }}
                >
                  Huỷ
                </button>
                <button 
                  className="address-btn-submit"
                  onClick={handleSubmitForm}
                >
                  {editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}
                </button>
              </div>
            </div>
          ) : (
            // Danh sách địa chỉ
            <>
              <div className="address-list">
                {addresses.length === 0 ? (
                  <div className="address-empty">
                    <p>Bạn chưa có địa chỉ nào.</p>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div 
                      key={address.id} 
                      className={`address-item ${selectedAddressId === address.id ? 'selected' : ''}`}
                    >
                      <label className="address-radio">
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressId === address.id}
                          onChange={() => handleSelectAndConfirm(address)}
                        />
                        <div className="address-item-content">
                          <div className="address-item-header">
                            <span className="address-name">{address.recipient_name || 'Không có tên'}</span>
                            <span className="address-divider">|</span>
                            <span className="address-phone">{address.recipient_phone || 'Không có SĐT'}</span>
                            <button 
                              className="address-edit-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(address);
                              }}
                            >
                              Sửa
                            </button>
                            {!address.is_default && onDelete && (
                              <button 
                                className="address-edit-btn"
                                style={{ color: '#ef4444' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(address.id);
                                }}
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                          <div className="address-item-detail">
                            <p>{address.address_line}</p>
                            <p>{[address.state, address.city].filter(Boolean).join(', ')}</p>
                          </div>
                          <div className="address-item-tags">
                            {address.is_default && (
                              <span className="address-tag default">Mặc định</span>
                            )}
                            {!address.is_default && onSetDefault && (
                              <button 
                                className="address-set-default-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetDefaultClick(address.id);
                                }}
                              >
                                Đặt làm mặc định
                              </button>
                            )}
                          </div>
                        </div>
                      </label>
                    </div>
                  ))
                )}
              </div>

              <button className="address-add-btn" onClick={handleAddClick}>
                <span>+</span> Thêm Địa Chỉ Mới
              </button>
            </>
          )}
        </div>

        {!showAddForm && !editingAddress && (
          <div className="address-modal-footer">
            <button className="address-btn-cancel" onClick={onClose}>
              Huỷ
            </button>
            <button 
              className="address-btn-confirm"
              onClick={onClose}
            >
              Xác nhận
            </button>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
