import React from 'react';
import './ServiceMenu.css';

export default function ServiceMenu() {
  const services = [
    {
      id: 1,
      title: "Cần mua thuốc",
      subtitle: "",
      icon: "💊",
      bgColor: "from-blue-400 to-blue-500",
      iconBg: "bg-blue-100"
    },
    {
      id: 2,
      title: "Tư vấn với",
      subtitle: "Dược Sỹ",
      icon: "👨‍⚕️",
      bgColor: "from-indigo-400 to-indigo-500",
      iconBg: "bg-indigo-100"
    },
    {
      id: 3,
      title: "Đơn của tôi",
      subtitle: "",
      icon: "📋",
      bgColor: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-100"
    },
    {
      id: 4,
      title: "Tìm nhà thuốc",
      subtitle: "",
      icon: "📍",
      bgColor: "from-cyan-400 to-cyan-500",
      iconBg: "bg-cyan-100"
    },
    {
      id: 5,
      title: "Tiêm Vắc xin",
      subtitle: "",
      icon: "💉",
      bgColor: "from-purple-400 to-purple-500",
      iconBg: "bg-purple-100"
    },
    {
      id: 6,
      title: "Tra thuốc",
      subtitle: "chính hãng",
      icon: "🔍",
      bgColor: "from-sky-400 to-sky-500",
      iconBg: "bg-sky-100"
    }
  ];

  const handleServiceClick = (service) => {
    console.log(`Clicked on: ${service.title}`);
    // Thêm logic navigation hoặc action tại đây
  };

  return (
    <div className="service-menu">
      <div className="service-container">
        {services.map((service) => (
          <div
            key={service.id}
            className="service-card"
            onClick={() => handleServiceClick(service)}
          >
            <div className={`service-icon ${service.iconBg}`}>
              <span className="icon-emoji">{service.icon}</span>
            </div>
            <div className="service-content">
              <h3 className="service-title">{service.title}</h3>
              {service.subtitle && (
                <p className="service-subtitle">{service.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}