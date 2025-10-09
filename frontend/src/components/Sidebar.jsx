import React, { useState } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import { HouseDoorFill, BookFill, FileEarmarkPlusFill, GlobeAmericas } from 'react-bootstrap-icons';
import './Sidebar.css'; // File CSS tùy chỉnh

// Dùng tạm thời các icon từ react-bootstrap-icons, bạn cần cài đặt:
// npm install react-bootstrap-icons

const menuItems = [
  { id: 1, name: 'Trang chủ', icon: HouseDoorFill, link: '/' },
  { id: 2, name: 'Tra cứu đất', icon: BookFill, link: '/search' },
  { id: 3, name: 'Nộp hồ sơ', icon: FileEarmarkPlusFill, link: '/submit' },
  { id: 4, name: 'Quản lý đất', icon: GlobeAmericas, link: '/manage' },
];

function Sidebar() {
  const [activeItem, setActiveItem] = useState(menuItems[0].name);

  // Giả định nút hamburger chỉ để toggle (ẩn/hiện)
  const [isOpen, setIsOpen] = useState(true); 

  if (!isOpen) {
    // Nếu menu đóng, chỉ hiện nút hamburger
    return (
      <div className="sidebar-container closed">
        <button 
          className="btn text-white p-3 border-0 bg-primary" 
          onClick={() => setIsOpen(true)}
        >
          <i className="bi bi-list fs-4"></i>
        </button>
      </div>
    );
  }

  return (
    <div className="sidebar-container bg-primary text-white">
      {/* 1. Phần Header/Hamburger */}
      <div className="sidebar-header p-3 d-flex justify-content-end align-items-center">
        <button 
          className="btn text-white border-0 p-0" 
          onClick={() => setIsOpen(false)}
        >
          {/* Icon Hamburger (dùng Bootstrap Icons) */}
          <i className="bi bi-list fs-2"></i> 
        </button>
      </div>

      {/* 2. Các Mục Menu */}
      <ListGroup variant="flush" className="sidebar-menu">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = item.name === activeItem;

          return (
            <ListGroup.Item
              key={item.id}
              action // Thêm hiệu ứng hover/click của Bootstrap
              active={isActive}
              onClick={() => setActiveItem(item.name)}
              // Sử dụng Bootstrap Utility Classes để tạo kiểu
              className={`
                d-flex align-items-center py-3 border-0 text-white 
                ${isActive ? 'bg-secondary' : 'bg-transparent text-opacity-75'}
                ${isActive ? 'active-item' : 'inactive-item'}
              `}
            >
              <IconComponent size={24} className="me-3" />
              <span>{item.name}</span>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );
}

export default Sidebar;