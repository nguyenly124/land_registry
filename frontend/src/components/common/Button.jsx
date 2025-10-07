import React from "react";
import "./Button.css";

const Button = ({ children, type = "default", onClick }) => {
  return (
    <button className={`btn btn-${type}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
