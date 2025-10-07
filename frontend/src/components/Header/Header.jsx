import React from "react";
import  "./Header.css";
import Button from "../common/Button.jsx";
import { colors,fontSizes } from "../../styles/theme";
const Header = () => {
  return (
    <div className="header">
      <div className="left">
        <img src="/logo.png" alt="Logo" className="logo" />
        <div>
          <h1 className="title">CỔNG THÔNG TIN ĐỊA CHÍNH</h1>
          <p className="subtitle">Số hóa thông tin đất đai</p>
        </div>
      </div>

      <div className="right">
        
        <Button type="default"> Đăng nhập </Button>
        <Button type="primary"> Đăng Ký </Button>
      </div>
    </div>
  );
};

export default Header;
