// src/components/shared/Card.jsx  (White Box Wrapper)
import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white shadow rounded-lg p-4 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
