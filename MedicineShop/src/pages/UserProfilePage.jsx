import React, { useState } from 'react';
import AccountPage from './AccountPage';
import OrderHistoryPage from './OrderHistoryPage';
import VouchersPage from './VouchersPage';
import './UserProfilePage.css';

export default function UserProfilePage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { key: 'account', label: 'Thông tin tài khoản'},
    { key: 'orders', label: 'Lịch sử đơn hàng'},
    { key: 'vouchers', label: 'Vouchers' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountPage onNavigate={onNavigate} />;
      case 'orders':
        return <OrderHistoryPage onNavigate={onNavigate} />;
      case 'vouchers':
        return <VouchersPage onNavigate={onNavigate} />;
      default:
        return <AccountPage onNavigate={onNavigate} />;
    }
  };

  return (
    <div className="user-profile-page">
      <div className="user-profile-container">
        {/* Tabs Navigation */}
        <div className="profile-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`profile-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="profile-tab-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
